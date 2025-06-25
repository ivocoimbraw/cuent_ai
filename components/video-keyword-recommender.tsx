"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGemini } from "@/lib/hooks/use-gemini"
import { KeywordRecommendation } from "@/lib/gemini-client"
import { apiClient } from "@/lib/client"
import { Loader2, Video, Copy, Wand2, Play } from "lucide-react"

interface VideoKeywordRecommenderProps {
  assetId?: string
  initialText?: string
  onKeywordsGenerated?: (keywords: string) => void
}

export function VideoKeywordRecommender({ 
  assetId, 
  initialText = "", 
  onKeywordsGenerated 
}: VideoKeywordRecommenderProps) {
  const [text, setText] = useState(initialText)
  const [videoStyle, setVideoStyle] = useState("")
  const [recommendations, setRecommendations] = useState<KeywordRecommendation | null>(null)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  
  const {
    recommendVideoKeywords,
    isLoading,
    error,
    clearError
  } = useGemini()

  const handleGetRecommendations = async () => {
    if (!text.trim()) return
    
    const result = await recommendVideoKeywords(text, videoStyle)
    if (result) {
      setRecommendations(result)
    }
  }

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy)
  }

  const getAllKeywords = (): string => {
    if (!recommendations) return ""
    
    return [
      ...recommendations.primary_keywords,
      ...recommendations.secondary_keywords,
      ...recommendations.style_keywords
    ].join(", ")
  }

  const handleGenerateVideo = async () => {
    if (!assetId || !recommendations) return
    
    const keywords = getAllKeywords()
    setIsGeneratingVideo(true)
    
    try {
      await apiClient.generateVideo(assetId, { key_words: keywords })
      onKeywordsGenerated?.(keywords)
    } catch (error) {
      console.error("Error generating video:", error)
    } finally {
      setIsGeneratingVideo(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400"
    if (confidence >= 0.6) return "text-yellow-400"
    return "text-red-400"
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "Alta"
    if (confidence >= 0.6) return "Media"
    return "Baja"
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Recomendador de Keywords para Video
          </CardTitle>
          <CardDescription>
            Genera keywords en inglés optimizadas para la generación de video con IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-analysis">Texto para Analizar</Label>
              <Textarea
                id="text-analysis"
                placeholder="Ingresa el texto que quieres convertir en video..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="video-style">Estilo de Video (Opcional)</Label>
              <Input
                id="video-style"
                placeholder="Ej: animated, cinematic, cartoon, realistic..."
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={handleGetRecommendations} 
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Generar Keywords
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations && (
        <div className="space-y-4">
          {/* Confidence Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Análisis de Confianza
                <Badge 
                  variant="outline" 
                  className={getConfidenceColor(recommendations.confidence)}
                >
                  {getConfidenceText(recommendations.confidence)} ({Math.round(recommendations.confidence * 100)}%)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">{recommendations.context}</p>
            </CardContent>
          </Card>

          {/* Primary Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Keywords Principales
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(recommendations.primary_keywords.join(", "))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Los elementos más importantes para tu video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendations.primary_keywords.map((keyword, index) => (
                  <Badge key={index} className="cursor-pointer hover:bg-purple-600">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Secondary Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Keywords Secundarias
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(recommendations.secondary_keywords.join(", "))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Elementos de apoyo y contexto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendations.secondary_keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Style Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Keywords de Estilo
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(recommendations.style_keywords.join(", "))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Estilo visual y técnico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendations.style_keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="cursor-pointer">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Keywords Combined */}
          <Card className="border-green-200 bg-green-50/5">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center justify-between">
                Keywords Completas
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(getAllKeywords())}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Todas las keywords combinadas, listas para usar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-sm font-mono">{getAllKeywords()}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(getAllKeywords())}
                    variant="outline"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Todo
                  </Button>
                  
                  {assetId && (
                    <Button
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo}
                    >
                      {isGeneratingVideo ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Generar Video
                    </Button>
                  )}
                </div>
              </div>
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
