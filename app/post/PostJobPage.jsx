'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PostJobPage({ initialProvinces = [], initialCategories = [] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [provinces] = useState(initialProvinces)
  const [regencies, setRegencies] = useState([])
  const [categories] = useState(initialCategories)
  const [subcategories, setSubcategories] = useState([])

  const [formData, setFormData] = useState({
    // 회사 정보
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',

    // 채용 공고 정보
    title: '',
    description: '',
    province_id: '',
    regency_id: '',
    category_id: '',
    subcategory_id: '',
    deadline: '',
  })

  // Initial data already loaded from server via props
  // No need to load again

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
    if (formData.category_id && categories.length > 0) {
      loadSubcategories(formData.category_id)
    } else {
      setSubcategories([])
    }
  }, [formData.category_id, categories])

  // 마감일 기본값 설정 (30일 후)
  useEffect(() => {
    if (!formData.deadline) {
      const defaultDeadline = new Date()
      defaultDeadline.setDate(defaultDeadline.getDate() + 30)
      setFormData(prev => ({
        ...prev,
        deadline: defaultDeadline.toISOString().slice(0, 16)
      }))
    }
  }, [])

  // 수정 모드: 기존 채용 공고 데이터 로드
  useEffect(() => {
    if (editId) {
      loadExistingJobData(editId)
    } else {
      loadExistingCompanyInfo()
    }
  }, [editId])

  const loadExistingJobData = async (jobId) => {
    const supabase = createClient()
    setLoading(true)

    try {
      console.log('=== 수정 모드 데이터 로드 시작 ===')
      console.log('Job ID:', jobId)

      const { data: job, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies(
            company_name,
            contact_person,
            phone,
            email,
            province_id,
            regency_id
          )
        `)
        .eq('id', jobId)
        .single()

      console.log('불러온 Job:', job)
      console.log('Title:', job?.title)
      console.log('Description:', job?.description)

      if (error) {
        console.error('Error loading job:', error)
        alert('채용 공고를 불러오는 중 오류가 발생했습니다.')
        router.push('/my-posts')
        return
      }

      if (job) {
        setIsEditMode(true)

        // DB에서 카테고리 정보 다시 가져오기
        let parentCategoryId = ''
        let subcategoryId = ''

        if (job.category_id) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('category_id, name, parent_category')
            .eq('category_id', job.category_id)
            .single()

          console.log('카테고리 데이터:', categoryData)

          if (categoryData) {
            if (categoryData.parent_category) {
              // 소분류
              subcategoryId = categoryData.category_id

              const { data: parentData } = await supabase
                .from('categories')
                .select('category_id')
                .eq('name', categoryData.parent_category)
                .is('parent_category', null)
                .single()

              if (parentData) {
                parentCategoryId = parentData.category_id
              }
            } else {
              // 대분류
              parentCategoryId = categoryData.category_id
            }
          }
        }

        console.log('Parent Category ID:', parentCategoryId)
        console.log('Subcategory ID:', subcategoryId)

        const newFormData = {
          company_name: job.companies?.company_name || '',
          contact_person: job.companies?.contact_person || '',
          phone: job.companies?.phone || '',
          email: job.companies?.email || '',
          title: job.title || '',
          description: job.description || '',
          province_id: job.companies?.province_id || job.province_id || '',
          regency_id: job.companies?.regency_id || job.regency_id || '',
          category_id: parentCategoryId,
          subcategory_id: subcategoryId,
          deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 16) : '',
        }

        console.log('설정할 FormData:', newFormData)
        setFormData(newFormData)
        console.log('=== 데이터 로드 완료 ===')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
      router.push('/my-posts')
    } finally {
      setLoading(false)
    }
  }

  // 기존 회사 정보 자동 로드 (신규 등록 시에만)
  const loadExistingCompanyInfo = async () => {
    const supabase = createClient()

    // 로그인 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 기존 회사 정보 조회
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (companies) {
      // 회사 정보를 폼에 자동으로 채움
      setFormData(prev => ({
        ...prev,
        company_name: companies.company_name || '',
        contact_person: companies.contact_person || '',
        phone: companies.phone || '',
        email: companies.email || '',
        province_id: companies.province_id || '',
        regency_id: companies.regency_id || ''
      }))
    }
  }

  // No longer needed - data comes from server props

  const loadRegencies = async (provinceId) => {
    const supabase = createClient()

    const { data: regenciesData } = await supabase
      .from('regencies')
      .select('regency_id, regency_name')
      .eq('province_id', provinceId)
      .order('regency_name')

    if (regenciesData) {
      setRegencies(regenciesData)
    }
  }

  const loadSubcategories = async (parentCategoryId) => {
    const supabase = createClient()

    const parentCategory = categories.find(cat => cat.category_id === parseInt(parentCategoryId))

    if (!parentCategory) return

    const { data: subcategoriesData } = await supabase
      .from('categories')
      .select('category_id, name')
      .eq('parent_category', parentCategory.name)
      .order('name')

    if (subcategoriesData) {
      setSubcategories(subcategoriesData)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 최종 검증
    if (!formData.deadline) {
      alert('마감기한을 선택해주세요.')
      return
    }

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

      // Check if user has a company profile
      let { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      let companyId

      if (!companies || companies.length === 0) {
        // Create a new company
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            user_id: user.id,
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            phone: formData.phone,
            email: formData.email,
            regency_id: formData.regency_id,
            province_id: formData.province_id
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
        // Update existing company
        companyId = companies[0].id

        const updateData = {
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          phone: formData.phone,
          email: formData.email,
          regency_id: formData.regency_id,
          province_id: formData.province_id
        }

        const { error: updateError } = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', companyId)

        if (updateError) {
          console.error('Error updating company:', updateError)
        }
      }

      // Prepare job data
      const jobData = {
        company_id: companyId,
        title: formData.title,
        description: formData.description,
        province_id: formData.province_id,
        regency_id: formData.regency_id,
        category_id: formData.subcategory_id || formData.category_id,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        status: 'active'
      }

      if (isEditMode && editId) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editId)

        if (error) {
          console.error('Error updating job:', error)
          alert('수정 중 오류가 발생했습니다: ' + error.message)
          return
        }

        alert('채용공고가 성공적으로 수정되었습니다!')
        router.push('/my-posts')
      } else {
        // Insert new job
        const { data, error } = await supabase
          .from('jobs')
          .insert([jobData])
          .select()

        if (error) {
          console.error('Error inserting job:', error)
          alert('등록 중 오류가 발생했습니다: ' + error.message)
          return
        }

        alert('채용공고가 성공적으로 등록되었습니다!')
        router.push('/jobs/hiring')
      }

    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 권한 체크: 로딩 중
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[800px] mx-auto px-5">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 회사 정보 */}
            <div className="space-y-6">
                {/* 회사명 */}
                <div>
                  <label htmlFor="company_name" className="block text-sm font-semibold text-slate-700 mb-2">
                    회사명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    required
                  />
                </div>

                {/* 담당자 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact_person" className="block text-sm font-semibold text-slate-700 mb-2">
                      담당자명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* 이메일 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    required
                  />
                </div>
            </div>

            {/* 채용 정보 */}
            <div className="space-y-6">
                {/* 제목 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                    채용 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    placeholder="예: Senior Software Developer 채용"
                    required
                  />
                </div>

                {/* 상세 설명 */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                    상세 설명 <span className="text-red-500">*</span> (최소 50자)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none h-32"
                    placeholder="업무 환경, 회사 문화, 성장 기회 등을 자세히 설명해주세요..."
                    required
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/50자
                  </div>
                </div>


                {/* 지역 선택 */}
                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2">근무 지역</div>
                  <div className="space-y-3">
                    <select
                      value={formData.province_id}
                      onChange={(e) => setFormData({...formData, province_id: e.target.value, regency_id: ''})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    >
                      <option value="">시/도 선택</option>
                      {provinces.map((province) => (
                        <option key={province.province_id} value={province.province_id}>
                          {province.province_name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={formData.regency_id}
                      onChange={(e) => setFormData({...formData, regency_id: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      disabled={!formData.province_id}
                      required
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

            {/* 상세 조건 */}
            <div className="space-y-6">
                {/* 직업 카테고리 */}
                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2">직종</div>
                  <div className="space-y-3">
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value, subcategory_id: ''})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    >
                      <option value="">대분류 선택</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={formData.subcategory_id}
                      onChange={(e) => setFormData({...formData, subcategory_id: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      disabled={!formData.category_id}
                    >
                      <option value="">소분류 선택 (선택사항)</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.category_id} value={subcategory.category_id}>
                          {subcategory.icon} {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 마감기한 */}
                <div>
                  <label htmlFor="deadline" className="block text-sm font-semibold text-slate-700 mb-2">
                    지원 마감일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    기본값: 30일 후 | 최대 90일까지 설정 가능
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
                  >
                    {loading
                      ? (isEditMode ? '수정 중...' : '등록 중...')
                      : (isEditMode ? '수정 완료' : '채용공고 등록')}
                  </button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}