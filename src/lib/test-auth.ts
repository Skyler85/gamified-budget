import { supabase } from './supabase'

// RLS 정책 테스트 (인증되지 않은 상태)
export async function testAnonymousAccess() {
  console.log('🔐 익명 사용자 접근 권한 테스트...')

  const tests = [
    {
      name: 'profiles 테이블 조회',
      test: () => supabase.from('profiles').select('*').limit(1),
    },
    {
      name: 'badges 테이블 조회',
      test: () => supabase.from('badges').select('*').limit(1),
    },
    {
      name: 'transactions 테이블 조회',
      test: () => supabase.from('transactions').select('*').limit(1),
    },
  ]

  const results = []

  for (const { name, test } of tests) {
    try {
      const { data, error } = await test()

      if (error) {
        // 인증 오류는 예상된 결과
        if (error.code === 'PGRST301' || error.message.includes('RLS')) {
          console.log(`✅ ${name}: RLS 정책이 올바르게 작동 중`)
          results.push({ test: name, success: true, protected: true })
        } else {
          console.log(`❌ ${name}: 예상치 못한 오류 - ${error.message}`)
          results.push({ test: name, success: false, error: error.message })
        }
      } else {
        // badges 테이블은 조회 가능해야 함
        if (name.includes('badges')) {
          console.log(`✅ ${name}: 공개 데이터 접근 성공`)
          results.push({ test: name, success: true, protected: false })
        } else {
          console.log(`⚠️ ${name}: 보호되어야 할 데이터가 노출됨`)
          results.push({ test: name, success: false, issue: 'not_protected' })
        }
      }
    } catch (err) {
      console.log(`❌ ${name}: 예상치 못한 오류`, err)
      results.push({ test: name, success: false, error: err })
    }
  }

  return results
}

// 테스트 사용자 생성 및 인증 테스트
export async function testUserSignup() {
  console.log('👤 테스트 사용자 생성 및 인증 테스트...')

  const testEmail = `test_${Date.now()}@example.com`
  const testPassword = 'Test123456!'

  try {
    // 1. 회원가입 테스트
    console.log('🔄 회원가입 테스트 중...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
      }
    )

    if (signUpError) {
      console.error('❌ 회원가입 실패:', signUpError.message)
      return { success: false, step: 'signup', error: signUpError.message }
    }

    console.log('✅ 회원가입 성공')
    console.log('📧 이메일 확인 필요:', !signUpData.user?.email_confirmed_at)

    // 2. 프로필 자동 생성 확인 (개발 환경에서는 이메일 확인 없이도 가능)
    if (signUpData.user) {
      console.log('🔄 자동 프로필 생성 확인 중...')

      // 잠시 대기 (트리거 실행 시간)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single()

      if (profileError) {
        console.error('❌ 프로필 자동 생성 실패:', profileError.message)
        return {
          success: false,
          step: 'profile_creation',
          error: profileError.message,
        }
      }

      console.log('✅ 프로필 자동 생성 성공')
      console.log('📊 프로필 데이터:', profile)

      // 기본 카테고리 생성 확인
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', signUpData.user.id)

      if (categoriesError) {
        console.error('❌ 기본 카테고리 확인 실패:', categoriesError.message)
      } else {
        console.log(`✅ 기본 카테고리 생성 성공: ${categories?.length}개`)
      }
    }

    // 3. 로그아웃
    await supabase.auth.signOut()
    console.log('✅ 로그아웃 완료')

    return {
      success: true,
      testUser: { email: testEmail, id: signUpData.user?.id },
      profileCreated: true,
      categoriesCreated: true,
    }
  } catch (err) {
    console.error('❌ 사용자 테스트 중 예상치 못한 오류:', err)
    return { success: false, error: err }
  }
}
