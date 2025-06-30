export interface Category {
  id: string
  name: string
  color: string
  icon?: string
  type: 'income' | 'expense'
  is_default?: boolean
}
