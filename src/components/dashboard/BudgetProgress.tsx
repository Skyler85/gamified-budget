'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BudgetProgressProps {
  monthlyBudget: number
  totalExpense: number
  savingGoal: number
  totalIncome: number
  onOpenBudgetSettings?: () => void
}

export default function BudgetProgress({
  monthlyBudget,
  totalExpense,
  savingGoal,
  totalIncome,
  onOpenBudgetSettings,
}: BudgetProgressProps) {
  const budgetUsagePercent =
    monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0
  const remainingBudget = monthlyBudget - totalExpense
  const savingProgress =
    savingGoal > 0 ? ((totalIncome - totalExpense) / savingGoal) * 100 : 0
  const actualSaving = totalIncome - totalExpense

  const getBudgetStatus = () => {
    if (budgetUsagePercent <= 70) {
      return {
        color: 'text-green-600',
        icon: CheckCircle,
        message: '예산을 잘 지키고 있어요!',
      }
    } else if (budgetUsagePercent <= 90) {
      return {
        color: 'text-yellow-600',
        icon: AlertTriangle,
        message: '예산 사용에 주의하세요',
      }
    } else {
      return {
        color: 'text-red-600',
        icon: AlertTriangle,
        message: '예산을 초과했습니다',
      }
    }
  }

  const getSavingStatus = () => {
    if (savingProgress >= 100) {
      return {
        color: 'text-green-600',
        icon: CheckCircle,
        message: '저축 목표 달성!',
      }
    } else if (savingProgress >= 70) {
      return {
        color: 'text-blue-600',
        icon: TrendingUp,
        message: '목표 달성이 가까워요!',
      }
    } else if (actualSaving > 0) {
      return {
        color: 'text-yellow-600',
        icon: TrendingUp,
        message: '저축하고 있어요',
      }
    } else {
      return {
        color: 'text-red-600',
        icon: AlertTriangle,
        message: '적자 상태입니다',
      }
    }
  }

  const budgetStatus = getBudgetStatus()
  const savingStatus = getSavingStatus()

  if (monthlyBudget === 0 && savingGoal === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>예산 관리</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              예산 목표를 설정해보세요
            </h3>
            <p className="text-gray-500 mb-4">
              월별 예산과 저축 목표를 설정하면
              <br />더 체계적으로 관리할 수 있어요
            </p>
            <Button onClick={onOpenBudgetSettings}>예산 설정하기</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>예산 관리</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 월 예산 진행률 */}
        {monthlyBudget > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-700">월 예산 사용률</h4>
              <budgetStatus.icon className={`h-4 w-4 ${budgetStatus.color}`} />
            </div>

            <Progress
              value={Math.min(budgetUsagePercent, 100)}
              className="h-3"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {formatCurrency(totalExpense)} / {formatCurrency(monthlyBudget)}
              </span>
              <span className={`font-medium ${budgetStatus.color}`}>
                {budgetUsagePercent.toFixed(1)}%
              </span>
            </div>

            <div className={`text-sm ${budgetStatus.color}`}>
              {budgetStatus.message}
            </div>

            {remainingBudget > 0 ? (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  💰 이번 달 남은 예산:{' '}
                  <span className="font-semibold">
                    {formatCurrency(remainingBudget)}
                  </span>
                </p>
              </div>
            ) : (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ 예산 초과:{' '}
                  <span className="font-semibold">
                    {formatCurrency(Math.abs(remainingBudget))}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* 저축 목표 진행률 */}
        {savingGoal > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-700">
                  저축 목표 달성률
                </h4>
                <p className="text-xs text-gray-500">
                  이번 달 수입에서 지출을 뺀 금액 기준
                </p>
              </div>
              <savingStatus.icon className={`h-4 w-4 ${savingStatus.color}`} />
            </div>

            <Progress
              value={Math.max(0, Math.min(savingProgress, 100))}
              className="h-3"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {actualSaving > 0 ? (
                  <span className="text-green-600">
                    실제 저축: {formatCurrency(actualSaving)}
                  </span>
                ) : (
                  <span className="text-red-600">
                    적자: {formatCurrency(Math.abs(actualSaving))}
                  </span>
                )}{' '}
                / {formatCurrency(savingGoal)}
              </span>
              <span className={`font-medium ${savingStatus.color}`}>
                {Math.max(0, savingProgress).toFixed(1)}%
              </span>
            </div>

            <div className={`text-sm ${savingStatus.color}`}>
              {savingStatus.message}
            </div>

            {/* 저축 상태별 메시지 */}
            {actualSaving >= savingGoal ? (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  🎉 목표 달성! 추가 저축:{' '}
                  <span className="font-semibold">
                    {formatCurrency(actualSaving - savingGoal)}
                  </span>
                </p>
              </div>
            ) : actualSaving > 0 ? (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  🎯 목표까지 남은 금액:{' '}
                  <span className="font-semibold">
                    {formatCurrency(savingGoal - actualSaving)}
                  </span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  지출을 {formatCurrency(savingGoal - actualSaving)} 줄이면 목표
                  달성!
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-700">
                  💡 현재 적자 상태입니다. 지출을 줄이거나 수입을 늘려보세요.
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  저축하려면 최소{' '}
                  {formatCurrency(Math.abs(actualSaving) + savingGoal)}을
                  절약해야 합니다.
                </p>
              </div>
            )}

            {/* 저축 계산 방법 설명 */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h5 className="text-xs font-semibold text-gray-700 mb-1">
                📊 저축 계산 방법
              </h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• 실제 저축 = 이번 달 수입 - 이번 달 지출</div>
                <div>• 달성률 = (실제 저축 ÷ 저축 목표) × 100%</div>
                <div className="pt-1 border-t border-gray-200">
                  <span className="text-green-600">
                    수입: {formatCurrency(totalIncome)}
                  </span>
                  <span className="mx-2">-</span>
                  <span className="text-red-600">
                    지출: {formatCurrency(totalExpense)}
                  </span>
                  <span className="mx-2">=</span>
                  <span
                    className={
                      actualSaving >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {actualSaving >= 0 ? '저축' : '적자'}:{' '}
                    {formatCurrency(Math.abs(actualSaving))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 목표 수정 버튼 */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenBudgetSettings}
            className="w-full"
          >
            예산 목표 수정하기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
