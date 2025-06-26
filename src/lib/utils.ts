import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 숫자를 한국 원화 형식으로 포맷
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

// 날짜 포맷팅
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// 상대 시간 포맷팅 (예: "2시간 전", "어제")
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return '방금 전'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else if (diffInDays === 1) {
    return '어제'
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`
  } else {
    return formatDate(date)
  }
}

// 숫자를 간단한 형태로 포맷 (예: 1.2K, 1.5M)
export function formatCompactNumber(num: number): string {
  if (num < 1000) {
    return num.toString()
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K'
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else {
    return (num / 1000000000).toFixed(1) + 'B'
  }
}
