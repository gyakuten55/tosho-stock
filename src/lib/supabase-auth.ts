import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  username: string
  user_type: 'admin' | 'user'
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AuthUser extends User {
  profile?: UserProfile
}

// Sign up new user with profile
export async function signUp(email: string, password: string, userData: {
  username: string
  user_type: 'admin' | 'user'
  full_name?: string
}): Promise<{ user: AuthUser | null; error: Error | null }> {
  if (!supabase) {
    return { user: null, error: new Error('Supabase client not initialized') }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          user_type: userData.user_type,
          full_name: userData.full_name || userData.username
        }
      }
    })

    if (error) throw error

    return { user: data.user as AuthUser, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { user: null, error: error as Error }
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
  console.log('SignIn attempt - Supabase client exists:', !!supabase)

  if (!supabase) {
    console.error('Supabase client not initialized - check environment variables')
    return { user: null, error: new Error('Supabase client not initialized') }
  }

  try {
    // Sanitize input to ensure no non-ASCII characters cause header issues
    let sanitizedEmail = email.trim()
    const sanitizedPassword = password.trim()

    // メールアドレス形式でない場合は @local を追加
    if (!sanitizedEmail.includes('@')) {
      sanitizedEmail = `${sanitizedEmail}@local`
      console.log('Converting username to email format:', sanitizedEmail)
    }

    console.log('Attempting to sign in with email:', sanitizedEmail)

    // Validate inputs
    if (!sanitizedEmail || !sanitizedPassword) {
      throw new Error('Email and password are required')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: sanitizedPassword
    })

    console.log('Supabase auth response:', {
      success: !!data?.user,
      error: error?.message,
      userId: data?.user?.id
    })

    if (error) throw error

    // Get user profile
    const profile = await getUserProfile(data.user.id)
    const userWithProfile = { ...data.user, profile } as AuthUser

    console.log('User profile loaded:', !!profile)
    return { user: userWithProfile, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { user: null, error: error as Error }
  }
}


// Sign out
export async function signOut(): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase client not initialized') }
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: error as Error }
  }
}

// Get current user session
export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null

  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get user profile
    const profile = await getUserProfile(user.id)
    return { ...user, profile } as AuthUser
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

// Get user profile from profiles table
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Get profile error:', error)
      return null
    }

    return data as UserProfile
  } catch (error) {
    console.error('Get profile error:', error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: Error | null }> {
  if (!supabase) {
    return { profile: null, error: new Error('Supabase client not initialized') }
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return { profile: data as UserProfile, error: null }
  } catch (error) {
    console.error('Update profile error:', error)
    return { profile: null, error: error as Error }
  }
}

// Reset password
export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase client not initialized') }
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Reset password error:', error)
    return { error: error as Error }
  }
}

// Update password
export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase client not initialized') }
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Update password error:', error)
    return { error: error as Error }
  }
}

// Auth state change listener
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }

  return supabase.auth.onAuthStateChange(callback)
}

// Check if user is admin
export function isAdmin(user: AuthUser | null): boolean {
  return user?.profile?.user_type === 'admin'
}

// Check if user is authenticated
export function isAuthenticated(user: AuthUser | null): boolean {
  return !!user
}