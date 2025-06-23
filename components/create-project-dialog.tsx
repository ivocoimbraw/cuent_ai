"use client"

import type React from "react"

import { useState } from "react"
import { Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/lib/auth-store"
import { createProject } from "@/lib/data-fetching"

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setIsLoading(true)

    try {
      const result = await createProject({
        name: formData.name,
        description: formData.description,
        user_id: user.id,
      })

      if (result.success) {
        setFormData({ name: "", description: "" })
        setOpen(false)
        // Refresh the page to show the new project
        window.location.reload()
      } else {
        setError(result.error || "Error al crear proyecto")
      }
    } catch (error) {
      setError("Error inesperado al crear proyecto")
      console.error("Project creation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setError(null)
      setFormData({ name: "", description: "" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription className="text-gray-400">
            Crea un nuevo proyecto para comenzar a escribir tu cuento
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Nombre del proyecto
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: El Bosque Mágico"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Descripción
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe brevemente tu proyecto..."
              value={formData.description}
              onChange={handleChange}
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              {isLoading ? "Creando..." : "Crear Proyecto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
