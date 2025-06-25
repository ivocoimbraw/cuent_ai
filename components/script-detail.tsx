"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, RefreshCw, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetCard } from "@/components/asset-card"
import {
  generateAsset,
  generateVideo,
  regenerateAllAssets,
  mixScriptAssets
} from "@/lib/data-fetching"
import { Asset, Script } from "@/lib/types"


interface Project {
  id: string
  name: string
  description: string
}

interface ScriptDetailProps {
  project: Project
  script: Script
  initialAssets: Asset[]
}

export function ScriptDetail({ project, script, initialAssets }: ScriptDetailProps) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateAssetLine = (id: string, line: string) => {
    setAssets(prev => prev.map(asset =>
      asset.id === id ? { ...asset, line } : asset
    ))
  }

  const handleGenerateAudio = async (id: string) => {
    setAssets(prev => prev.map(asset =>
      asset.id === id ? { ...asset, audio_state: "PROCESSING" } : asset
    ))

    try {
      const result = await generateAsset(id)
      const { success, data } = result;
      const realAsset = data?.data;

      if (success && realAsset?.audio_url) {
        setAssets(prev => prev.map(asset =>
          asset.id === id ? {
            ...asset,
            ...realAsset
          } : asset
        ))
      } else {
        setAssets(prev => prev.map(asset =>
          asset.id === id ? { ...asset, audio_state: "ERROR" } : asset
        ))
        setError(result.error || "Error al generar audio")
      }
    } catch (error) {
      setAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, audio_state: "ERROR" } : asset
      ))
      setError("Error inesperado al generar audio")
    }
  }

  const handleGenerateVideo = async (id: string, keywords: string) => {
    setAssets(prev => prev.map(asset =>
      asset.id === id ? { ...asset, video_state: "PROCESSING" } : asset
    ))

    try {
      const result = await generateVideo(id, keywords)
      const { success, data } = result;
      const realAsset = data?.data;

      console.log("Generate video result:", result)

      if (success && realAsset) {
        setAssets(prev => prev.map(asset =>
          asset.id === id ? {
            ...asset,
            ...realAsset
          } : asset
        ))
      } else {
        setAssets(prev => prev.map(asset =>
          asset.id === id ? { ...asset, video_state: "ERROR" } : asset
        ))
        setError(result.error || "Error al generar video")
      }
    } catch (error) {
      setAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, video_state: "ERROR" } : asset
      ))
      setError("Error inesperado al generar video")
    }
  }

  const handleRegenerateAll = async () => {
    setIsLoading(true)
    const result = await regenerateAllAssets(script.id)
    const {success, data } = result
    const realAssets = data?.data;

    if (success) {
      setAssets(realAssets ?? []);
    } else {
      setError(result.error || "Error al regenerar assets")
    }
    setIsLoading(false)
  }

  const handleMixAssets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await mixScriptAssets(script.id)

      if (result.success) {
        console.log("Assets mezclados exitosamente")
        // Refresh the page to get the updated script with mixed media URLs
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setError(result.error || "Error al mezclar assets")
      }
    } catch (err) {
      setError("Error inesperado al mezclar assets")
      console.error("Mix assets error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const finishedAssets = assets.filter(asset => asset.audio_state === "FINISHED").length
  const processingAssets = assets.filter(asset =>
    asset.audio_state === "PROCESSING" || asset.video_state === "PROCESSING"
  ).length
  const totalDuration = assets.reduce((acc, asset) => acc + (asset.duration || 0), 0)

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={() => setError(null)}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = `/projects/${project.id}`)}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Proyecto
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Script {script.position ? `#${script.position}` : `ID: ${script.id.slice(0, 8)}`}
            </h1>
            <p className="text-gray-400 mt-1">{project.name}</p>
            <p className="text-gray-300 mt-2 max-w-2xl">{script.text_entry}</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRegenerateAll}
              disabled={isLoading}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerar Todo
            </Button>            <Button
              onClick={handleMixAssets}
              disabled={isLoading}
              className={`${script.mixed_audio || script.mixed_video
                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mezclando...
                </>
              ) : (
                <>
                  <Shuffle className="h-4 w-4 mr-2" />
                  {script.mixed_audio || script.mixed_video ? "Volver a Mezclar" : "Mezclar Assets"}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>      {/* Assets Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">{assets.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-400">{finishedAssets}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">En Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-yellow-400">{processingAssets}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Duración Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-cyan-400">
                {totalDuration.toFixed(1)}s
              </div>
            </CardContent>
          </Card>

          <Card className={`border ${script.mixed_audio || script.mixed_video
            ? "bg-green-900/20 border-green-600/30"
            : "bg-gray-900/50 border-gray-800"
            }`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Estado Mezcla</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${script.mixed_audio || script.mixed_video
                ? "text-green-400"
                : "text-gray-500"
                }`}>
                {script.mixed_audio || script.mixed_video ? "✅ Listo" : "⏳ Pendiente"}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Mixed Media Results */}
      {(script.mixed_audio) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-600/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Shuffle className="h-5 w-5" />
                Medios Mezclados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mixed Audio */}
                {script.mixed_audio && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      🎵 Audio Final
                    </h3>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <audio
                        controls
                        className="w-full"
                        preload="metadata"
                      >
                        <source src={script.mixed_audio} type="audio/mpeg" />
                        Tu navegador no soporta el elemento de audio.
                      </audio>                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          Audio mezclado • MP3
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => {
                              const audio = document.querySelector(`audio[src="${script.mixed_audio}"]`) as HTMLAudioElement
                              if (audio) {
                                if (audio.paused) {
                                  audio.play()
                                } else {
                                  audio.pause()
                                }
                              }
                            }}
                          >
                            ⏯️
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => window.open(script.mixed_audio, '_blank')}
                          >
                            📥 Descargar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mixed Media Info */}
              <div className="pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Estado:</span>
                    <div className="text-green-400 font-semibold">✅ Mezclado Completo</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Assets Procesados:</span>
                    <div className="text-white">{assets.length} assets</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Duración Estimada:</span>
                    <div className="text-cyan-400">{totalDuration.toFixed(1)}s</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Instructions when no mixed media */}
      {!(script.mixed_audio) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-gradient-to-r from-blue-900/20 to-blue-900/5 border-blue-600/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="text-4xl">🎬</div>
                <h3 className="text-lg font-semibold text-white">
                  ¿Listo para crear tu contenido final?
                </h3>
                <p className="text-gray-400 max-w-lg mx-auto">
                  Asegúrate de que todos los assets estén generados y luego haz clic en "Mezclar Assets"
                  para crear el audio y video final de tu script.
                </p>
                <div className="text-sm text-gray-500">
                  {finishedAssets} de {assets.length} assets completados
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Assets List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Assets del Script</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <AssetCard
                  asset={asset}
                  onUpdateLine={(line: string) => updateAssetLine(asset.id, line)}
                  onGenerateAudio={() => handleGenerateAudio(asset.id)}
                  onGenerateVideo={(keywords: string) => handleGenerateVideo(asset.id, keywords)}
                  onRegenerateAudio={() => handleGenerateAudio(asset.id)}
                  onRegenerateVideo={(keywords: string) => handleGenerateVideo(asset.id, keywords)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
