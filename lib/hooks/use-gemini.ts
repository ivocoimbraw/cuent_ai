import { useState, useCallback } from "react"
import { GeminiClient, createGeminiClient, ScriptLine, KeywordRecommendation, SFXRecommendation } from "@/lib/gemini-client"

interface UseGeminiConfig {
  apiKey?: string
}

interface UseGeminiReturn {
  client: GeminiClient | null
  isLoading: boolean
  error: string | null
  
  // Manual script assistance
  assistManualScript: (
    userInput: string,
    context?: string,
    existingLines?: ScriptLine[]
  ) => Promise<{
    suggestions: ScriptLine[]
    improvements: string[]
    structure_tips: string[]
  } | null>
  
  // Auto script assistance  
  assistAutoScript: (
    textEntry: string,
    projectContext?: string
  ) => Promise<{
    enhanced_text: string
    suggestions: string[]
    structure_improvements: string[]
  } | null>
  
  // Video keywords
  recommendVideoKeywords: (
    text: string,
    videoStyle?: string
  ) => Promise<KeywordRecommendation | null>
  
  // SFX recommendations
  recommendSFXDescription: (
    context: string,
    mood?: string,
    intensity?: "low" | "medium" | "high"
  ) => Promise<SFXRecommendation | null>
  
  // Script analysis
  analyzeScript: (script: ScriptLine[]) => Promise<{
    overall_quality: number
    suggestions: string[]
    missing_elements: string[]
    sfx_opportunities: string[]
    pacing_feedback: string
  } | null>
  
  clearError: () => void
}

export const useGemini = (config?: UseGeminiConfig): UseGeminiReturn => {
  const [client, setClient] = useState<GeminiClient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize client
  const initializeClient = useCallback((apiKey: string) => {
    try {
      const geminiClient = createGeminiClient(apiKey)
      setClient(geminiClient)
      setError(null)
    } catch (err) {
      setError("Error al inicializar el cliente de Gemini")
      console.error("Gemini client initialization error:", err)
    }
  }, [])

  // Auto-initialize if API key is provided
  useState(() => {
    const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (apiKey && !client) {
      initializeClient(apiKey)
    }
  })

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    if (!client) {
      setError("Cliente de Gemini no inicializado")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      console.error("Gemini API call error:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [client])

  const assistManualScript = useCallback(async (
    userInput: string,
    context?: string,
    existingLines?: ScriptLine[]
  ) => {
    return handleApiCall(() => 
      client!.assistManualScript(userInput, context, existingLines)
    )
  }, [client, handleApiCall])

  const assistAutoScript = useCallback(async (
    textEntry: string,
    projectContext?: string
  ) => {
    return handleApiCall(() => 
      client!.assistAutoScript(textEntry, projectContext)
    )
  }, [client, handleApiCall])

  const recommendVideoKeywords = useCallback(async (
    text: string,
    videoStyle?: string
  ) => {
    return handleApiCall(() => 
      client!.recommendVideoKeywords(text, videoStyle)
    )
  }, [client, handleApiCall])

  const recommendSFXDescription = useCallback(async (
    context: string,
    mood?: string,
    intensity?: "low" | "medium" | "high"
  ) => {
    return handleApiCall(() => 
      client!.recommendSFXDescription(context, mood, intensity)
    )
  }, [client, handleApiCall])

  const analyzeScript = useCallback(async (script: ScriptLine[]) => {
    return handleApiCall(() => 
      client!.analyzeScript(script)
    )
  }, [client, handleApiCall])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    client,
    isLoading,
    error,
    assistManualScript,
    assistAutoScript,
    recommendVideoKeywords,
    recommendSFXDescription,
    analyzeScript,
    clearError
  }
}

export default useGemini
