'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import WelcomeStep from '@/components/onboarding/steps/WelcomeStep'
import GoalStep from '@/components/onboarding/steps/GoalStep'
import CategoryStep from '@/components/onboarding/steps/CategoryStep'
import FirstTransactionStep from '@/components/onboarding/steps/FirstTransactionStep'
import GameificationStep from '@/components/onboarding/steps/GameificationStep'

export default function TestOnboardingPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />
      case 2:
        return <GoalStep />
      case 3:
        return <CategoryStep />
      case 4:
        return <FirstTransactionStep />
      case 5:
        return <GameificationStep />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">온보딩 테스트</h1>

        <div className="space-y-2">
          <Button
            onClick={() => {
              setCurrentStep(1)
              setIsOpen(true)
            }}
          >
            1단계: 환영 페이지
          </Button>
          <Button
            onClick={() => {
              setCurrentStep(2)
              setIsOpen(true)
            }}
          >
            2단계: 목표 설정
          </Button>
          <Button
            onClick={() => {
              setCurrentStep(3)
              setIsOpen(true)
            }}
          >
            3단계: 카테고리 설정
          </Button>
          <Button
            onClick={() => {
              setCurrentStep(4)
              setIsOpen(true)
            }}
          >
            4단계: 첫 거래 입력
          </Button>
          <Button
            onClick={() => {
              setCurrentStep(5)
              setIsOpen(true)
            }}
          >
            5단계: 게임화 소개
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {renderStep()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
