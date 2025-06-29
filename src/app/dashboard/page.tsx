'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import MonthlyOverview from '@/components/dashboard/MonthlyOverview'
import CategoryChart from '@/components/dashboard/CategoryChart'
import BudgetProgress from '@/components/dashboard/BudgetProgress'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import GameStats from '@/components/dashboard/GameStats'
import QuickActions from '@/components/dashboard/QuickActions'
import TransactionModal from '@/components/transactions/TransactionModal'
import { PlusCircle, TrendingUp, Wallet, Target } from 'lucide-react'
import BudgetSettingsModal from '../../components/budget/BudgetSettingsModal'
import CategoryBudgetProgress from '@/components/dashboard/CategoryBudgetProgress'
import BudgetAlerts from '@/components/dashboard/BudgetAlerts'

interface DashboardData {
  monthlyStats: {
    totalIncome: number
    totalExpense: number
    netAmount: number
    transactionCount: number
    expenseChange: number
  }
  categoryExpenses: Array<{
    category: string
    amount: number
    color: string
  }>
  recentTransactions: Array<{
    id: string
    amount: number
    description: string | null
    type: 'income' | 'expense'
    date: string
    categories: {
      name: string
      color: string
    }
  }>
  categories: Array<{
    id: string
    name: string
    color: string
    type: 'income' | 'expense'
  }>
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    monthlyStats: {
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
      transactionCount: 0,
      expenseChange: 0,
    },
    categoryExpenses: [],
    recentTransactions: [],
    categories: [],
  })

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentYear = new Date().getFullYear()
  const currentMonthNum = new Date().getMonth() + 1

  useEffect(() => {
    if (profile) {
      loadDashboardData()
    }
  }, [profile])

  const loadDashboardData = async () => {
    if (!profile) return

    setLoading(true)
    const supabase = createClient()

    // 월의 마지막 날을 구하는 함수
    const getLastDayOfMonth = (year, month) => {
      return new Date(year, month, 0).getDate()
    }

    try {
      // 현재 월 거래 데이터
      const lastDayOfCurrentMonth = getLastDayOfMonth(
        currentYear,
        currentMonthNum
      )
      const { data: currentMonthTransactions, error: transactionsError } =
        await supabase
          .from('transactions')
          .select(
            `
          *,
          categories:category_id (
            name,
            color
          )
        `
          )
          .eq('user_id', profile.id)
          .gte(
            'date',
            `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}-01`
          )
          .lte(
            'date',
            `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}-${lastDayOfCurrentMonth.toString().padStart(2, '0')}`
          )

      if (transactionsError) {
        console.error('거래 데이터 로드 오류:', transactionsError)
        return
      }

      // 이전 월 데이터 (비교용)
      const prevMonth = currentMonthNum === 1 ? 12 : currentMonthNum - 1
      const prevYear = currentMonthNum === 1 ? currentYear - 1 : currentYear

      const { data: prevMonthTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .gte('date', `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`)
        .lte(
          'date',
          `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${lastDayOfCurrentMonth.toString().padStart(2, '0')}`
        )

      // 최근 거래 내역 (10개)
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(
          `
          *,
          categories:category_id (
            name,
            color
          )
        `
        )
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // 카테고리 목록
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', profile.id)

      // 월별 통계 계산
      const totalIncome =
        currentMonthTransactions
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) || 0

      const totalExpense =
        currentMonthTransactions
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0) || 0

      const prevTotalExpense =
        prevMonthTransactions
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0) || 0

      const expenseChange =
        prevTotalExpense > 0
          ? ((totalExpense - prevTotalExpense) / prevTotalExpense) * 100
          : 0

      // 카테고리별 지출 계산
      const categoryExpenses =
        categories
          ?.filter(cat => cat.type === 'expense')
          .map(cat => {
            const amount =
              currentMonthTransactions
                ?.filter(t => t.category_id === cat.id && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0) || 0

            return {
              category: cat.name,
              amount,
              color: cat.color,
            }
          })
          .filter(cat => cat.amount > 0)
          .sort((a, b) => b.amount - a.amount) || []

      setDashboardData({
        monthlyStats: {
          totalIncome,
          totalExpense,
          netAmount: totalIncome - totalExpense,
          transactionCount: currentMonthTransactions?.length || 0,
          expenseChange,
        },
        categoryExpenses,
        recentTransactions: recentTransactions || [],
        categories: categories || [],
      })
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionAdded = async () => {
    await loadDashboardData()
    setShowAddModal(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // 대시보드에서 콘솔을 열고 실행
  // const debugDashboardData = async () => {
  //   console.log('=== 대시보드 데이터 디버깅 ===')

  //   // 현재 사용자 확인
  //   const supabase = createClient()

  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser()
  //   console.log('현재 사용자:', user?.id)

  //   if (!user) {
  //     console.log('❌ 로그인되지 않음')
  //     return
  //   }

  //   // 모든 거래 확인
  //   const { data: allTransactions } = await supabase
  //     .from('transactions')
  //     .select('*')
  //     .eq('user_id', user.id)
  //     .order('date', { ascending: false })

  //   console.log('전체 거래 내역:', allTransactions)

  //   // 이번 달 거래 확인
  //   const now = new Date()
  //   const currentYear = now.getFullYear()
  //   const currentMonth = now.getMonth() + 1
  //   const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
  //   const endDate = new Date(currentYear, currentMonth, 0)
  //     .toISOString()
  //     .split('T')[0]

  //   console.log('현재 월 필터:', { startDate, endDate })

  //   const { data: thisMonthTransactions } = await supabase
  //     .from('transactions')
  //     .select('*')
  //     .eq('user_id', user.id)
  //     .gte('date', startDate)
  //     .lte('date', endDate)

  //   console.log('이번 달 거래:', thisMonthTransactions)

  //   // 통계 계산
  //   const income =
  //     thisMonthTransactions
  //       ?.filter(t => t.type === 'income')
  //       .reduce((sum, t) => sum + t.amount, 0) || 0
  //   const expense =
  //     thisMonthTransactions
  //       ?.filter(t => t.type === 'expense')
  //       .reduce((sum, t) => sum + t.amount, 0) || 0

  //   console.log('계산된 통계:', {
  //     수입: income,
  //     지출: expense,
  //     순수입: income - expense,
  //     거래건수: thisMonthTransactions?.length || 0,
  //   })
  // }

  // debugDashboardData()

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            안녕하세요, {profile?.full_name || profile?.username}님! 👋
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
            })}{' '}
            가계부 현황입니다
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>거래 추가</span>
        </Button>
      </div>

      {/* 예산 초과 알림 설정 */}
      <BudgetAlerts />

      {/* 월별 개요 */}
      <MonthlyOverview
        stats={dashboardData.monthlyStats}
        currentMonth={currentMonth}
        key={`monthly-${dashboardData.monthlyStats.totalIncome}-${dashboardData.monthlyStats.totalExpense}`}
      />

      {/* 게임 통계 */}
      <GameStats profile={profile} />

      {/* 빠른 액션 */}
      <QuickActions onAddTransaction={() => setShowAddModal(true)} />

      {/* 메인 차트 및 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리별 지출 차트 */}
        <CategoryChart
          data={dashboardData.categoryExpenses}
          loading={loading}
        />

        {/* 예산 진행률 */}
        <BudgetProgress
          monthlyBudget={profile?.monthly_budget || 0}
          totalExpense={dashboardData.monthlyStats.totalExpense}
          savingGoal={profile?.saving_goal || 0}
          totalIncome={dashboardData.monthlyStats.totalIncome}
          onOpenBudgetSettings={() => setShowBudgetModal(true)}
        />
      </div>

      {/* 카테고리별 예산 진행률 */}
      <CategoryBudgetProgress />

      {/* 최근 거래 내역 */}
      <RecentTransactions
        transactions={dashboardData.recentTransactions}
        loading={loading}
      />

      {/* 거래 추가 모달 */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={handleTransactionAdded}
        categories={dashboardData.categories}
      />

      {/* 예산 설정 모달 */}
      <BudgetSettingsModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSaved={async () => {
          await loadDashboardData()
          setShowBudgetModal(false)
        }}
      />
    </div>
  )
}
