'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient()

        // URL에서 code 파라미터 확인
        const { searchParams } = new URL(window.location.href)
        const code = searchParams.get('code')

        if (code) {
          // code를 session으로 교환
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

          if (sessionError) {
            console.error('Session exchange error:', sessionError)
            setError('인증 처리 중 오류가 발생했습니다.')
            setTimeout(() => router.push('/login'), 2000)
            return
          }

          if (sessionData?.session?.user) {
            const userId = sessionData.session.user.id

            // users 테이블에서 user_type 확인
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('user_type')
              .eq('id', userId)
              .single()

            if (userError && userError.code !== 'PGRST116') {
              // PGRST116은 "no rows returned" 에러 (사용자가 아직 없는 경우)
              console.error('User fetch error:', userError)
            }

            // user_type이 없으면 회원 타입 선택 페이지로
            if (!userData || !userData.user_type) {
              router.replace('/select-user-type')
            } else {
              // user_type이 있으면 메인 페이지로
              router.replace('/')
            }
          }
        } else {
          // code가 없으면 에러
          setError('잘못된 인증 요청입니다.')
          setTimeout(() => router.push('/login'), 2000)
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError('인증 처리 중 오류가 발생했습니다.')
        setTimeout(() => router.push('/login'), 2000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {error ? (
          <>
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold">{error}</p>
            </div>
            <p className="text-sm text-gray-600">잠시 후 로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2c3e50] mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-900 mb-2">로그인 처리 중...</p>
            <p className="text-sm text-gray-600">잠시만 기다려주세요.</p>
          </>
        )}
      </div>
    </div>
  )
}
