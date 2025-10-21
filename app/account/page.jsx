'use client'

import Header from '../components/Header'
import BottomTab from '../components/BottomTab'

export default function AccountPage() {
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
              계정 페이지
            </h2>
            <p className="text-gray-600 mb-8">
              로그인 기능은 현재 준비 중입니다
            </p>
          </div>
        </div>
      </main>
      <BottomTab />
    </>
  )
}
