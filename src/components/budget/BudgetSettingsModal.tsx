'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Target, DollarSign, TrendingUp, Loader2 } from 'lucide-react'

const budgetSchema = z.object({
  monthlyBudget: z.string().min(1, '월 예산을 입력해주세요'),
  savingGoal: z.string().optional(),
})

type BudgetForm = z.infer<typeof budgetSchema>

interface BudgetSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export default function BudgetSettingsModal({
  isOpen,
  onClose,
  onSaved,
}: BudgetSettingsModalProps) {
  const { profile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
  })

  // 현재 설정값으로 폼 초기화
  useEffect(() => {
    if (profile && isOpen) {
      setValue('monthlyBudget', profile.monthly_budget?.toString() || '')
      setValue('savingGoal', profile.saving_goal?.toString() || '')
    }
  }, [profile, isOpen, setValue])

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setValue('monthlyBudget', formatted)
  }

  const handleSavingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setValue('savingGoal', formatted)
  }

  const onSubmit = async (data: BudgetForm) => {
    if (!profile) return

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const updateData = {
        monthly_budget: parseFloat(data.monthlyBudget.replace(/,/g, '')),
        saving_goal: data.savingGoal
          ? parseFloat(data.savingGoal.replace(/,/g, ''))
          : null,
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)

      if (updateError) {
        setError('예산 설정 저장에 실패했습니다.')
        console.error('예산 설정 오류:', updateError)
        return
      }

      // 프로필 새로고침
      await refreshProfile()
      onSaved()
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('예산 설정 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const monthlyBudget = watch('monthlyBudget')
  const savingGoal = watch('savingGoal')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>예산 목표 설정</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 월 예산 */}
          <div className="space-y-2">
            <Label
              htmlFor="monthlyBudget"
              className="flex items-center space-x-2"
            >
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>월 예산 (필수)</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₩</span>
              <Input
                id="monthlyBudget"
                {...register('monthlyBudget')}
                onChange={handleBudgetChange}
                placeholder="2,000,000"
                className="pl-8 text-lg"
                disabled={isLoading}
              />
            </div>
            {errors.monthlyBudget && (
              <p className="text-sm text-red-500">
                {errors.monthlyBudget.message}
              </p>
            )}
            <p className="text-sm text-gray-500">
              한 달에 사용할 수 있는 전체 예산을 입력하세요
            </p>
          </div>

          {/* 저축 목표 */}
          <div className="space-y-2">
            <Label htmlFor="savingGoal" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>월 저축 목표 (선택)</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₩</span>
              <Input
                id="savingGoal"
                {...register('savingGoal')}
                onChange={handleSavingChange}
                placeholder="500,000"
                className="pl-8 text-lg"
                disabled={isLoading}
              />
            </div>
            <p className="text-sm text-gray-500">
              매월 저축하고 싶은 금액을 입력하세요
            </p>
          </div>

          {/* 미리보기 */}
          {monthlyBudget && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-blue-900">💡 설정 미리보기</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>
                  월 예산: <span className="font-medium">₩{monthlyBudget}</span>
                </div>
                {savingGoal && (
                  <div>
                    저축 목표:{' '}
                    <span className="font-medium">₩{savingGoal}</span>
                  </div>
                )}
                {savingGoal && monthlyBudget && (
                  <div className="pt-2 border-t border-blue-200">
                    저축률:{' '}
                    <span className="font-medium">
                      {(
                        (parseFloat(savingGoal.replace(/,/g, '')) /
                          parseFloat(monthlyBudget.replace(/,/g, ''))) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장하기'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
