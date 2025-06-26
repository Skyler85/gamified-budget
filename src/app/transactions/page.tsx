'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import TransactionList from '@/components/transactions/TransactionList'
import TransactionModal from '@/components/transactions/TransactionModal'
import TransactionStats from '@/components/transactions/TransactionStats'
import { PlusCircle, Search, Filter, Calendar } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  description: string | null
  type: 'income' | 'expense'
  date: string
  created_at: string
  categories: {
    id: string
    name: string
    color: string
    icon: string
  }
}

interface Category {
  id: string
  name: string
  color: string
  type: 'income' | 'expense'
}

export default function TransactionsPage() {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('')

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 20

  // 데이터 로드
  useEffect(() => {
    if (profile) {
      loadTransactions()
      loadCategories()
    }
  }, [
    profile,
    currentPage,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedMonth,
  ])

  const loadCategories = async () => {
    if (!profile) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', profile.id)
      .order('name')

    if (error) {
      console.error('카테고리 로드 오류:', error)
      return
    }

    setCategories(data || [])
  }

  const loadTransactions = async () => {
    if (!profile) return

    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('transactions')
      .select(
        `
        *,
        categories:category_id (
          id,
          name,
          color,
          icon
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', profile.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    // 검색 필터
    if (searchTerm) {
      query = query.ilike('description', `%${searchTerm}%`)
    }

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory)
    }

    // 타입 필터
    if (selectedType !== 'all') {
      query = query.eq('type', selectedType)
    }

    // 월의 마지막 날을 구하는 함수
    const getLastDayOfMonth = (year: string, month: string) => {
      return new Date(year, month, 0).getDate()
    }

    // 월별 필터
    if (selectedMonth) {
      const year = selectedMonth.split('-')[0]
      const month = selectedMonth.split('-')[1]
      const lastDayOfCurrentMonth = getLastDayOfMonth(year, month)
      const startDate = `${year}-${month}-01`
      const endDate = `${year}-${month}-${lastDayOfCurrentMonth.toString().padStart(2, '0')}`
      query = query.gte('date', startDate).lte('date', endDate)
    }

    // 페이지네이션
    const from = (currentPage - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('거래 내역 로드 오류:', error)
      setLoading(false)
      return
    }

    setTransactions(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }

  const handleTransactionSaved = () => {
    loadTransactions()
    setShowAddModal(false)
    setEditingTransaction(null)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowAddModal(true)
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('이 거래를 삭제하시겠습니까?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', profile?.id)

    if (error) {
      console.error('거래 삭제 오류:', error)
      alert('거래 삭제에 실패했습니다.')
      return
    }

    loadTransactions()
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedType('all')
    setSelectedMonth('')
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // 현재 월 기본값
  const currentMonth = new Date().toISOString().slice(0, 7)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">거래 내역</h1>
          <p className="text-gray-600">모든 수입과 지출을 관리하세요</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>거래 추가</span>
        </Button>
      </div>

      {/* 통계 요약 */}
      <TransactionStats
        transactions={transactions}
        selectedMonth={selectedMonth || currentMonth}
      />

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>필터 및 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="거래 내용 검색"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 카테고리 필터 */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                {categories.map(category => (
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

            {/* 타입 필터 */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">수입/지출</SelectItem>
                <SelectItem value="income">💰 수입</SelectItem>
                <SelectItem value="expense">💸 지출</SelectItem>
              </SelectContent>
            </Select>

            {/* 월별 필터 */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 필터 리셋 */}
            <Button variant="outline" onClick={resetFilters}>
              필터 초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 거래 목록 */}
      <TransactionList
        transactions={transactions}
        loading={loading}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            이전
          </Button>

          <span className="px-4 py-2 text-sm text-gray-600">
            {currentPage} / {totalPages} 페이지 (총 {totalCount}개)
          </span>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* 거래 추가/수정 모달 */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingTransaction(null)
        }}
        onSaved={handleTransactionSaved}
        editingTransaction={editingTransaction}
        categories={categories}
      />
    </div>
  )
}
