"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BookOpen, FolderOpen, ImageIcon, User, CreditCard, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BookOpen },
  { href: "/projects", label: "Proyectos", icon: FolderOpen },
  { href: "/profile", label: "Perfil", icon: User },
  { href: "/subscription", label: "Suscripción", icon: CreditCard },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-0 left-0 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-40 h-screen w-70 bg-black/95 backdrop-blur-sm border-r border-gray-800 "
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8 mt-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              CUENT-AI
            </h1>
            <p className="text-sm text-gray-400 mt-1">Crea cuentos con IA</p>
          </div>

          {/* User info */}
          {user && (
            <div className="mb-6 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout button */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800/50"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
