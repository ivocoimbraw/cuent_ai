"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGemini } from "@/lib/hooks/use-gemini"
import { SFXRecommendation } from "@/lib/gemini-client"
import { Loader2, Volume2, Copy, Wand2, RefreshCw } from "lucide-react"

interface SFXRecommenderProps {
  initialContext?: string
  onSFXSelected?: (description: string) => void
}

export function SFXRecommender({ 
  initialContext = "", 
  onSFXSelected 
}: SFXRecommenderProps) {
  const [context, setContext] = useState(initialContext)
  const [mood, setMood] = useState("none")
  const [intensity, setIntensity] = useState<"low" | "medium" | "high">("medium")
  const [recommendation, setRecommendation] = useState<SFXRecommendation | null>(null)
  
  const {
    recommendSFXDescription,
    isLoading,
    error,
    clearError
  } = useGemini()

  const moodOptions = [
    { value: "none", label: "Sin especificar" },
    { value: "happy", label: "Alegre" },
    { value: "sad", label: "Triste" },
    { value: "tense", label: "Tenso" },
    { value: "peaceful", label: "Pacífico" },
    { value: "dramatic", label: "Dramático" },
    { value: "mysterious", label: "Misterioso" },
    { value: "romantic", label: "Romántico" },
    { value: "action", label: "Acción" },
    { value: "horror", label: "Terror" },
    { value: "comedy", label: "Comedia" },
  ]

  const intensityOptions = [
    { value: "low", label: "Baja", description: "Sutil, ambiente" },
    { value: "medium", label: "Media", description: "Notable, equilibrado" },
    { value: "high", label: "Alta", description: "Prominente, impactante" },
  ]

  const handleGetRecommendation = async () => {
    if (!context.trim()) return
    
    const result = await recommendSFXDescription(
      context, 
      mood === "none" ? undefined : mood, 
      intensity
    )
    if (result) {
      setRecommendation(result)
    }
  }

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy)
  }

  const handleSelectDescription = (description: string) => {
    onSFXSelected?.(description)
    copyToClipboard(description)
  }

  const getIntensityColor = (level: string) => {
    switch (level) {
      case "low": return "text-green-400"
      case "medium": return "text-yellow-400"
      case "high": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  const getIntensityBadgeVariant = (level: string) => {
    switch (level) {
      case "low": return "secondary"
      case "medium": return "default"
      case "high": return "destructive"
      default: return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Recomendador de Efectos de Sonido (SFX)
          </CardTitle>
          <CardDescription>
            Genera descripciones en inglés optimizadas para ElevenLabs y generación de audio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sfx-context">Contexto del Efecto de Sonido</Label>
              <Textarea
                id="sfx-context"
                placeholder="Describe la escena o situación donde necesitas el efecto de sonido..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mood-select">Estado de Ánimo</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un estado de ánimo" />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="intensity-select">Intensidad</Label>
                <Select value={intensity} onValueChange={(value: "low" | "medium" | "high") => setIntensity(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intensityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGetRecommendation} 
              disabled={isLoading || !context.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Generar Recomendación SFX
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      {recommendation && (
        <div className="space-y-4">
          {/* Main Recommendation */}
          <Card className="border-purple-200 bg-purple-50/5">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center justify-between">
                Descripción Principal
                <Badge 
                  variant={getIntensityBadgeVariant(recommendation.intensity_level)}
                  className={getIntensityColor(recommendation.intensity_level)}
                >
                  {recommendation.intensity_level.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Descripción optimizada para ElevenLabs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/20">
                  <p className="text-lg font-mono text-purple-300">
                    {recommendation.sound_description}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSelectDescription(recommendation.sound_description)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Usar Esta Descripción
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(recommendation.sound_description)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alternativas</CardTitle>
              <CardDescription>
                Otras opciones que podrías considerar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendation.alternative_descriptions.map((alt, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors"
                    onClick={() => handleSelectDescription(alt)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono flex-1">{alt}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(alt)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Duración Sugerida</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-lg p-2">
                  {recommendation.duration_suggestion}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contexto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">{recommendation.context}</p>
              </CardContent>
            </Card>
          </div>

          {/* Regenerate */}
          <Card>
            <CardContent className="pt-6">
              <Button
                variant="outline"
                onClick={handleGetRecommendation}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generar Nueva Recomendación
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
          <Button variant="ghost" size="sm" onClick={clearError} className="mt-2">
            Cerrar
          </Button>
        </div>
      )}
    </div>
  )
}
