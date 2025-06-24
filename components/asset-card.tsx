"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Volume2,
  Video,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Edit3,
  Save,
  X,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Asset } from "@/lib/types"

interface AssetCardProps {
  asset: Asset
  onUpdateLine: (line: string) => void
  onGenerateAudio: () => void
  onGenerateVideo: (keywords: string) => void
  onRegenerateAudio: () => void
  onRegenerateVideo: (keywords: string) => void
}

const getStateIcon = (state: Asset["audio_state"] | Asset["video_state"]) => {
  switch (state) {
    case "FINISHED":
      return <CheckCircle className="h-4 w-4 text-green-400" />
    case "PROCESSING":
      return <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
    case "ERROR":
      return <AlertCircle className="h-4 w-4 text-red-400" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

const getStateBadge = (state: Asset["audio_state"] | Asset["video_state"]) => {
  const variants = {
    FINISHED: "bg-green-500/20 text-green-400 border-green-500/30",
    PROCESSING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    ERROR: "bg-red-500/20 text-red-400 border-red-500/30",
    PENDING: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  }

  return (
    <Badge variant="outline" className={variants[state]}>
      {state.toLowerCase()}
    </Badge>
  )
}

export function AssetCard({
  asset,
  onUpdateLine,
  onGenerateAudio,
  onGenerateVideo,
  onRegenerateAudio,
  onRegenerateVideo,
}: AssetCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(asset.line)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [videoDuration, setVideoDuration] = useState<number | null>(null)
  const [keywords, setKeywords] = useState("")
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false)
  const [isRegenerateDialog, setIsRegenerateDialog] = useState(false)

  // Add this helper function at the top of the component:
  const isSFX = asset.type === "SFX"

  const handleSave = () => {
    onUpdateLine(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(asset.line)
    setIsEditing(false)
  }

  const handleVideoGeneration = () => {
    if (keywords.trim()) {
      onGenerateVideo(keywords.trim())
      setIsVideoDialogOpen(false)
      setKeywords("")
    }
  }

  const handleVideoRegeneration = () => {
    if (keywords.trim()) {
      onRegenerateVideo(keywords.trim())
      setIsVideoDialogOpen(false)
      setIsRegenerateDialog(false)
      setKeywords("")
    }
  }

  const openVideoDialog = (isRegenerate = false) => {
    setIsRegenerateDialog(isRegenerate)
    setKeywords(asset.line || "") // Pre-fill with asset line as default
    setIsVideoDialogOpen(true)
  }

  const handleAudioLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget
    setAudioDuration(audio.duration)
  }

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setVideoDuration(video.duration)
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const canGenerateVideo = asset.audio_state === "FINISHED" && (asset.video_state === "PENDING" || asset.video_state === "ERROR")
  const canRegenerateVideo = asset.audio_state === "FINISHED" && asset.video_state === "FINISHED"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {asset.position}
              </div>
              <div>
                <h3 className="text-white font-medium">Asset #{asset.position}</h3>
                {asset.duration && <p className="text-gray-400 text-sm">{asset.duration.toFixed(1)}s</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStateBadge(asset.audio_state)}
              {getStateBadge(asset.video_state)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Text Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Texto del Asset</label>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={
                    isSFX
                      ? "Describe el efecto de sonido (ej: Sonido de pasos, Viento en el bosque...)"
                      : "Ingresa el texto para este asset..."
                  }
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-1" />
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="border-gray-700">
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <p className="text-white text-sm">
                  {asset.line || <span className="text-gray-500 italic">Haz clic en editar para agregar texto...</span>}
                </p>
              </div>
            )}
          </div>

          {/* Audio Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">{isSFX ? "Efecto de Sonido" : "Audio"}</span>
              {getStateIcon(asset.audio_state)}
            </div>

            {asset.audio_state === "FINISHED" && asset.audio_url ? (
              <div className="space-y-3">
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {audioDuration ? formatDuration(audioDuration) : 'Cargando...'}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(asset.audio_url!, `asset-${asset.position}-audio.mp3`)}
                      className="text-gray-400 hover:text-white h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                  <audio 
                    controls 
                    className="w-full h-8"
                    preload="metadata"
                    onLoadedMetadata={handleAudioLoadedMetadata}
                  >
                    <source src={asset.audio_url} type="audio/mpeg" />
                    <source src={asset.audio_url} type="audio/wav" />
                    <source src={asset.audio_url} type="audio/ogg" />
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                </div>
                <Button size="sm" onClick={onRegenerateAudio} className="bg-purple-600 hover:bg-purple-700">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerar
                </Button>
              </div>
            ) : asset.audio_state === "PROCESSING" ? (
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
                <span className="text-yellow-400 text-sm">Generando audio...</span>
              </div>
            ) : asset.audio_state === "ERROR" ? (
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm">Error al generar audio</span>
                </div>
                <Button size="sm" onClick={onGenerateAudio} className="bg-red-600 hover:bg-red-700">
                  Reintentar
                </Button>
              </div>
            ) : (
              <Button
                onClick={onGenerateAudio}
                disabled={!asset.line.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {isSFX ? "Generar Efecto" : "Generar Audio"}
              </Button>
            )}
          </div>

          {/* Video Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-gray-300">Video</span>
              {getStateIcon(asset.video_state)}
            </div>

            {asset.video_state === "FINISHED" && asset.video_url ? (
              <div className="space-y-3">
                <div className="aspect-video rounded-lg border overflow-hidden relative group">
                  <video 
                    controls 
                    className="w-full h-full object-cover rounded-lg"
                    preload="metadata"
                    poster="/placeholder.jpg"
                    onLoadedMetadata={handleVideoLoadedMetadata}
                  >
                    <source src={asset.video_url} type="video/mp4" />
                    <source src={asset.video_url} type="video/webm" />
                    <source src={asset.video_url} type="video/ogg" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {videoDuration && (
                      <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
                        {formatDuration(videoDuration)}
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(asset.video_url!, `asset-${asset.position}-video.mp4`)}
                      className="bg-black/80 text-white hover:bg-black/90 h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => openVideoDialog(true)}
                  disabled={!canRegenerateVideo}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar Video
                </Button>
              </div>
            ) : asset.video_state === "PROCESSING" ? (
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
                <span className="text-yellow-400 text-sm">Generando video...</span>
              </div>
            ) : asset.video_state === "ERROR" ? (
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm">Error al generar video</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => openVideoDialog(true)}
                  disabled={!canGenerateVideo}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reintentar
                </Button>
              </div>
            ) : asset.audio_state !== "FINISHED" ? (
              <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm text-center">Genera el audio primero para crear el video</p>
              </div>
            ) : (
              <Button
                onClick={() => openVideoDialog(false)}
                disabled={!canGenerateVideo}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
              >
                <Video className="h-4 w-4 mr-2" />
                Generar Video
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Generation Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isRegenerateDialog ? "Regenerar Video" : "Generar Video"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Ingresa palabras clave para generar el video. Estas palabras ayudarán a la IA a crear el contenido visual apropiado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="keywords" className="text-sm font-medium text-gray-300">
                Palabras clave *
              </Label>
              <Textarea
                id="keywords"
                placeholder="Ej: bosque, mágico, noche, luciérnagas..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-600"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa palabras clave separadas por comas que describan la escena que quieres generar
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Texto del asset:</p>
              <p className="text-white text-sm">{asset.line}</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsVideoDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={isRegenerateDialog ? handleVideoRegeneration : handleVideoGeneration}
              disabled={!keywords.trim()}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
            >
              <Video className="h-4 w-4 mr-2" />
              {isRegenerateDialog ? "Regenerar Video" : "Generar Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
