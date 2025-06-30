'use client'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import { Transaction } from '../../types'

interface TransactionStatsProps {
  transactions: Transaction[]
  selectedMonth: string
}

export default function TransactionStats({
  transactions,
  selectedMonth,
}: TransactionStatsProps) {
  const stats = useMemo(() => {
    // 선택된 월의 거래만 필터링
    const monthTransactions = transactions.filter(t => {
      const transactionMonth = new Date(t.date).toISOString().slice(0, 7)
      return transactionMonth === selectedMonth
    })

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const netAmount = totalIncome - totalExpense
    const transactionCount = monthTransactions.length

    // 이전 달과 비교 (간단히 30일 전 데이터와 비교)
    const previousMonth = new Date(selectedMonth + '-01')
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    const prevMonthStr = previousMonth.toISOString().slice(0, 7)

    const prevMonthTransactions = transactions.filter(t => {
      const transactionMonth = new Date(t.date).toISOString().slice(0, 7)
      return transactionMonth === prevMonthStr
    })

    const prevTotalExpense = prevMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenseChange =
      prevTotalExpense > 0
        ? ((totalExpense - prevTotalExpense) / prevTotalExpense) * 100
        : 0

    return {
      totalIncome,
      totalExpense,
      netAmount,
      transactionCount,
      expenseChange,
    }
  }, [transactions, selectedMonth])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01')
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 총 수입 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {formatMonth(selectedMonth)} 수입
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">이번 달 총 수입</p>
        </CardContent>
      </Card>

      {/* 총 지출 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {formatMonth(selectedMonth)} 지출
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalExpense)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>전월 대비 </span>
            <span
              className={`ml-1 font-medium ${
                stats.expenseChange > 0 ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {stats.expenseChange > 0 ? '+' : ''}
              {stats.expenseChange.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 순 수입/지출 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            순 {stats.netAmount >= 0 ? '수입' : '지출'}
          </CardTitle>
          <DollarSign
            className={`h-4 w-4 ${
              stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(Math.abs(stats.netAmount))}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.netAmount >= 0
              ? '수입이 지출보다 많습니다'
              : '지출이 수입보다 많습니다'}
          </p>
        </CardContent>
      </Card>

      {/* 거래 건수 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">거래 건수</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.transactionCount}건
          </div>
          <p className="text-xs text-muted-foreground">
            {formatMonth(selectedMonth)} 총 거래
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
