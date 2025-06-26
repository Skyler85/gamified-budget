'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProfileCard from '@/components/profile/ProfileCard'
import ProfileEditForm from '@/components/profile/ProfileEditForm'
import { useAuth } from '@/lib/auth-context'
import { ArrowLeft, Settings, LogOut, Shield, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* 헤더 */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로 가기
              </Button>
            </div>

            {/* 편집 폼 */}
            <ProfileEditForm
              onSuccess={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">프로필</h1>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              대시보드
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 프로필 카드 */}
            <div className="lg:col-span-2">
              <ProfileCard onEdit={() => setIsEditing(true)} />
            </div>

            {/* 계정 설정 */}
            <div className="space-y-6">
              {/* 계정 관리 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    계정 관리
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    보안 설정
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    알림 설정
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </Button>
                </CardContent>
              </Card>

              {/* 구독 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">구독 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900">무료 플랜</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        기본 가계부 기능을 이용할 수 있습니다
                      </p>
                    </div>
                    <Button className="w-full">프리미엄으로 업그레이드</Button>
                  </div>
                </CardContent>
              </Card>

              {/* 앱 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">앱 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>버전</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>가입일</span>
                    <span>2024년 12월</span>
                  </div>
                  <div className="flex justify-between">
                    <span>데이터 사용량</span>
                    <span>2.3 MB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
