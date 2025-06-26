import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

// 클라이언트 컴포넌트용 Supabase 클라이언트
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// 기본 클라이언트 인스턴스 (클라이언트 컴포넌트에서만 사용)
let supabaseInstance: ReturnType<
  typeof createClientComponentClient<Database>
> | null = null

export const supabase = (() => {
  if (typeof window !== 'undefined') {
    // 브라우저 환경에서만 인스턴스 생성
    if (!supabaseInstance) {
      supabaseInstance = createClientComponentClient<Database>()
    }
    return supabaseInstance
  }

  // 서버 환경에서는 매번 새로운 인스턴스 생성
  return createClientComponentClient<Database>()
})()
