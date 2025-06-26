import { supabase } from './supabase'

// 기본 연결 테스트
export async function testBasicConnection() {
  console.log('🔄 Supabase 기본 연결 테스트 시작...')

  try {
    // 단순 ping 테스트
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('❌ 연결 실패:', error.message)
      return { success: false, error: error.message }
    }

    console.log('✅ Supabase 기본 연결 성공!')
    console.log('📊 프로필 테이블 존재 확인됨')
    return { success: true, data }
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err)
    return { success: false, error: err }
  }
}

// 환경 변수 확인
export function checkEnvironmentVariables() {
  console.log('🔧 환경 변수 확인 중...')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const results = {
    urlExists: !!supabaseUrl,
    keyExists: !!supabaseKey,
    urlFormat: supabaseUrl?.includes('.supabase.co'),
    keyFormat: supabaseKey?.startsWith('eyJ'),
  }

  console.log('📋 환경 변수 상태:')
  console.log('  - SUPABASE_URL 존재:', results.urlExists ? '✅' : '❌')
  console.log('  - SUPABASE_KEY 존재:', results.keyExists ? '✅' : '❌')
  console.log('  - URL 형식 올바름:', results.urlFormat ? '✅' : '❌')
  console.log('  - KEY 형식 올바름:', results.keyFormat ? '✅' : '❌')

  return results
}
