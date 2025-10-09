import modal
import subprocess
import requests
import os
import re
from pydantic import BaseModel
from fastapi import Request

# Create Modal app
app = modal.App("manim-explainer")

# Request model
class RenderRequest(BaseModel):
    code: str
    scene_name: str
    upload_url: str = None
    openai_api_key: str = None

def validate_chart_completeness(code: str) -> list[str]:
    """Validate that charts have required elements."""
    warnings = []
    
    if 'Axes(' in code or 'ax.plot' in code:
        # This is a chart
        if 'get_x_axis_label' not in code and 'x_label' not in code.lower():
            warnings.append("Chart missing x-axis label")
        if 'get_y_axis_label' not in code and 'y_label' not in code.lower():
            warnings.append("Chart missing y-axis label")
        if 'Text(' not in code or 'title' not in code.lower():
            warnings.append("Chart may be missing title")
    
    return warnings

def validate_text_latex_usage(code: str) -> list[str]:
    """Validate proper Text/LaTeX usage."""
    warnings = []
    
    # Check for mathematical symbols in Text()
    import re
    text_matches = re.findall(r'Text\([^)]*\)', code)
    math_patterns = ['x^2', 'y^2', 'z^2', '^2', '^3', r'\frac', r'\sqrt', '=', r'\pm', r'\times']
    for text_match in text_matches:
        if any(pattern in text_match for pattern in math_patterns):
            warnings.append(f"Mathematical symbols in Text() - should use MathTex(): {text_match[:50]}...")
            break
    
    # Check for LaTeX without raw strings
    latex_matches = re.findall(r'(MathTex|Tex)\([^)]*\)', code)
    for latex_match in latex_matches:
        if '\\' in latex_match and 'r"' not in latex_match and "r'" not in latex_match:
            warnings.append(f"LaTeX without raw string - may cause issues: {latex_match[:50]}...")
            break
    
    # Check for proper MathTex isolation for coloring
    if 'MathTex(' in code and 'set_color_by_tex' in code and '{{' not in code:
        warnings.append("MathTex with coloring should use {{ }} for part isolation")
    
    return warnings

# Define container image with all dependencies pre-installed
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(
        "ffmpeg",
        "sox",
        "libsox-fmt-all",
        "portaudio19-dev",
        "gettext",
        "pkg-config",
        "libcairo2-dev",
        "libpango1.0-dev",
        "libpangocairo-1.0-0",
        "libgirepository1.0-dev",
        "libglib2.0-dev",
        "libffi-dev",
        "libxml2-dev",
        "libxslt1-dev",
        "zlib1g-dev",
        "libjpeg-dev",
        "libpng-dev",
        "libfreetype6-dev",
        "libx11-dev",
        "libxext-dev",
        "libxrender-dev",
        "libxrandr-dev",
        "libxinerama-dev",
        "libxcursor-dev",
        "libxi-dev",
        "libxss-dev",
        "libxcomposite-dev",
        "libxdamage-dev",
        "libxfixes-dev",
        "libxtst-dev",
        "build-essential",
        "cmake",
        "git",
        # LaTeX dependencies for MathTex
        "texlive",
        "texlive-latex-extra",
        "texlive-fonts-recommended",
        "texlive-fonts-extra",
        "libgs-dev",
        "dvipng"
    )
    .pip_install(
        "manim==0.18.1",
        "manim-voiceover[openai]",
        "requests",
        "fastapi[standard]"
    )
)

