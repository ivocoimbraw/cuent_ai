"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getProject, getScript, getAssetsByScript } from "@/lib/data-fetching"
import { ScriptDetail } from "@/components/script-detail"
import { useAuthStore } from "@/lib/auth-store"

export default function ScriptDetailPage() {
  const params = useParams()
  const { user } = useAuthStore()
  const [project, setProject] = useState<any>(null)
  const [script, setScript] = useState<any>(null)
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!user || !params.id || !params.scriptId) return

      try {
        const [fetchedProject, fetchedScript, fetchedAssets] = await Promise.all([
          getProject(params.id as string),
          getScript(params.scriptId as string),
          getAssetsByScript(params.scriptId as string)
        ])

        if (!fetchedProject || !fetchedScript) {
          setError("Proyecto o script no encontrado")
          return
        }

        setProject(fetchedProject)
        setScript(fetchedScript)
        setAssets(fetchedAssets)
      } catch (err) {
        setError("Error al cargar los datos")
        console.error("Error loading data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id, params.scriptId, user])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-400">Cargando script...</p>
        </div>
      </div>
    )
  }

  if (error || !project || !script) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-400">{error || "Script no encontrado"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <ScriptDetail 
        project={project} 
        script={script} 
        initialAssets={assets} 
      />
    </div>
  )
}
