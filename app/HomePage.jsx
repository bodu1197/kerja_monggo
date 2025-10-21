'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from './components/Header'
import Banner from './components/Banner'
import JobCard from './components/JobCard'
import Footer from './components/Footer'
import BottomTab from './components/BottomTab'

export default function HomePage({ initialProvinces = [], initialCategories = [] }) {
  const supabase = createClient()
  const [allJobs, setAllJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('')
  const [provinces, setProvinces] = useState(initialProvinces)
  const [categories, setCategories] = useState(initialCategories)
  const [region1, setRegion1] = useState('')
  const [region2, setRegion2] = useState('')
  const [job1, setJob1] = useState('')
  const [job2, setJob2] = useState('')
  const [region2Options, setRegion2Options] = useState([])
  const [job2Options, setJob2Options] = useState([])
  const [hasSearched, setHasSearched] = useState(false)

  // 클라이언트에서 직접 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // provinces 데이터 로드
        const { data: provincesData, error: provincesError } = await supabase
          .from('provinces')
          .select('province_id, province_name')
          .order('province_name')

        if (provincesError) {
          console.error('Provinces error:', provincesError)
        } else if (provincesData) {
          console.log('Loaded provinces:', provincesData.length)
          setProvinces(provincesData)
        }

        // categories 데이터 로드
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('category_id, name, icon')
          .is('parent_category', null)
          .order('category_id')

        if (categoriesError) {
          console.error('Categories error:', categoriesError)
        } else if (categoriesData) {
          console.log('Loaded categories:', categoriesData.length)
          setCategories(categoriesData)
        }
      } catch (err) {
        console.error('Client load error:', err)
      }
    }

    // initialProvinces와 initialCategories가 비어있으면 클라이언트에서 로드
    if (!initialProvinces?.length || !initialCategories?.length) {
      loadInitialData()
    }
  }, [])

  // Load all jobs on mount
  useEffect(() => {
    loadAllJobs()
  }, [])

  // Load regencies when province changes
  useEffect(() => {
    if (region1) {
      loadRegencies(region1)
    } else {
      setRegion2Options([])
      setRegion2('')
    }
  }, [region1])

  // Load subcategories when category changes
  useEffect(() => {
    if (job1) {
      loadSubcategories(job1)
    } else {
      setJob2Options([])
      setJob2('')
    }
  }, [job1])

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters()
    // 필터가 하나라도 적용되었는지 확인
    if (selectedType || region1 || region2 || job1 || job2) {
      setHasSearched(true)
    } else {
      setHasSearched(false)
    }
  }, [selectedType, region1, region2, job1, job2, allJobs])

  const loadAllJobs = async () => {
    setLoading(true)
    try {
      // Load job posts (구인)
      const { data: jobPosts } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          created_at,
          province:provinces(province_name),
          regency:regencies(regency_name),
          category:categories!job_posts_category_id_fkey(name, icon)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50)

      // Load job seeker posts (구직)
      const { data: seekerPosts } = await supabase
        .from('candidate_profiles')
        .select(`
          id,
          title,
          description,
          created_at,
          province:provinces(province_name),
          regency:regencies(regency_name),
          category:categories!job_seeker_posts_category_id_fkey(name, icon)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50)

      // Transform data to unified format
      const transformedJobPosts = (jobPosts || []).map(job => ({
        id: job.id,
        type: 'job',
        title: job.title,
        description: job.description,
        region: `${job.province?.province_name || ''} ${job.regency?.regency_name || ''}`.trim(),
        province_name: job.province?.province_name,
        regency_name: job.regency?.regency_name,
        category: job.category?.name,
        category_icon: job.category?.icon,
        created_at: job.created_at,
        days: Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24))
      }))

      const transformedSeekerPosts = (seekerPosts || []).map(job => ({
        id: job.id,
        type: 'worker',
        title: job.title,
        description: job.description,
        region: `${job.province?.province_name || ''} ${job.regency?.regency_name || ''}`.trim(),
        province_name: job.province?.province_name,
        regency_name: job.regency?.regency_name,
        category: job.category?.name,
        category_icon: job.category?.icon,
        created_at: job.created_at,
        days: Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24))
      }))

      const combined = [...transformedJobPosts, ...transformedSeekerPosts]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setAllJobs(combined)
      setFilteredJobs(combined)
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRegencies = async (provinceId) => {
    const { data } = await supabase
      .from('regencies')
      .select('regency_id, regency_name')
      .eq('province_id', provinceId)
      .order('regency_name')

    if (data) {
      setRegion2Options(data)
    }
  }

  const loadSubcategories = async (categoryId) => {
    const parentCategory = categories.find(cat => cat.category_id === parseInt(categoryId))
    if (!parentCategory) return

    const { data } = await supabase
      .from('categories')
      .select('category_id, name, icon')
      .eq('parent_category', parentCategory.name)
      .order('name')

    if (data) {
      setJob2Options(data)
    }
  }

  const applyFilters = () => {
    let filtered = allJobs.filter(job => {
      // Filter by type
      if (selectedType && job.type !== selectedType) return false

      // Filter by province
      if (region1) {
        const selectedProvince = provinces.find(p => p.province_id === region1)
        if (selectedProvince && job.province_name !== selectedProvince.province_name) return false
      }

      // Filter by regency
      if (region2) {
        const selectedRegency = region2Options.find(r => r.regency_id === region2)
        if (selectedRegency && job.regency_name !== selectedRegency.regency_name) return false
      }

      // Filter by category
      if (job1) {
        const selectedCategory = categories.find(c => c.category_id === parseInt(job1))
        if (selectedCategory && job.category !== selectedCategory.name) return false
      }

      // Filter by subcategory
      if (job2) {
        const selectedSubcategory = job2Options.find(s => s.category_id === parseInt(job2))
        if (selectedSubcategory && job.category !== selectedSubcategory.name) return false
      }

      return true
    })

    setFilteredJobs(filtered)
  }

  const handleReset = () => {
    setSelectedType('')
    setRegion1('')
    setRegion2('')
    setJob1('')
    setJob2('')
  }

  return (
    <>
      <Header />
      <Banner />

      <main className="flex-1 p-0 text-[#333] bg-[#fafafa] relative pb-20">
        <div className="absolute top-0 left-0 right-0 h-px" style={{background: 'linear-gradient(90deg, transparent, #e0e0e0 20%, #e0e0e0 80%, transparent)'}}></div>

        {/* 검색 필터 영역 */}
        <div className="max-w-[1200px] mx-auto py-6">
          <div className="bg-white rounded-2xl shadow-lg p-[10px] md:p-6">
            {/* 유형 선택 */}
            <div className="mb-6">
              <div className="flex gap-2">
                {['job', 'worker'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex-1 px-3 py-3 rounded-[10px] text-sm font-semibold cursor-pointer transition-all border-2 ${
                      selectedType === type
                        ? 'bg-[#2c3e50] border-[#2c3e50] text-white'
                        : 'bg-white border-[#e0e0e0] text-[#666] hover:border-[#2c3e50] hover:text-[#2c3e50]'
                    }`}
                  >
                    {type === 'job' ? '구직' : '구인'}
                  </button>
                ))}
              </div>
            </div>

            {/* 지역 선택 */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    id="filterRegion1"
                    value={region1}
                    onChange={(e) => setRegion1(e.target.value)}
                    className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-[#e0e0e0] rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
                  >
                    <option value="">모든 지역</option>
                    {provinces.map((province) => (
                      <option key={province.province_id} value={province.province_id}>
                        {province.province_name}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                <div className="relative">
                  <select
                    id="filterRegion2"
                    value={region2}
                    onChange={(e) => setRegion2(e.target.value)}
                    disabled={!region1}
                    className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-[#e0e0e0] rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
                  >
                    <option value="">세부 지역</option>
                    {region2Options.map((r) => (
                      <option key={r.regency_id} value={r.regency_id}>{r.regency_name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* 직업 선택 */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    id="filterJob1"
                    value={job1}
                    onChange={(e) => setJob1(e.target.value)}
                    className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-[#e0e0e0] rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
                  >
                    <option value="">모든 직업</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                <div className="relative">
                  <select
                    id="filterJob2"
                    value={job2}
                    onChange={(e) => setJob2(e.target.value)}
                    disabled={!job1}
                    className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-[#e0e0e0] rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
                  >
                    <option value="">세부 직업</option>
                    {job2Options.map((j) => (
                      <option key={j.category_id} value={j.category_id}>
                        {j.icon} {j.name}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* 초기화 버튼 */}
            <button
              onClick={handleReset}
              className="w-full py-3.5 border-none rounded-[10px] text-[15px] font-semibold cursor-pointer transition-all bg-[#f5f5f5] text-[#666] hover:bg-[#e0e0e0] hover:text-[#333]"
            >
              초기화
            </button>
          </div>

          {/* 검색 결과 */}
          {hasSearched && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">
                {loading ? '로딩 중...' :
                  selectedType === 'job' ? `구직 결과 (${filteredJobs.length}개)` :
                  selectedType === 'worker' ? `구인 결과 (${filteredJobs.length}개)` :
                  `검색 결과 (${filteredJobs.length}개)`
                }
              </h3>
              {!loading && filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">
                    {selectedType === 'job' ? '구직 결과가 없습니다.' :
                     selectedType === 'worker' ? '구인 결과가 없습니다.' :
                     '검색 결과가 없습니다.'}
                  </p>
                  <p className="text-sm mt-2">다른 조건으로 검색해보세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                  {filteredJobs.map((job) => (
                    <JobCard key={`${job.type}-${job.id}`} job={job} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomTab />
    </>
  )
}
