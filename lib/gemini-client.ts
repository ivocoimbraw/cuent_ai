// Gemini AI service for CUENT-AI
// Provides AI assistance for script creation, keyword generation, and content recommendations

export interface GeminiConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ScriptLine {
  text: string
  type: "TTS" | "SFX"
  position: number
}

export interface ManualScriptRequest {
  lines: Array<{ text: string; type: string }>
  project_id: string
}

export interface AutoScriptRequest {
  text_entry: string
  project_id: string
}

export interface KeywordRecommendation {
  primary_keywords: string[]
  secondary_keywords: string[]
  style_keywords: string[]
  context: string
  confidence: number
}

export interface SFXRecommendation {
  sound_description: string
  alternative_descriptions: string[]
  intensity_level: "low" | "medium" | "high"
  duration_suggestion: string
  context: string
}

export class GeminiClient {
  private apiKey: string
  private model: string
  private temperature: number
  private maxTokens: number
  private baseURL: string

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey
    this.model = config.model || "gemini-2.5-flash"
    this.temperature = config.temperature || 0.7
    this.maxTokens = config.maxTokens || 1000
    this.baseURL = "https://generativelanguage.googleapis.com/v1beta"
  }

  private cleanJsonResponse(response: string): string {
    // Remove markdown code blocks if present
    let cleaned = response.trim()
    
    // Remove ```json and closing ```
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7)
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3)
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3)
    }
    
    return cleaned.trim()
  }

  private async makeRequest(prompt: string, systemPrompt?: string): Promise<string> {
    const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
        candidateCount: 1,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error("Invalid response from Gemini API")
      }

      const rawText = data.candidates[0].content.parts[0].text
      console.log("Raw response from Gemini:", rawText)
      return this.cleanJsonResponse(rawText)
    } catch (error) {
      console.error("Gemini API request failed:", error)
      throw error
    }
  }

  /**
   * Asistente para creación manual de scripts
   * Ayuda a estructurar y mejorar las líneas del script
   */
  async assistManualScript(
    userInput: string,
    context?: string,
    existingLines?: ScriptLine[]
  ): Promise<{
    suggestions: ScriptLine[]
    improvements: string[]
    structure_tips: string[]
  }> {
    const systemPrompt = `Eres un asistente experto en creación de scripts para cuentos digitales. 
    Tu trabajo es ayudar a estructurar scripts que incluyen tanto diálogos/narración (TTS) como efectos de sonido (SFX).
    
    Reglas importantes:
    - TTS: Texto que será convertido a voz (diálogos, narración)
    - SFX: Efectos de sonido (descripciones de sonidos en inglés para mejores resultados)
    - Mantén una estructura lógica y fluida
    - Los efectos de sonido deben ser descriptivos pero concisos
    
    IMPORTANTE: 
    - Responde ÚNICAMENTE con JSON válido
    - NO uses bloques de código markdown
    - NO agregues texto explicativo antes o después del JSON
    - Devuelve solamente el objeto JSON`

    const contextInfo = context ? `Contexto del proyecto: ${context}\n` : ""
    const existingInfo = existingLines && existingLines.length > 0 
      ? `Líneas existentes: ${JSON.stringify(existingLines)}\n` 
      : ""

    const prompt = `${contextInfo}${existingInfo}
    Usuario solicita: "${userInput}"
    
    Proporciona sugerencias para mejorar o completar el script. Responde en este formato JSON:
    {
      "suggestions": [
        {
          "text": "texto de la línea",
          "type": "TTS" o "SFX",
          "position": número
        }
      ],
      "improvements": ["sugerencia de mejora 1", "sugerencia 2"],
      "structure_tips": ["consejo estructural 1", "consejo 2"]
    }`

    try {
      const response = await this.makeRequest(prompt, systemPrompt)
      const parsed = JSON.parse(response)
      return parsed
    } catch (error) {
      console.error("Error parsing manual script assistance:", error)
      return {
        suggestions: [],
        improvements: ["Error al procesar la solicitud. Intenta nuevamente."],
        structure_tips: []
      }
    }
  }

  /**
   * Asistente para autocompletar scripts automáticos
   * Ayuda a mejorar y expandir el texto de entrada
   */
  async assistAutoScript(
    textEntry: string,
    projectContext?: string
  ): Promise<{
    enhanced_text: string
    suggestions: string[]
    structure_improvements: string[]
  }> {
    const systemPrompt = `Eres un experto en creación de cuentos y narrativas digitales.
    Tu trabajo es mejorar y expandir textos para crear mejores scripts automáticos.
    
    Enfócate en:
    - Narrativa clara y envolvente
    - Estructura coherente
    - Diálogos naturales cuando aplique
    - Descripciones vívidas pero concisas
    
    IMPORTANTE: 
    - Responde ÚNICAMENTE con JSON válido
    - NO uses bloques de código markdown
    - NO agregues texto explicativo antes o después del JSON
    - Devuelve solamente el objeto JSON`

    const contextInfo = projectContext ? `Contexto del proyecto: ${projectContext}\n` : ""

    const prompt = `${contextInfo}
    Texto original: "${textEntry}"
    
    Mejora este texto para crear un mejor script automático. Responde con este formato JSON exacto:
    {
      "enhanced_text": "versión mejorada del texto",
      "suggestions": ["sugerencia de mejora 1", "sugerencia 2"],
      "structure_improvements": ["mejora estructural 1", "mejora 2"]
    }`
    console.log("Prompt for Gemini:", prompt)
    console.log("System prompt for Gemini:", systemPrompt)
    try {
      const response = await this.makeRequest(prompt, systemPrompt)
      console.log("Raw response from Gemini:", response)
      const parsed = JSON.parse(response)
      return parsed
    } catch (error) {
      console.error("Error parsing auto script assistance:", error)
      return {
        enhanced_text: textEntry,
        suggestions: ["Error al procesar la solicitud. Intenta nuevamente."],
        structure_improvements: []
      }
    }
  }

  /**
   * Recomendador de keywords para generación de video
   * Genera keywords en inglés optimizadas para generación de video
   */
  async recommendVideoKeywords(
    text: string,
    videoStyle?: string
  ): Promise<KeywordRecommendation> {
    const systemPrompt = `Eres un experto en generación de video por IA y keywords de video.
    Tu trabajo es analizar texto y generar keywords en inglés optimizadas para generación de video.
    
    Enfócate en:
    - Keywords visuales específicas
    - Estilos de video apropiados
    - Elementos compositivos
    - Iluminación y ambiente
    
    IMPORTANTE: 
    - Responde ÚNICAMENTE con JSON válido
    - NO uses bloques de código markdown
    - NO agregues texto explicativo antes o después del JSON
    - Devuelve solamente el objeto JSON`

    const styleInfo = videoStyle ? `Estilo de video deseado: ${videoStyle}\n` : ""

    const prompt = `${styleInfo}
    Texto para analizar: "${text}"
    
    Genera keywords en inglés para la mejor generación de video. Responde en este formato JSON:
    {
      "primary_keywords": ["keyword principal 1", "keyword principal 2"],
      "secondary_keywords": ["keyword secundario 1", "keyword secundario 2"],
      "style_keywords": ["estilo 1", "estilo 2"],
      "context": "breve explicación del contexto visual",
      "confidence": 0.85
    }`

    try {
      const response = await this.makeRequest(prompt, systemPrompt)
      const parsed = JSON.parse(response)
      return parsed
    } catch (error) {
      console.error("Error generating video keywords:", error)
      return {
        primary_keywords: ["story scene", "narrative"],
        secondary_keywords: ["cinematic", "storytelling"],
        style_keywords: ["animated", "colorful"],
        context: "Error al procesar la solicitud",
        confidence: 0.1
      }
    }
  }

  /**
   * Recomendador de texto para efectos de sonido (SFX)
   * Genera descripciones en inglés optimizadas para ElevenLabs
   */
  async recommendSFXDescription(
    context: string,
    mood?: string,
    intensity?: "low" | "medium" | "high"
  ): Promise<SFXRecommendation> {
    const systemPrompt = `Eres un experto en diseño de sonido y efectos de audio.
    Tu trabajo es generar descripciones en inglés optimizadas para generación de efectos de sonido con ElevenLabs.
    
    Enfócate en:
    - Descripciones claras y específicas
    - Términos técnicos de audio cuando sea necesario
    - Intensidad y duración apropiadas
    - Alternativas creativas
    
    IMPORTANTE: 
    - Responde ÚNICAMENTE con JSON válido
    - NO uses bloques de código markdown
    - NO agregues texto explicativo antes o después del JSON
    - Devuelve solamente el objeto JSON`

    const moodInfo = mood ? `Estado de ánimo: ${mood}\n` : ""
    const intensityInfo = intensity ? `Intensidad deseada: ${intensity}\n` : ""

    const prompt = `${moodInfo}${intensityInfo}
    Contexto para el efecto de sonido: "${context}"
    
    Genera una descripción en inglés optimizada para ElevenLabs. Responde en este formato JSON:
    {
      "sound_description": "descripción principal del sonido en inglés",
      "alternative_descriptions": ["alternativa 1", "alternativa 2"],
      "intensity_level": "low" | "medium" | "high",
      "duration_suggestion": "sugerencia de duración",
      "context": "explicación del contexto sonoro"
    }`

    try {
      const response = await this.makeRequest(prompt, systemPrompt)
      const parsed = JSON.parse(response)
      return parsed
    } catch (error) {
      console.error("Error generating SFX recommendation:", error)
      return {
        sound_description: "ambient sound effect",
        alternative_descriptions: ["background audio", "environmental sound"],
        intensity_level: intensity || "medium",
        duration_suggestion: "2-5 seconds",
        context: "Error al procesar la solicitud"
      }
    }
  }

  /**
   * Análisis completo de un script para recomendaciones generales
   */
  async analyzeScript(script: ScriptLine[]): Promise<{
    overall_quality: number
    suggestions: string[]
    missing_elements: string[]
    sfx_opportunities: string[]
    pacing_feedback: string
  }> {
    const systemPrompt = `Eres un experto en análisis de scripts para medios digitales.
    Analiza scripts que contienen tanto elementos TTS (texto a voz) como SFX (efectos de sonido).
    Proporciona retroalimentación constructiva y específica.
    
    IMPORTANTE: 
    - Responde ÚNICAMENTE con JSON válido
    - NO uses bloques de código markdown
    - NO agregues texto explicativo antes o después del JSON
    - Devuelve solamente el objeto JSON`

    const prompt = `Analiza este script completo:
    ${JSON.stringify(script, null, 2)}
    
    Proporciona un análisis detallado en formato JSON:
    {
      "overall_quality": 0.85,
      "suggestions": ["sugerencia específica 1", "sugerencia 2"],
      "missing_elements": ["elemento faltante 1", "elemento 2"],
      "sfx_opportunities": ["oportunidad SFX 1", "oportunidad 2"],
      "pacing_feedback": "feedback sobre el ritmo y flujo"
    }`

    try {
      const response = await this.makeRequest(prompt, systemPrompt)
      const parsed = JSON.parse(response)
      return parsed
    } catch (error) {
      console.error("Error analyzing script:", error)
      return {
        overall_quality: 0.5,
        suggestions: ["Error al procesar el análisis. Intenta nuevamente."],
        missing_elements: [],
        sfx_opportunities: [],
        pacing_feedback: "No se pudo analizar el script."
      }
    }
  }
}

// Configuración por defecto
export const createGeminiClient = (apiKey: string): GeminiClient => {
  return new GeminiClient({
    apiKey,
    model: "gemini-1.5-pro",
    temperature: 0.7,
    maxTokens: 1000
  })
}

export default GeminiClient
