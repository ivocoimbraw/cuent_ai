"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { useAuthStore } from "@/lib/auth-store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, hasHydrated, setHasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHasHydrated(true)
    }, 1000)

    useAuthStore.persist.rehydrate()
    
    return () => clearTimeout(timeoutId)
  }, [setHasHydrated])

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, hasHydrated, router])

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="relative flex">
        <Navigation />
        <main className="flex-1 md:ml-70">{children}</main>
      </div>
    </div>
  )
}