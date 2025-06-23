"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"

export default function HomePage() {
  const { isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      logout()
      router.push("/login")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          CUENT-AI
        </h1>
        <p className="text-gray-400">Cargando...</p>
      </div>
    </div>
  )
}
