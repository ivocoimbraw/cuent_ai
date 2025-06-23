"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export function useRequireAuth(redirectTo: string = '/login') {
  const router = useRouter()
  const { token, user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    // Esperar a que el store se hidrate antes de verificar
    if (!hasHydrated) return

    // Verificar si está autenticado
    if (!isAuthenticated || !token || !user) {
      console.log('🚫 Acceso denegado - redirigiendo a login')
      router.push(redirectTo)
    }
  }, [token, user, isAuthenticated, hasHydrated, router, redirectTo])

  return { 
    isAuthenticated: isAuthenticated && !!token && !!user,
    loading: !hasHydrated,
    user,
    token
  }
}

export function useRequireGuest(redirectTo: string = '/dashboard') {
  const router = useRouter()
  const { isAuthenticated, token, user, hasHydrated } = useAuthStore()

  useEffect(() => {
    // Esperar a que el store se hidrate antes de verificar
    if (!hasHydrated) return

    // Si está autenticado, redirigir
    if (isAuthenticated && token && user) {
      console.log('🔄 Usuario autenticado - redirigiendo a dashboard')
      router.push(redirectTo)
    }
  }, [isAuthenticated, token, user, hasHydrated, router, redirectTo])

  return { 
    isGuest: !isAuthenticated || !token || !user,
    loading: !hasHydrated,
    user,
    token
  }
}

// Hook opcional para verificación manual sin redirección automática
export function useAuth() {
  const { token, user, isAuthenticated, hasHydrated } = useAuthStore()

  return {
    isAuthenticated: isAuthenticated && !!token && !!user,
    isGuest: !isAuthenticated || !token || !user,
    loading: !hasHydrated,
    user,
    token
  }
}
