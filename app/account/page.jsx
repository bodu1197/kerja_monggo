'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import BottomTab from '../components/BottomTab'

export default function AccountPage() {
  const router = useRouter()
  const { user, userType, loading, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#2c3e50] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </main>
        <BottomTab />
      </>
    )
  }

  // 로그인 안 되어 있을 때
  if (!user) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-gray-50 p-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                로그인이 필요합니다
              </h2>
              <p className="text-gray-600 mb-8">
                회원 서비스를 이용하시려면 로그인해주세요
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3 px-4 bg-[#2c3e50] text-white rounded-lg font-semibold hover:bg-[#34495e] transition-colors"
                >
                  로그인
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full py-3 px-4 bg-white text-[#2c3e50] border-2 border-[#2c3e50] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  회원가입
                </button>
              </div>
            </div>
          </div>
        </main>
        <BottomTab />
      </>
    )
  }

  // 로그인 되어 있을 때
  const getUserTypeLabel = () => {
    if (userType === 'employer') return '구인자'
    if (userType === 'job_seeker') return '구직자'
    return '미설정'
  }

  const getUserTypeBadgeColor = () => {
    if (userType === 'employer') return 'bg-blue-100 text-blue-800'
    if (userType === 'job_seeker') return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-[#2c3e50] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{user.email}</h2>
                <div className="mt-1">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getUserTypeBadgeColor()}`}>
                    {getUserTypeLabel()}
                  </span>
                </div>
              </div>
            </div>

            {/* 회원 유형 미설정 시 안내 */}
            {!userType && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-3">
                  회원 유형을 선택하지 않으셨습니다. 회원 유형을 선택하면 더 많은 기능을 이용할 수 있습니다.
                </p>
                <button
                  onClick={() => router.push('/select-user-type')}
                  className="w-full py-2 px-4 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  회원 유형 선택하기
                </button>
              </div>
            )}

            {/* 메뉴 목록 */}
            <div className="space-y-2">
              <button
                onClick={() => router.push('/my-posts')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-700 font-medium">내 게시글</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {userType === 'job_seeker' && (
                <button
                  onClick={() => router.push('/my-applications')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-gray-700 font-medium">지원 내역</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700 font-medium">설정</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </main>
      <BottomTab />
    </>
  )
}
