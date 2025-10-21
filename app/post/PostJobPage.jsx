'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PostJobPage({ initialProvinces = [], initialCategories = [] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [provinces] = useState(initialProvinces)
  const [regencies, setRegencies] = useState([])
  const [categories] = useState(initialCategories)
  const [subcategories, setSubcategories] = useState([])
  const [currentStep, setCurrentStep] = useState(1) // 단계별 폼

  const [formData, setFormData] = useState({
    // 회사 정보
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    business_registration: '',
    company_size: '',
    industry: '',

    // 채용 공고 정보
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    province_id: '',
    regency_id: '',
    category_id: '',
    subcategory_id: '',
    employment_type: 'full_time',
    experience_level: 'entry',
    salary_min: '',
    salary_max: '',
    is_salary_negotiable: false,
    is_remote: false,
    skills: [],
    benefits: [],
    positions_available: 1,
    deadline: '',
  })

  const [skillInput, setSkillInput] = useState('')
  const [benefitInput, setBenefitInput] = useState('')

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

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    })
  }

  const addBenefit = () => {
    if (benefitInput.trim() && !formData.benefits.includes(benefitInput.trim())) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, benefitInput.trim()]
      })
      setBenefitInput('')
    }
  }

  const removeBenefit = (benefit) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter(b => b !== benefit)
    })
  }

  const validateStep1 = () => {
    if (!formData.company_name || !formData.contact_person || !formData.phone || !formData.email) {
      alert('회사 기본 정보를 모두 입력해주세요.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.title || !formData.description || !formData.requirements) {
      alert('채용 공고 기본 정보를 모두 입력해주세요.')
      return false
    }
    if (formData.description.length < 50) {
      alert('상세 설명은 최소 50자 이상이어야 합니다.')
      return false
    }
    return true
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
        .eq('user_id', 'temp-user-id')
        .limit(1)

      let companyId

      if (!companies || companies.length === 0) {
        // Create a new company
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            user_id: 'temp-user-id',
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            phone: formData.phone,
            email: formData.email,
            business_registration: formData.business_registration,
            company_size: formData.company_size,
            industry: formData.industry,
            regency_id: formData.regency_id,
            province_id: formData.province_id,
            benefits: formData.benefits // 회사 복리후생
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
          business_registration: formData.business_registration,
          company_size: formData.company_size,
          industry: formData.industry,
          regency_id: formData.regency_id,
          province_id: formData.province_id,
          benefits: formData.benefits
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
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        province_id: formData.province_id,
        regency_id: formData.regency_id,
        category_id: formData.subcategory_id || formData.category_id,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        is_salary_negotiable: formData.is_salary_negotiable,
        is_remote: formData.is_remote,
        skills: formData.skills,
        benefits: formData.benefits,
        positions_available: parseInt(formData.positions_available) || 1,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        status: 'active'
      }

      // Insert job
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
      router.push('/')

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
          <h1 className="text-2xl font-bold text-slate-700 mb-6">채용공고 등록</h1>

          {/* 진행 상태 표시 */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex-1 text-center ${currentStep >= 1 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-slate-700 text-white' : 'bg-gray-200'
              }`}>1</div>
              <div className="mt-2 text-sm">회사 정보</div>
            </div>
            <div className={`flex-1 text-center ${currentStep >= 2 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-slate-700 text-white' : 'bg-gray-200'
              }`}>2</div>
              <div className="mt-2 text-sm">채용 정보</div>
            </div>
            <div className={`flex-1 text-center ${currentStep >= 3 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-slate-700 text-white' : 'bg-gray-200'
              }`}>3</div>
              <div className="mt-2 text-sm">상세 조건</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: 회사 정보 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">회사 정보</h2>

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

                {/* 사업자등록번호 */}
                <div>
                  <label htmlFor="business_registration" className="block text-sm font-semibold text-slate-700 mb-2">
                    사업자등록번호 (NPWP/NIB)
                  </label>
                  <input
                    type="text"
                    id="business_registration"
                    value={formData.business_registration}
                    onChange={(e) => setFormData({...formData, business_registration: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                  />
                </div>

                {/* 회사 규모 및 업종 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company_size" className="block text-sm font-semibold text-slate-700 mb-2">
                      회사 규모
                    </label>
                    <select
                      id="company_size"
                      value={formData.company_size}
                      onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    >
                      <option value="">선택</option>
                      <option value="1-10">1-10명</option>
                      <option value="11-50">11-50명</option>
                      <option value="51-200">51-200명</option>
                      <option value="201-500">201-500명</option>
                      <option value="500+">500명 이상</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="industry" className="block text-sm font-semibold text-slate-700 mb-2">
                      업종
                    </label>
                    <input
                      type="text"
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      placeholder="예: IT, 제조업"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2)
                      }
                    }}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
                  >
                    다음 단계
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: 채용 정보 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">채용 정보</h2>

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

                {/* 자격 요건 */}
                <div>
                  <label htmlFor="requirements" className="block text-sm font-semibold text-slate-700 mb-2">
                    자격 요건 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none h-32"
                    placeholder="필수 자격 요건을 입력하세요..."
                    required
                  />
                </div>

                {/* 담당 업무 */}
                <div>
                  <label htmlFor="responsibilities" className="block text-sm font-semibold text-slate-700 mb-2">
                    담당 업무
                  </label>
                  <textarea
                    id="responsibilities"
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none h-32"
                    placeholder="주요 담당 업무를 입력하세요..."
                  />
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

                {/* 원격 근무 */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_remote}
                      onChange={(e) => setFormData({...formData, is_remote: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-slate-700">원격 근무 가능</span>
                  </label>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                  >
                    이전 단계
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) {
                        setCurrentStep(3)
                      }
                    }}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
                  >
                    다음 단계
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: 상세 조건 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">상세 조건</h2>

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

                {/* 고용 형태 */}
                <div>
                  <label htmlFor="employment_type" className="block text-sm font-semibold text-slate-700 mb-2">
                    고용 형태
                  </label>
                  <select
                    id="employment_type"
                    value={formData.employment_type}
                    onChange={(e) => setFormData({...formData, employment_type: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                  >
                    <option value="full_time">정규직</option>
                    <option value="part_time">파트타임</option>
                    <option value="contract">계약직</option>
                    <option value="internship">인턴십</option>
                    <option value="freelance">프리랜서</option>
                  </select>
                </div>

                {/* 경력 수준 */}
                <div>
                  <label htmlFor="experience_level" className="block text-sm font-semibold text-slate-700 mb-2">
                    경력 수준
                  </label>
                  <select
                    id="experience_level"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                  >
                    <option value="entry">신입</option>
                    <option value="junior">주니어 (1-3년)</option>
                    <option value="mid">중급 (3-5년)</option>
                    <option value="senior">시니어 (5-10년)</option>
                    <option value="lead">리드 (10년+)</option>
                    <option value="executive">임원급</option>
                  </select>
                </div>

                {/* 급여 정보 */}
                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2">급여 (IDR)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => setFormData({...formData, salary_min: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      placeholder="최소 급여"
                    />
                    <input
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({...formData, salary_max: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      placeholder="최대 급여"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.is_salary_negotiable}
                      onChange={(e) => setFormData({...formData, is_salary_negotiable: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">급여 협의 가능</span>
                  </label>
                </div>

                {/* 필요 기술 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    필요 기술
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      placeholder="예: React, Node.js"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 복리후생 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    복리후생
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      placeholder="예: BPJS, 보너스, 식대"
                    />
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(benefit)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 채용 인원 */}
                <div>
                  <label htmlFor="positions_available" className="block text-sm font-semibold text-slate-700 mb-2">
                    채용 인원
                  </label>
                  <input
                    type="number"
                    id="positions_available"
                    value={formData.positions_available}
                    onChange={(e) => setFormData({...formData, positions_available: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    min="1"
                  />
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

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                  >
                    이전 단계
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
                  >
                    {loading ? '등록 중...' : '채용공고 등록'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}