import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "@/lib/client"

export interface Subscription {
  name: string
  cuent_tokens: number
}

export interface UserSubscription {
  total_Cuentokens: number
  Subscription: Subscription
}

export interface User {
  id: string
  name: string
  email: string
  all_subscriptions: UserSubscription[]
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hasHydrated: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
  loadUserProfile: () => Promise<void>
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.signIn({ email, password })
          const { data, token } = response
          console.log("Login response:", data)
          // Set token in API client
          apiClient.setToken(token)

          set({
            user: data,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error al iniciar sesión",
            isLoading: false,
          })
          throw error
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.signUp({ name, email, password })
          const { data, token } = response

          // Set token in API client
          apiClient.setToken(token)

          set({
            user: data,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error al registrarse",
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        apiClient.clearToken()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      loadUserProfile: async () => {
        const { token } = get()
        if (!token) return

        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.getProfile()
          set({
            user: response.data,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error al cargar perfil",
            isLoading: false,
          })
        }
      },

      changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string) => {
        set({ isLoading: true, error: null })

        try {
          await apiClient.changePassword({
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          })

          set({ isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Error al cambiar contraseña",
            isLoading: false,
          })
          throw error
        }
      },

      setHasHydrated: (state: boolean) => {
        set({
          hasHydrated: state
        })
      }
    }),
    {
      name: "cuent-ai-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        return (state: any, error: any) => {
          if (error) {
            console.log('An error happened during hydration', error)
          } else {
            if (state?.token) {
              apiClient.setToken(state.token)
            }
            state?.setHasHydrated(true)
          }
        }
      },
    },
  ),
)