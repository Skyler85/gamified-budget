'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  BarChart3,
  Target,
  Settings,
  Receipt,
  Coffee,
  Car,
  ShoppingBag,
} from 'lucide-react'

interface QuickActionsProps {
  onAddTransaction: () => void
}

export default function QuickActions({ onAddTransaction }: QuickActionsProps) {
  const router = useRouter()

  const quickExpenseCategories = [
    { name: '식비', icon: '🍽️', color: 'bg-red-500' },
    { name: '교통비', icon: '🚗', color: 'bg-blue-500' },
    { name: '카페', icon: '☕', color: 'bg-amber-600' },
    { name: '쇼핑', icon: '🛍️', color: 'bg-purple-500' },
  ]

  const mainActions = [
    {
      title: '거래 추가',
      description: '새로운 수입/지출 기록',
      icon: PlusCircle,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onAddTransaction,
    },
    {
      title: '전체 내역',
      description: '모든 거래 내역 보기',
      icon: BarChart3,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => router.push('/transactions'),
    },
    {
      title: '예산 관리',
      description: '월별 예산 설정',
      icon: Target,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => router.push('/profile'),
    },
    {
      title: '설정',
      description: '계정 및 카테고리 관리',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => router.push('/profile'),
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 주요 액션 */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>빠른 액션</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mainActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-20 flex-col space-y-2 ${action.color} text-white border-none`}
                  onClick={action.onClick}
                >
                  <action.icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium text-xs">{action.title}</div>
                    <div className="text-xs opacity-80">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 지출 기록 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coffee className="h-5 w-5" />
              <span>빠른 지출</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickExpenseCategories.map((category, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={onAddTransaction}
                >
                  <span className="text-lg mr-3">{category.icon}</span>
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="link"
                size="sm"
                onClick={onAddTransaction}
                className="text-gray-500"
              >
                + 다른 카테고리
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
