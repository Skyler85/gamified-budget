'use client'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/lib/onboarding-context'
import { useAuth } from '@/lib/auth-context'
import { Coins, Trophy, Target, Sparkles } from 'lucide-react'

export default function WelcomeStep() {
  const { nextStep, skipOnboarding, currentStep, totalSteps } = useOnboarding()
  const { profile } = useAuth()

  return (
    <div className="text-center space-y-6 p-6">
      {/* 진행률 표시 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500">
        {currentStep} / {totalSteps}
      </p>

      {/* 환영 콘텐츠 */}
      <div className="space-y-4">
        <div className="relative">
          <div className="text-6xl mb-4">🎉</div>
          <Sparkles className="absolute top-0 right-20 h-6 w-6 text-yellow-500 animate-pulse" />
          <Sparkles className="absolute top-12 left-16 h-4 w-4 text-blue-500 animate-pulse delay-300" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          환영합니다, {profile?.full_name || profile?.username}님!
        </h1>

        <p className="text-lg text-gray-600 max-w-md mx-auto">
          게임화 가계부에서 재미있게 돈을 관리하는 방법을 알아보세요. 몇 분만
          투자하면 시작할 수 있습니다!
        </p>
      </div>

      {/* 특징 소개 */}
      <div className="grid grid-cols-3 gap-4 my-8">
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
          <Coins className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold text-sm">코인 시스템</h3>
          <p className="text-xs text-gray-600 text-center">
            거래 입력하고 코인을 모아보세요
          </p>
        </div>

        <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
          <Trophy className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold text-sm">뱃지 수집</h3>
          <p className="text-xs text-gray-600 text-center">
            다양한 도전과제를 달성하세요
          </p>
        </div>

        <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
          <Target className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold text-sm">목표 달성</h3>
          <p className="text-xs text-gray-600 text-center">
            예산 목표를 설정하고 달성하세요
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={skipOnboarding} className="flex-1">
          건너뛰기
        </Button>
        <Button
          onClick={nextStep}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          시작하기 🚀
        </Button>
      </div>
    </div>
  )
}
