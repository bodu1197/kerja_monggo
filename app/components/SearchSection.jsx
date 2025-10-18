'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchSection({ provinces, categories }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedProvince) params.set('province', selectedProvince)
    if (selectedCategory) params.set('category', selectedCategory)

    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className="bg-primary text-white px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">
        Temukan Pekerjaan Impian
      </h1>
      <p className="text-sm text-green-100 mb-4">
        Ribuan lowongan kerja menanti Anda
      </p>

      <form onSubmit={handleSearch}>
        {/* Search Bar */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Cari pekerjaan, perusahaan..."
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

        {/* Filters Row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Province Filter */}
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="px-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="">Semua Provinsi</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Button */}
        <button
          type="button"
          className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Cari di Sekitar Saya</span>
        </button>
      </form>
    </div>
  )
}
