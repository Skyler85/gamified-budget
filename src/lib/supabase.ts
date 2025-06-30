import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

// 클라이언트 컴포넌트용 Supabase 클라이언트
export const createClient = () => createClientComponentClient<Database>()

// 싱글턴 클라이언트 (클라이언트 컴포넌트에서 재사용 가능)
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase =
  typeof window !== 'undefined'
    ? (supabaseInstance ||= createClientComponentClient<Database>())
    : createClientComponentClient<Database>()
