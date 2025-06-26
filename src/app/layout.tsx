import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { OnboardingProvider } from '@/lib/onboarding-context'
import OnboardingModal from '@/components/onboarding/OnboardingModal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '게임화 가계부',
  description: '재미있게 돈을 관리하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <OnboardingProvider>
            {children}
            <OnboardingModal />
          </OnboardingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
