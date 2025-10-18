'use client'

import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  return (
    <header className="w-full h-[60px] flex items-center justify-between px-5 border-b border-gray-200">
      <div className="text-2xl font-bold text-black">LOGO</div>
      <button
        onClick={() => router.push('/post')}
        className="px-6 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
      >
        등록하기
      </button>
    </header>
  )
}
