"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import type { MemberDto, MemberRegisterDto } from "@/lib/types"

interface AuthContextType {
  user: MemberDto | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: MemberRegisterDto) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MemberDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = apiClient.getToken()
      if (token) {
        const currentUser = await apiClient.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      apiClient.setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password)
    if (response.member) {
      setUser(response.member)
    }
  }

  const register = async (data: MemberRegisterDto) => {
    const response = await apiClient.register(data)
    if (response.member) {
      setUser(response.member)
    }
  }

  const logout = async () => {
    await apiClient.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
