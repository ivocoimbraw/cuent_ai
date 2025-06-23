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

    const result = await generateAsset(id)
    
    if (result.success) {
      // Simulate completion after 3 seconds
      setTimeout(() => {
        setAssets(prev => prev.map(asset => 
          asset.id === id ? { ...asset, audio_state: "FINISHED" } : asset
        ))
      }, 3000)
    } else {
      setAssets(prev => prev.map(asset => 
        asset.id === id ? { ...asset, audio_state: "ERROR" } : asset
      ))
      setError(result.error || "Error al generar audio")
    }
  }

  const handleGenerateVideo = async (id: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, video_state: "PROCESSING" } : asset
    ))

    const result = await generateVideo(id, "")
    
    if (result.success) {
      setTimeout(() => {
        setAssets(prev => prev.map(asset => 
          asset.id === id ? { ...asset, video_state: "FINISHED" } : asset
        ))
      }, 5000)
    } else {
      setAssets(prev => prev.map(asset => 
        asset.id === id ? { ...asset, video_state: "ERROR" } : asset
      ))
      setError(result.error || "Error al generar video")
    }
  }

  const handleRegenerateAll = async () => {
    setIsLoading(true)
    const result = await regenerateAllAssets(script.id)
    
    if (result.success) {
      // Refresh page to get updated data
      window.location.reload()
    } else {
      setError(result.error || "Error al regenerar assets")
    }
    setIsLoading(false)
  }

  const handleMixAssets = async () => {
    setIsLoading(true)
    const result = await mixScriptAssets(script.id)
    
    if (result.success) {
      console.log("Assets mezclados exitosamente")
    } else {
      setError(result.error || "Error al mezclar assets")
    }
    setIsLoading(false)
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
            </Button>
            <Button
              onClick={handleMixAssets}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Mezclar Assets
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Assets Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>
      </motion.div>

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
                  onGenerateVideo={() => handleGenerateVideo(asset.id)}
                  onRegenerateAudio={() => handleGenerateAudio(asset.id)}
                  onRegenerateVideo={() => handleGenerateVideo(asset.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
