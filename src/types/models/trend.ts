export interface MonthlyTrend {
  month: number
  monthName: string
  income: number
  expense: number
  net: number
}

export interface CategoryTrend {
  name: string
  color: string
  data: number[]
  total: number
}

export interface YearlySummary {
  year: number
  income: number
  expense: number
  net: number
}

export interface TrendData {
  monthlyData: MonthlyTrend[]
  categoryData: CategoryTrend[]
  yearlyComparison: {
    years: YearlySummary[]
    growthRate: {
      income: number
      expense: number
    }
  }
  patterns: {
    dayOfWeekPattern: {
      day: string
      amount: number
      percentage: number
    }[]
    dailyStats: {
      average: number
      max: number
      min: number
    }
  }
}
