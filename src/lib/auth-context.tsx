'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  AuthUser,
  getCurrentUser,
  getCurrentSession,
  onAuthStateChange,
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
  isAdmin,
  isAuthenticated
} from './supabase-auth'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: AuthUser | null; error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  isAdmin: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session and user
    const getInitialAuth = async () => {
      try {
        const [currentSession, currentUser] = await Promise.all([
          getCurrentSession(),
          getCurrentUser()
        ])

        setSession(currentSession)
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial auth state:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialAuth()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      
      setSession(session)
      
      if (session?.user) {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await supabaseSignIn(email, password)
      if (result.user) {
        setUser(result.user)
      }
      return result
    } finally {
      setLoading(false)
    }
  }



  const signOut = async () => {
    setLoading(true)
    try {
      const result = await supabaseSignOut()
      setUser(null)
      setSession(null)
      return result
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAdmin: isAdmin(user),
    isAuthenticated: isAuthenticated(user)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}