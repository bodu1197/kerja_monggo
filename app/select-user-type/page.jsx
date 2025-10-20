'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export default function SelectUserTypePage() {
  const router = useRouter()
  const { user, userType, setUserTypeInDB } = useAuth()
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 이미 user_type이 설정되어 있으면 메인 페이지로 리다이렉트
    if (userType) {
      router.push('/')
    }
  }, [userType, router])

  const handleSelectType = async () => {
    if (!selectedType) {
      setError('회원 유형을 선택해주세요.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await setUserTypeInDB(selectedType)

    if (error) {
      setError('회원 유형 설정에 실패했습니다. 다시 시도해주세요.')
      setLoading(false)
    } else {
      // 성공 시 메인 페이지로 이동
      router.push('/')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">로그인이 필요합니다.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-[#2c3e50] text-white rounded-md hover:bg-[#34495e]"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          회원 유형을 선택해주세요
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          가입하신 유형에 따라 이용 가능한 서비스가 달라집니다
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 구인자 카드 */}
            <button
              onClick={() => setSelectedType('employer')}
              className={`relative p-8 border-2 rounded-xl transition-all ${
                selectedType === 'employer'
                  ? 'border-[#2c3e50] bg-[#2c3e50]/5'
                  : 'border-gray-200 hover:border-[#2c3e50]/50'
              }`}
            >
              {selectedType === 'employer' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-[#2c3e50]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">구인자</h3>
                <p className="text-sm text-gray-600 mb-4">
                  직원을 채용하고 싶어요
                </p>
                <ul className="text-sm text-left space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>구인 공고 등록 가능</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>구직자 프로필 열람</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>지원자 관리</span>
                  </li>
                </ul>
              </div>
            </button>

            {/* 구직자 카드 */}
            <button
              onClick={() => setSelectedType('job_seeker')}
              className={`relative p-8 border-2 rounded-xl transition-all ${
                selectedType === 'job_seeker'
                  ? 'border-[#2c3e50] bg-[#2c3e50]/5'
                  : 'border-gray-200 hover:border-[#2c3e50]/50'
              }`}
            >
              {selectedType === 'job_seeker' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-[#2c3e50]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">구직자</h3>
                <p className="text-sm text-gray-600 mb-4">
                  일자리를 찾고 있어요
                </p>
                <ul className="text-sm text-left space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>구직 프로필 등록 가능</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>구인 공고 검색 및 지원</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>이력서 관리</span>
                  </li>
                </ul>
              </div>
            </button>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSelectType}
              disabled={!selectedType || loading}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#2c3e50] hover:bg-[#34495e] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : '선택 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
