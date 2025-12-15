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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}