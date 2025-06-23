"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Settings, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScriptNodes } from "@/components/script-nodes"
import { Project } from "@/lib/types"

interface ProjectDetailProps {
  project: Project
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const projectScripts = project.scripts || []

  const handleSelectScript = (script: any) => {
    window.location.href = `/projects/${project.id}/scripts/${script.id}`
  }

  const handleCreateScript = () => {
    window.location.href = `/projects/${project.id}/scripts/new`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/projects")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proyectos
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <p className="text-gray-400 mt-1">{project.description}</p>
            <p className="text-gray-500 text-sm mt-2">
              Creado: {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Project Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Scripts Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{projectScripts.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Scripts Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {projectScripts.filter((s) => s.state === "FINISHED").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">En Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {projectScripts.filter((s) => s.state === "PROCESSING").length}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Script Nodes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ScriptNodes
          scripts={projectScripts}
          currentScript={null}
          onSelectScript={handleSelectScript}
          onCreateScript={handleCreateScript}
        />
      </motion.div>
    </div>
  )
}
