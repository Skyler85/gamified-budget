export interface UserProfile {
  id: string
  email?: string
  avatar_url?: string
  level: number
  coins: number
  total_exp: number
  current_streak: number
  longest_streak: number
  monthly_budget: number
  saving_goal: number
}
