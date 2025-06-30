import { useAuth } from './auth-context'

export const useAuthSafe = () => {
  const { profile, user, ...rest } = useAuth()

  if (!profile || !user) {
    throw new Error('로그인된 사용자만 접근할 수 있습니다.')
  }

  return { profile, user, ...rest }
}
