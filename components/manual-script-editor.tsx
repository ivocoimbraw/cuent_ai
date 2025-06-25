"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGemini } from "@/lib/hooks/use-gemini"
import { ScriptLine } from "@/lib/gemini-client"
import { apiClient } from "@/lib/client"
import { Loader2, Plus, Trash2, Edit3, Wand2, Play, Save } from "lucide-react"

interface ManualScriptEditorProps {
  projectId: string
  onScriptCreated?: (scriptId: string) => void
}

export function ManualScriptEditor({ projectId, onScriptCreated }: ManualScriptEditorProps) {
  const [lines, setLines] = useState<ScriptLine[]>([])
  const [currentLine, setCurrentLine] = useState({ text: "", type: "TTS" as "TTS" | "SFX" })
  const [context, setContext] = useState("")
  const [assistantInput, setAssistantInput] = useState("")
  const [isCreatingScript, setIsCreatingScript] = useState(false)
  
  const {
    assistManualScript,
    recommendSFXDescription,
    analyzeScript,
    isLoading,
    error,
    clearError
  } = useGemini()

  const addLine = () => {
    if (!currentLine.text.trim()) return
    
    const newLine: ScriptLine = {
      ...currentLine,
      position: lines.length,
      text: currentLine.text.trim()
    }
    
    setLines([...lines, newLine])
    setCurrentLine({ text: "", type: "TTS" })
  }

  const removeLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index)
    // Reorder positions
    const reorderedLines = newLines.map((line, i) => ({ ...line, position: i }))
    setLines(reorderedLines)
  }

  const moveLine = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === lines.length - 1)
    ) return

    const newLines = [...lines]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    
    // Swap elements
    const temp = newLines[index]
    newLines[index] = newLines[targetIndex]
    newLines[targetIndex] = temp
    
    // Update positions
    const reorderedLines = newLines.map((line, i) => ({ ...line, position: i }))
    setLines(reorderedLines)
  }

  const handleAssistant = async () => {
    if (!assistantInput.trim()) return
    
    const result = await assistManualScript(assistantInput, context, lines)
    if (result) {
      // Add suggested lines
      if (result.suggestions.length > 0) {
        const newLines = result.suggestions.map((suggestion, index) => ({
          ...suggestion,
          position: lines.length + index
        }))
        setLines([...lines, ...newLines])
      }
    }
    setAssistantInput("")
  }

  const handleSFXRecommendation = async (lineIndex: number) => {
    const line = lines[lineIndex]
    if (line.type !== "SFX") return
    
    const result = await recommendSFXDescription(line.text)
    if (result) {
      const updatedLines = [...lines]
      updatedLines[lineIndex] = {
        ...line,
        text: result.sound_description
      }
      setLines(updatedLines)
    }
  }

  const handleAnalyzeScript = async () => {
    if (lines.length === 0) return
    
    const result = await analyzeScript(lines)
    if (result) {
      // Show analysis results (you can implement a modal or sidebar for this)
      console.log("Script Analysis:", result)
    }
  }

  const handleCreateScript = async () => {
    if (lines.length === 0) return
    
    setIsCreatingScript(true)
    try {
      const scriptData = {
        lines: lines.map(line => ({ text: line.text, type: line.type })),
        project_id: projectId
      }
      
      const result = await apiClient.createManualScript(scriptData)
      if (result.data) {
        onScriptCreated?.(result.data.id)
      }
    } catch (error) {
      console.error("Error creating script:", error)
    } finally {
      setIsCreatingScript(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Context Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Editor Manual de Scripts
          </CardTitle>
          <CardDescription>
            Crea tu script línea por línea con ayuda de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="context">Contexto del Proyecto (Opcional)</Label>
              <Textarea
                id="context"
                placeholder="Describe el contexto de tu historia..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="assistant">Asistente IA</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          {/* Add Line Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agregar Línea</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="line-text">Texto</Label>
                    <Textarea
                      id="line-text"
                      placeholder={
                        currentLine.type === "TTS" 
                          ? "Ingresa diálogo o narración..." 
                          : "Describe el efecto de sonido..."
                      }
                      value={currentLine.text}
                      onChange={(e) => setCurrentLine(prev => ({ ...prev, text: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor="line-type">Tipo</Label>
                    <Select
                      value={currentLine.type}
                      onValueChange={(value: "TTS" | "SFX") => 
                        setCurrentLine(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TTS">TTS (Voz)</SelectItem>
                        <SelectItem value="SFX">SFX (Sonido)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addLine} disabled={!currentLine.text.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Línea
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Script Lines */}
          <div className="space-y-2">
            {lines.map((line, index) => (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={line.type === "TTS" ? "default" : "secondary"}>
                          {line.type}
                        </Badge>
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      </div>
                      <p className="text-sm">{line.text}</p>
                    </div>
                    <div className="flex gap-1 ml-4">
                      {line.type === "SFX" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSFXRecommendation(index)}
                          disabled={isLoading}
                        >
                          <Wand2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveLine(index, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveLine(index, "down")}
                        disabled={index === lines.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeLine(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Asistente IA
              </CardTitle>
              <CardDescription>
                Pide ayuda para mejorar tu script
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assistant-input">¿Qué necesitas?</Label>
                  <Textarea
                    id="assistant-input"
                    placeholder="Ej: Agrega más efectos de sonido dramáticos, mejora la transición entre escenas..."
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAssistant} 
                    disabled={isLoading || !assistantInput.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Ayudar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleAnalyzeScript}
                    disabled={isLoading || lines.length === 0}
                  >
                    Analizar Script
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vista Previa del Script</span>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateScript}
                    disabled={isCreatingScript || lines.length === 0}
                  >
                    {isCreatingScript ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Crear Script
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {lines.length} líneas - {lines.filter(l => l.type === "TTS").length} TTS, {lines.filter(l => l.type === "SFX").length} SFX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lines.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay líneas en el script. Agrega algunas en la pestaña Editor.
                  </p>
                ) : (
                  lines.map((line, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded border">
                      <Badge variant={line.type === "TTS" ? "default" : "secondary"}>
                        {line.type}
                      </Badge>
                      <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                      <p className="flex-1 text-sm">{line.text}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
