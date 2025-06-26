import { createClient } from './supabase'

export async function testStoragePermissions() {
  console.log('🧪 Storage 권한 테스트 시작...')

  try {
    const supabase = createClient()

    // 1. 현재 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ 인증되지 않은 사용자:', userError)
      return false
    }
    console.log('✅ 인증된 사용자:', user.id)

    // 2. 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('❌ 세션이 없습니다:', sessionError)
      return false
    }
    console.log('✅ 유효한 세션 존재')

    // 3. 버킷 목록 조회
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets()
    if (bucketsError) {
      console.error('❌ 버킷 목록 조회 실패:', bucketsError)
      return false
    }
    console.log(
      '✅ 사용 가능한 버킷들:',
      buckets.map(b => b.name)
    )

    // 4. avatars 버킷 존재 확인
    const avatarsBucket = buckets.find(b => b.name === 'avatars')
    if (!avatarsBucket) {
      console.error('❌ avatars 버킷이 존재하지 않음')
      return false
    }
    console.log('✅ avatars 버킷 존재 확인:', avatarsBucket)

    // 5. 테스트 파일 업로드 시도
    const testFileName = `${user.id}/test-${Date.now()}.txt`
    const testFile = new File(['test content'], 'test.txt', {
      type: 'text/plain',
    })

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testFile)

    if (uploadError) {
      console.error('❌ 테스트 파일 업로드 실패:', uploadError)
      return false
    }
    console.log('✅ 테스트 파일 업로드 성공:', uploadData)

    // 6. 테스트 파일 삭제
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([testFileName])

    if (deleteError) {
      console.error('⚠️ 테스트 파일 삭제 실패:', deleteError)
    } else {
      console.log('✅ 테스트 파일 삭제 성공')
    }

    return true
  } catch (err) {
    console.error('❌ Storage 테스트 중 예상치 못한 오류:', err)
    return false
  }
}
