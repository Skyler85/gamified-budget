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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Calculator, Calendar, Tag, Loader2 } from 'lucide-react'
import { Category, Transaction } from '../../types'

const transactionSchema = z.object({
  amount: z.string().min(1, '금액을 입력해주세요'),
  categoryId: z.string().min(1, '카테고리를 선택해주세요'),
  description: z.string().optional(),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, '날짜를 선택해주세요'),
})

type TransactionForm = z.infer<typeof transactionSchema>

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  editingTransaction?: Transaction | null
  categories: Category[]
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSaved,
  editingTransaction,
  categories,
}: TransactionModalProps) {
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    'expense'
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const watchedType = watch('type')

  // 편집 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (editingTransaction) {
      setValue('amount', editingTransaction.amount.toString())
      setValue('categoryId', editingTransaction.categories.id)
      setValue('description', editingTransaction.description || '')
      setValue('type', editingTransaction.type)
      setValue('date', editingTransaction.date)
      setTransactionType(editingTransaction.type)
    } else {
      // 새 거래일 때 기본값 설정
      reset({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        categoryId: '',
        description: '',
      })
      setTransactionType('expense')
    }
  }, [editingTransaction, setValue, reset])

  // 타입 변경 시 카테고리 초기화
  useEffect(() => {
    if (watchedType !== transactionType) {
      setTransactionType(watchedType)
      setValue('categoryId', '')
    }
  }, [watchedType, transactionType, setValue])

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setValue('amount', formatted)
  }

  const calculateExp = (amount: number) => {
    return Math.max(5, Math.floor(amount / 1000))
  }

  const onSubmit = async (data: TransactionForm) => {
    if (!profile || typeof profile !== 'object' || !('id' in profile)) return

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const numericAmount = parseFloat(data.amount.replace(/,/g, ''))
      const expGained = calculateExp(numericAmount)

      const transactionData = {
        user_id: profile.id,
        category_id: data.categoryId,
        amount: numericAmount,
        description: data.description || null,
        type: data.type,
        date: data.date,
        exp_gained: expGained,
      }

      if (editingTransaction) {
        // 거래 수정
        const { error: updateError } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id)
          .eq('user_id', profile.id)

        if (updateError) {
          setError('거래 수정에 실패했습니다.')
          console.error('거래 수정 오류:', updateError)
          return
        }
      } else {
        // 새 거래 추가
        const { error: insertError } = await supabase
          .from('transactions')
          .insert([transactionData])

        if (insertError) {
          setError('거래 추가에 실패했습니다.')
          console.error('거래 추가 오류:', insertError)
          return
        }
      }

      onSaved()
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      console.error('거래 처리 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 현재 타입에 맞는 카테고리 필터링
  const filteredCategories = categories.filter(
    cat => cat.type === transactionType
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? '거래 수정' : '새 거래 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 거래 타입 선택 */}
          <div className="space-y-2">
            <Label>거래 유형</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={transactionType === 'expense' ? 'default' : 'outline'}
                onClick={() => {
                  setValue('type', 'expense')
                  setTransactionType('expense')
                }}
                className="flex-1"
                disabled={isLoading}
              >
                💸 지출
              </Button>
              <Button
                type="button"
                variant={transactionType === 'income' ? 'default' : 'outline'}
                onClick={() => {
                  setValue('type', 'income')
                  setTransactionType('income')
                }}
                className="flex-1"
                disabled={isLoading}
              >
                💰 수입
              </Button>
            </div>
          </div>

          {/* 금액 입력 */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>금액</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₩</span>
              <Input
                id="amount"
                {...register('amount')}
                onChange={handleAmountChange}
                placeholder="10,000"
                className="pl-8 text-lg"
                disabled={isLoading}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>카테고리</span>
            </Label>
            <Select
              value={watch('categoryId') || ''}
              onValueChange={value => setValue('categoryId', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* 날짜 선택 */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>날짜</span>
            </Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* 설명 입력 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="거래에 대한 간단한 설명을 입력하세요"
              className="resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* 예상 보상 (새 거래일 때만) */}
          {!editingTransaction && watch('amount') && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">
                🎁 예상 보상
              </h4>
              <div className="flex space-x-3 text-xs text-blue-700">
                <span>
                  +
                  {calculateExp(
                    parseFloat(watch('amount')?.replace(/,/g, '') || '0')
                  )}{' '}
                  XP
                </span>
                <span>+10 코인</span>
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
                  {editingTransaction ? '수정 중...' : '추가 중...'}
                </>
              ) : editingTransaction ? (
                '수정하기'
              ) : (
                '추가하기'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
