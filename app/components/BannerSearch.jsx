'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BannerSearch() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="w-full h-[220px] bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center text-white mb-4">
          <h1 className="text-2xl font-bold mb-2">Temukan Pekerjaan Impian Anda</h1>
          <p className="text-sm">Platform Lowongan Kerja Terpercaya di Indonesia</p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari pekerjaan atau perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-dark text-white p-2 rounded-md hover:bg-green-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
