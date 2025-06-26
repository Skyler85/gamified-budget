'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Loader2, Upload, X, Check } from 'lucide-react'

const profileSchema = z.object({
  username: z
    .string()
    .min(3, '사용자명은 3자 이상이어야 합니다')
    .max(20, '사용자명은 20자 이하여야 합니다')
    .regex(/^[a-zA-Z0-9_]+$/, '사용자명은 영문, 숫자, _만 사용 가능합니다'),
  fullName: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이하여야 합니다'),
})

type ProfileForm = z.infer<typeof profileSchema>

interface ProfileEditFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ProfileEditForm({
  onSuccess,
  onCancel,
}: ProfileEditFormProps) {
  const { profile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      fullName: profile?.full_name || '',
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다')
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다')
      return
    }

    setAvatarFile(file)

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = e => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !profile) return null

    setUploadingAvatar(true)
    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile)

      if (uploadError) {
        console.error('아바타 업로드 오류:', uploadError)
        setError('아바타 업로드에 실패했습니다')
        return null
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)

      return data.publicUrl
    } catch (err) {
      console.error('아바타 업로드 중 오류:', err)
      setError('아바타 업로드 중 오류가 발생했습니다')
      return null
    } finally {
      setUploadingAvatar(false)
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    if (!profile) return

    setIsLoading(true)
    setError('')

    try {
      let avatarUrl = profile.avatar_url

      // 아바타가 변경된 경우 업로드
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        } else {
          setIsLoading(false)
          return // 업로드 실패 시 중단
        }
      }

      // 프로필 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          full_name: data.fullName,
          ...(avatarUrl && { avatar_url: avatarUrl }),
        })
        .eq('id', profile.id)

      if (updateError) {
        if (updateError.code === '23505') {
          setError('이미 사용 중인 사용자명입니다')
        } else {
          setError('프로필 업데이트에 실패했습니다')
        }
        return
      }

      // 프로필 새로고침
      await refreshProfile()

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (err) {
      console.error('프로필 업데이트 오류:', err)
      setError('프로필 업데이트 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Check className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-600">
              업데이트 완료!
            </h2>
            <p className="text-gray-600">
              프로필이 성공적으로 업데이트되었습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>프로필 편집</CardTitle>
        <CardDescription>프로필 정보를 수정할 수 있습니다</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 아바타 섹션 */}
          <div className="space-y-4">
            <Label>프로필 이미지</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={avatarPreview || profile?.avatar_url}
                  alt="Profile"
                />
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.full_name || profile?.username || 'U')}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById('avatar-upload')?.click()
                    }
                    disabled={uploadingAvatar}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingAvatar ? '업로드 중...' : '이미지 선택'}
                  </Button>

                  {(avatarPreview || profile?.avatar_url) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAvatarFile(null)
                        setAvatarPreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <p className="text-xs text-gray-500">
                  JPG, PNG 파일 (최대 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* 사용자명 */}
          <div className="space-y-2">
            <Label htmlFor="username">사용자명</Label>
            <Input
              id="username"
              {...register('username')}
              disabled={isLoading || uploadingAvatar}
              placeholder="사용자명을 입력하세요"
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="fullName">이름</Label>
            <Input
              id="fullName"
              {...register('fullName')}
              disabled={isLoading || uploadingAvatar}
              placeholder="이름을 입력하세요"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex space-x-2">
          <Button
            type="submit"
            disabled={isLoading || uploadingAvatar}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || uploadingAvatar}
          >
            취소
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
