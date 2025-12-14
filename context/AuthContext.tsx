'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
  username: string
  email?: string
  nickname?: string // Alias para compatibilidad
}

type AuthContextValue = {
  user: User | null
  login: (username: string, email?: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'fnf_user' // Misma key que usa login/page.tsx

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Normalizar: asegurar que tenga nickname
        setUser({
          username: parsed.username || parsed.nickname,
          email: parsed.email,
          nickname: parsed.username || parsed.nickname, // Alias
        })
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (username: string, email?: string) => {
    const u: User = { 
      username, 
      email,
      nickname: username // Alias para compatibilidad con matchmaking
    }
    setUser(u)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } catch (e) {
      console.error('Error saving user to localStorage:', e)
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Error removing user from localStorage:', e)
    }
  }

  const value: AuthContextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  }

  // No renderizar children hasta que se cargue el usuario
  if (isLoading) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}