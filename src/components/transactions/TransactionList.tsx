'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, Calendar, Tag } from 'lucide-react'
import { Transaction } from '../../types'

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (transactionId: string) => void
}

export default function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return '오늘'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제'
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            거래 내역이 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            첫 번째 거래를 추가해서 가계부를 시작해보세요
          </p>
        </CardContent>
      </Card>
    )
  }

  // 날짜별로 거래 그룹화
  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const date = transaction.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
      return groups
    },
    {} as Record<string, Transaction[]>
  )

  return (
    <div className="space-y-4">
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
        const dayTotal = dayTransactions.reduce((sum, t) => {
          return sum + (t.type === 'income' ? t.amount : -t.amount)
        }, 0)

        return (
          <Card key={date}>
            <CardContent className="p-0">
              {/* 날짜 헤더 */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {formatDate(date)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({new Date(date).toLocaleDateString('ko-KR')})
                  </span>
                </div>
                <div
                  className={`font-semibold ${
                    dayTotal >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {dayTotal >= 0 ? '+' : ''}
                  {formatCurrency(dayTotal)}
                </div>
              </div>

              {/* 거래 목록 */}
              <div className="divide-y">
                {dayTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* 카테고리 아이콘 */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: transaction.categories.color }}
                    >
                      {transaction.categories.name.charAt(0)}
                    </div>

                    {/* 거래 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {transaction.description || '거래'}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor:
                              transaction.categories.color + '20',
                            color: transaction.categories.color ?? '#cccccc',
                          }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {transaction.categories.name}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{formatTime(transaction.created_at)}</span>
                        <span>•</span>
                        <span
                          className={`font-medium ${
                            transaction.type === 'income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '수입' : '지출'}
                        </span>
                      </div>
                    </div>

                    {/* 금액 */}
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(transaction.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
