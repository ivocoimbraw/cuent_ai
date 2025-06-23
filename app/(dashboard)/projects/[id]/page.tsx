"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getProject } from "@/lib/data-fetching"
import { ProjectDetail } from "@/components/project-detail"
import { useAuthStore } from "@/lib/auth-store"

export default function ProjectDetailPage() {
  const params = useParams()
  const { user } = useAuthStore()
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProject = async () => {
      if (!user || !params.id) return

      try {
        const fetchedProject = await getProject(params.id as string)
        if (fetchedProject) {
          setProject(fetchedProject)
        } else {
          setError("Proyecto no encontrado")
        }
      } catch (err) {
        setError("Error al cargar el proyecto")
        console.error("Error loading project:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [params.id, user])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-400">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-400">{error || "Proyecto no encontrado"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <ProjectDetail project={project} />
    </div>
  )
}