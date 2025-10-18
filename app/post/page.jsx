'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [regencies, setRegencies] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])

  const [formData, setFormData] = useState({
    type: 'job', // 'job' (구직) or 'worker' (구인)
    title: '',
    description: '',
    province_id: '',
    regency_id: '',
    category_id: '',
    subcategory_id: '',
    employment_type: 'full_time',
    experience_level: 'entry',
    salary_min: '',
    salary_max: '',
  })

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Load regencies when province changes
  useEffect(() => {
    if (formData.province_id) {
      loadRegencies(formData.province_id)
    } else {
      setRegencies([])
    }
  }, [formData.province_id])

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id)
    } else {
      setSubcategories([])
    }
  }, [formData.category_id])

  const loadInitialData = async () => {
    const supabase = createClient()

    // Check cache first
    const cachedProvinces = localStorage.getItem('provinces')
    const cachedCategories = localStorage.getItem('categories')
    const cacheTime = localStorage.getItem('provincesCategories_cacheTime')
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000 // 24 hours

    // Use cache if valid (less than 24 hours old)
    if (cachedProvinces && cachedCategories && cacheTime && (now - parseInt(cacheTime)) < oneDay) {
      setProvinces(JSON.parse(cachedProvinces))
      setCategories(JSON.parse(cachedCategories))
      return
    }

    // Load provinces
    const { data: provincesData } = await supabase
      .from('provinces')
      .select('province_id, province_name')
      .order('province_name')

    // Load parent categories only (1차 카테고리)
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('category_id, name')
      .is('parent_category', null)
      .order('name')

    // Cache the data
    if (provincesData) {
      localStorage.setItem('provinces', JSON.stringify(provincesData))
    }
    if (categoriesData) {
      localStorage.setItem('categories', JSON.stringify(categoriesData))
    }
    localStorage.setItem('provincesCategories_cacheTime', now.toString())

    setProvinces(provincesData || [])
    setCategories(categoriesData || [])
  }

  const loadRegencies = async (provinceId) => {
    const supabase = createClient()

    // Check cache
    const cacheKey = `regencies_${provinceId}`
    const cached = localStorage.getItem(cacheKey)
    const cacheTime = localStorage.getItem(`${cacheKey}_time`)
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    if (cached && cacheTime && (now - parseInt(cacheTime)) < oneDay) {
      setRegencies(JSON.parse(cached))
      return
    }

    const { data } = await supabase
      .from('regencies')
      .select('regency_id, regency_name')
      .eq('province_id', provinceId)
      .order('regency_name')

    if (data) {
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(`${cacheKey}_time`, now.toString())
    }

    setRegencies(data || [])
  }

  const loadSubcategories = async (categoryId) => {
    const supabase = createClient()

    // Check cache
    const cacheKey = `subcategories_${categoryId}`
    const cached = localStorage.getItem(cacheKey)
    const cacheTime = localStorage.getItem(`${cacheKey}_time`)
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    if (cached && cacheTime && (now - parseInt(cacheTime)) < oneDay) {
      setSubcategories(JSON.parse(cached))
      return
    }

    const { data } = await supabase
      .from('categories')
      .select('category_id, name')
      .eq('parent_category', categoryId)
      .order('name')

    if (data) {
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(`${cacheKey}_time`, now.toString())
    }

    setSubcategories(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        alert('로그인이 필요합니다.')
        router.push('/login')
        return
      }

      // Check if user has a company profile, create one if not
      let { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      let companyId

      if (!companies || companies.length === 0) {
        // Create a default company for the user
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            user_id: user.id,
            company_name: formData.title.split(' ')[0] || 'Company',
            description: '회사 정보를 업데이트해주세요.',
            regency_id: formData.regency_id
          }])
          .select()
          .single()

        if (createError) {
          console.error('Error creating company:', createError)
          alert('회사 프로필 생성 중 오류가 발생했습니다.')
          return
        }

        companyId = newCompany.id
      } else {
        companyId = companies[0].id
      }

      // Prepare job data for insertion
      const jobData = {
        company_id: companyId,
        title: formData.title,
        description: formData.description,
        requirements: formData.description, // Using description as requirements for now
        regency_id: formData.regency_id,
        category_id: formData.subcategory_id || formData.category_id, // Use subcategory if selected, otherwise parent category
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        status: 'active'
      }

      // Insert job into database
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()

      if (error) {
        console.error('Error inserting job:', error)
        alert('등록 중 오류가 발생했습니다: ' + error.message)
        return
      }

      alert('성공적으로 등록되었습니다!')
      router.push('/')

    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[600px] mx-auto px-5">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-slate-700 mb-6">구인/구직 등록</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 유형 선택 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">유형</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'job'})}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    formData.type === 'job'
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  구직 (일자리 찾기)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'worker'})}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    formData.type === 'worker'
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  구인 (인재 찾기)
                </button>
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">제목</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                placeholder="예: Software Developer 구함"
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none h-32"
                placeholder="상세한 설명을 입력하세요..."
                required
              />
            </div>

            {/* 지역 선택 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">지역 (Wilayah)</label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="province_id" className="sr-only">시/도 선택</label>
                  <select
                    id="province_id"
                    value={formData.province_id}
                    onChange={(e) => setFormData({...formData, province_id: e.target.value, regency_id: ''})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none appearance-none"
                    required
                    aria-label="시/도 선택"
                  >
                    <option value="">시/도 선택</option>
                    {provinces.map((province) => (
                      <option key={province.province_id} value={province.province_id}>
                        {province.province_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="regency_id" className="sr-only">시/군/구 선택</label>
                  <select
                    id="regency_id"
                    value={formData.regency_id}
                    onChange={(e) => setFormData({...formData, regency_id: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none appearance-none disabled:bg-gray-100"
                    disabled={!formData.province_id}
                    required
                    aria-label="시/군/구 선택"
                  >
                    <option value="">시/군/구 선택</option>
                    {regencies.map((regency) => (
                      <option key={regency.regency_id} value={regency.regency_id}>
                        {regency.regency_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 직업 카테고리 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">직업 분야 (Pekerjaan)</label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="category_id" className="sr-only">직업 대분류 선택</label>
                  <select
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value, subcategory_id: ''})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none appearance-none"
                    required
                    aria-label="직업 대분류 선택"
                  >
                    <option value="">대분류 선택</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subcategory_id" className="sr-only">직업 소분류 선택</label>
                  <select
                    id="subcategory_id"
                    value={formData.subcategory_id}
                    onChange={(e) => setFormData({...formData, subcategory_id: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none appearance-none disabled:bg-gray-100"
                    disabled={!formData.category_id}
                    aria-label="직업 소분류 선택"
                  >
                    <option value="">소분류 선택 (선택사항)</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.category_id} value={subcategory.category_id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 고용 형태 */}
            <div>
              <label htmlFor="employment_type" className="block text-sm font-semibold text-slate-700 mb-2">고용 형태</label>
              <select
                id="employment_type"
                value={formData.employment_type}
                onChange={(e) => setFormData({...formData, employment_type: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none appearance-none"
                aria-label="고용 형태 선택"
              >
                <option value="full_time">풀타임</option>
                <option value="part_time">파트타임</option>
                <option value="contract">계약직</option>
                <option value="internship">인턴십</option>
                <option value="freelance">프리랜서</option>
              </select>
            </div>

            {/* 경력 */}
            <div>
              <label htmlFor="experience_level" className="block text-sm font-semibold text-slate-700 mb-2">경력</label>
              <select
                id="experience_level"
                value={formData.experience_level}
                onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none appearance-none"
                aria-label="경력 선택"
              >
                <option value="entry">신입</option>
                <option value="junior">주니어 (1-3년)</option>
                <option value="mid">중급 (3-5년)</option>
                <option value="senior">시니어 (5-10년)</option>
                <option value="lead">리드 (10년+)</option>
                <option value="executive">임원급</option>
              </select>
            </div>

            {/* 급여 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">급여 (IDR)</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({...formData, salary_min: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                  placeholder="최소"
                />
                <input
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({...formData, salary_max: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                  placeholder="최대"
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
              >
                {loading ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
