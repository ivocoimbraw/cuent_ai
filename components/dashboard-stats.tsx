"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, FolderOpen, FileText, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store"
import { getProjects } from "@/lib/data-fetching"

export function DashboardStats() {
  const { user } = useAuthStore()
  const [projectsCount, setProjectsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return
      
      try {
        const projects = await getProjects()
        setProjectsCount(projects.length)
      } catch (error) {
        console.error("Error loading projects:", error)
        setProjectsCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [user])

  const currentSubscription = user?.all_subscriptions?.[0]
  const tokensUsed = currentSubscription?.total_Cuentokens || 0
  const totalTokens = currentSubscription?.Subscription.cuent_tokens || 1000
  const tokensPercentage = (tokensUsed / totalTokens) * 100

  const stats = [
    {
      title: "Proyectos Activos",
      value: isLoading ? "..." : projectsCount,
      icon: FolderOpen,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Scripts Generados",
      value: "12",
      icon: FileText,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Tokens Disponibles",
      value: `${totalTokens - tokensUsed}`,
      icon: Zap,
      color: "from-green-500 to-green-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold text-white">¡Hola, {user?.name}! 👋</h1>
        <p className="text-gray-400">Bienvenido de vuelta a CUENT-AI. ¿Listo para crear historias increíbles?</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Token Usage */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Uso de Tokens</CardTitle>
            <CardDescription className="text-gray-400">Plan {currentSubscription?.Subscription.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tokens utilizados</span>
                <span className="text-white">
                  {tokensUsed} / {totalTokens}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${tokensPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Acciones Rápidas</CardTitle>
            <CardDescription className="text-gray-400">Comienza a crear contenido ahora mismo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <Button
                className="h-auto p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                onClick={() => (window.location.href = "/projects")}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Mis Proyectos</div>
                    <div className="text-sm opacity-80">Crea un proyecto desde cero o visualiza tus proyectos</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
