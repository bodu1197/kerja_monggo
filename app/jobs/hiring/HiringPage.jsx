'use client'

import { useState, useEffect } from 'react'
import ProductCard from '../../components/ProductCard'
import LoadingState from '../../components/LoadingState'
import Footer from '../../components/Footer'
import { useSupabase } from '../../components/SupabaseProvider'

export default function HiringPage({ initialProvinces, initialCategories, initialJobs }) {
  const supabase = useSupabase()
  const [provinces] = useState(initialProvinces)
  const [categories] = useState(initialCategories)
  const [jobs, setJobs] = useState(initialJobs)
  const [loading, setLoading] = useState(false)

  console.log('HiringPage - provinces:', provinces?.length, provinces)
  console.log('HiringPage - categories:', categories?.length, categories)
  console.log('HiringPage - jobs:', jobs?.length, jobs)

  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedRegency, setSelectedRegency] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')

  const [regencies, setRegencies] = useState([])
  const [subcategories, setSubcategories] = useState([])

  // Province 선택 시 Regency 로드
  useEffect(() => {
    if (selectedProvince) {
      const loadRegencies = async () => {
        const { data } = await supabase
          .from('regencies')
          .select('id, name')
          .eq('province_id', selectedProvince)
          .order('name')
        setRegencies(data || [])
      }
      loadRegencies()
      setSelectedRegency('')
    } else {
      setRegencies([])
      setSelectedRegency('')
    }
  }, [selectedProvince, supabase])

  // Category 선택 시 Subcategory 로드
  useEffect(() => {
    if (selectedCategory) {
      const loadSubcategories = async () => {
        const { data } = await supabase
          .from('categories')
          .select('id, name')
          .eq('parent_category', selectedCategory)
          .order('name')
        setSubcategories(data || [])
      }
      loadSubcategories()
      setSelectedSubcategory('')
    } else {
      setSubcategories([])
      setSelectedSubcategory('')
    }
  }, [selectedCategory, supabase])

  // 필터 적용
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true)
      let query = supabase
        .from('job_posts')
        .select(`
          *,
          province:provinces(name),
          regency:regencies(name),
          category:categories!job_posts_category_id_fkey(name),
          subcategory:categories!job_posts_subcategory_id_fkey(name)
        `)
        .eq('status', 'active')

      if (selectedProvince) query = query.eq('province_id', selectedProvince)
      if (selectedRegency) query = query.eq('regency_id', selectedRegency)
      if (selectedCategory) query = query.eq('category_id', selectedCategory)
      if (selectedSubcategory) query = query.eq('subcategory_id', selectedSubcategory)

      const { data } = await query.order('created_at', { ascending: false }).limit(50)

      const transformedJobs = data?.map(job => ({
        ...job,
        province_name: job.province?.name,
        regency_name: job.regency?.name,
        category_name: job.category?.name,
        subcategory_name: job.subcategory?.name,
      })) || []

      setJobs(transformedJobs)
      setLoading(false)
    }

    applyFilters()
  }, [selectedProvince, selectedRegency, selectedCategory, selectedSubcategory, supabase])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary">Lowongan Kerja</h1>
        <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
          Pasang Lowongan
        </button>
      </div>

      {/* 드롭다운 필터 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="px-4 py-2 bg-dark-100 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-primary"
        >
          <option value="">Semua Provinsi ({provinces?.length || 0})</option>
          {provinces?.map(province => (
            <option key={province.id} value={province.id}>{province.name}</option>
          ))}
        </select>

        <select
          value={selectedRegency}
          onChange={(e) => setSelectedRegency(e.target.value)}
          className="px-4 py-2 bg-dark-100 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-primary"
          disabled={!selectedProvince}
        >
          <option value="">Semua Kota/Kabupaten</option>
          {regencies.map(regency => (
            <option key={regency.id} value={regency.id}>{regency.name}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-dark-100 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-primary"
        >
          <option value="">Semua Kategori ({categories?.length || 0})</option>
          {categories?.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          className="px-4 py-2 bg-dark-100 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-primary"
          disabled={!selectedCategory}
        >
          <option value="">Semua Subkategori</option>
          {subcategories.map(subcategory => (
            <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
          ))}
        </select>
      </div>

      {/* 결과 */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <ProductCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          Tidak ada lowongan kerja yang ditemukan
        </div>
      )}

      <Footer />
    </main>
  )
}
