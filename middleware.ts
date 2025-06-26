import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 인증이 필요한 페이지들
  const protectedPaths = ['/dashboard', '/transactions', '/profile']
  const authPaths = ['/login', '/signup']

  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  )
  const isAuthPath = authPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  )

  // 인증되지 않은 사용자가 보호된 페이지에 접근하려 할 때
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 인증된 사용자가 인증 페이지에 접근하려 할 때
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
