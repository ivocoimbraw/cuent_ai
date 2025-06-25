"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ManualScriptEditor } from "./manual-script-editor"
import { AutoScriptEditor } from "./auto-script-editor"
import { VideoKeywordRecommender } from "./video-keyword-recommender"
import { SFXRecommender } from "./sfx-recommender"
import { Edit3, FileText, Video, Volume2, Wand2 } from "lucide-react"

interface GeminiStudioProps {
  projectId: string
  onScriptCreated?: (scriptId: string) => void
}

export function GeminiStudio({ projectId, onScriptCreated }: GeminiStudioProps) {
  const [activeTab, setActiveTab] = useState("manual")

  const features = [
    {
      id: "manual",
      title: "Editor Manual",
      description: "Crea scripts línea por línea con asistencia de IA",
      icon: Edit3,
      component: ManualScriptEditor,
      badge: "Creación Precisa"
    },
    {
      id: "auto",
      title: "Editor Automático", 
      description: "Escribe libremente y deja que la IA te ayude",
      icon: FileText,
      component: AutoScriptEditor,
      badge: "IA Avanzada"
    },
    {
      id: "video",
      title: "Keywords Video",
      description: "Genera keywords optimizadas para videos",
      icon: Video,
      component: VideoKeywordRecommender,
      badge: "Optimización Visual"
    },
    {
      id: "sfx",
      title: "Efectos de Sonido",
      description: "Recomendaciones para audio y SFX",
      icon: Volume2,
      component: SFXRecommender,
      badge: "Audio IA"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-purple-400" />
            Gemini AI Studio
          </CardTitle>
          <CardDescription className="text-lg">
            Suite completa de herramientas de IA para creación de contenido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-purple-500 ${
                    activeTab === feature.id 
                      ? "border-purple-500 bg-purple-900/20" 
                      : "border-gray-700 bg-gray-800/30"
                  }`}
                  onClick={() => setActiveTab(feature.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-purple-400" />
                    <h3 className="font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{feature.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <TabsTrigger key={feature.id} value={feature.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{feature.title}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <ManualScriptEditor 
            projectId={projectId}
            onScriptCreated={onScriptCreated}
          />
        </TabsContent>

        <TabsContent value="auto" className="mt-6">
          <AutoScriptEditor 
            projectId={projectId}
            onScriptCreated={onScriptCreated}
          />
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <VideoKeywordRecommender />
        </TabsContent>

        <TabsContent value="sfx" className="mt-6">
          <SFXRecommender />
        </TabsContent>
      </Tabs>

      {/* Quick Access Tips */}
      <Card className="border-blue-200 bg-blue-900/10">
        <CardHeader>
          <CardTitle className="text-lg text-blue-400">💡 Consejos de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Editor Manual</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Perfecto para control preciso del script</li>
                <li>• Usa "TTS" para diálogos y narración</li>
                <li>• Usa "SFX" para efectos de sonido</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Editor Automático</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Ideal para escritura fluida</li>
                <li>• Presiona Ctrl+Espacio para autocompletar</li>
                <li>• La IA mejora automáticamente tu texto</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Keywords Video</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Genera keywords en inglés</li>
                <li>• Optimizado para generación de video</li>
                <li>• Copia las keywords para usar en assets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Efectos SFX</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Descripciones para ElevenLabs</li>
                <li>• Optimizado para audio en inglés</li>
                <li>• Múltiples opciones de intensidad</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
