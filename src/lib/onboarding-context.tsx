'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth-context'
import { createClient } from './supabase'

interface OnboardingContextType {
  isOnboarding: boolean
  currentStep: number
  totalSteps: number
  startOnboarding: () => void
  nextStep: () => void
  prevStep: () => void
  completeOnboarding: () => Promise<void>
  skipOnboarding: () => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextType>({
  isOnboarding: false,
  currentStep: 0,
  totalSteps: 5,
  startOnboarding: () => {},
  nextStep: () => {},
  prevStep: () => {},
  completeOnboarding: async () => {},
  skipOnboarding: async () => {},
})

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 5
  const { user, profile } = useAuth()

  // 사용자가 처음 가입했는지 확인
  useEffect(() => {
    if (profile && user) {
      // 프로필이 생성된 지 5분 이내이고, 아직 온보딩을 완료하지 않았다면
      const profileCreated = new Date(profile.created_at)
      const now = new Date()
      const timeDiff = now.getTime() - profileCreated.getTime()
      const minutesDiff = timeDiff / (1000 * 60)

      const isNewUser = minutesDiff < 5 // 5분 이내
      const hasNotCompletedOnboarding = !profile.onboarding_completed

      if (isNewUser && hasNotCompletedOnboarding) {
        setIsOnboarding(true)
        setCurrentStep(1)
      }
    }
  }, [profile, user])

  const startOnboarding = () => {
    setIsOnboarding(true)
    setCurrentStep(1)
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    if (!profile) return

    try {
      const supabase = createClient()

      // 프로필에 온보딩 완료 표시
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      // 온보딩 완료 보상 지급
      await supabase
        .from('profiles')
        .update({
          coins: profile.coins + 100, // 온보딩 완료 보너스
          total_exp: profile.total_exp + 200,
        })
        .eq('id', profile.id)

      setIsOnboarding(false)
      setCurrentStep(0)
    } catch (error) {
      console.error('온보딩 완료 처리 오류:', error)
    }
  }

  const skipOnboarding = async () => {
    if (!profile) return

    try {
      const supabase = createClient()

      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_skipped: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      setIsOnboarding(false)
      setCurrentStep(0)
    } catch (error) {
      console.error('온보딩 건너뛰기 처리 오류:', error)
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStep,
        totalSteps,
        startOnboarding,
        nextStep,
        prevStep,
        completeOnboarding,
        skipOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error(
      'useOnboarding은 OnboardingProvider 내에서 사용되어야 합니다'
    )
  }
  return context
}
