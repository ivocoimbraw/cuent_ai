"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/project-card"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { getProjects } from "@/lib/data-fetching"
import { useAuthStore } from "@/lib/auth-store"

interface Project {
  id: string
  name: string
  description: string
  cuentokens: string
  state: string
  scripts?: any[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export function ProjectsList() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return
      
      try {
        const fetchedProjects = await getProjects()
        setProjects(fetchedProjects)
      } catch (error) {
        console.error("Error loading projects:", error)
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [user])

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectProject = (project: Project) => {
    window.location.href = `/projects/${project.id}`
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    )
  }

  const handleProjectDeleted = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Mis Proyectos</h1>
            <p className="text-gray-400 mt-1">Gestiona y organiza todos tus proyectos de cuentos</p>
          </div>
          <CreateProjectDialog />
        </div>
        <div className="text-center py-12">
          <p className="text-gray-400">Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Mis Proyectos</h1>
          <p className="text-gray-400 mt-1">Gestiona y organiza todos tus proyectos de cuentos</p>
        </div>
        <CreateProjectDialog />
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar proyectos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
        />
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <ProjectCard 
              project={project} 
              onSelect={handleSelectProject}
              onProjectUpdated={handleProjectUpdated}
              onProjectDeleted={handleProjectDeleted}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 text-lg mb-4">
            {searchTerm ? "No se encontraron proyectos" : "No tienes proyectos aún"}
          </div>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? "Intenta con otros términos de búsqueda" 
              : "Crea tu primer proyecto para comenzar a escribir historias increíbles"
            }
          </p>
          <CreateProjectDialog />
        </motion.div>
      )}
    </div>
  )
}
