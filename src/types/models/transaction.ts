import { Category } from './category'

export interface Transaction {
  id: string
  amount: number
  description: string | null
  type: 'income' | 'expense'
  date: string
  created_at: string
  category_id?: string
  categories?: Category // 또는 Category[]
}

export interface TransactionWithCategory extends Transaction {
  categories: Category
}
