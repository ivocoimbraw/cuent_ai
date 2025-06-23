"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles, Edit3, Plus, Trash2, Wand2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getProject, createScript, createManualScript } from "@/lib/data-fetching"
import { Project } from "@/lib/types"
import { useRequireAuth } from "@/lib/use-require-auth"

interface ManualLine {
  text: string
  type: "TTS" | "SFX"
}

export default function NewScriptPage() {
  useRequireAuth() // Proteger la ruta
  
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  // State
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [activeTab, setActiveTab] = useState("ai")

  // AI Mode State
  const [aiText, setAiText] = useState("")

  // Manual Mode State
  const [manualLines, setManualLines] = useState<ManualLine[]>([{ text: "", type: "TTS" }])

  useEffect(() => {
    // Load current project
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      setError("")
      const project = await getProject(projectId)
      if (project) {
        setCurrentProject(project)
      } else {
        setError("Proyecto no encontrado")
      }
    } catch (err) {
      console.error("Error loading project:", err)
      setError("Error al cargar el proyecto")
    }
  }

  const handleCreateAIScript = async () => {
    if (!aiText.trim() || !currentProject) return

    setError("")
    setIsLoading(true)

    try {
      const result = await createScript({
        text_entry: aiText,
        project_id: projectId,
      })

      if (result.success && result.data) {
        router.push(`/projects/${projectId}/scripts/${result.data.id}`)
      } else {
        setError(result.error || "Error al crear script")
      }
    } catch (err) {
      console.error("AI script creation failed:", err)
      setError("Error inesperado al crear script")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateManualScript = async () => {
    const validLines = manualLines.filter((line) => line.text.trim())
    if (validLines.length === 0 || !currentProject) return

    setError("")
    setIsLoading(true)

    try {
      const result = await createManualScript({
        lines: validLines,
        project_id: projectId,
      })

      if (result.success && result.data) {
        router.push(`/projects/${projectId}/scripts/${result.data.id}`)
      } else {
        setError(result.error || "Error al crear script manual")
      }
    } catch (err) {
      console.error("Manual script creation failed:", err)
      setError("Error inesperado al crear script manual")
    } finally {
      setIsLoading(false)
    }
  }

  const addManualLine = () => {
    setManualLines([...manualLines, { text: "", type: "TTS" }])
  }

  const updateManualLine = (index: number, updates: Partial<ManualLine>) => {
    setManualLines(manualLines.map((line, i) => (i === index ? { ...line, ...updates } : line)))
  }

  const removeManualLine = (index: number) => {
    if (manualLines.length > 1) {
      setManualLines(manualLines.filter((_, i) => i !== index))
    }
  }

  if (!currentProject && !error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-400">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Proyecto
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">Crear Nuevo Script</h1>
          <p className="text-gray-400 mt-1">{currentProject?.name}</p>
        </div>
      </motion.div>

      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Creation Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-800">
            <TabsTrigger
              value="ai"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generación con IA
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-700 data-[state=active]:text-white"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Creación Manual
            </TabsTrigger>
          </TabsList>

          {/* AI Generation Tab */}
          <TabsContent value="ai" className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Wand2 className="h-5 w-5 text-purple-400" />
                    Generación Automática con IA
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    Ingresa tu historia completa y la IA la dividirá automáticamente en assets
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-text" className="text-gray-300">
                      Texto de la Historia
                    </Label>
                    <Textarea
                      id="ai-text"
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      placeholder="Escribe aquí tu historia completa. Por ejemplo: 'Había una vez una pequeña niña llamada Luna que vivía en un pueblo cerca del bosque encantado. Una mañana, mientras paseaba por el jardín, Luna notó un sendero que nunca había visto antes...'"
                      className="min-h-[300px] bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{aiText.length} caracteres</span>
                      <span>Mínimo 50 caracteres recomendado</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <Button
                      onClick={handleCreateAIScript}
                      disabled={aiText.trim().length < 10 || isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="mr-2"
                          >
                            <Sparkles className="h-4 w-4" />
                          </motion.div>
                          Generando Script con IA...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Crear Script con IA
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Manual Creation Tab */}
          <TabsContent value="manual" className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Edit3 className="h-5 w-5 text-cyan-400" />
                    Creación Manual de Script
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    Crea tu script línea por línea con control total sobre cada elemento
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {manualLines.map((line, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Line Number */}
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-sm font-medium mt-1">
                                {index + 1}
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-3">
                                {/* Type Selector */}
                                <div className="space-y-1">
                                  <Label className="text-gray-300 text-xs">Tipo</Label>
                                  <Select
                                    value={line.type}
                                    onValueChange={(value: "TTS" | "SFX") => updateManualLine(index, { type: value })}
                                    disabled={isLoading}
                                  >
                                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                      <SelectItem value="TTS" className="text-white">
                                        <div>
                                          <div className="font-medium">TTS</div>
                                          <div className="text-xs text-gray-400">Texto a voz</div>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="SFX" className="text-white">
                                        <div>
                                          <div className="font-medium">SFX</div>
                                          <div className="text-xs text-gray-400">Efectos de sonido</div>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Text Input */}
                                <div className="space-y-1">
                                  <Label className="text-gray-300 text-xs">Contenido</Label>
                                  <Input
                                    value={line.text}
                                    onChange={(e) => updateManualLine(index, { text: e.target.value })}
                                    placeholder={
                                      line.type === "TTS"
                                        ? "Ej: Había una vez una pequeña niña llamada Luna..."
                                        : "Ej: Sonido de pasos en el bosque"
                                    }
                                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                                    disabled={isLoading}
                                  />
                                </div>
                              </div>

                              {/* Remove Button */}
                              {manualLines.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeManualLine(index)}
                                  className="mt-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add Line Button */}
                  <Button
                    onClick={addManualLine}
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white border-dashed"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Nueva Línea
                  </Button>

                  {/* Create Button */}
                  <div className="pt-4 border-t border-gray-800">
                    <Button
                      onClick={handleCreateManualScript}
                      disabled={manualLines.every((line) => !line.text.trim()) || isLoading}
                      className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="mr-2"
                          >
                            <Edit3 className="h-4 w-4" />
                          </motion.div>
                          Creando Script...
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Crear Script Manual ({manualLines.filter((line) => line.text.trim()).length} líneas)
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
