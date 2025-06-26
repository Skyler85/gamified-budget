'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/lib/onboarding-context'
import { useAuth } from '@/lib/auth-context'
import {
  Trophy,
  Coins,
  Flame,
  Star,
  Crown,
  Target,
  Sparkles,
} from 'lucide-react'

export default function GameificationStep() {
  const { completeOnboarding, prevStep, currentStep, totalSteps } =
    useOnboarding()
  const { profile } = useAuth()
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    await completeOnboarding()
  }

  const features = [
    {
      icon: <Star className="h-8 w-8 text-blue-600" />,
      title: '레벨 시스템',
      description: '거래를 입력할 때마다 경험치를 획득하고 레벨업하세요',
      detail: '1000 XP마다 레벨업하고 보너스 코인을 받아요',
    },
    {
      icon: <Coins className="h-8 w-8 text-yellow-600" />,
      title: '코인 시스템',
      description: '거래 입력, 목표 달성 등으로 코인을 모으세요',
      detail: '나중에 프리미엄 기능이나 테마로 교환할 수 있어요',
    },
    {
      icon: <Trophy className="h-8 w-8 text-purple-600" />,
      title: '뱃지 수집',
      description: '다양한 도전과제를 달성하고 특별한 뱃지를 수집하세요',
      detail: '첫걸음, 꾸준함, 절약왕 등 다양한 뱃지가 있어요',
    },
    {
      icon: <Flame className="h-8 w-8 text-orange-600" />,
      title: '연속 기록',
      description: '매일 거래를 기록하고 연속 기록을 늘려보세요',
      detail: '연속 기록이 길수록 더 많은 보상을 받을 수 있어요',
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: '목표 달성',
      description: '설정한 예산 목표를 달성하고 특별 보상을 받으세요',
      detail: '월별 목표를 달성하면 보너스 코인과 뱃지를 받아요',
    },
    {
      icon: <Crown className="h-8 w-8 text-indigo-600" />,
      title: '랭킹 시스템',
      description: '친구들과 절약 실력을 겨루고 순위를 확인하세요',
      detail: '나중에 소셜 기능이 추가될 예정이에요',
    },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* 진행률 표시 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 text-center">
        {currentStep} / {totalSteps}
      </p>

      {/* 제목 */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="text-6xl mb-4">🎮</div>
          <Sparkles className="absolute top-0 right-20 h-6 w-6 text-yellow-500 animate-pulse" />
          <Sparkles className="absolute top-12 left-16 h-4 w-4 text-blue-500 animate-pulse delay-300" />
        </div>

        <h2 className="text-2xl font-bold">게임처럼 재미있게!</h2>
        <p className="text-gray-600">
          가계부 관리가 지루하지 않도록 다양한 게임 요소를 준비했어요
        </p>
      </div>

      {/* 게임화 요소들 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">{feature.icon}</div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
                <p className="text-xs text-gray-500">{feature.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 현재 상태 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">
          🎉 현재 상태
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {profile?.level || 1}
            </div>
            <div className="text-sm text-gray-600">레벨</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {profile?.coins || 100}
            </div>
            <div className="text-sm text-gray-600">코인</div>
          </div>
        </div>
      </div>

      {/* 다음 단계 안내 */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-2">
          🚀 이제 시작해보세요!
        </h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• 매일 거래를 기록하여 연속 기록을 늘려보세요</li>
          <li>• 설정한 월 예산 목표를 지켜보세요</li>
          <li>• 다양한 뱃지를 수집하며 재미있게 관리하세요</li>
          <li>• 궁금한 점이 있으면 언제든 프로필에서 도움말을 확인하세요</li>
        </ul>
      </div>

      {/* 완료 보상 안내 */}
      <div className="bg-yellow-50 p-4 rounded-lg text-center">
        <h4 className="font-semibold text-yellow-900 mb-2">
          🎁 온보딩 완료 보상
        </h4>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-1 text-blue-700">
            <Star className="h-4 w-4" />
            <span>+200 XP</span>
          </div>
          <div className="flex items-center space-x-1 text-yellow-700">
            <Coins className="h-4 w-4" />
            <span>+100 코인</span>
          </div>
          <div className="flex items-center space-x-1 text-purple-700">
            <Trophy className="h-4 w-4" />
            <span>시작의 뱃지</span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={prevStep}
          className="flex-1"
          disabled={isCompleting}
        >
          이전
        </Button>
        <Button
          onClick={handleComplete}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          disabled={isCompleting}
        >
          {isCompleting ? '완료 중...' : '가계부 시작하기! 🎉'}
        </Button>
      </div>
    </div>
  )
}
