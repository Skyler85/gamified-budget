'use client'
import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, TrendingUp, X, Bell, BellOff } from 'lucide-react'

interface BudgetAlert {
  id: string
  alertType: 'total' | 'category'
  percentage: number
  amountUsed: number
  budgetAmount: number
  categoryName?: string
  createdAt: string
  isRead: boolean
}

export default function BudgetAlerts() {
  const { profile } = useAuth()
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)

  useEffect(() => {
    if (profile) {
      loadAlerts()
      checkAndCreateAlerts()
    }
  }, [profile])

  const loadAlerts = async () => {
    if (!profile) return

    const supabase = createClient()

    // 최근 7일간의 알림만 조회
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data } = await supabase
      .from('budget_alerts')
      .select(
        `
        *,
        categories:category_id (
          name
        )
      `
      )
      .eq('user_id', profile.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (data) {
      const formattedAlerts: BudgetAlert[] = data.map(alert => ({
        id: alert.id,
        alertType: alert.alert_type,
        percentage: alert.percentage,
        amountUsed: alert.amount_used,
        budgetAmount: alert.budget_amount,
        categoryName: alert.categories?.name,
        createdAt: alert.created_at,
        isRead: alert.is_read,
      }))

      setAlerts(formattedAlerts.filter(a => !a.isRead))
    }

    setLoading(false)
  }

  const checkAndCreateAlerts = async () => {
    if (!profile || !profile.monthly_budget) return

    const supabase = createClient()
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`

    // 전체 예산 확인
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', profile.id)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    const totalExpense =
      transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
    const totalPercentage = (totalExpense / profile.monthly_budget) * 100

    // 기존 알림 확인
    const { data: existingAlerts } = await supabase
      .from('budget_alerts')
      .select('percentage')
      .eq('user_id', profile.id)
      .eq('alert_type', 'total')
      .gte('created_at', startDate)

    const existingPercentages = existingAlerts?.map(a => a.percentage) || []

    // 새 알림 생성
    const thresholds = [50, 80, 100]
    for (const threshold of thresholds) {
      if (
        totalPercentage >= threshold &&
        !existingPercentages.includes(threshold)
      ) {
        await supabase.from('budget_alerts').insert({
          user_id: profile.id,
          alert_type: 'total',
          percentage: threshold,
          amount_used: totalExpense,
          budget_amount: profile.monthly_budget,
        })
      }
    }

    // 카테고리별 예산 확인
    const { data: categoryBudgets } = await supabase
      .from('category_budgets')
      .select('*')
      .eq('user_id', profile.id)
      .eq('period', 'monthly')

    if (categoryBudgets) {
      for (const budget of categoryBudgets) {
        const { data: categoryTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', profile.id)
          .eq('category_id', budget.category_id)
          .eq('type', 'expense')
          .gte('date', startDate)
          .lte('date', endDate)

        const categoryExpense =
          categoryTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0
        const categoryPercentage = (categoryExpense / budget.amount) * 100

        // 기존 카테고리 알림 확인
        const { data: existingCategoryAlerts } = await supabase
          .from('budget_alerts')
          .select('percentage')
          .eq('user_id', profile.id)
          .eq('category_id', budget.category_id)
          .eq('alert_type', 'category')
          .gte('created_at', startDate)

        const existingCategoryPercentages =
          existingCategoryAlerts?.map(a => a.percentage) || []

        for (const threshold of thresholds) {
          if (
            categoryPercentage >= threshold &&
            !existingCategoryPercentages.includes(threshold)
          ) {
            await supabase.from('budget_alerts').insert({
              user_id: profile.id,
              category_id: budget.category_id,
              alert_type: 'category',
              percentage: threshold,
              amount_used: categoryExpense,
              budget_amount: budget.amount,
            })
          }
        }
      }
    }

    // 알림 다시 로드
    loadAlerts()
  }

  const markAsRead = async (alertId: string) => {
    const supabase = createClient()
    await supabase
      .from('budget_alerts')
      .update({ is_read: true })
      .eq('id', alertId)

    setAlerts(alerts.filter(a => a.id !== alertId))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const alertIds = alerts.map(a => a.id)

    await supabase
      .from('budget_alerts')
      .update({ is_read: true })
      .in('id', alertIds)

    setAlerts([])
  }

  const getAlertVariant = (percentage: number) => {
    if (percentage >= 100) return 'destructive'
    if (percentage >= 80) return 'default'
    return 'default'
  }

  const getAlertIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4" />
    if (percentage >= 80) return <TrendingUp className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  if (loading || alerts.length === 0 || !showAlerts) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* 알림 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span>예산 알림 ({alerts.length})</span>
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            모두 읽음
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAlerts(false)}
            className="text-xs"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-2">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            variant={getAlertVariant(alert.percentage)}
            className="relative"
          >
            <div className="flex items-start space-x-2">
              {getAlertIcon(alert.percentage)}
              <div className="flex-1">
                <AlertTitle className="text-sm font-medium">
                  {alert.alertType === 'total'
                    ? '전체 예산'
                    : alert.categoryName}{' '}
                  {alert.percentage}% 도달
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {formatCurrency(alert.amountUsed)} /{' '}
                  {formatCurrency(alert.budgetAmount)} 사용
                  {alert.percentage >= 100 && (
                    <span className="block mt-1 font-medium">
                      초과 금액:{' '}
                      {formatCurrency(alert.amountUsed - alert.budgetAmount)}
                    </span>
                  )}
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(alert.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  )
}
