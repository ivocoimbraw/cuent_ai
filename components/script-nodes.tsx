"use client"

import { motion } from "framer-motion"
import { FileText, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Script } from "@/lib/types"

interface ScriptNodesProps {
  scripts: Script[]
  currentScript: Script | null
  onSelectScript: (script: Script) => void
  onCreateScript: () => void
}

const getStateIcon = (state: Script["state"]) => {
  switch (state) {
    case "FINISHED":
      return <CheckCircle className="h-4 w-4 text-green-400" />
    case "PROCESSING":
      return <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
    case "ERROR":
      return <AlertCircle className="h-4 w-4 text-red-400" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

const getStateColor = (state: Script["state"]) => {
  switch (state) {
    case "FINISHED":
      return "border-green-500/50 bg-green-500/10"
    case "PROCESSING":
      return "border-yellow-500/50 bg-yellow-500/10"
    case "ERROR":
      return "border-red-500/50 bg-red-500/10"
    default:
      return "border-gray-600/50 bg-gray-800/50"
  }
}

export function ScriptNodes({ scripts, currentScript, onSelectScript, onCreateScript }: ScriptNodesProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Scripts del Proyecto</h2>
        <Button
          onClick={onCreateScript}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Nuevo Script
        </Button>
      </div>

      {scripts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg"
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No hay scripts aún</h3>
          <p className="text-gray-400 mb-4">Crea tu primer script para comenzar</p>
          <Button
            onClick={onCreateScript}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            Crear Primer Script
          </Button>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Connection Lines */}
          <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-cyan-500 opacity-30" />

          {/* Script Nodes */}
          <div className="space-y-4">
            {scripts.map((script, index) => (
              <motion.div
                key={script.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Dot */}
                <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 border-2 border-black z-10" />

                <Card
                  className={`ml-16 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    currentScript?.id === script.id
                      ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                      : getStateColor(script.state)
                  }`}
                  onClick={() => onSelectScript(script)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-purple-400">Script #{script.position}</span>
                          {getStateIcon(script.state)}
                        </div>
                        <p className="text-white font-medium mb-1">
                          {script.text_entry.slice(0, 60)}
                          {script.text_entry.length > 60 ? "..." : ""}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Creado: {new Date(script.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 capitalize">{script.state.toLowerCase()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
