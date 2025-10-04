"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Plus, X, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ArtifactFormProps {
  onSave: (artifact: { title: string; image?: string; description: string; isPublic?: boolean; style?: string }) => Promise<void>
  onCancel: () => void
  type?: 'artifact' | 'project'
}

// Données d'exemple pour la sélection de styles d'illustration
const illustrationStyles = [
  { value: "realistic", label: "Realistic" },
  { value: "cartoon", label: "Cartoon" },
  { value: "anime", label: "Anime" },
  { value: "watercolor", label: "Watercolor" },
  { value: "oil-painting", label: "Oil Painting" },
  { value: "digital-art", label: "Digital Art" },
  { value: "sketch", label: "Sketch" },
  { value: "vector", label: "Vector" },
  { value: "3d-render", label: "3D Render" },
  { value: "minimalist", label: "Minimalist" },
  { value: "vintage", label: "Vintage" },
  { value: "modern", label: "Modern" },
  { value: "abstract", label: "Abstract" },
  { value: "geometric", label: "Geometric" },
  { value: "hand-drawn", label: "Hand Drawn" },
]

export function ArtifactForm({ onSave, onCancel, type = 'artifact' }: ArtifactFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Add native event listener as fallback
  useEffect(() => {
    const input = fileInputRef.current
    if (input) {
      const handleNativeChange = (event: Event) => {
        console.log('🎯 Native change event fired', event)
        const target = event.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
          const file = target.files[0]
          console.log('✅ File found via native event:', file)
          processImageFile(file)
        }
      }
      
      input.addEventListener('change', handleNativeChange)
      console.log('📌 Native event listener added')
      
      return () => {
        input.removeEventListener('change', handleNativeChange)
        console.log('📌 Native event listener removed')
      }
    }
  }, [])

  const processImageFile = (file: File) => {
    console.log('📁 File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    })
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive"
      })
      return
    }

    // Compress image before storing
    console.log('🔄 Starting image processing...')
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log('📖 FileReader loaded, creating image...')
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            throw new Error('Could not get canvas context')
          }
          
          // Resize image to max 800px width/height to reduce file size
          const maxSize = 800
          let { width, height } = img
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to compressed JPEG
          console.log('🎨 Converting to compressed JPEG...')
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          console.log('✅ Image processed successfully, setting preview')
          console.log('📸 Compressed data URL length:', compressedDataUrl.length)
          console.log('📸 Compressed data URL preview:', compressedDataUrl.substring(0, 100) + '...')
          setImagePreview(compressedDataUrl)
        } catch (error) {
          console.error('Error processing image:', error)
          toast({
            title: "Error processing image",
            description: "There was an error processing your image. Please try again.",
            variant: "destructive"
          })
        }
      }
      img.onerror = () => {
        toast({
          title: "Invalid image",
          description: "The selected file is not a valid image.",
          variant: "destructive"
        })
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading the selected file.",
        variant: "destructive"
      })
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ Image upload triggered', event)
    console.log('📁 Event target:', event.target)
    console.log('📁 Event target files:', event.target.files)
    console.log('📁 Files length:', event.target.files?.length)
    console.log('📁 Event target value:', event.target.value)
    
    // Get the file immediately
    const file = event.target.files?.[0]
    console.log('📁 File object:', file)
    
    if (file) {
      console.log('✅ File found, processing...', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      processImageFile(file)
    } else {
      console.log('❌ No file found in event')
    }
  }

  // Alternative approach using direct file handling
  const handleFileSelect = () => {
    console.log('🔧 handleFileSelect called')
    if (fileInputRef.current) {
      const files = fileInputRef.current.files
      console.log('📁 Direct file access:', files)
      if (files && files.length > 0) {
        const file = files[0]
        console.log('✅ File found via direct access:', file)
        processImageFile(file)
      } else {
        console.log('❌ No files found via direct access')
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const files = event.dataTransfer.files
    console.log('🎯 Drag and drop triggered', files)
    console.log('📁 Dropped files length:', files.length)
    if (files.length > 0) {
      const file = files[0]
      console.log('✅ File dropped, processing...', file)
      processImageFile(file)
    } else {
      console.log('❌ No files in drop event')
    }
  }

  const handleSave = async () => {
    console.log('💾 Save button clicked', {
      hasTitle: !!title.trim(),
      hasImage: !!imagePreview,
      hasDescription: !!description.trim(),
      imagePreviewValue: imagePreview,
      imagePreviewType: typeof imagePreview,
      imagePreviewLength: imagePreview?.length
    })
    if (title.trim() && description.trim()) {
      const artifactData = {
        title: title.trim(),
        image: imagePreview || '', // Make image optional
        description: description.trim(),
        ...(type === 'artifact' && { isPublic }),
        ...(type === 'project' && selectedStyle && { style: selectedStyle })
      }
      
      try {
        console.log('🚀 Calling onSave with data:', artifactData)
        console.log('🖼️ Image data details:', {
          hasImage: !!artifactData.image,
          imageLength: artifactData.image?.length,
          imageType: typeof artifactData.image,
          imagePreview: artifactData.image?.substring(0, 100) + '...'
        })
        // Call onSave which now handles database persistence
        await onSave(artifactData)
        console.log('✅ onSave completed successfully')
        
        // Clear form after successful save
        setTitle("")
        setDescription("")
        setImagePreview(null)
        setIsPublic(false)
        setSelectedStyle("")
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
          console.log('🔄 File input reset')
        }
        
        // Show success toast
        toast({
          title: type === 'project' ? "Project created successfully" : "Artifact created successfully",
          description: `"${artifactData.title}" has been added to your collection.`,
        })
      } catch (error) {
        console.error('Failed to save artifact:', error)
        toast({
          title: "Error",
          description: "Failed to create artifact. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-foreground">
            {type === 'project' ? 'New Project' : 'New Artifact'}
          </h3>
          {type === 'artifact' && (
            <div className="flex items-center gap-2">
              <label htmlFor="public-toggle" className="text-xs font-medium text-foreground">
                {isPublic ? 'Public' : 'Private'}
              </label>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="h-4 w-7 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#57e6f9] data-[state=checked]:via-blue-500 data-[state=checked]:to-purple-700"
              />
            </div>
          )}
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="artifact-title" className="block text-sm font-medium text-foreground mb-1">
            Title
          </label>
          <Input
            id="artifact-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'project' ? "Enter project title" : "Enter artifact title"}
          />
        </div>

        <div>
          <div className="block text-sm font-medium text-foreground mb-1">
            Upload Image <span className="text-muted-foreground text-xs">(Optional)</span>
          </div>
          <div 
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              onClick={() => console.log('📁 File input clicked directly')}
              onInput={() => {
                console.log('📁 File input onInput event fired')
                setTimeout(handleFileSelect, 100) // Check for files after a short delay
              }}
              className="hidden"
              id="artifact-image-upload"
              name="image"
            />
            <div 
              className="cursor-pointer block"
              onClick={() => {
                console.log('🏷️ Upload area clicked, triggering file input')
                if (fileInputRef.current) {
                  console.log('📁 File input ref found, clicking...')
                  fileInputRef.current.click()
                } else {
                  console.log('❌ File input ref not found')
                }
              }}
            >
              {imagePreview ? (
                <div className="space-y-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md mx-auto"
                  />
                  <p className="text-sm text-muted-foreground">Click to change image or drag & drop</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {isDragOver ? 'Drop image here' : 'Click to upload image or drag & drop'}
                  </p>
                  <div className="space-x-2">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('🔘 Test button clicked')
                        if (fileInputRef.current) {
                          fileInputRef.current.click()
                        }
                      }}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Test Upload
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('🔍 Check files button clicked')
                        handleFileSelect()
                      }}
                      className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Check Files
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {type === 'project' && (
          <div>
            <label htmlFor="artifact-style" className="block text-sm font-medium text-foreground mb-1">
              Style
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="artifact-style"
                  name="style"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedStyle
                    ? illustrationStyles.find((style) => style.value === selectedStyle)?.label
                    : "Select style..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search style..." />
                  <CommandList>
                    <CommandEmpty>No style found.</CommandEmpty>
                    <CommandGroup>
                      {illustrationStyles.map((style) => (
                        <CommandItem
                          key={style.value}
                          value={style.value}
                          onSelect={(currentValue) => {
                            setSelectedStyle(currentValue === selectedStyle ? "" : currentValue)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStyle === style.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {style.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div>
          <label htmlFor="artifact-description" className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <Textarea
            id="artifact-description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'project' ? "Enter project description" : "Enter artifact description"}
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="button"
          onClick={handleSave} 
          className="flex-1" 
          disabled={!title.trim() || !description.trim()}
        >
          Save
        </Button>
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel} 
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
