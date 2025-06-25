"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, FileText, Edit3, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Project } from "@/lib/types"
import { updateProject, deleteProject } from "@/lib/data-fetching"

interface ProjectCardProps {
  project: Project
  onSelect: (project: Project) => void
  onProjectUpdated?: (project: Project) => void
  onProjectDeleted?: (projectId: string) => void
}

export function ProjectCard({ project, onSelect, onProjectUpdated, onProjectDeleted }: ProjectCardProps) {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const contextMenuRef = useRef<HTMLDivElement>(null)
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setContextMenuPosition({ x, y })
    setShowContextMenu(true)
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowContextMenu(false)
      }
    }

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showContextMenu])

  const handleUpdateProject = async () => {
    if (!editForm.name.trim()) {
      setError("El nombre del proyecto es requerido")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await updateProject(project.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim()
      })

      if (result.success && result.data) {
        setShowEditDialog(false)
        setError("")
        onProjectUpdated?.(result.data)
      } else {
        setError(result.error || "Error al actualizar el proyecto")
      }
    } catch (err) {
      setError("Error inesperado al actualizar el proyecto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await deleteProject(project.id)

      if (result.success) {
        setShowDeleteDialog(false)
        onProjectDeleted?.(project.id)
      } else {
        setError(result.error || "Error al eliminar el proyecto")
      }
    } catch (err) {
      setError("Error inesperado al eliminar el proyecto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Card
          className="bg-gray-900/50 border-gray-800 hover:border-purple-600/50 transition-colors cursor-pointer group relative"
          onClick={() => onSelect(project)}
          onContextMenu={handleContextMenu}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                  {project.name}
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">{project.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(project.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Proyecto</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Context Menu */}
        {showContextMenu && (
          <motion.div
            ref={contextMenuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[150px] py-1"
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          >
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowContextMenu(false)
                setEditForm({ name: project.name, description: project.description })
                setShowEditDialog(true)
              }}
            >
              <Edit3 className="h-4 w-4" />
              Editar
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 w-full text-left transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowContextMenu(false)
                setShowDeleteDialog(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Proyecto</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifica la información de tu proyecto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-white">Nombre del Proyecto</Label>
              <Input
                id="project-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Nombre del proyecto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-white">Descripción</Label>
              <Textarea
                id="project-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Descripción del proyecto"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false)
                setEditForm({ name: project.name, description: project.description })
                setError("")
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateProject}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Eliminar Proyecto</DialogTitle>
            <DialogDescription className="text-gray-400">
              ¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h4 className="text-white font-semibold">{project.name}</h4>
            <p className="text-gray-400 text-sm mt-1">{project.description}</p>
            <p className="text-gray-500 text-xs mt-2">Creado el {formatDate(project.created_at)}</p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setError("")
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteProject}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Proyecto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}