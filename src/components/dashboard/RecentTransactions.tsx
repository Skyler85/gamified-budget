'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, ArrowRight } from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface RecentTransaction {
  id: string
  amount: number
  description: string | null
  type: 'income' | 'expense'
  date: string
  created_at: string
  categories: {
    name: string
    color: string
  }
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[]
  loading: boolean
}

export default function RecentTransactions({
  transactions,
  loading,
}: RecentTransactionsProps) {
  const router = useRouter()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>최근 거래</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="w-16 h-5 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>최근 거래</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/transactions')}
            className="flex items-center space-x-1"
          >
            <span>전체 보기</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-500 mb-2">최근 거래가 없습니다</p>
            <p className="text-sm text-gray-400">첫 번째 거래를 추가해보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 8).map(transaction => (
              <div
                key={transaction.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                onClick={() => router.push('/transactions')}
              >
                {/* 카테고리 아이콘 */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: transaction.categories.color }}
                >
                  {transaction.categories.name.charAt(0)}
                </div>

                {/* 거래 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate text-sm">
                      {transaction.description || '거래'}
                    </h4>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: transaction.categories.color + '20',
                        color: transaction.categories.color ?? '#cccccc',
                      }}
                    >
                      {transaction.categories.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>
                      {formatRelativeTime(new Date(transaction.created_at))}
                    </span>
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
                    className={`font-bold text-sm ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            ))}

            {transactions.length > 8 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/transactions')}
                >
                  {transactions.length - 8}개 더 보기
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
