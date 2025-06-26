import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
import { Database } from '@/types/database'

// 클라이언트 컴포넌트용
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// 서버 컴포넌트용
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}

// 브라우저에서 사용할 기본 클라이언트
export const supabase = createClientComponentClient<Database>()
