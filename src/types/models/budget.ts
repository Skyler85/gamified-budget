export interface BudgetAlert {
  id: string
  alertType: 'total' | 'category'
  percentage: number
  amountUsed: number
  budgetAmount: number
  categoryName?: string
  createdAt: string
  isRead: boolean
}

export interface CategoryBudgetData {
  categoryId: string
  categoryName: string
  categoryColor: string
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentage: number
}
