'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CategoryData {
  category: string
  amount: number
  color: string
}

interface CategoryChartProps {
  data: CategoryData[]
  loading: boolean
}

export default function CategoryChart({ data, loading }: CategoryChartProps) {
  const CustomTooltip = ({ active, payload }: unknown /* TODO: replace 'any' */) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.amount)} (
            {((data.amount / getTotalAmount()) * 100).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  const getTotalAmount = () => {
    return data.reduce((sum, item) => sum + item.amount, 0)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5" />
            <span>카테고리별 지출</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5" />
            <span>카테고리별 지출</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>이번 달 지출 데이터가 없습니다</p>
              <p className="text-sm">거래를 추가하면 차트가 표시됩니다</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChartIcon className="h-5 w-5" />
          <span>카테고리별 지출</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) =>
                  percent > 5 ? `${(percent * 100).toFixed(0)}%` : ''
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 범례 */}
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-sm text-gray-700">
            카테고리별 상세
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-gray-500 text-xs">
                    ({((item.amount / getTotalAmount()) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 총합 */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between font-semibold">
            <span>총 지출</span>
            <span className="text-red-600">
              {formatCurrency(getTotalAmount())}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
