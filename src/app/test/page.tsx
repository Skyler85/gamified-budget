import TestConnection from '@/components/TestConnection'

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">개발 환경 테스트</h1>
      <TestConnection />
    </div>
  )
}
