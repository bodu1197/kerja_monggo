'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const supabase = createClient()

      // 로그인 상태 확인
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        setUser(authUser)

        // users 테이블에서 추가 정보 가져오기
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userData) {
          setUserInfo(userData)
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserInfo(null)
    alert('로그아웃되었습니다.')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 상태
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              계정
            </h2>
            <p className="text-gray-600 mb-8">
              로그인하여 서비스를 이용하세요
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
              >
                로그인
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="w-full px-6 py-3 border-2 border-slate-700 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 로그인된 상태
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 프로필 헤더 */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">
                {user.email}
              </h1>
              {userInfo?.user_type && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  userInfo.user_type === 'employer'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {userInfo.user_type === 'employer' ? '기업회원 (구인자)' : '구직자'}
                </span>
              )}
            </div>
          </div>

          {/* 계정 정보 */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-bold text-slate-700 mb-4">계정 정보</h2>

            <div className="flex justify-between py-3 border-b">
              <span className="text-slate-600">이메일</span>
              <span className="text-slate-900 font-medium">{user.email}</span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-slate-600">회원 유형</span>
              <span className="text-slate-900 font-medium">
                {userInfo?.user_type === 'employer' ? '기업회원 (구인자)' : '구직자'}
              </span>
            </div>

            <div className="flex justify-between py-3 border-b">
              <span className="text-slate-600">가입일</span>
              <span className="text-slate-900 font-medium">
                {new Date(userInfo?.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/my-posts')}
              className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
            >
              내 글 관리
            </button>

            {userInfo?.user_type === 'employer' && (
              <button
                onClick={() => router.push('/post')}
                className="w-full px-6 py-3 border-2 border-slate-700 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
              >
                채용 공고 등록
              </button>
            )}

            {userInfo?.user_type === 'job_seeker' && (
              <button
                onClick={() => router.push('/profile')}
                className="w-full px-6 py-3 border-2 border-slate-700 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
              >
                구직 프로필 등록
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-all"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
