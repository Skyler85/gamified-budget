'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface MonthlyStats {
  totalIncome: number
  totalExpense: number
  netAmount: number
  transactionCount: number
  expenseChange: number
}

interface MonthlyOverviewProps {
  stats: MonthlyStats
  currentMonth: string
}

export default function MonthlyOverview({
  stats,
  currentMonth,
}: MonthlyOverviewProps) {
  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01')
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    })
  }

  const statsData = [
    {
      title: '이번 달 수입',
      value: stats.totalIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: null,
      description: '총 수입 금액',
    },
    {
      title: '이번 달 지출',
      value: stats.totalExpense,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      change: stats.expenseChange,
      description: '전월 대비',
    },
    {
      title: stats.netAmount >= 0 ? '순 수입' : '순 지출',
      value: Math.abs(stats.netAmount),
      icon: DollarSign,
      color: stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.netAmount >= 0 ? 'bg-green-50' : 'bg-red-50',
      iconColor: stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600',
      change: null,
      description:
        stats.netAmount >= 0
          ? '수입이 지출보다 많습니다'
          : '지출이 수입보다 많습니다',
    },
    {
      title: '거래 건수',
      value: stats.transactionCount,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: null,
      description: '이번 달 총 거래',
      isCount: true,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {formatMonth(currentMonth)} 개요
        </h2>
        <p className="text-gray-600">이번 달 수입과 지출 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.isCount ? `${stat.value}건` : formatCurrency(stat.value)}
              </div>

              {stat.change !== null && (
                <div className="flex items-center text-xs">
                  {stat.change > 0 ? (
                    <ArrowUp className="h-3 w-3 text-red-500 mr-1" />
                  ) : stat.change < 0 ? (
                    <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                  ) : null}
                  <span
                    className={
                      stat.change > 0
                        ? 'text-red-500'
                        : stat.change < 0
                          ? 'text-green-500'
                          : 'text-gray-500'
                    }
                  >
                    {stat.change > 0 ? '+' : ''}
                    {stat.change.toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">{stat.description}</span>
                </div>
              )}

              {stat.change === null && (
                <p className="text-xs text-gray-500">{stat.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 간단한 요약 메시지 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center">
            {stats.netAmount > 0 ? (
              <p className="text-green-700">
                🎉 이번 달은{' '}
                <span className="font-bold">
                  {formatCurrency(stats.netAmount)}
                </span>
                를 절약했어요!
              </p>
            ) : stats.netAmount < 0 ? (
              <p className="text-red-700">
                ⚠️ 이번 달은{' '}
                <span className="font-bold">
                  {formatCurrency(Math.abs(stats.netAmount))}
                </span>{' '}
                적자예요. 지출을 조절해보세요.
              </p>
            ) : (
              <p className="text-blue-700">
                💰 이번 달은 수입과 지출이 균형을 이뤘어요!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
