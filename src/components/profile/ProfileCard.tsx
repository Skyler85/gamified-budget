'use client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import {
  Crown,
  Coins,
  Flame,
  Star,
  Edit,
  Trophy,
  TrendingUp,
} from 'lucide-react'

interface ProfileCardProps {
  onEdit?: () => void
  showEditButton?: boolean
}

export default function ProfileCard({
  onEdit,
  showEditButton = true,
}: ProfileCardProps) {
  const { profile, user } = useAuth()

  if (!profile || !user) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-16 w-16"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getLevelProgress = () => {
    const currentLevelExp = (profile.level - 1) * 1000
    const nextLevelExp = profile.level * 1000
    const progress = ((profile.total_exp - currentLevelExp) / 1000) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  const getStreakColor = () => {
    if (profile.current_streak >= 30) return 'text-purple-600 bg-purple-100'
    if (profile.current_streak >= 7) return 'text-orange-600 bg-orange-100'
    if (profile.current_streak >= 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* 아바타 */}
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(profile.full_name || profile.username || 'U')}
                </AvatarFallback>
              </Avatar>

              {/* 레벨 배지 */}
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {profile.level}
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                {profile.full_name || profile.username}
              </h2>
              <p className="text-sm text-gray-600">@{profile.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* 편집 버튼 */}
          {showEditButton && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              편집
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 레벨 진행도 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-blue-600 font-medium">
              <Crown className="h-4 w-4 mr-1" />
              레벨 {profile.level}
            </span>
            <span className="text-gray-500">
              {profile.total_exp.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getLevelProgress()}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            다음 레벨까지 {1000 - (profile.total_exp % 1000)} XP
          </p>
        </div>

        {/* 게임 통계 */}
        <div className="grid grid-cols-3 gap-4">
          {/* 코인 */}
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Coins className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-lg font-bold text-yellow-700">
              {profile.coins.toLocaleString()}
            </p>
            <p className="text-xs text-yellow-600">코인</p>
          </div>

          {/* 연속 기록 */}
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-lg font-bold text-orange-700">
              {profile.current_streak}
            </p>
            <p className="text-xs text-orange-600">연속일</p>
          </div>

          {/* 최장 기록 */}
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-lg font-bold text-purple-700">
              {profile.longest_streak}
            </p>
            <p className="text-xs text-purple-600">최장</p>
          </div>
        </div>

        {/* 구독 상태 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">계정 유형</span>
          </div>
          <Badge
            variant={
              profile.subscription_status === 'premium'
                ? 'default'
                : 'secondary'
            }
          >
            {profile.subscription_status === 'premium' ? '프리미엄' : '무료'}
          </Badge>
        </div>

        {/* 연속 기록 상태 */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Flame className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">연속 기록</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStreakColor()}>
              {profile.current_streak}일 연속
            </Badge>
            {profile.current_streak > 0 && (
              <TrendingUp className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
