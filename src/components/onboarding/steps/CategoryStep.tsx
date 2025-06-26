'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/lib/onboarding-context'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Tag, Plus, X } from 'lucide-react'

interface Category {
  id?: string
  name: string
  color: string
  icon: string
  type: 'income' | 'expense'
  is_default: boolean
}

export default function CategoryStep() {
  const { nextStep, prevStep, currentStep, totalSteps } = useOnboarding()
  const { profile } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 기본 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      if (!profile) return

      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', profile.id)
        .order('type', { ascending: false })

      if (data) {
        setCategories(data)
      }
    }

    loadCategories()
  }, [profile])

  // 추천 카테고리 목록
  const recommendedCategories = [
    {
      name: '카페/음료',
      color: '#8B4513',
      icon: 'Coffee',
      type: 'expense' as const,
    },
    {
      name: '온라인쇼핑',
      color: '#FF6B6B',
      icon: 'ShoppingCart',
      type: 'expense' as const,
    },
    {
      name: '헬스/운동',
      color: '#4ECDC4',
      icon: 'Dumbbell',
      type: 'expense' as const,
    },
    {
      name: '문화생활',
      color: '#45B7D1',
      icon: 'Film',
      type: 'expense' as const,
    },
    {
      name: '반려동물',
      color: '#FFA07A',
      icon: 'Heart',
      type: 'expense' as const,
    },
    {
      name: '부업수입',
      color: '#98D8C8',
      icon: 'Briefcase',
      type: 'income' as const,
    },
    {
      name: '투자수익',
      color: '#50C878',
      icon: 'TrendingUp',
      type: 'income' as const,
    },
  ]

  const addRecommendedCategory = async (
    recommended: (typeof recommendedCategories)[0]
  ) => {
    if (!profile) return

    const newCategory: Category = {
      name: recommended.name,
      color: recommended.color,
      icon: recommended.icon,
      type: recommended.type,
      is_default: false,
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            ...newCategory,
            user_id: profile.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('카테고리 추가 오류:', error)
        return
      }

      setCategories(prev => [...prev, data])
    } catch (error) {
      console.error('카테고리 추가 중 오류:', error)
    }
  }

  const removeCategory = async (categoryId: string) => {
    if (!profile) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', profile.id)

      if (error) {
        console.error('카테고리 삭제 오류:', error)
        return
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    } catch (error) {
      console.error('카테고리 삭제 중 오류:', error)
    }
  }

  const handleNext = () => {
    nextStep()
  }

  const expenseCategories = categories.filter(cat => cat.type === 'expense')
  const incomeCategories = categories.filter(cat => cat.type === 'income')

  // 이미 추가된 카테고리는 추천에서 제외
  const availableRecommended = recommendedCategories.filter(
    rec => !categories.some(cat => cat.name === rec.name)
  )

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
        <Tag className="h-12 w-12 text-purple-600 mx-auto" />
        <h2 className="text-2xl font-bold">카테고리를 추가해보세요</h2>
        <p className="text-gray-600">
          나만의 카테고리를 추가하면 더 세세하게 가계부를 관리할 수 있어요
        </p>
      </div>

      {/* 현재 카테고리 */}
      <div className="space-y-4">
        {/* 지출 카테고리 */}
        <div>
          <h3 className="font-semibold text-red-600 mb-2 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            지출 카테고리 ({expenseCategories.length}개)
          </h3>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map(category => (
              <div
                key={category.id}
                className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: category.color + '20',
                  color: category.color,
                }}
              >
                <span>{category.name}</span>
                {!category.is_default && (
                  <button
                    onClick={() => removeCategory(category.id!)}
                    className="ml-1 hover:bg-white hover:bg-opacity-50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 수입 카테고리 */}
        <div>
          <h3 className="font-semibold text-green-600 mb-2 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            수입 카테고리 ({incomeCategories.length}개)
          </h3>
          <div className="flex flex-wrap gap-2">
            {incomeCategories.map(category => (
              <div
                key={category.id}
                className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: category.color + '20',
                  color: category.color,
                }}
              >
                <span>{category.name}</span>
                {!category.is_default && (
                  <button
                    onClick={() => removeCategory(category.id!)}
                    className="ml-1 hover:bg-white hover:bg-opacity-50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 추천 카테고리 */}
      {availableRecommended.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">추천 카테고리</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableRecommended.map((recommended, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => addRecommendedCategory(recommended)}
              >
                <Plus className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{recommended.name}</div>
                  <div className="text-xs text-gray-500">
                    {recommended.type === 'income' ? '수입' : '지출'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-900 mb-2">
          💡 카테고리 관리 팁
        </h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• 너무 세분화하지 말고 자주 쓰는 카테고리 위주로 추가하세요</li>
          <li>• 나중에 대시보드에서 언제든 카테고리를 추가/삭제할 수 있어요</li>
          <li>• 기본 카테고리는 삭제할 수 없습니다</li>
        </ul>
      </div>

      {/* 액션 버튼 */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          이전
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          disabled={isLoading}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
