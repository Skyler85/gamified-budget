'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import type { UserProfile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!user) return

    try {
      const client = createClient()
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('프로필 로드 오류:', error)
        return
      }

      setProfile(data as UserProfile) // ✅ 타입 단언
    } catch (err) {
      console.error('프로필 새로고침 오류:', err)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const client = createClient()
      const {
        data: { session },
      } = await client.auth.getSession()

      setUser(session?.user ?? null)
      if (session?.user) await refreshProfile()
      setLoading(false)
    }

    getSession()

    const client = createClient()
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      setUser(session?.user ?? null)

      if (session?.user) {
        await refreshProfile()
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user?.id) {
      refreshProfile()
    }
  }, [user?.id])

  const signOut = async () => {
    const client = createClient()
    const { error } = await client.auth.signOut()
    if (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다')
  }
  return context
}
