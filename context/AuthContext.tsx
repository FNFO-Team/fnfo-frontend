'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  getIdToken,
  User as FirebaseUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

type User = {
  uid: string;
  username: string;
  email?: string;
  nickname?: string; // Alias para compatibilidad
  displayName?: string;
  photoURL?: string;
}

type AuthContextValue = {
  user: User | null
  idToken: string | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isInitialized: boolean;
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
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user exists, get the ID token
        const token = await getIdToken(firebaseUser);
        setIdToken(token);

        // Create our User object
        const userObj: User = {
          uid: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.uid,
          email: firebaseUser.email ?? undefined,
          nickname: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.uid,
          displayName: firebaseUser.displayName ?? undefined,
          photoURL: firebaseUser.photoURL ?? undefined,
        };
        setUser(userObj);
      } else {
        // No user is signed in
        setUser(null);
        setIdToken(null);
      }
      setIsInitialized(true);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Error removing user from localStorage:', e)
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const value: AuthContextValue = {
    user,
    idToken,
    logout,
    isAuthenticated: !!user && !!idToken,
    isInitialized,
  }

  // No renderizar children hasta que se inicialice el auth
  if (!isInitialized) {
    return null
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