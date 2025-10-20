'use client'

import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  return (
    <header className="w-full h-[60px] flex items-center justify-center px-5 border-b border-gray-200">
      <div className="text-2xl font-bold text-black cursor-pointer" onClick={() => router.push('/')}>
        LOGO
      </div>
    </header>
  )
}
