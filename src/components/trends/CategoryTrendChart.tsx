'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react'

interface CategoryData {
  name: string
  color: string
  data: number[]
  total: number
}

interface CategoryTrendChartProps {
  data: CategoryData[]
  year: number
}

export default function CategoryTrendChart({
  data,
  year,
}: CategoryTrendChartProps) {
  const [viewMode, setViewMode] = useState<'line' | 'bar' | 'pie'>('line')
  const months = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ]

  // 상위 5개 카테고리만 표시
  const topCategories = data.slice(0, 5)

  // 라인/바 차트용 데이터 변환
  const chartData = months.map((month, index) => {
    const monthData: unknown /* TODO: replace 'any' */ = { month }
    topCategories.forEach(category => {
      monthData[category.name] = category.data[index]
    })
    return monthData
  })

  // 파이 차트용 데이터
  const pieData = topCategories.map(category => ({
    name: category.name,
    value: category.total,
    color: category.color,
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

  // 파이 차트 라벨
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: unknown /* TODO: replace 'any' */) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // 가장 많이 쓴 카테고리
  const topSpendingCategory = topCategories[0]
  const categoryGrowth = topSpendingCategory
    ? ((topSpendingCategory.data[11] - topSpendingCategory.data[0]) /
        topSpendingCategory.data[0]) *
      100
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            카테고리별 지출 트렌드
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  )
}
