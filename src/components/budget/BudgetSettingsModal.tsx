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
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import {
  Target,
  DollarSign,
  TrendingUp,
  Loader2,
  PieChart,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react'

const budgetSchema = z.object({
  monthlyBudget: z.string().min(1, '월 예산을 입력해주세요'),
  savingGoal: z.string().optional(),
})

type BudgetForm = z.infer<typeof budgetSchema>

interface CategoryBudget {
  categoryId: string
  categoryName: string
  categoryColor: string
  amount: number
  percentage: number
}

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
  const [activeTab, setActiveTab] = useState<'total' | 'category'>('total')
  const [categories, setCategories] = useState<unknown /* TODO: replace 'any' */[]>([])
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([])
  const [allocatedPercentage, setAllocatedPercentage] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
  })

  const monthlyBudget = watch('monthlyBudget')
  const monthlyBudgetNumber = monthlyBudget
    ? parseFloat(monthlyBudget.replace(/,/g, ''))
    : 0

  // 카테고리 및 현재 예산 로드
  useEffect(() => {
    if (profile && isOpen) {
      loadData()
    }
  }, [profile, isOpen])

  const loadData = async () => {
    if (!profile) return

    const supabase = createClient()

    // 현재 프로필 값 설정
    setValue('monthlyBudget', profile.monthly_budget?.toString() || '')
    setValue('savingGoal', profile.saving_goal?.toString() || '')

    // 지출 카테고리 로드
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', profile.id)
      .eq('type', 'expense')
      .order('name')

    setCategories(categoriesData || [])

    // 카테고리별 예산 로드
    const { data: budgetsData } = await supabase
      .from('category_budgets')
      .select('*')
      .eq('user_id', profile.id)
      .eq('period', 'monthly')

    if (budgetsData && categoriesData) {
      const budgets = categoriesData.map(cat => {
        const budget = budgetsData.find(b => b.category_id === cat.id)
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          categoryColor: cat.color,
          amount: budget?.amount || 0,
          percentage: 0,
        }
      })
      setCategoryBudgets(budgets)
      updatePercentages(budgets, monthlyBudgetNumber)
    }
  }

  const updatePercentages = (
    budgets: CategoryBudget[],
    totalBudget: number
  ) => {
    if (totalBudget === 0) {
      setCategoryBudgets(budgets.map(b => ({ ...b, percentage: 0 })))
      setAllocatedPercentage(0)
      return
    }

    const updatedBudgets = budgets.map(b => ({
      ...b,
      percentage: (b.amount / totalBudget) * 100,
    }))

    const totalPercentage = updatedBudgets.reduce(
      (sum, b) => sum + b.percentage,
      0
    )

    setCategoryBudgets(updatedBudgets)
    setAllocatedPercentage(totalPercentage)
  }

  const handleCategoryBudgetChange = (categoryId: string, value: string) => {
    const amount = parseFloat(value.replace(/,/g, '')) || 0
    const updatedBudgets = categoryBudgets.map(b =>
      b.categoryId === categoryId ? { ...b, amount } : b
    )
    updatePercentages(updatedBudgets, monthlyBudgetNumber)
  }

  const handlePercentageChange = (categoryId: string, percentage: number) => {
    const amount = (monthlyBudgetNumber * percentage) / 100
    const updatedBudgets = categoryBudgets.map(b =>
      b.categoryId === categoryId ? { ...b, amount, percentage } : b
    )
    updatePercentages(updatedBudgets, monthlyBudgetNumber)
  }

  const formatCurrencyInput = (value: string) => {
    const number = value.replace(/[^\d]/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value)
    setValue('monthlyBudget', formatted)

    // 월 예산이 변경되면 카테고리 예산 재계산
    const newBudget = parseFloat(formatted.replace(/,/g, '')) || 0
    updatePercentages(categoryBudgets, newBudget)
  }

  const handleSavingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value)
    setValue('savingGoal', formatted)
  }

  const onSubmit = async (data: BudgetForm) => {
    if (!profile) return

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // 전체 예산 업데이트
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

      // 카테고리별 예산 저장
      if (activeTab === 'category') {
        for (const budget of categoryBudgets) {
          if (budget.amount > 0) {
            await supabase.from('category_budgets').upsert({
              user_id: profile.id,
              category_id: budget.categoryId,
              amount: budget.amount,
              period: 'monthly',
              updated_at: new Date().toISOString(),
            })
          } else {
            // 금액이 0이면 삭제
            await supabase
              .from('category_budgets')
              .delete()
              .eq('user_id', profile.id)
              .eq('category_id', budget.categoryId)
              .eq('period', 'monthly')
          }
        }
      }

      await refreshProfile()
      onSaved()
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('예산 설정 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const remainingBudget =
    monthlyBudgetNumber - categoryBudgets.reduce((sum, b) => sum + b.amount, 0)
  const savingGoal = watch('savingGoal')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* 탭 선택 */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('total')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'total'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              전체 예산
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('category')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'category'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              카테고리별 예산
            </button>
          </div>

          {activeTab === 'total' ? (
            <>
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
                <Label
                  htmlFor="savingGoal"
                  className="flex items-center space-x-2"
                >
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
                  <h4 className="font-semibold text-blue-900">
                    💡 설정 미리보기
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>
                      월 예산:{' '}
                      <span className="font-medium">₩{monthlyBudget}</span>
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
            </>
          ) : (
            <>
              {/* 카테고리별 예산 설정 */}
              <div className="space-y-4">
                {/* 전체 예산 표시 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      전체 월 예산
                    </span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(monthlyBudgetNumber)}
                    </span>
                  </div>
                </div>

                {/* 할당 진행률 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">예산 할당률</span>
                    <span
                      className={`font-medium ${
                        allocatedPercentage > 100
                          ? 'text-red-600'
                          : allocatedPercentage === 100
                            ? 'text-green-600'
                            : 'text-blue-600'
                      }`}
                    >
                      {allocatedPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(allocatedPercentage, 100)}
                    className="h-2"
                  />
                  {allocatedPercentage > 100 && (
                    <Alert variant="destructive" className="py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        카테고리 예산 합계가 전체 예산을 초과했습니다!
                      </AlertDescription>
                    </Alert>
                  )}
                  {remainingBudget > 0 && (
                    <p className="text-sm text-gray-600">
                      미할당 예산: {formatCurrency(remainingBudget)}
                    </p>
                  )}
                </div>

                {/* 카테고리별 예산 입력 */}
                <div className="space-y-3">
                  {categoryBudgets.map(budget => (
                    <div key={budget.categoryId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: budget.categoryColor }}
                          />
                          <span>{budget.categoryName}</span>
                        </Label>
                        <span className="text-sm text-gray-500">
                          {budget.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-gray-500 text-sm">
                            ₩
                          </span>
                          <Input
                            value={formatCurrencyInput(
                              budget.amount.toString()
                            )}
                            onChange={e =>
                              handleCategoryBudgetChange(
                                budget.categoryId,
                                e.target.value
                              )
                            }
                            placeholder="0"
                            className="pl-8"
                            disabled={isLoading}
                          />
                        </div>
                        <Input
                          type="number"
                          value={budget.percentage.toFixed(1)}
                          onChange={e =>
                            handlePercentageChange(
                              budget.categoryId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20"
                          placeholder="%"
                          disabled={isLoading || monthlyBudgetNumber === 0}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 빠른 배분 버튼 */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // 균등 배분
                      const equalAmount =
                        monthlyBudgetNumber / categoryBudgets.length
                      const equalBudgets = categoryBudgets.map(b => ({
                        ...b,
                        amount: equalAmount,
                        percentage: 100 / categoryBudgets.length,
                      }))
                      setCategoryBudgets(equalBudgets)
                      setAllocatedPercentage(100)
                    }}
                    className="text-xs"
                  >
                    균등 배분
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // 초기화
                      const resetBudgets = categoryBudgets.map(b => ({
                        ...b,
                        amount: 0,
                        percentage: 0,
                      }))
                      setCategoryBudgets(resetBudgets)
                      setAllocatedPercentage(0)
                    }}
                    className="text-xs"
                  >
                    초기화
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* 액션 버튼 */}
          <div className="flex space-x-3 pt-4 border-t">
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
