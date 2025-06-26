'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { runAllTests } from '@/lib/run-all-tests'

export default function TestConnection() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState(null)

  const handleTest = async () => {
    setTesting(true)
    setResults(null)

    const testResults = await runAllTests()
    setResults(testResults)
    setTesting(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Supabase 연결 테스트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTest} disabled={testing} className="w-full">
          {testing ? '테스트 실행 중...' : '전체 테스트 실행'}
        </Button>

        {results && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">테스트 결과:</h3>
            <div className="space-y-2 text-sm">
              <div>
                환경 변수:{' '}
                {results.environment?.urlExists &&
                results.environment?.keyExists
                  ? '✅'
                  : '❌'}
              </div>
              <div>기본 연결: {results.connection?.success ? '✅' : '❌'}</div>
              <div>
                테이블 구조:{' '}
                {results.tables?.every(t => t.success) ? '✅' : '❌'}
              </div>
              <div>
                기본 데이터: {results.defaultData?.badges ? '✅' : '❌'}
              </div>
              <div>보안 정책: {results.security?.length > 0 ? '✅' : '❌'}</div>
              <div>
                인증 시스템: {results.authentication?.success ? '✅' : '❌'}
              </div>
              <div className="font-bold pt-2 border-t">
                전체 결과: {results.overall ? '✅ 성공' : '❌ 실패'}
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          💡 개발자 도구 콘솔에서 자세한 로그를 확인하세요.
        </div>
      </CardContent>
    </Card>
  )
}
