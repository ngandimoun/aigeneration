"use client"

import { useState } from "react"
import { Globe, Lock, Palette, Sparkles, Package, BarChart3, User } from "lucide-react"
import { useNavigation } from "@/hooks/use-navigation"
import { CharacterVariations } from "@/components/character-variations"
import { ArtifactCard } from "@/components/artifact-card"
import { ArtifactCardSkeleton } from "@/components/artifact-card-skeleton"
import { ArtifactGenerationHistory } from "@/components/artifact-generation-history"
import { Button } from "@/components/ui/button"

export function MainContent() {
  const { 
    getDisplayTitle, 
    selectedSection, 
    characterVariations = [], 
    characterVariationsMetadata,
    isGeneratingVariations = false,
    getArtifactsBySection,
    isLoadingArtifacts,
    deleteArtifact,
    selectedArtifact,
    setSelectedArtifact
  } = useNavigation()
  const [selectedVariation, setSelectedVariation] = useState<number | undefined>(undefined)

  // Debug global context
  console.log('🔍 MainContent global context:', {
    selectedSection,
    ...(characterVariations.length > 0 || isGeneratingVariations ? {
      characterVariationsCount: characterVariations.length,
      isGeneratingVariations,
      characterVariations: characterVariations
    } : {})
  })

  const handleSelectVariation = (index: number) => {
    console.log('🎯 Variation selected:', index)
    setSelectedVariation(index)
    console.log('🔄 Selected variation state updated to:', index)
  }

  // Get template artifacts for Templates section
  const templateArtifacts = getArtifactsBySection('templates')

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hover">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          {getDisplayTitle()}
        </h1>
        
        {/* Character Variations for Comics section */}
        {selectedSection === 'comics' && (characterVariations.length > 0 || isGeneratingVariations) && (
          <div className="space-y-6">
            <CharacterVariations
              variations={characterVariations}
              variationsMetadata={characterVariationsMetadata || undefined}
              isLoading={isGeneratingVariations}
              onSelect={handleSelectVariation}
              onRegenerate={() => console.log('Regenerate clicked')}
              selectedIndex={selectedVariation}
            />
          </div>
        )}
        
        {/* Templates section */}
        {selectedSection === 'templates' && (
          <div className="space-y-6">
            {isLoadingArtifacts ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <ArtifactCardSkeleton key={index} />
                ))}
              </div>
            ) : templateArtifacts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {templateArtifacts.map((artifact) => (
                  <ArtifactCard
                    key={artifact.id}
                    id={artifact.id}
                    title={artifact.title}
                    image={artifact.image}
                    description={artifact.description}
                    isPublic={artifact.isPublic}
                    isDefault={artifact.isDefault}
                    onDelete={deleteArtifact}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                  <p className="text-sm">Character variations and other templates will appear here when you generate them.</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Artifacts section */}
        {selectedSection === 'artifacts' && (
          <div className="space-y-6">
            {selectedArtifact ? (
              <div className="space-y-6">
                {/* Artifact Details */}
                <div className="bg-background border border-border rounded-lg p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <img 
                        src={selectedArtifact.image} 
                        alt={selectedArtifact.title}
                        className="w-48 h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-2">
                            {selectedArtifact.title}
                          </h2>
                          <div className="flex items-center gap-2 mb-3">
                            {selectedArtifact.isPublic ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </span>
                            )}
                            {selectedArtifact.isDefault && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedArtifact(null)}
                        >
                          Close
                        </Button>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {selectedArtifact.description}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Type:</strong> {selectedArtifact.type}</p>
                        <p><strong>Section:</strong> {selectedArtifact.section}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generation History */}
                <div className="bg-background border border-border rounded-lg p-6">
                  <ArtifactGenerationHistory 
                    artifactId={selectedArtifact.id}
                    artifactTitle={selectedArtifact.title}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Artifacts Grid */}
                {isLoadingArtifacts ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <ArtifactCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (() => {
                  
                  const artifacts = getArtifactsBySection('artifacts')
                  return artifacts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {artifacts.map((artifact) => (
                        <ArtifactCard
                          key={artifact.id}
                          id={artifact.id}
                          title={artifact.title}
                          image={artifact.image}
                          description={artifact.description}
                          isPublic={artifact.isPublic}
                          isDefault={artifact.isDefault}
                          onDelete={deleteArtifact}
                          onClick={() => setSelectedArtifact(artifact)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground mb-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-2xl">🎨</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No artifacts yet</h3>
                        <p className="text-sm">Create your first artifact to get started.</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}
        
        {/* Illustration section - Project details or Welcome message */}
        {selectedSection === 'illustration' && (
          selectedArtifact ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Image */}
                <div className="overflow-hidden rounded-lg border border-border">
                  <img 
                    src={selectedArtifact.image} 
                    alt={selectedArtifact.title}
                    className="w-full h-auto object-contain"
                  />
                </div>
                
                {/* Project Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {selectedArtifact.title}
                    </h2>
                  </div>
                  
                  {/* Project Status */}
                  <div className="flex items-center gap-2">
                    {selectedArtifact.isPublic ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-sm">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    )}
                  </div>
                  
                  {/* Project Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedArtifact.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <Palette className="h-10 w-10 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Welcome to Illustrations
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Create stunning custom illustrations with AI-powered tools. Choose from various art styles, 
                  from flat vector designs to photorealistic renders, and bring your creative vision to life.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Click "New Project" to start creating your first illustration</span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Product Mockups section - Project details or Welcome message */}
        {selectedSection === 'product-mockups' && (
          selectedArtifact ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Image */}
                <div className="overflow-hidden rounded-lg border border-border">
                  <img 
                    src={selectedArtifact.image} 
                    alt={selectedArtifact.title}
                    className="w-full h-auto object-contain"
                  />
                </div>
                
                {/* Project Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {selectedArtifact.title}
                    </h2>
                  </div>
                  
                  {/* Project Status */}
                  <div className="flex items-center gap-2">
                    {selectedArtifact.isPublic ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-sm">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    )}
                  </div>
                  
                  {/* Project Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedArtifact.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Package className="h-10 w-10 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Welcome to Product Mockups
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Create stunning product presentations with AI-powered tools. Design professional mockups with 
                  customizable backgrounds, perfect lighting, and seamless brand integration to showcase your products 
                  in their best light.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Click "New Project" to create your first product mockup</span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Concept Worlds section - Project details or Welcome message */}
        {selectedSection === 'concept-worlds' && (
          selectedArtifact ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Image */}
                <div className="overflow-hidden rounded-lg border border-border">
                  <img 
                    src={selectedArtifact.image} 
                    alt={selectedArtifact.title}
                    className="w-full h-auto object-contain"
                  />
                </div>
                
                {/* Project Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {selectedArtifact.title}
                    </h2>
                  </div>
                  
                  {/* Project Status */}
                  <div className="flex items-center gap-2">
                    {selectedArtifact.isPublic ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-sm">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    )}
                  </div>
                  
                  {/* Project Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedArtifact.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Globe className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Welcome to Concept Worlds
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Design immersive universes with consistent visual DNA. Create everything from fantasy realms to 
                  futuristic environments with unified art direction, lighting systems, and spatial logic that 
                  brings your creative vision to life.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Click "New Project" to build your first concept world</span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Charts & Infographics section - Project details or Welcome message */}
        {selectedSection === 'charts-infographics' && (
          selectedArtifact ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Image */}
                <div className="overflow-hidden rounded-lg border border-border">
                  <img 
                    src={selectedArtifact.image} 
                    alt={selectedArtifact.title}
                    className="w-full h-auto object-contain"
                  />
                </div>
                
                {/* Project Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {selectedArtifact.title}
                    </h2>
                  </div>
                  
                  {/* Project Status */}
                  <div className="flex items-center gap-2">
                    {selectedArtifact.isPublic ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-sm">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    )}
                  </div>
                  
                  {/* Project Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedArtifact.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <BarChart3 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Welcome to Charts & Infographics
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Transform your data into beautiful visualizations with smart styling and custom branding. 
                  Create compelling charts, infographics, and data stories that communicate insights clearly 
                  and professionally across any platform.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Click "New Project" to create your first chart or infographic</span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Avatars & Personas section - Project details or Welcome message */}
        {selectedSection === 'avatars-personas' && (
          selectedArtifact ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Image */}
                <div className="overflow-hidden rounded-lg border border-border">
                  <img 
                    src={selectedArtifact.image} 
                    alt={selectedArtifact.title}
                    className="w-full h-auto object-contain"
                  />
                </div>
                
                {/* Project Details */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {selectedArtifact.title}
                    </h2>
                  </div>
                  
                  {/* Project Status */}
                  <div className="flex items-center gap-2">
                    {selectedArtifact.isPublic ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-sm">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    )}
                  </div>
                  
                  {/* Project Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedArtifact.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Welcome to Avatars & Personas
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Create AI-powered character avatars with unique personalities and appearances. Design custom personas 
                  with specific roles, demographics, and visual styles to bring your creative projects to life with 
                  authentic and engaging characters.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Click "New Project" to create your first avatar or persona</span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Content area for other sections */}
        {selectedSection !== 'comics' && selectedSection !== 'templates' && selectedSection !== 'artifacts' && selectedSection !== 'illustration' && selectedSection !== 'product-mockups' && selectedSection !== 'concept-worlds' && selectedSection !== 'charts-infographics' && selectedSection !== 'avatars-personas' && (() => {
            if (isLoadingArtifacts) {
              return (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <ArtifactCardSkeleton key={index} />
                  ))}
                </div>
              )
            }
          
          const sectionArtifacts = getArtifactsBySection(selectedSection)
          return sectionArtifacts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {sectionArtifacts.map((artifact) => (
                <ArtifactCard
                  key={artifact.id}
                  id={artifact.id}
                  title={artifact.title}
                  image={artifact.image}
                  description={artifact.description}
                  isPublic={artifact.isPublic}
                  isDefault={artifact.isDefault}
                  onDelete={deleteArtifact}
                  onClick={() => setSelectedArtifact(artifact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No {getDisplayTitle().toLowerCase()} yet</h3>
                <p className="text-sm">Create your first {getDisplayTitle().toLowerCase().slice(0, -1)} to get started.</p>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
