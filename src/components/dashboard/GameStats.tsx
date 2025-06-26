'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Crown, Coins, Flame, Star, Trophy, Target } from 'lucide-react'

interface GameStatsProps {
  profile: any
}

export default function GameStats({ profile }: GameStatsProps) {
  if (!profile) return null

  const getLevelProgress = () => {
    const currentLevelExp = (profile.level - 1) * 1000
    const nextLevelExp = profile.level * 1000
    const progress = ((profile.total_exp - currentLevelExp) / 1000) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  const getStreakColor = () => {
    if (profile.current_streak >= 30) return 'bg-purple-500'
    if (profile.current_streak >= 7) return 'bg-orange-500'
    if (profile.current_streak >= 3) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const getStreakEmoji = () => {
    if (profile.current_streak >= 30) return '🔥'
    if (profile.current_streak >= 7) return '⚡'
    if (profile.current_streak >= 3) return '✨'
    return '📝'
  }

  const expToNextLevel = 1000 - (profile.total_exp % 1000)
  const levelProgress = getLevelProgress()

  return (
    <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-purple-600" />
          <span>게임 현황</span>
          <Badge variant="secondary" className="ml-auto">
            Level {profile.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 레벨 및 경험치 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                레벨 진행도
              </span>
              <span className="text-xs text-gray-500">
                {profile.total_exp.toLocaleString()} XP
              </span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Level {profile.level}</span>
              <span>다음 레벨까지 {expToNextLevel} XP</span>
            </div>
          </div>

          {/* 코인 */}
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center mb-2">
              <Coins className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-700">
              {profile.coins.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-600">보유 코인</div>
          </div>

          {/* 연속 기록 */}
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">{getStreakEmoji()}</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {profile.current_streak}일
            </div>
            <div className="text-sm text-orange-600">연속 기록</div>
            {profile.current_streak > 0 && (
              <div className="mt-2">
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs text-white ${getStreakColor()}`}
                >
                  {profile.current_streak >= 30
                    ? '🏆 전설'
                    : profile.current_streak >= 7
                      ? '⭐ 꾸준'
                      : profile.current_streak >= 3
                        ? '👏 노력'
                        : '🌱 시작'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 성취 및 목표 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              이번 달 목표
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              {profile.monthly_budget > 0 && (
                <div>
                  💰 월 예산: {profile.monthly_budget.toLocaleString()}원
                </div>
              )}
              {profile.saving_goal > 0 && (
                <div>
                  🎯 저축 목표: {profile.saving_goal.toLocaleString()}원
                </div>
              )}
              {!profile.monthly_budget && !profile.saving_goal && (
                <div className="text-gray-400">목표를 설정해보세요!</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              최고 기록
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>🔥 최장 연속: {profile.longest_streak}일</div>
              <div>💎 최고 레벨: Level {profile.level}</div>
              <div>🏆 총 경험치: {profile.total_exp.toLocaleString()} XP</div>
            </div>
          </div>
        </div>

        {/* 오늘의 팁 */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
            💡 오늘의 팁
          </h4>
          <p className="text-sm text-gray-600">
            {profile.current_streak === 0
              ? '오늘 거래를 기록하고 연속 기록을 시작해보세요!'
              : profile.current_streak < 7
                ? "연속 7일을 달성하면 '꾸준함' 뱃지를 받을 수 있어요!"
                : '훌륭해요! 연속 기록을 유지하며 더 많은 경험치를 획득하세요!'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
