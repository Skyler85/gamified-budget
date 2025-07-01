'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import MonthlyTrendChart from '@/components/trends/MonthlyTrendChart'
import CategoryTrendChart from '@/components/trends/CategoryTrendChart'
// import YearOverYearComparison from '@/components/trends/YearOverYearComparison'
// import SpendingPatterns from '@/components/trends/SpendingPatterns'
import {
  TrendingUp,
  Calendar,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
} from 'lucide-react'
import {
  MonthlyTrend,
  Transaction,
  TrendData,
  YearlySummary,
} from '../../types'
import { SupabaseClient } from '@supabase/supabase-js'

export default function TrendsPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>(
    'monthly'
  )
  const [trendData, setTrendData] = useState<TrendData>({
    monthlyData: [],
    categoryData: [],
    yearlyComparison: {
      years: [],
      growthRate: { income: 0, expense: 0 },
    },
    patterns: {
      dayOfWeekPattern: [],
      dailyStats: { average: 0, max: 0, min: 0 },
    },
  })

  useEffect(() => {
    if (profile) {
      loadTrendData()
    }
  }, [profile])

  const loadTrendData = async () => {
    if (!profile) return

    setLoading(true)
    const supabase = createClient()

    try {
      // 월별 트렌드 데이터 로드
      const monthlyData = await loadMonthlyTrends(
        supabase,
        profile.id,
        selectedYear
      )

      // 카테고리별 트렌드 데이터 로드
      const categoryData = await loadCategoryTrends(
        supabase,
        profile.id,
        selectedYear
      )

      // 연도별 비교 데이터 로드
      const yearlyComparison = await loadYearlyComparison(supabase, profile.id)

      // 지출 패턴 분석
      const patterns = await analyzeSpendingPatterns(supabase, profile.id)

      setTrendData({
        monthlyData,
        categoryData,
        yearlyComparison,
        patterns,
      })
    } catch (error) {
      console.error('트렌드 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMonthlyTrends = async (
    supabase: SupabaseClient,
    userId: string,
    year: number
  ) => {
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')

    // 월별로 집계
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i).toLocaleDateString('ko-KR', {
        month: 'short',
      }),
      income: 0,
      expense: 0,
      net: 0,
    }))

    // transactions?.forEach((transaction: Transaction) => {
    //   const month = new Date(transaction.date).getMonth()
    //   if (transaction.type === 'income') {
    //     monthlyData[month].income += transaction.amount
    //   } else {
    //     monthlyData[month].expense += transaction.amount
    //   }
    // })
    if (!transactions) return monthlyData

    monthlyData.forEach(data => {
      data.net = data.income - data.expense
    })

    return monthlyData
  }

  const loadCategoryTrends = async (
    supabase: SupabaseClient,
    userId: string,
    year: number
  ) => {
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const { data: transactions } = await supabase
      .from('transactions')
      .select(
        `
        *,
        categories (
          name,
          color
        )
      `
      )
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    // 카테고리별 월별 집계
    const categoryMap = new Map()

    transactions?.forEach((transaction: Transaction) => {
      const categoryName = transaction.categories?.name || '미분류'
      const categoryColor = transaction.categories?.color || '##cccccc'
      const month = new Date(transaction.date).getMonth()

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          color: categoryColor,
          data: Array(12).fill(0),
          total: 0,
        })
      }

      const category = categoryMap.get(categoryName)
      category.data[month] += transaction.amount
      category.total += transaction.amount
    })

    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)
  }

  const loadYearlyComparison = async (
    supabase: SupabaseClient,
    userId: string
  ) => {
    const currentYear = new Date().getFullYear()
    const years = [currentYear - 2, currentYear - 1, currentYear]

    const yearlyData = await Promise.all(
      years.map(async year => {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', userId)
          .gte('date', `${year}-01-01`)
          .lte('date', `${year}-12-31`)

        const income =
          transactions
            ?.filter((t: Pick<Transaction, 'type'>) => t.type === 'income')
            .reduce(
              (sum: number, t: Pick<Transaction, 'type' | 'amount'>) =>
                sum + t.amount,
              0
            ) || 0

        const expense =
          transactions
            ?.filter((t: Pick<Transaction, 'type'>) => t.type === 'expense')
            .reduce(
              (sum: number, t: Pick<Transaction, 'type' | 'amount'>) =>
                sum + t.amount,
              0
            ) || 0

        return {
          year,
          income,
          expense,
          net: income - expense,
        }
      })
    )

    return {
      years: yearlyData,
      growthRate: calculateGrowthRate(yearlyData),
    }
  }

  const analyzeSpendingPatterns = async (
    supabase: SupabaseClient,
    userId: string
  ) => {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte(
        'date',
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      ) // 최근 90일

    // 요일별 지출 패턴
    const dayOfWeekSpending = Array(7).fill(0)
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']

    // 일별 평균 지출
    const dailySpending = new Map()

    transactions?.forEach((t: Pick<Transaction, 'date' | 'amount'>) => {
      const date = new Date(t.date)
      const dayOfWeek = date.getDay()
      dayOfWeekSpending[dayOfWeek] += t.amount

      const dateKey = date.toISOString().split('T')[0]
      dailySpending.set(dateKey, (dailySpending.get(dateKey) || 0) + t.amount)
    })

    // 평균 계산
    const avgDailySpending =
      Array.from(dailySpending.values()).reduce((a, b) => a + b, 0) /
        dailySpending.size || 0
    const maxDailySpending = Math.max(...Array.from(dailySpending.values()))
    const minDailySpending = Math.min(...Array.from(dailySpending.values()))

    return {
      dayOfWeekPattern: dayOfWeekSpending.map((amount, index) => ({
        day: dayNames[index],
        amount,
        percentage:
          (amount / dayOfWeekSpending.reduce((a, b) => a + b, 0)) * 100,
      })),
      dailyStats: {
        average: avgDailySpending,
        max: maxDailySpending,
        min: minDailySpending,
      },
    }
  }

  const calculateGrowthRate = (yearlyData: YearlySummary[]) => {
    if (yearlyData.length < 2) return { income: 0, expense: 0 }

    const current = yearlyData[yearlyData.length - 1]
    const previous = yearlyData[yearlyData.length - 2]

    return {
      income:
        previous.income > 0
          ? ((current.income - previous.income) / previous.income) * 100
          : 0,
      expense:
        previous.expense > 0
          ? ((current.expense - previous.expense) / previous.expense) * 100
          : 0,
    }
  }

  const availableYears = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-96 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            지출 트렌드 분석
          </h1>
          <p className="text-gray-600 mt-1">
            시간에 따른 수입과 지출 패턴을 분석해보세요
          </p>
        </div>

        <div className="flex gap-3">
          <Select
            value={selectedYear.toString()}
            onValueChange={v => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedPeriod}
            onValueChange={(v: 'monthly' | 'yearly') => setSelectedPeriod(v)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">월별</SelectItem>
              <SelectItem value="yearly">연도별</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  평균 월 지출
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    trendData.monthlyData.length
                      ? trendData.monthlyData.reduce(
                          (sum: number, m: MonthlyTrend) => sum + m.expense,
                          0
                        ) / 12
                      : 0
                  )}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  평균 월 수입
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    trendData.monthlyData.reduce(
                      (sum: number, m: MonthlyTrend) => sum + m.income,
                      0
                    ) / 12
                  )}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">지출 성장률</p>
                <p
                  className={`text-2xl font-bold ${
                    trendData.yearlyComparison.growthRate?.expense > 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {trendData.yearlyComparison.growthRate?.expense > 0
                    ? '+'
                    : ''}
                  {trendData.yearlyComparison.growthRate?.expense?.toFixed(1)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  일 평균 지출
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(trendData.patterns.dailyStats?.average || 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 월별 트렌드 차트 */}
        <MonthlyTrendChart data={trendData.monthlyData} year={selectedYear} />

        {/* 카테고리별 트렌드 차트 */}
        <CategoryTrendChart data={trendData.categoryData} year={selectedYear} />

        {/* 연도별 비교
        // <YearOverYearComparison data={trendData.yearlyComparison} />

        {/* 지출 패턴 분석 */}
        {/* <SpendingPatterns patterns={trendData.patterns} /> */}
      </div>
    </div>
  )
}
