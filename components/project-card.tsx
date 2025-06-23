"use client"

import { motion } from "framer-motion"
import { Calendar, FileText, MoreVertical } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
  onSelect: (project: Project) => void
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="bg-gray-900/50 border-gray-800 hover:border-purple-600/50 transition-colors cursor-pointer group"
        onClick={() => onSelect(project)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                {project.name}
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">{project.description}</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation() // Evitar que se active el onSelect del Card
                
                console.log('Opciones del proyecto:', project.name)
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
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
    </motion.div>
  )
}
