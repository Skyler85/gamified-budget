'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MonthlyData {
  month: number
  monthName: string
  income: number
  expense: number
  net: number
}

interface MonthlyTrendChartProps {
  data: MonthlyData[]
  year: number
}

export default function MonthlyTrendChart({
  data,
  year,
}: MonthlyTrendChartProps) {
  // 전월 대비 변화율 계산
  const calculateChangeRate = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  // 현재 월 찾기
  const currentMonth = new Date().getMonth() + 1
  const currentMonthData = data.find(d => d.month === currentMonth)
  const previousMonthData = data.find(d => d.month === currentMonth - 1)

  const expenseChangeRate = previousMonthData
    ? calculateChangeRate(
        currentMonthData?.expense || 0,
        previousMonthData.expense
      )
    : 0

  // 차트 데이터 포맷
  const chartData = data.map(item => ({
    ...item,
    수입: item.income,
    지출: item.expense,
    순수익: item.net,
  }))

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: unknown /* TODO: replace 'any' */) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: unknown /* TODO: replace 'any' */, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // 통계 계산
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0)
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0)
  const avgMonthlyExpense = totalExpense / data.length
  const maxExpenseMonth = data.reduce((max, item) =>
    item.expense > max.expense ? item : max
  )

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {year}년 월별 수입/지출 트렌드
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            {expenseChangeRate !== 0 && (
              <>
                {expenseChangeRate > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span
                  className={
                    expenseChangeRate > 0 ? 'text-red-600' : 'text-green-600'
                  }
                >
                  전월 대비 {Math.abs(expenseChangeRate).toFixed(1)}%
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 차트 */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={value => `${(value / 1000000).toFixed(1)}M`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="수입"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorIncome)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="지출"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorExpense)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="순수익"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600">총 수입</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">총 지출</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">월 평균 지출</p>
            <p className="text-lg font-semibold">
              {formatCurrency(avgMonthlyExpense)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">최대 지출월</p>
            <p className="text-lg font-semibold">
              {maxExpenseMonth.monthName} (
              {formatCurrency(maxExpenseMonth.expense)})
            </p>
          </div>
        </div>

        {/* 인사이트 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            💡 인사이트
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {totalIncome > totalExpense ? (
              <li>
                • 올해 총 {formatCurrency(totalIncome - totalExpense)}를
                저축하셨어요! 🎉
              </li>
            ) : (
              <li>
                • 올해 총 {formatCurrency(totalExpense - totalIncome)}의 적자가
                발생했어요.
              </li>
            )}
            <li>
              • {maxExpenseMonth.monthName}에 가장 많은 지출이 있었어요.
              평균보다{' '}
              {formatCurrency(maxExpenseMonth.expense - avgMonthlyExpense)} 더
              썼네요.
            </li>
            {expenseChangeRate < -10 && (
              <li>
                • 지난달보다 지출이 크게 줄었어요! 절약을 잘하고 계시네요 👍
              </li>
            )}
            {expenseChangeRate > 20 && (
              <li>• 이번 달 지출이 급증했어요. 특별한 지출이 있었나요?</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
