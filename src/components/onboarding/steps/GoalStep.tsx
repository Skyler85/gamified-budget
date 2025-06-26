'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOnboarding } from '@/lib/onboarding-context'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Target, DollarSign, TrendingUp } from 'lucide-react'

export default function GoalStep() {
  const { nextStep, prevStep, currentStep, totalSteps } = useOnboarding()
  const { profile } = useAuth()
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [savingGoal, setSavingGoal] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = async () => {
    if (!monthlyBudget) return

    setIsLoading(true)
    try {
      const supabase = createClient()

      // 사용자 목표를 프로필에 저장 (나중에 별도 테이블로 분리 가능)
      await supabase
        .from('profiles')
        .update({
          monthly_budget: parseFloat(monthlyBudget),
          saving_goal: savingGoal ? parseFloat(savingGoal) : null,
        })
        .eq('id', profile?.id)

      nextStep()
    } catch (error) {
      console.error('목표 저장 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setMonthlyBudget(formatted)
  }

  const handleSavingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setSavingGoal(formatted)
  }

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
      <div className="text-center space-y-2">
        <Target className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold">목표를 설정해보세요</h2>
        <p className="text-gray-600">
          월 예산과 저축 목표를 설정하면 더 효과적으로 관리할 수 있어요
        </p>
      </div>

      {/* 입력 폼 */}
      <div className="space-y-6">
        {/* 월 예산 */}
        <div className="space-y-2">
          <Label
            htmlFor="monthly-budget"
            className="flex items-center space-x-2"
          >
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>월 예산 (필수)</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">₩</span>
            <Input
              id="monthly-budget"
              type="text"
              placeholder="2,000,000"
              value={monthlyBudget}
              onChange={handleBudgetChange}
              className="pl-8 text-lg"
            />
          </div>
          <p className="text-sm text-gray-500">
            한 달에 사용할 수 있는 전체 예산을 입력하세요
          </p>
        </div>

        {/* 저축 목표 */}
        <div className="space-y-2">
          <Label htmlFor="saving-goal" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>월 저축 목표 (선택)</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">₩</span>
            <Input
              id="saving-goal"
              type="text"
              placeholder="500,000"
              value={savingGoal}
              onChange={handleSavingChange}
              className="pl-8 text-lg"
            />
          </div>
          <p className="text-sm text-gray-500">
            매월 저축하고 싶은 금액을 입력하세요
          </p>
        </div>

        {/* 예시 설명 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 목표 설정 팁</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 월 예산은 생활비, 식비, 교통비 등을 모두 포함한 금액</li>
            <li>• 저축 목표는 월 예산의 10-30% 정도로 설정하는 것이 좋아요</li>
            <li>• 나중에 언제든 수정할 수 있으니 부담 갖지 마세요</li>
          </ul>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          이전
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={!monthlyBudget || isLoading}
        >
          {isLoading ? '저장 중...' : '다음'}
        </Button>
      </div>
    </div>
  )
}