@app.function(
    image=image,
    timeout=1800,  # 30 minutes
    cpu=4.0,
    memory=8192,
)
def render_manim(code: str, scene_name: str, upload_url: str = None, openai_api_key: str = None):
    """Render Manim animation and optionally upload to Supabase."""
    
    # Set OpenAI API key if provided
    if openai_api_key:
        os.environ['OPENAI_API_KEY'] = openai_api_key
    
    result = None
    
    try:
        # Write scene.py
        with open("scene.py", "w") as f:
            f.write(code)
        
        print(f"📝 Written scene.py with {len(code)} characters")
        
        # Validate chart completeness
        chart_warnings = validate_chart_completeness(code)
        if chart_warnings:
            print("⚠️ Chart validation warnings:")
            for warning in chart_warnings:
                print(f"   - {warning}")
        
        # Validate text/LaTeX usage
        text_warnings = validate_text_latex_usage(code)
        if text_warnings:
            print("⚠️ Text/LaTeX validation warnings:")
            for warning in text_warnings:
                print(f"   - {warning}")
        
        print(f"🎬 Rendering scene: {scene_name}")
        
        # Try rendering with voiceover
        try:
            result = subprocess.run(
                ["manim", "--disable_caching", "scene.py", scene_name, "-qk", "--format=mp4"],
                capture_output=True,
                text=True,
                timeout=1200  # 20 minutes
            )
            
            if result.returncode != 0:
                raise Exception(f"Manim render failed: {result.stderr}")
            
            print("✅ Render completed successfully")
            
        except Exception as e:
            # Fallback: try without voiceover
            print(f"⚠️ Original render failed, trying fallback without voiceover: {e}")
            
            # Create fallback code by removing voiceover components line by line
            lines = code.split('\n')
            cleaned_lines = []
            skip_until_dedent = False
            base_indent = None

            for line in lines:
                # Skip voiceover imports
                if 'from manim_voiceover' in line:
                    continue

                # Replace VoiceoverScene with Scene
                if 'VoiceoverScene' in line:
                    line = line.replace('VoiceoverScene', 'Scene')

                # Skip voiceover service setup
                if 'self.set_speech_service(' in line:
                    continue

                # Check if this line starts a voiceover block
                if 'with self.voiceover(' in line:
                    skip_until_dedent = True
                    base_indent = len(line) - len(line.lstrip())
                    continue

                # If we're in a voiceover block, check for dedent
                if skip_until_dedent:
                    if line.strip() == '' or len(line) - len(line.lstrip()) <= base_indent:
                        skip_until_dedent = False
                        if line.strip() != '':
                            cleaned_lines.append(line)
                    continue

                # Replace tracker.duration with fixed run_time
                if 'run_time=tracker.duration' in line:
                    line = line.replace('run_time=tracker.duration', 'run_time=1')

                # Fix LaTeX double braces issue
                if 'MathTex' in line and '{{' in line:
                    line = line.replace('{{', '{ {').replace('}}', '} }')

                # Fix config["style"] issue - Manim 0.18.1 doesn't have style attribute
                if 'config["style"]' in line:
                    line = line.replace('config["style"]', '"dark"')  # Default to dark style
                
                # Fix any other config style references
                if 'config.style' in line:
                    line = line.replace('config.style', '"dark"')
                
                # Fix undefined classes - replace with appropriate Manim alternatives
                undefined_classes = {
                    'PieChart': 'Circle',  # Replace PieChart with Circle
                    'BarChart': 'Rectangle',  # Replace BarChart with Rectangle
                    'LineChart': 'Line',  # Replace LineChart with Line
                    'Histogram': 'Rectangle',  # Replace Histogram with Rectangle
                    'ScatterPlot': 'Dot',  # Replace ScatterPlot with Dot
                }
                
                for undefined_class, replacement in undefined_classes.items():
                    if undefined_class in line:
                        line = line.replace(undefined_class, replacement)
                        print(f"⚠️ Replaced undefined class {undefined_class} with {replacement}")
                
                # Fix common Manim API issues
                if 'ax.get_graph(' in line and 'color=' in line:
                    # Remove color parameter from get_graph as it's not supported
                    line = line.replace('ax.get_graph(', 'ax.plot(')
                    print("⚠️ Fixed ax.get_graph() API usage")
                
                # Fix other common API issues
                if 'get_graph(' in line and 'color=' in line:
                    line = line.replace('get_graph(', 'plot(')
                    print("⚠️ Fixed get_graph() API usage")
                
                # Fix Dot() radius parameter conflicts
                if 'Dot(' in line and 'radius=' in line and '**' in line:
                    # This is a complex case - try to fix radius conflicts
                    if 'vertex_dot_style' in line or '**' in line:
                        print("⚠️ Detected potential Dot() radius conflict - may need manual review")
                
                # Fix plot_line_graph parameter issues
                if 'plot_line_graph(' in line and 'add_vertex_dots=True' in line:
                    # Remove add_vertex_dots to avoid radius conflicts
                    line = line.replace('add_vertex_dots=True', 'add_vertex_dots=False')
                    print("⚠️ Fixed plot_line_graph vertex dots conflict")
                
                # Fix vertex_dot_style radius conflicts
                if 'vertex_dot_style' in line and 'radius' in line:
                    # Remove radius from vertex_dot_style to avoid conflicts
                    line = line.replace('vertex_dot_style={"radius":', 'vertex_dot_style={')
                    line = line.replace('vertex_dot_style={"radius": ', 'vertex_dot_style={')
                    print("⚠️ Fixed vertex_dot_style radius conflict")
                
                # Fix camera.frame API issues (Manim 0.18.1 doesn't have camera.frame)
                if 'self.camera.frame' in line:
                    # Replace camera.frame animations with simpler alternatives
                    if 'animate.scale(' in line:
                        # Replace scale animation with a simple wait
                        line = '        self.wait(0.5)  # Replaced camera.frame.animate.scale()'
                        print("⚠️ Fixed camera.frame.animate.scale() - replaced with wait")
                    elif 'animate.shift(' in line:
                        # Replace shift animation with a simple wait
                        line = '        self.wait(0.5)  # Replaced camera.frame.animate.shift()'
                        print("⚠️ Fixed camera.frame.animate.shift() - replaced with wait")
                    elif 'animate' in line:
                        # Replace any other camera.frame animation
                        line = '        self.wait(0.5)  # Replaced camera.frame animation'
                        print("⚠️ Fixed camera.frame animation - replaced with wait")
                    else:
                        # Just remove the line if it's not an animation
                        line = '        # Removed camera.frame reference'
                        print("⚠️ Removed camera.frame reference")
                
                # Fix VGroup type issues - replace VGroup with Group for mixed object types
                if 'VGroup(' in line and ('Text(' in line or 'MathTex(' in line or 'DecimalNumber(' in line):
                    # Replace VGroup with Group when mixing VMobjects with Mobjects
                    line = line.replace('VGroup(', 'Group(')
                    print("⚠️ Fixed VGroup type issue - replaced with Group for mixed objects")
                
                # Fix VGroup assignments that might cause type issues
                if '= VGroup(' in line and ('Text(' in line or 'MathTex(' in line or 'DecimalNumber(' in line):
                    line = line.replace('= VGroup(', '= Group(')
                    print("⚠️ Fixed VGroup assignment - replaced with Group for mixed objects")

                # ANIMATION QUALITY FIXES
                
                # Fix 1: Ensure minimum wait times
                if 'self.wait(' in line:
                    # Extract wait time and enforce minimum
                    import re
                    match = re.search(r'self\.wait\(([0-9.]+)\)', line)
                    if match:
                        wait_time = float(match.group(1))
                        if wait_time < 1.0:
                            line = line.replace(f'self.wait({wait_time})', 'self.wait(2.0)')
                            print(f"⚠️ Fixed wait time: {wait_time}s → 2.0s")

                # Fix 2: Add wait after play if missing
                if 'self.play(' in line and i < len(lines) - 1:
                    next_line = lines[i + 1] if i + 1 < len(lines) else ''
                    if 'self.wait(' not in next_line and 'self.play(' in next_line:
                        # Insert wait after this play
                        indent = len(line) - len(line.lstrip())
                        cleaned_lines.append(line)
                        cleaned_lines.append(' ' * indent + 'self.wait(2.0)  # Added for proper pacing')
                        print("⚠️ Added missing wait after play")
                        continue

                # Fix 3: Detect overlapping content (simple heuristic)
                if 'self.play(' in line and ('Create(' in line or 'Write(' in line or 'FadeIn(' in line):
                    # Check if previous content was cleared
                    recent_lines = cleaned_lines[-5:] if len(cleaned_lines) >= 5 else cleaned_lines
                    has_fadeout = any('FadeOut(' in l for l in recent_lines)
                    has_clear = any('self.clear()' in l for l in recent_lines)
                    
                    if not has_fadeout and not has_clear and len(cleaned_lines) > 10:
                        # Likely overlapping - add warning comment
                        indent = len(line) - len(line.lstrip())
                        cleaned_lines.append(' ' * indent + '# WARNING: Previous content may overlap - consider FadeOut')
                        print("⚠️ Detected potential overlapping content")

                # Fix 4: Enforce UTF-8 for Text objects
                if 'Text(' in line or 'Tex(' in line:
                    # Ensure proper encoding
                    if '©' in line or 'é' in line or 'è' in line or 'à' in line:
                        # Already has UTF-8 characters - ensure r-string or proper escaping
                        if 'Text("' in line and 'r"' not in line:
                            line = line.replace('Text("', 'Text(r"')
                            print("⚠️ Added r-string for UTF-8 text")

                # Fix 5: Ensure MathTex for equations (Enhanced)
                if 'Text(' in line:
                    # Check for common mathematical symbols/patterns
                    math_patterns = ['x^2', 'y^2', 'z^2', '=', '\\frac', '\\sqrt', 
                                   '^2', '^3', '_1', '_2', '\\pm', '\\times', 
                                   '\\div', '\\leq', '\\geq', '\\neq']
                    if any(pattern in line for pattern in math_patterns):
                        # This looks like math - suggest MathTex
                        cleaned_lines.append('        # WARNING: Consider using MathTex() instead of Text() for equations')
                        print("⚠️ Detected equation in Text - should use MathTex")
                
                # Fix 5b: Ensure raw strings for LaTeX
                if ('MathTex(' in line or 'Tex(' in line) and 'r"' not in line and 'r\'' not in line:
                    # Check if it contains LaTeX commands
                    if '\\' in line and ('MathTex("' in line or 'Tex("' in line):
                        # Add warning about missing raw string
                        cleaned_lines.append('        # WARNING: Use raw strings r"..." for LaTeX to avoid backslash issues')
                        print("⚠️ LaTeX without raw string detected")
                
                # Fix 5c: Check for proper MathTex usage with double braces
                if 'MathTex(' in line and '{{' not in line and 'set_color_by_tex' in code:
                    # If using color operations, suggest double braces for isolation
                    cleaned_lines.append('        # TIP: Use {{ }} to isolate parts for coloring: MathTex(r"{{ a^2 }} + {{ b^2 }}")')
                    print("⚠️ MathTex might benefit from {{ }} for part isolation")

                # Fix 6: Add proper run_time to animations
                if 'self.play(' in line and 'run_time' not in line:
                    # Add default run_time
                    line = line.rstrip()
                    if line.endswith(')'):
                        line = line[:-1] + ', run_time=1.5)'
                    print("⚠️ Added default run_time to animation")
                
                # Fix 7: Ensure proper object management for scene cleanup
                if 'self.add(' in line and 'self.play(' in line:
                    # Check if objects are properly stored in variables for cleanup
                    if '=' not in line and 'self.add(' in line:
                        # Object created inline - suggest storing in variable
                        cleaned_lines.append('        # WARNING: Store objects in variables for proper cleanup')
                        print("⚠️ Suggest storing objects in variables for cleanup")
                
                # Fix 8: Detect potential static/moving object issues
                if 'add_updater(' in line:
                    # Objects with updaters should be properly managed
                    cleaned_lines.append('        # NOTE: Object with updater - ensure proper cleanup')
                    print("⚠️ Object with updater detected - ensure proper cleanup")

                cleaned_lines.append(line)
            
            fallback_code = '\n'.join(cleaned_lines)
            
            # Extract the actual class name from the fallback code
            fallback_class_name = scene_name  # Default to original name
            for line in cleaned_lines:
                if 'class ' in line and 'Scene' in line:
                    # Extract class name from "class ClassName(Scene):"
                    match = re.search(r'class\s+(\w+)\s*\(', line)
                    if match:
                        fallback_class_name = match.group(1)
                        break
            
            with open("fallback_scene.py", "w") as f:
                f.write(fallback_code)
            
            result = subprocess.run(
                ["manim", "--disable_caching", "fallback_scene.py", fallback_class_name, "-qk", "--format=mp4"],
                capture_output=True,
                text=True,
                timeout=1200
            )
            
            if result.returncode != 0:
                raise Exception(f"Fallback render failed: {result.stderr}")
            
            print("✅ Fallback render completed successfully")

        # Find output file - try multiple possible locations for both MP4 and PNG
        possible_video_paths = [
            f"media/videos/scene/1080p60/{scene_name}.mp4",
            f"media/videos/scene/720p30/{scene_name}.mp4",
            f"media/videos/scene/2160p60/{scene_name}.mp4",
            f"media/videos/scene/1440p60/{scene_name}.mp4",
            f"media/videos/fallback_scene/1080p60/{scene_name}.mp4",
            f"media/videos/fallback_scene/720p30/{scene_name}.mp4",
            f"media/videos/fallback_scene/2160p60/{scene_name}.mp4",
        ]

        possible_image_paths = [
            f"media/images/scene/{scene_name}_ManimCE_v0.18.1.png",
            f"media/images/fallback_scene/{scene_name}_ManimCE_v0.18.1.png",
        ]

        # If we used fallback, also try with the detected fallback class name
        if 'fallback_class_name' in locals() and fallback_class_name != scene_name:
            possible_video_paths.extend([
                f"media/videos/fallback_scene/1080p60/{fallback_class_name}.mp4",
                f"media/videos/fallback_scene/720p30/{fallback_class_name}.mp4",
                f"media/videos/fallback_scene/2160p60/{fallback_class_name}.mp4",
            ])
            possible_image_paths.extend([
                f"media/images/fallback_scene/{fallback_class_name}_ManimCE_v0.18.1.png",
            ])

        # Search for any MP4 and PNG files in the media directory
        import glob
        all_mp4_files = glob.glob("media/videos/**/*.mp4", recursive=True)
        all_png_files = glob.glob("media/images/**/*.png", recursive=True)
        
        print(f"🔍 Found {len(all_mp4_files)} MP4 files in media directory:")
        for mp4_file in all_mp4_files:
            print(f"  - {mp4_file}")
            
        print(f"🔍 Found {len(all_png_files)} PNG files in media directory:")
        for png_file in all_png_files:
            print(f"  - {png_file}")

        output_path = None
        output_type = None
        
        # First try to find MP4 files
        for path in possible_video_paths:
            if os.path.exists(path):
                output_path = path
                output_type = "video"
                print(f"📁 Found video output at: {path}")
                break

        # If no MP4 found, try to find PNG files
        if output_path is None:
            for path in possible_image_paths:
                if os.path.exists(path):
                    output_path = path
                    output_type = "image"
                    print(f"📁 Found image output at: {path}")
                    break

        # If still not found, try to find any file that might be our output
        if output_path is None:
            # Look for MP4 files that contain our scene name
            for mp4_file in all_mp4_files:
                if scene_name in mp4_file or (fallback_class_name in mp4_file if 'fallback_class_name' in locals() else False):
                    output_path = mp4_file
                    output_type = "video"
                    print(f"📁 Found video by name match: {mp4_file}")
                    break
            
            # If still no match, use the first MP4 file in the main output directory (exclude partial_movie_files)
            if output_path is None:
                main_mp4_files = [f for f in all_mp4_files if 'partial_movie_files' not in f]
                if main_mp4_files:
                    output_path = main_mp4_files[0]
                    output_type = "video"
                    print(f"📁 Using first available MP4 file: {output_path}")
            
            # Look for PNG files that contain our scene name
            if output_path is None:
                for png_file in all_png_files:
                    if scene_name in png_file or (fallback_class_name in png_file if 'fallback_class_name' in locals() else False):
                        output_path = png_file
                        output_type = "image"
                        print(f"📁 Found image by name match: {png_file}")
                        break
            
            # If still no match, use the first PNG file
            if output_path is None and all_png_files:
                output_path = all_png_files[0]
                output_type = "image"
                print(f"📁 Using first available PNG file: {output_path}")

        if output_path is None:
            raise Exception(f"Output file not found. Tried video paths: {possible_video_paths}. Tried image paths: {possible_image_paths}. Available MP4 files: {all_mp4_files}. Available PNG files: {all_png_files}")
        
        # Upload to Supabase if URL provided
        if upload_url:
            print(f"☁️ Uploading to Supabase...")
            with open(output_path, "rb") as f:
                # Get file size for Content-Length header
                f.seek(0, 2)  # Seek to end
                file_size = f.tell()
                f.seek(0)  # Seek back to beginning
                
                # Set appropriate content type based on output type
                if output_type == "video":
                    content_type = 'video/mp4'
                elif output_type == "image":
                    content_type = 'image/png'
                else:
                    content_type = 'application/octet-stream'
                
                # Upload with proper headers
                headers = {
                    'Content-Type': content_type,
                    'Content-Length': str(file_size)
                }
                
                response = requests.put(upload_url, data=f, headers=headers)
                response.raise_for_status()
            print(f"✅ Upload completed successfully ({output_type})")
        
        return {
            "success": True,
            "logs": result.stdout,
            "stderr": result.stderr,
            "output_path": output_path,
            "output_type": output_type
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "logs": getattr(result, 'stdout', ''),
            "stderr": getattr(result, 'stderr', error_msg)
        }

