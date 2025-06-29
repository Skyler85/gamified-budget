'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
  PieChart,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info,
} from 'lucide-react'

interface CategoryBudgetData {
  categoryId: string
  categoryName: string
  categoryColor: string
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentage: number
}

export default function CategoryBudgetProgress() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetData[]>(
    []
  )
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => {
    if (profile) {
      loadCategoryBudgets()
    }
  }, [profile])

  const loadCategoryBudgets = async () => {
    if (!profile) return

    setLoading(true)
    const supabase = createClient()

    try {
      // 현재 월의 시작과 끝
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`

      // 카테고리별 예산 조회
      const { data: budgets } = await supabase
        .from('category_budgets')
        .select(
          `
          *,
          categories (
            id,
            name,
            color
          )
        `
        )
        .eq('user_id', profile.id)
        .eq('period', 'monthly')

      if (!budgets || budgets.length === 0) {
        setCategoryBudgets([])
        setLoading(false)
        return
      }

      // 각 카테고리별 지출 계산
      const budgetData: CategoryBudgetData[] = []
      let totalBudgetAmount = 0
      let totalSpentAmount = 0

      for (const budget of budgets) {
        // 해당 카테고리의 이번 달 지출 합계
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', profile.id)
          .eq('category_id', budget.category_id)
          .eq('type', 'expense')
          .gte('date', startDate)
          .lte('date', endDate)

        const spentAmount =
          transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
        const remainingAmount = budget.amount - spentAmount
        const percentage =
          budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0

        budgetData.push({
          categoryId: budget.category_id,
          categoryName: budget.categories.name,
          categoryColor: budget.categories.color,
          budgetAmount: budget.amount,
          spentAmount,
          remainingAmount,
          percentage,
        })

        totalBudgetAmount += budget.amount
        totalSpentAmount += spentAmount
      }

      // 지출이 많은 순으로 정렬
      budgetData.sort((a, b) => b.percentage - a.percentage)

      setCategoryBudgets(budgetData)
      setTotalBudget(totalBudgetAmount)
      setTotalSpent(totalSpentAmount)
    } catch (error) {
      console.error('카테고리 예산 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    } else if (percentage >= 80) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>카테고리별 예산</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (categoryBudgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>카테고리별 예산</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              카테고리별 예산을 설정하면
              <br />더 세밀한 지출 관리가 가능해요
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>카테고리별 예산</span>
          </div>
          <Badge variant="outline" className="font-normal">
            총 {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 전체 진행률 */}
        <div className="space-y-2 pb-4 border-b">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">전체 예산 사용률</span>
            <span
              className={`font-medium ${
                totalBudget > 0
                  ? getStatusColor((totalSpent / totalBudget) * 100)
                  : 'text-gray-600'
              }`}
            >
              {totalBudget > 0
                ? `${((totalSpent / totalBudget) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
          <Progress
            value={
              totalBudget > 0
                ? Math.min((totalSpent / totalBudget) * 100, 100)
                : 0
            }
            className="h-2"
          />
        </div>

        {/* 카테고리별 진행률 */}
        <div className="space-y-3">
          {categoryBudgets.map(budget => (
            <div key={budget.categoryId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: budget.categoryColor }}
                  />
                  <span className="text-sm font-medium">
                    {budget.categoryName}
                  </span>
                  {getStatusIcon(budget.percentage)}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatCurrency(budget.spentAmount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    / {formatCurrency(budget.budgetAmount)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Progress
                  value={Math.min(budget.percentage, 100)}
                  className="h-2 flex-1"
                />
                <span
                  className={`text-xs font-medium w-12 text-right ${getStatusColor(budget.percentage)}`}
                >
                  {budget.percentage.toFixed(0)}%
                </span>
              </div>

              {/* 상태 메시지 */}
              {budget.percentage >= 100 && (
                <div className="text-xs text-red-600 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    예산 초과:{' '}
                    {formatCurrency(Math.abs(budget.remainingAmount))}
                  </span>
                </div>
              )}
              {budget.percentage >= 80 && budget.percentage < 100 && (
                <div className="text-xs text-yellow-600">
                  남은 예산: {formatCurrency(budget.remainingAmount)}
                </div>
              )}
              {budget.percentage < 80 && (
                <div className="text-xs text-gray-500">
                  남은 예산: {formatCurrency(budget.remainingAmount)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 예산 팁 */}
        <div className="pt-4 border-t">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-900 mb-1">
              💡 예산 관리 팁
            </h4>
            <p className="text-xs text-blue-700">
              {categoryBudgets.filter(b => b.percentage >= 80).length > 0
                ? '일부 카테고리가 예산 한도에 근접했어요. 지출을 조절해보세요.'
                : '예산을 잘 지키고 있어요! 이대로 유지하세요.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
