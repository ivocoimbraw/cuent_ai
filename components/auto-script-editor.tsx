"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGemini } from "@/lib/hooks/use-gemini"
import { apiClient } from "@/lib/client"
import { Loader2, Wand2, Save, FileText, Lightbulb } from "lucide-react"

interface AutoScriptEditorProps {
  projectId: string
  onScriptCreated?: (scriptId: string) => void
}

export function AutoScriptEditor({ projectId, onScriptCreated }: AutoScriptEditorProps) {
  const [textEntry, setTextEntry] = useState("")
  const [enhancedText, setEnhancedText] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [structureImprovements, setStructureImprovements] = useState<string[]>([])
  const [isCreatingScript, setIsCreatingScript] = useState(false)
  const [showEnhanced, setShowEnhanced] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    assistAutoScript,
    isLoading,
    error,
    clearError
  } = useGemini()

  const handleEnhanceText = async () => {
    if (!textEntry.trim()) return
    
    const result = await assistAutoScript(textEntry)
    if (result) {
      setEnhancedText(result.enhanced_text)
      setSuggestions(result.suggestions)
      setStructureImprovements(result.structure_improvements)
      setShowEnhanced(true)
    }
  }

  const handleUseEnhanced = () => {
    setTextEntry(enhancedText)
    setShowEnhanced(false)
  }

  const handleCreateScript = async () => {
    const finalText = showEnhanced ? enhancedText : textEntry
    if (!finalText.trim()) return
    
    setIsCreatingScript(true)
    try {
      const scriptData = {
        text_entry: finalText,
        project_id: projectId
      }
      
      const result = await apiClient.createScript(scriptData)
      if (result.data) {
        onScriptCreated?.(result.data.id)
      }
    } catch (error) {
      console.error("Error creating script:", error)
    } finally {
      setIsCreatingScript(false)
    }
  }

  const insertSuggestion = (suggestion: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = textEntry.substring(0, start) + suggestion + textEntry.substring(end)
      setTextEntry(newText)
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + suggestion.length, start + suggestion.length)
      }, 0)
    }
  }

  const autoComplete = async () => {
    if (!textEntry.trim() || textareaRef.current === null) return
    
    const textarea = textareaRef.current
    const cursorPosition = textarea.selectionStart
    const textBeforeCursor = textEntry.substring(0, cursorPosition)
    const textAfterCursor = textEntry.substring(cursorPosition)
    
    // Get AI suggestion for completion
    const result = await assistAutoScript(textBeforeCursor, "Continúa este texto de manera natural")
    console.log("Auto-complete result:", result)
    if (result && result.enhanced_text) {
      // Extract only the new part that was added
      const newPart = result.enhanced_text.substring(textBeforeCursor.length)
      if (newPart) {
        const completedText = textBeforeCursor + newPart + textAfterCursor
        setTextEntry(completedText)
        
        // Set cursor position after the completion
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(
            cursorPosition + newPart.length, 
            cursorPosition + newPart.length
          )
        }, 0)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Editor Automático con IA
          </CardTitle>
          <CardDescription>
            Escribe tu historia y deja que la IA te ayude a mejorarla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-entry">Tu Historia</Label>
              <div className="relative mt-1">
                <Textarea
                  ref={textareaRef}
                  id="text-entry"
                  placeholder="Escribe tu historia aquí... La IA te ayudará a mejorarla y expandirla."
                  value={textEntry}
                  onChange={(e) => setTextEntry(e.target.value)}
                  className="min-h-[300px] resize-none"
                  onKeyDown={(e) => {
                    // Auto-complete with Ctrl+Space
                    if (e.ctrlKey && e.code === "Space") {
                      e.preventDefault()
                      autoComplete()
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  Ctrl+Space para autocompletar
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleEnhanceText} 
                disabled={isLoading || !textEntry.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Mejorar con IA
              </Button>
              
              <Button 
                variant="outline"
                onClick={autoComplete} 
                disabled={isLoading || !textEntry.trim()}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Autocompletar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Text Preview */}
      {showEnhanced && enhancedText && (
        <Card className="border-green-200 bg-green-50/5">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Versión Mejorada por IA
            </CardTitle>
            <CardDescription>
              Aquí está tu historia mejorada por la inteligencia artificial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{enhancedText}</p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleUseEnhanced}>
                  Usar Esta Versión
                </Button>
                <Button variant="outline" onClick={() => setShowEnhanced(false)}>
                  Mantener Original
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sugerencias de IA</CardTitle>
            <CardDescription>
              Haz clic en cualquier sugerencia para insertarla en tu texto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors"
                  onClick={() => insertSuggestion(suggestion)}
                >
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Structure Improvements */}
      {structureImprovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mejoras Estructurales</CardTitle>
            <CardDescription>
              Consejos para mejorar la estructura de tu historia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {structureImprovements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">
                    {index + 1}
                  </Badge>
                  <p className="text-sm flex-1">{improvement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Script */}
      <Card>
        <CardHeader>
          <CardTitle>Crear Script</CardTitle>
          <CardDescription>
            Cuando estés satisfecho con tu historia, créala como script
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCreateScript}
            disabled={isCreatingScript || (!textEntry.trim() && !enhancedText.trim())}
            size="lg"
          >
            {isCreatingScript ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Crear Script Automático
          </Button>
        </CardContent>
      </Card>

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
