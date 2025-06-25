"use client"

import { useRouter } from "next/navigation"
import { GeminiStudio } from "@/components/gemini-studio"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"

interface AIStudioPageProps {
  params: {
    id: string
  }
}

export default function AIStudioPage({ params }: AIStudioPageProps) {
  const router = useRouter()

  const handleScriptCreated = (scriptId: string) => {
    // Redirigir al script creado
    router.push(`/projects/${params.id}/scripts/${scriptId}`)
  }

  const handleBack = () => {
    router.push(`/projects/${params.id}`)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Proyecto
            </Button>
            <div className="h-6 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <h1 className="text-2xl font-bold">AI Studio</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <GeminiStudio 
          projectId={params.id}
          onScriptCreated={handleScriptCreated}
        />
      </div>
    </div>
  )
}
