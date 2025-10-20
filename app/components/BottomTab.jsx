'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export default function BottomTab() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  // 현재 경로에 따라 활성 탭 확인
  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-[#e0e0e0] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] w-full">
      <nav className="h-[70px] max-w-[600px] mx-auto flex justify-around items-center">
        {/* 홈 */}
        <button
          onClick={() => router.push('/')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 bg-transparent border-none cursor-pointer transition-all active:scale-95 ${
            isActive('/') ? 'text-[#2c3e50]' : 'text-[#666]'
          }`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="text-xs font-medium">Beranda</span>
        </button>

        {/* 구인등록 */}
        <button
          onClick={() => router.push('/post')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 bg-transparent border-none cursor-pointer transition-all active:scale-95 ${
            isActive('/post') ? 'text-[#2c3e50]' : 'text-[#666]'
          }`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <span className="text-xs font-medium">Lowongan</span>
        </button>

        {/* 구직등록 */}
        <button
          onClick={() => router.push('/profile')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 bg-transparent border-none cursor-pointer transition-all active:scale-95 ${
            isActive('/profile') ? 'text-[#2c3e50]' : 'text-[#666]'
          }`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span className="text-xs font-medium">Cari Kerja</span>
        </button>

        {/* 내주변 */}
        <button
          onClick={() => router.push('/nearby')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 bg-transparent border-none cursor-pointer transition-all active:scale-95 ${
            isActive('/nearby') ? 'text-[#2c3e50]' : 'text-[#666]'
          }`}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="text-xs font-medium">Sekitar</span>
        </button>

        {/* 프로필/로그인 */}
        <button
          onClick={() => router.push('/account')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 bg-transparent border-none cursor-pointer transition-all active:scale-95 ${
            isActive('/account') ? 'text-[#2c3e50]' : 'text-[#666]'
          }`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="text-xs font-medium">{user ? 'Profil' : 'Login'}</span>
        </button>
      </nav>
    </div>
  )
}
