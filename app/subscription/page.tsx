"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Star, Zap, Crown, CreditCard, Loader2, X, Lock, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/client"
import { useAuthStore } from "@/lib/auth-store"
import { useRequireAuth } from "@/lib/use-require-auth"

interface SubscriptionPlan {
  id: string
  name: string
  cuent_tokens: number
  duration: string
  created_at: string
  updated_at: string
}

interface UserSubscription {
  id: string
  total_Cuentokens: number
  start_date: string
  end_date: string
  subscription: {
    id: string
    name: string
    cuent_tokens: number
    duration: string
    created_at: string
    updated_at: string
  }
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    created_at: string
  }>
  created_at: string
}

export default function SubscriptionPage() {
  useRequireAuth()
  
  const { user } = useAuthStore()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [paymentStep, setPaymentStep] = useState<"idle" | "preparing" | "processing" | "success" | "error">("idle")
  const [paymentError, setPaymentError] = useState("")
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError("")
      console.log("🔄 Cargando datos de suscripción...")
      
      // Cargar planes disponibles
      console.log("📋 Obteniendo planes de suscripción...")
      
      let activePlans: SubscriptionPlan[] = []
        try {
        const plansResponse = await apiClient.getSubscriptionPlans()
        console.log("📋 Respuesta de planes:", plansResponse)
        
        // Filtrar solo planes que NO sean "Free"
        activePlans = plansResponse.data.filter(
          plan => plan.name.toLowerCase() !== "free"
        )
        console.log("📋 Planes filtrados:", activePlans)
        
      } catch (apiError) {
        console.warn("⚠️ API de planes falló, usando datos de ejemplo:", apiError)
        
        // Datos de ejemplo cuando la API falla basados en la estructura real
        activePlans = [
          {
            id: "standard-plan",
            name: "Standard", 
            cuent_tokens: 5000,
            duration: "0000-01-30T00:00:00Z",
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-01T00:00:00Z"
          },
          {
            id: "pro-plan", 
            name: "Pro",
            cuent_tokens: 25000,
            duration: "0000-01-30T00:00:00Z",
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-01T00:00:00Z"
          },
          {
            id: "enterprise-plan",
            name: "Enterprise", 
            cuent_tokens: 100000,
            duration: "0000-01-30T00:00:00Z",
            created_at: "2023-01-01T00:00:00Z", 
            updated_at: "2023-01-01T00:00:00Z"
          }
        ]
      }
      
      setPlans(activePlans)

      // Cargar suscripción actual del usuario
      try {
        console.log("👤 Obteniendo suscripción del usuario...")
        const userSubResponse = await apiClient.getUserSubscription()
        console.log("👤 Respuesta de suscripción:", userSubResponse)
        setCurrentSubscription(userSubResponse.data)
      } catch (subError) {
        // Es normal que no tenga suscripción
        console.log("👤 Usuario sin suscripción actual:", subError)
      }
      
    } catch (err) {
      console.error("❌ Error loading subscription data:", err)
      setError(`Error al cargar los planes de suscripción: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return
    
    setSelectedPlan(plan)
    setShowCheckout(true)
    setPaymentStep("idle")
    setPaymentError("")
    setPaymentSuccess(false)
  }

  const handlePayment = async () => {
    if (!selectedPlan) return
    
    setSubscribingTo(selectedPlan.id)
    setPaymentStep("preparing")
    
    try {
      // Simular creación de Payment Intent
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPaymentStep("processing")
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Simular resultado del pago (85% éxito)
      const paymentSuccessful = Math.random() > 0.15
      
      if (paymentSuccessful) {
        setPaymentStep("success")
        setPaymentSuccess(true)
        
        // Simular webhook y actualización
        setTimeout(() => {
          setShowCheckout(false)
          loadData() // Recargar datos
          resetPaymentState()
        }, 3000)
        
      } else {
        const errors = [
          "Tu tarjeta fue declinada",
          "Fondos insuficientes",
          "Error de conexión con el banco",
          "Tarjeta expirada"
        ]
        const randomError = errors[Math.floor(Math.random() * errors.length)]
        setPaymentError(randomError)
        setPaymentStep("error")
      }
      
    } catch (error) {
      setPaymentError("Error inesperado durante el pago")
      setPaymentStep("error")
    } finally {
      setSubscribingTo(null)
    }
  }

  const resetPaymentState = () => {
    setSelectedPlan(null)
    setPaymentStep("idle")
    setPaymentError("")
    setPaymentSuccess(false)
    setSubscribingTo(null)
  }

  const closeCheckout = () => {
    setShowCheckout(false)
    setTimeout(resetPaymentState, 300)
  }

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes("standard") || name.includes("básico")) return Star
    if (name.includes("pro") || name.includes("profesional")) return Zap
    if (name.includes("enterprise") || name.includes("empresa")) return Crown
    return CreditCard
  }

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes("standard") || name.includes("básico")) return "from-blue-600 to-blue-700"
    if (name.includes("pro") || name.includes("profesional")) return "from-purple-600 to-purple-700"
    if (name.includes("enterprise") || name.includes("empresa")) return "from-amber-600 to-amber-700"
    return "from-gray-600 to-gray-700"
  }
    const isCurrentPlan = (planId: string) => {
    return currentSubscription?.subscription?.id === planId
  }

  // Función helper para obtener información adicional del plan
  const getPlanInfo = (plan: SubscriptionPlan) => {
    const name = plan.name.toLowerCase()
    
    let price = 0
    let currency = "COP"
    let features: string[] = []
    let description = ""

    switch (name) {
      case "standard":
        price = 15000
        description = "Plan básico para usuarios individuales"
        features = [
          `${plan.cuent_tokens.toLocaleString()} Cuentokens mensuales`,
          "Generación de audio básica",
          "Hasta 10 proyectos",
          "Soporte por email"
        ]
        break
      case "pro":
        price = 45000
        description = "Plan profesional con características avanzadas"
        features = [
          `${plan.cuent_tokens.toLocaleString()} Cuentokens mensuales`,
          "Generación de audio premium",
          "Proyectos ilimitados",
          "Efectos de sonido avanzados",
          "Soporte prioritario",
          "Exportación en alta calidad"
        ]
        break
      case "enterprise":
        price = 150000
        description = "Plan empresarial con todas las características"
        features = [
          `${plan.cuent_tokens.toLocaleString()} Cuentokens mensuales`,
          "API personalizada",
          "Integración empresarial",
          "Soporte 24/7 dedicado",
          "SLA garantizado",
          "Entrenamientos personalizados"
        ]
        break
      default:
        description = "Plan personalizado"
        features = [`${plan.cuent_tokens.toLocaleString()} Cuentokens mensuales`]
    }

    return { price, currency, features, description, interval: "mes" }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-400">Cargando planes de suscripción...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-white">
          Planes de Suscripción
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Desbloquea todo el potencial de CUENT-AI con nuestros planes premium
        </p>
      </motion.div>      {/* Current Subscription */}
      {currentSubscription && currentSubscription.subscription && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-600/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Check className="h-5 w-5" />
                Suscripción Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Plan</p>                  <p className="text-lg font-semibold text-white">
                    {currentSubscription.subscription?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tokens del Plan</p>
                  <p className="text-lg font-semibold text-white">
                    {currentSubscription.subscription?.cuent_tokens?.toLocaleString() || 0} tokens
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tokens Disponibles</p>
                  <p className="text-lg font-semibold text-green-400">
                    {currentSubscription.total_Cuentokens?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              {currentSubscription.end_date && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">Válido hasta</p>
                  <p className="text-white">
                    {new Date(currentSubscription.end_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}      {/* Plans Grid */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >        {plans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 space-y-2">
              <p className="text-lg">No hay planes de suscripción disponibles</p>
              <p className="text-sm">Verifica la consola para más detalles</p>
              <Button 
                onClick={loadData} 
                variant="outline" 
                className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Reintentar
              </Button>
            </div>
          </div>
        ) : (
          plans.map((plan, index) => {
          const Icon = getPlanIcon(plan.name)
          const isPopular = plan.name.toLowerCase().includes("pro")
          const isCurrent = isCurrentPlan(plan.id)
          const isSubscribing = subscribingTo === plan.id
          const planInfo = getPlanInfo(plan)

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="relative"
            >
              {/* Popular Badge */}
              {isPopular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                  Más Popular
                </Badge>
              )}

              <Card className={`h-full ${
                isPopular 
                  ? "border-purple-600/50 bg-gradient-to-b from-purple-900/20 to-purple-900/5" 
                  : "bg-gray-900/50 border-gray-800"
              } ${isCurrent ? "ring-2 ring-green-500/50" : ""} hover:border-purple-600/50 transition-all duration-300`}>
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getPlanColor(plan.name)} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                    <CardDescription className="text-gray-400">
                    {planInfo.description}
                  </CardDescription>

                  <div className="pt-4">
                    <div className="text-4xl font-bold text-white">
                      ${planInfo.price.toLocaleString()}
                      <span className="text-lg text-gray-400 font-normal">
                        /{planInfo.interval}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {planInfo.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || isSubscribing}
                    className={`w-full ${
                      isCurrent
                        ? "bg-green-600 hover:bg-green-600 cursor-default"
                        : isPopular
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                        : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                    }`}
                  >
                    {isSubscribing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Procesando...
                      </>
                    ) : isCurrent ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Plan Actual
                      </>
                    ) : (
                      `Elegir ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>            </motion.div>
          )
        }))}
      </motion.div>

      {/* Additional Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center space-y-4 pt-8"
      >
        <h3 className="text-xl font-semibold text-white">
          ¿Necesitas ayuda para elegir?
        </h3>
        <p className="text-gray-400">
          Todos nuestros planes incluyen soporte 24/7 y acceso completo a la plataforma
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            🔒 Pagos seguros
          </Badge>
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            🔄 Cancela cuando quieras
          </Badge>
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            ⚡ Activación inmediata
          </Badge>
        </div>
      </motion.div>

      {/* Stripe Security Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-gray-900/30 border-gray-700">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white">Pagos seguros con Stripe</h4>
              </div>
              <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                Utilizamos Stripe, la plataforma de pagos más confiable del mundo, para procesar todas las transacciones. 
                Tus datos están protegidos con encriptación de nivel bancario y nunca almacenamos información de tarjetas de crédito.
              </p>
              <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 justify-center text-amber-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Modo Demo</span>
                </div>
                <p className="text-amber-300/80 text-xs mt-1">
                  Esta es una simulación del proceso de pago. En producción se integraría con la API real de Stripe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stripe Checkout Modal */}
      <AnimatePresence>
        {showCheckout && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && paymentStep === "idle" && closeCheckout()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Stripe Checkout</h3>
                    <p className="text-sm text-gray-400">Pago seguro y encriptado</p>
                  </div>
                </div>
                {paymentStep === "idle" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeCheckout}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Plan Summary */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Plan {selectedPlan.name}</h4>
                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                      Mensual
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Tokens incluidos:</span>
                      <span className="font-medium">{selectedPlan.cuent_tokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración:</span>
                      <span className="font-medium">30 días</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-white pt-2 border-t border-gray-600">
                      <span>Total:</span>
                      <span>${getPlanInfo(selectedPlan).price.toLocaleString()} COP</span>
                    </div>
                  </div>
                </div>

                {/* Payment States */}
                {paymentStep === "idle" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Simulated Payment Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Número de tarjeta
                        </label>
                        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-400">
                          •••• •••• •••• 4242 (Demo)
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Vencimiento
                          </label>
                          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-400">
                            12/27
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            CVC
                          </label>
                          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-400">
                            •••
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Lock className="h-3 w-3" />
                      <span>Procesado de forma segura por Stripe</span>
                    </div>

                    <Button
                      onClick={handlePayment}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      Pagar ${getPlanInfo(selectedPlan).price.toLocaleString()} COP
                    </Button>
                  </motion.div>
                )}

                {paymentStep === "preparing" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                  >
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
                    <div>
                      <h4 className="text-lg font-medium text-white">Preparando pago</h4>
                      <p className="text-gray-400">Conectando con Stripe...</p>
                    </div>
                  </motion.div>
                )}

                {paymentStep === "processing" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                  >
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-500" />
                    <div>
                      <h4 className="text-lg font-medium text-white">Procesando pago</h4>
                      <p className="text-gray-400">Por favor no cierres esta ventana...</p>
                    </div>
                  </motion.div>
                )}

                {paymentStep === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white">¡Pago exitoso!</h4>
                      <p className="text-gray-400">Tu suscripción se ha activado correctamente</p>
                    </div>
                    <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                      <p className="text-sm text-green-400">
                        Plan <strong>{selectedPlan.name}</strong> activado<br />
                        {selectedPlan.cuent_tokens.toLocaleString()} tokens disponibles
                      </p>
                    </div>
                  </motion.div>
                )}

                {paymentStep === "error" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white">Error en el pago</h4>
                      <p className="text-red-400">{paymentError}</p>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={() => setPaymentStep("idle")}
                        className="w-full"
                        variant="outline"
                      >
                        Intentar de nuevo
                      </Button>
                      <Button
                        onClick={closeCheckout}
                        className="w-full"
                        variant="ghost"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
