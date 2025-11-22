'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
  nickname: string
}

type AuthContextValue = {
  user: User | null
  login: (nickname: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fnfo_user')
      if (raw) setUser(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [])

  const login = (nickname: string) => {
    const u = { nickname }
    setUser(u)
    try {
      localStorage.setItem('fnfo_user', JSON.stringify(u))
    } catch (e) {
      // ignore
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem('fnfo_user')
    } catch (e) {
      // ignore
    }
  }

  const value: AuthContextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
