'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOnboarding } from '@/lib/onboarding-context'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { PlusCircle, Coins, Star } from 'lucide-react'
import { Category } from '@/types'

export default function FirstTransactionStep() {
  const { nextStep, prevStep, currentStep, totalSteps } = useOnboarding()
  const { profile } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [description, setDescription] = useState('')
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    'expense'
  )
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      if (!profile) return

      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', profile.id)
        .eq('type', transactionType)
        .order('name')

      if (data) {
        setCategories(data)
        if (data.length > 0) {
          setSelectedCategory(data[0].id)
        }
      }
    }

    loadCategories()
  }, [profile, transactionType])

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setAmount(formatted)
  }

  const calculateExp = (amount: number) => {
    // 금액에 따른 경험치 계산 (1000원당 1 exp, 최소 5 exp)
    return Math.max(5, Math.floor(amount / 1000))
  }

  const handleSubmit = async () => {
    if (!amount || !selectedCategory || !profile) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const numericAmount = parseFloat(amount.replace(/,/g, ''))
      const expGained = calculateExp(numericAmount)

      // 거래 추가
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: profile.id,
            category_id: selectedCategory,
            amount: numericAmount,
            description: description || null,
            type: transactionType,
            date: new Date().toISOString().split('T')[0],
            exp_gained: expGained,
          },
        ])

      if (transactionError) {
        console.error('거래 추가 오류:', transactionError)
        alert('거래 추가에 실패했습니다. 다시 시도해주세요.')
        return
      }

      console.log('거래 추가 성공!')

      // 성공 애니메이션 표시
      setShowSuccess(true)

      // 3초 후 다음 단계로 (시간을 늘림)
      setTimeout(() => {
        console.log('다음 단계로 이동 중...')
        nextStep()
      }, 3000)
    } catch (error) {
      console.error('거래 추가 중 예상치 못한 오류:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="space-y-6 p-6 text-center">
        <div className="space-y-4">
          <div className="relative">
            <div className="text-6xl mb-4">🎉</div>
            <Star className="absolute top-0 right-20 h-6 w-6 text-yellow-500 animate-bounce" />
            <Star className="absolute top-12 left-16 h-4 w-4 text-blue-500 animate-bounce delay-300" />
          </div>

          <h2 className="text-2xl font-bold text-green-600">첫 거래 완료!</h2>
          <p className="text-gray-600">
            축하합니다! 첫 거래를 성공적으로 입력했습니다.
            <br />
            경험치와 코인을 획득했어요!
          </p>

          <div className="flex justify-center space-x-4 my-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-lg">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">
                +{calculateExp(parseFloat(amount.replace(/,/g, '')))} XP
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 rounded-lg">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">+10 코인</span>
            </div>
          </div>

          {/* 수동 진행 버튼 추가 */}
          <Button
            onClick={nextStep}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            다음 단계로 계속하기 🚀
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* 진행률 표시 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 text-center">
        {currentStep} / {totalSteps}
      </p>

      {/* 제목 */}
      <div className="text-center space-y-2">
        <PlusCircle className="h-12 w-12 text-green-600 mx-auto" />
        <h2 className="text-2xl font-bold">첫 거래를 입력해보세요</h2>
        <p className="text-gray-600">
          간단한 거래 하나를 입력해서 가계부 사용법을 익혀보세요
        </p>
      </div>

      {/* 거래 타입 선택 */}
      <div className="space-y-3">
        <Label>거래 유형</Label>
        <div className="flex space-x-2">
          <Button
            variant={transactionType === 'expense' ? 'default' : 'outline'}
            onClick={() => setTransactionType('expense')}
            className="flex-1"
          >
            💸 지출
          </Button>
          <Button
            variant={transactionType === 'income' ? 'default' : 'outline'}
            onClick={() => setTransactionType('income')}
            className="flex-1"
          >
            💰 수입
          </Button>
        </div>
      </div>

      {/* 금액 입력 */}
      <div className="space-y-2">
        <Label htmlFor="amount">금액</Label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500">₩</span>
          <Input
            id="amount"
            type="text"
            placeholder="10,000"
            value={amount}
            onChange={handleAmountChange}
            className="pl-8 text-lg"
          />
        </div>
      </div>

      {/* 카테고리 선택 */}
      <div className="space-y-2">
        <Label>카테고리</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="카테고리를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 설명 입력 */}
      <div className="space-y-2">
        <Label htmlFor="description">설명 (선택)</Label>
        <Input
          id="description"
          type="text"
          placeholder="예: 점심 식사, 카페 음료"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {/* 예상 보상 */}
      {amount && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">🎁 예상 보상</h4>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-blue-700">
              <Star className="h-4 w-4" />
              <span>
                +{calculateExp(parseFloat(amount.replace(/,/g, '') || '0'))}{' '}
                경험치
              </span>
            </div>
            <div className="flex items-center space-x-1 text-yellow-700">
              <Coins className="h-4 w-4" />
              <span>+10 코인</span>
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          이전
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={!amount || !selectedCategory || isLoading}
        >
          {isLoading ? '추가 중...' : '거래 추가하기'}
        </Button>
      </div>
    </div>
  )
}
