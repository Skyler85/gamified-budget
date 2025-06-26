import {
  testBasicConnection,
  checkEnvironmentVariables,
} from './test-connection'
import { testTableStructure, testDefaultData } from './test-database'
import { testAnonymousAccess, testUserSignup } from './test-auth'
import { testStoragePermissions } from './test-storage'

export async function runAllTests() {
  console.log('🧪 Supabase 전체 연결 테스트 시작...')
  console.log('='.repeat(50))

  const results = {
    environment: null,
    connection: null,
    tables: null,
    defaultData: null,
    security: null,
    authentication: null,
    storage: null,
    overall: false,
  }

  try {
    // 1. 환경 변수 확인
    console.log('\n1️⃣ 환경 변수 확인')
    console.log('-'.repeat(30))
    results.environment = checkEnvironmentVariables()

    // 2. 기본 연결 테스트
    console.log('\n2️⃣ 기본 연결 테스트')
    console.log('-'.repeat(30))
    results.connection = await testBasicConnection()

    if (!results.connection.success) {
      console.error('🛑 기본 연결 실패로 테스트 중단')
      return results
    }

    // 3. 테이블 구조 테스트
    console.log('\n3️⃣ 테이블 구조 테스트')
    console.log('-'.repeat(30))
    results.tables = await testTableStructure()

    // 4. 기본 데이터 테스트
    console.log('\n4️⃣ 기본 데이터 테스트')
    console.log('-'.repeat(30))
    results.defaultData = await testDefaultData()

    // 5. 보안 정책 테스트
    console.log('\n5️⃣ 보안 정책 테스트')
    console.log('-'.repeat(30))
    results.security = await testAnonymousAccess()

    // 6. 인증 시스템 테스트
    console.log('\n6️⃣ 인증 시스템 테스트')
    console.log('-'.repeat(30))
    results.authentication = await testUserSignup()

    // 7. 스토리지 테스트
    console.log('\n7️⃣ 스토리지 테스트')
    console.log('-'.repeat(30))
    results.storage = await testStoragePermissions()

    // 전체 결과 평가
    const allSuccessful =
      results.environment.urlExists &&
      results.environment.keyExists &&
      results.connection.success &&
      results.tables.every(t => t.success) &&
      results.defaultData.badges &&
      results.security.length > 0 &&
      results.authentication.success &&
      results.storage

    results.overall = allSuccessful

    // 최종 결과 출력
    console.log('\n📊 최종 테스트 결과')
    console.log('='.repeat(50))
    console.log(
      `환경 변수: ${results.environment.urlExists && results.environment.keyExists ? '✅' : '❌'}`
    )
    console.log(`기본 연결: ${results.connection.success ? '✅' : '❌'}`)
    console.log(
      `테이블 구조: ${results.tables.every(t => t.success) ? '✅' : '❌'}`
    )
    console.log(`기본 데이터: ${results.defaultData.badges ? '✅' : '❌'}`)
    console.log(`보안 정책: ${results.security.length > 0 ? '✅' : '❌'}`)
    console.log(`인증 시스템: ${results.authentication.success ? '✅' : '❌'}`)
    console.log(`스토리지 권한: ${results.storage ? '✅' : '❌'}`)
    console.log(
      `\n🎯 전체 결과: ${allSuccessful ? '✅ 모든 테스트 통과!' : '❌ 일부 테스트 실패'}`
    )

    return results
  } catch (err) {
    console.error('❌ 테스트 실행 중 치명적 오류:', err)
    results.overall = false
    return results
  }
}
