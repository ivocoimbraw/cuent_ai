"use client"

import { useRequireAuth, useRequireGuest } from '@/lib/use-require-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useRequireAuth()
  
  if (loading) {
    return fallback || null
  }
  
  if (!isAuthenticated) {
    return fallback || null
  }
  
  return <>{children}</>
}

interface GuestOnlyRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function GuestOnlyRoute({ children, fallback }: GuestOnlyRouteProps) {
  const { isGuest, loading } = useRequireGuest()
  
  if (loading) {
    return fallback || null
  }
  
  if (!isGuest) {
    return fallback || null
  }
  
  return <>{children}</>
}
