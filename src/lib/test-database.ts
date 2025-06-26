import { supabase } from './supabase'

// 테이블 존재 여부 확인
export async function testTableStructure() {
  console.log('🗄️ 데이터베이스 테이블 구조 테스트 시작...')

  const tables = [
    'profiles',
    'categories',
    'transactions',
    'badges',
    'user_badges',
  ]
  const results = []

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)

      if (error) {
        console.log(`❌ ${table} 테이블 접근 실패:`, error.message)
        results.push({ table, success: false, error: error.message })
      } else {
        console.log(`✅ ${table} 테이블 접근 성공`)
        results.push({ table, success: true })
      }
    } catch (err) {
      console.log(`❌ ${table} 테이블 예상치 못한 오류:`, err)
      results.push({ table, success: false, error: err })
    }
  }

  return results
}

// 기본 데이터 확인
export async function testDefaultData() {
  console.log('📦 기본 데이터 확인 중...')

  try {
    // 기본 뱃지 데이터 확인
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')

    if (badgesError) {
      console.error('❌ 뱃지 데이터 로드 실패:', badgesError)
      return { badges: false }
    }

    console.log(`✅ 뱃지 데이터 로드 성공: ${badges?.length}개 뱃지 발견`)
    console.log('📋 뱃지 목록:')
    badges?.forEach(badge => {
      console.log(`  - ${badge.name}: ${badge.description}`)
    })

    return { badges: true, badgeCount: badges?.length }
  } catch (err) {
    console.error('❌ 기본 데이터 확인 중 오류:', err)
    return { badges: false, error: err }
  }
}
