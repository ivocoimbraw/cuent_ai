"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Calendar, CreditCard, History, Settings, Coins, TrendingUp, Trophy, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/client"
import { useAuthStore } from "@/lib/auth-store"
import { useRequireAuth } from "@/lib/use-require-auth"

interface UserProfile {
  id: string
  name: string
  email: string
  all_subscriptions: Array<{
    id: string
    total_Cuentokens: number
    start_date: string
    end_date: string
    Subscription: {
      id: string
      name: string
      cuent_tokens: number
      duration: string
      created_at: string
      updated_at: string
    }
    created_at: string
    updated_at: string
  }>
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  useRequireAuth()
  
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setError("")
      console.log("🔄 Cargando perfil del usuario...")
      
      const response = await apiClient.getProfile()
      console.log("👤 Perfil obtenido:", response)
      setProfile(response.data)
      
    } catch (err) {
      console.error("❌ Error loading profile:", err)
      setError(`Error al cargar el perfil: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentSubscription = () => {
    if (!profile?.all_subscriptions?.length) return null
    
    const now = new Date()
    return profile.all_subscriptions.find(sub => {
      const endDate = new Date(sub.end_date)
      return endDate > now
    }) || profile.all_subscriptions[profile.all_subscriptions.length - 1]
  }

  const getTotalTokensUsed = () => {
    if (!profile?.all_subscriptions?.length) return 0
    
    return profile.all_subscriptions.reduce((total, sub) => {
      const originalTokens = sub.Subscription.cuent_tokens
      const remainingTokens = sub.total_Cuentokens
      return total + (originalTokens - remainingTokens)
    }, 0)
  }

  const getSubscriptionStats = () => {
    if (!profile?.all_subscriptions?.length) return { total: 0, active: 0, expired: 0 }
    
    const now = new Date()
    let active = 0
    let expired = 0
    
    profile.all_subscriptions.forEach(sub => {
      const endDate = new Date(sub.end_date)
      if (endDate > now) {
        active++
      } else {
        expired++
      }
    })
    
    return {
      total: profile.all_subscriptions.length,
      active,
      expired
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSubscriptionStatus = (subscription: UserProfile['all_subscriptions'][0]) => {
    const now = new Date()
    const endDate = new Date(subscription.end_date)
    const startDate = new Date(subscription.start_date)
    
    if (now < startDate) return 'pending'
    if (now > endDate) return 'expired'
    return 'active'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'expired': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa'
      case 'expired': return 'Expirada'
      case 'pending': return 'Pendiente'
      default: return 'Desconocida'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertDescription className="text-red-400">
            No se pudo cargar el perfil del usuario
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentSubscription = getCurrentSubscription()
  const stats = getSubscriptionStats()
  const totalTokensUsed = getTotalTokensUsed()

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-white">Mi Perfil</h1>
        <p className="text-xl text-gray-400">
          Gestiona tu información personal y revisa tu actividad
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Personal Information */}
        <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Nombre</label>
                <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-white">{profile.name}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Email</label>
                <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-white">{profile.email}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Miembro desde</label>
                <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-white">{formatDate(profile.created_at)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">ID de Usuario</label>
                <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                  <Settings className="h-4 w-4 text-gray-400" />
                  <span className="text-white font-mono text-xs">{profile.id}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex gap-4">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Settings className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Cambiar Contraseña
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-900/5 border-purple-600/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <TrendingUp className="h-5 w-5" />
              Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {currentSubscription?.total_Cuentokens?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-400">Tokens Disponibles</div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Tokens Utilizados</span>
                <span className="text-white font-semibold">
                  {totalTokensUsed.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Suscripciones Activas</span>
                <span className="text-green-400 font-semibold">{stats.active}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Suscripciones</span>
                <span className="text-white font-semibold">{stats.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Subscription */}
      {currentSubscription && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-600/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <CreditCard className="h-5 w-5" />
                Suscripción Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Plan</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-white">
                      {currentSubscription.Subscription.name}
                    </p>
                    <Badge className={`${getStatusColor(getSubscriptionStatus(currentSubscription))} text-white`}>
                      {getStatusText(getSubscriptionStatus(currentSubscription))}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Tokens del Plan</p>
                  <p className="text-lg font-semibold text-white">
                    {currentSubscription.Subscription.cuent_tokens.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Tokens Disponibles</p>
                  <p className="text-lg font-semibold text-green-400">
                    {currentSubscription.total_Cuentokens.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Válida hasta</p>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(currentSubscription.end_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Subscription History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <History className="h-5 w-5" />
              Historial de Suscripciones
            </CardTitle>
            <CardDescription>
              Revisa todas tus suscripciones pasadas y actuales
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.all_subscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tienes suscripciones registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.all_subscriptions
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((subscription, index) => {
                    const status = getSubscriptionStatus(subscription)
                    const tokensUsed = subscription.Subscription.cuent_tokens - subscription.total_Cuentokens
                    const usagePercentage = (tokensUsed / subscription.Subscription.cuent_tokens) * 100
                    
                    return (
                      <motion.div
                        key={subscription.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-white">
                                {subscription.Subscription.name}
                              </h3>
                              <Badge className={`${getStatusColor(status)} text-white`}>
                                {getStatusText(status)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Inicio:</span>
                                <div className="text-white">{formatDate(subscription.start_date)}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Fin:</span>
                                <div className="text-white">{formatDate(subscription.end_date)}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Tokens Usados:</span>
                                <div className="text-white">{tokensUsed.toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Tokens Restantes:</span>
                                <div className="text-green-400">{subscription.total_Cuentokens.toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-400">
                              {subscription.Subscription.cuent_tokens.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">tokens totales</div>
                          </div>
                        </div>
                        
                        {/* Usage Progress */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Uso: {usagePercentage.toFixed(1)}%</span>
                            <span>{tokensUsed.toLocaleString()} / {subscription.Subscription.cuent_tokens.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
