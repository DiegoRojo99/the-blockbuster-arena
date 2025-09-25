import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import type { DbUser, DbUserInsert } from '@/types/database'

// Auth context type
interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: DbUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username?: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>
  updateProfile: (updates: Partial<DbUser>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Generate unique username
function generateUsername(email?: string): string {
  if (!email) return `user_${Date.now()}`
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}_${suffix}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingUsername, setPendingUsername] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await handleUserProfile(session.user)
        } 
        else {
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        setUserProfile(null)
        return
      }

      setUserProfile(data)
    } catch (error) {
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  // Handle user profile creation/update after auth
  const handleUserProfile = async (user: User) => {
    // Create a basic profile from auth data for immediate use
    const basicProfile: DbUser = {
      id: user.id,
      email: user.email || null,
      username: pendingUsername || generateUsername(user.email),
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      bio: null,
      location: null,
      provider: user.app_metadata?.provider || 'email',
      preferred_language: 'en',
      theme_preference: 'system',
      is_public_profile: false,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    };
    
    setUserProfile(basicProfile);
    
    // Clear pending username
    setPendingUsername(null);
    
    // Try to sync with database in background (non-blocking)
    saveProfileToDatabase(user, basicProfile).catch(() => {
      // Silently handle database errors - app still works with basic profile
    });
  };
  
  // Separate method to try saving to database
  const saveProfileToDatabase = async (user: User, profile: DbUser) => {
    try {
        // Test basic connection first
        const { data: connectionTest, error: connectionError } = await supabase
          .from('users')
          .select('count')
          .limit(0);
        
        if (connectionError) {
          return;
        }

        // Try to fetch existing profile
        const { data: existingProfile, error: profileError } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

      if (!existingProfile || profileError?.code === 'PGRST116') {
        // Create new profile
        const newProfile: DbUserInsert = {
          id: user.id,
          email: user.email || null,
          display_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          provider: user.app_metadata?.provider || 'email',
          username: pendingUsername || generateUsername(user.email || user.user_metadata?.full_name),
          preferred_language: 'en',
          theme_preference: 'system',
          is_public_profile: false,
        };

        const { data, error } = await (supabase as any)
          .from('users')
          .insert(newProfile)
          .select()
          .single();

        if (!error && data) {
          setUserProfile(data);
        }
      } else {
        // Update existing profile with latest data
        const updates = {
          display_name: user.user_metadata?.full_name || user.user_metadata?.name || (existingProfile as any).display_name,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || (existingProfile as any).avatar_url,
          last_active: new Date().toISOString(),
        };

        const { data, error } = await (supabase as any)
          .from('users')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user profile:', error);
          // Update the main profile state with database result
          setUserProfile(data || existingProfile);
        } 
        else {
          // Update the main profile state with database result
          setUserProfile(data);
        }
      }
    } catch (error) {
      console.error('Background database save failed:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      // Don't set profile to null here since we have a working basic profile
    }
  };

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in.',
      })
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email/password
  const signUp = async (email: string, password: string, username?: string) => {
    setLoading(true)
    try {
      // Store the username to use when creating the profile
      if (username) {
        setPendingUsername(username)
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      
      toast({
        title: 'Check your email!',
        description: 'We sent you a confirmation link.',
      })
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      toast({
        title: 'Signed out',
        description: 'Come back soon!',
      })
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign in with OAuth provider
  const signInWithProvider = async (provider: 'google' | 'github') => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      
      if (error) throw error
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<DbUser>) => {
    if (!user) throw new Error('No user signed in')
    
    setLoading(true)
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .update({
          ...updates,
          last_active: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      
      setUserProfile(data)
      
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      })
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}