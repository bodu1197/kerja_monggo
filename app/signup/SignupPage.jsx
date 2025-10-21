'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: 회원유형 선택, 2: 회원가입 폼
  const [userType, setUserType] = useState('') // 'employer' or 'job_seeker'
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: ''
  })

  // 회원 유형 선택
  const handleUserTypeSelect = (type) => {
    setUserType(type)
    setStep(2)
  }

  // 회원가입 처리
  const handleSignup = async (e) => {
    e.preventDefault()

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    // 비밀번호 최소 길이 확인
    if (formData.password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Supabase Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: userType
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        alert('회원가입 중 오류가 발생했습니다: ' + authError.message)
        return
      }

      // 2. users 테이블에 user_type 저장 (트리거로 자동 생성되지만 user_type 업데이트)
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .update({ user_type: userType })
          .eq('id', authData.user.id)

        if (userError) {
          console.error('User update error:', userError)
        }
      }

      alert('회원가입이 완료되었습니다! 이메일을 확인해주세요.')
      router.push('/login')

    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 뒤로가기
  const handleBack = () => {
    setStep(1)
    setUserType('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">

        {/* Step 1: 회원 유형 선택 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">
              회원가입
            </h1>
            <p className="text-center text-slate-600 mb-8">
              가입 유형을 선택해주세요
            </p>

            <div className="space-y-4">
              {/* 구인자 (기업회원) */}
              <button
                onClick={() => handleUserTypeSelect('employer')}
                className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-slate-700 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-700 transition-all">
                    <svg className="w-8 h-8 text-slate-600 group-hover:text-white transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      기업회원 (구인자)
                    </h3>
                    <p className="text-sm text-slate-600">
                      직원을 채용하고 싶어요
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* 구직자 */}
              <button
                onClick={() => handleUserTypeSelect('job_seeker')}
                className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-slate-700 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-700 transition-all">
                    <svg className="w-8 h-8 text-slate-600 group-hover:text-white transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      구직자
                    </h3>
                    <p className="text-sm text-slate-600">
                      일자리를 찾고 싶어요
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-slate-700 font-semibold hover:underline"
                >
                  로그인
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: 회원가입 폼 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              뒤로가기
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {userType === 'employer' ? '기업회원 가입' : '구직자 가입'}
              </h1>
              <p className="text-slate-600">
                {userType === 'employer' ? '채용 공고를 등록하고 인재를 찾으세요' : '프로필을 등록하고 일자리를 찾으세요'}
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                  placeholder="최소 6자 이상"
                  required
                  minLength={6}
                />
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-slate-700 mb-2">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
              </div>

              {/* 가입 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '가입 중...' : '회원가입 완료'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-slate-700 font-semibold hover:underline"
                >
                  로그인
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
