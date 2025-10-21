'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export default function ProfilePage({ initialProvinces = [], initialCategories = [] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [provinces] = useState(initialProvinces)
  const [regencies, setRegencies] = useState([])
  const [categories] = useState(initialCategories)
  const [subcategories, setSubcategories] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [resumeFile, setResumeFile] = useState(null)
  const supabase = createClient()

  // 기본 프로필 정보
  const [profile, setProfile] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    province_id: '',
    regency_id: '',
    category_id: '',
    subcategory_id: '',
    current_title: '',
    experience_level: 'entry',
    expected_salary_min: '',
    expected_salary_max: '',
    skills: [],
    education_level: 'sma',
    resume_url: '',
    portfolio_url: '',
    linkedin_url: '',
    bio: '',
    is_profile_public: true,
    is_open_to_work: true,
  })

  // 학력 정보
  const [educations, setEducations] = useState([{
    institution: '',
    degree: 'sma',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  }])

  // 경력 정보
  const [experiences, setExperiences] = useState([{
    company_name: '',
    job_title: '',
    employment_type: 'full_time',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    achievements: []
  }])

  // 자격증 정보
  const [certifications, setCertifications] = useState([{
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: ''
  }])

  const [skillInput, setSkillInput] = useState('')
  const [achievementInput, setAchievementInput] = useState('')

  useEffect(() => {
    checkExistingProfile()
  }, [])

  useEffect(() => {
    if (profile.province_id) {
      loadRegencies(profile.province_id)
    } else {
      setRegencies([])
    }
  }, [profile.province_id, supabase])

  useEffect(() => {
    if (profile.category_id) {
      loadSubcategories(profile.category_id)
    } else {
      setSubcategories([])
    }
  }, [profile.category_id, categories, supabase])

  const loadRegencies = async (provinceId) => {
    const { data: regenciesData } = await supabase
      .from('regencies')
      .select('regency_id, regency_name')
      .eq('province_id', provinceId)
      .order('regency_name')

    if (regenciesData) {
      setRegencies(regenciesData)
    }
  }

  const loadSubcategories = async (categoryId) => {
    const parentCategory = categories.find(cat => cat.category_id === parseInt(categoryId))
    if (!parentCategory) return

    const { data: subcategoriesData } = await supabase
      .from('categories')
      .select('category_id, name, icon')
      .eq('parent_category', parentCategory.name)
      .order('name')

    if (subcategoriesData) {
      setSubcategories(subcategoriesData)
    }
  }

  const checkExistingProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 기존 프로필 확인
    const { data: existingProfile } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', 'temp-user-id')
      .single()

    if (existingProfile) {
      setProfile(existingProfile)

      // 학력 정보 로드
      const { data: eduData } = await supabase
        .from('education')
        .select('*')
        .eq('candidate_id', existingProfile.id)
        .order('start_date', { ascending: false })

      if (eduData && eduData.length > 0) {
        setEducations(eduData)
      }

      // 경력 정보 로드
      const { data: expData } = await supabase
        .from('work_experience')
        .select('*')
        .eq('candidate_id', existingProfile.id)
        .order('start_date', { ascending: false })

      if (expData && expData.length > 0) {
        setExperiences(expData)
      }

      // 자격증 정보 로드
      const { data: certData } = await supabase
        .from('certifications')
        .select('*')
        .eq('candidate_id', existingProfile.id)
        .order('issue_date', { ascending: false })

      if (certData && certData.length > 0) {
        setCertifications(certData)
      }
    }
  }

  const handleResumeChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.')
        return
      }
      setResumeFile(file)
    }
  }

  const uploadResume = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `resumes/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('candidate-assets')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Resume upload error:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from('candidate-assets')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill)
    })
  }

  const addEducation = () => {
    setEducations([...educations, {
      institution: '',
      degree: 'sma',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: ''
    }])
  }

  const removeEducation = (index) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index))
    }
  }

  const updateEducation = (index, field, value) => {
    const updated = [...educations]
    updated[index][field] = value

    // is_current가 true면 end_date 비우기
    if (field === 'is_current' && value === true) {
      updated[index].end_date = ''
    }

    setEducations(updated)
  }

  const addExperience = () => {
    setExperiences([...experiences, {
      company_name: '',
      job_title: '',
      employment_type: 'full_time',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      achievements: []
    }])
  }

  const removeExperience = (index) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index))
    }
  }

  const updateExperience = (index, field, value) => {
    const updated = [...experiences]
    updated[index][field] = value

    if (field === 'is_current' && value === true) {
      updated[index].end_date = ''
    }

    setExperiences(updated)
  }

  const addAchievement = (expIndex, achievement) => {
    if (achievement.trim()) {
      const updated = [...experiences]
      updated[expIndex].achievements = [...updated[expIndex].achievements, achievement.trim()]
      setExperiences(updated)
      setAchievementInput('')
    }
  }

  const removeAchievement = (expIndex, achIndex) => {
    const updated = [...experiences]
    updated[expIndex].achievements = updated[expIndex].achievements.filter((_, i) => i !== achIndex)
    setExperiences(updated)
  }

  const addCertification = () => {
    setCertifications([...certifications, {
      name: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: ''
    }])
  }

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const updateCertification = (index, field, value) => {
    const updated = [...certifications]
    updated[index][field] = value
    setCertifications(updated)
  }

  const validateStep1 = () => {
    if (!profile.full_name || !profile.email || !profile.phone) {
      alert('이름, 이메일, 전화번호는 필수입니다.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    const hasValidEducation = educations.some(edu =>
      edu.institution && edu.degree && edu.start_date
    )

    if (!hasValidEducation) {
      alert('최소 하나의 학력 정보를 입력해주세요.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        alert('로그인이 필요합니다.')
        router.push('/login')
        return
      }

      // 이력서 업로드
      let resumeUrl = profile.resume_url
      if (resumeFile) {
        resumeUrl = await uploadResume(resumeFile)
        if (!resumeUrl) {
          alert('이력서 업로드 중 오류가 발생했습니다.')
          setLoading(false)
          return
        }
      }

      // 프로필 생성/업데이트
      let candidateId = profile.id

      if (!candidateId) {
        // 새 프로필 생성
        const { data: newProfile, error: profileError } = await supabase
          .from('candidate_profiles')
          .insert([{
            user_id: 'temp-user-id',
            ...profile,
            resume_url: resumeUrl
          }])
          .select()
          .single()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          alert('프로필 생성 중 오류가 발생했습니다.')
          return
        }

        candidateId = newProfile.id
      } else {
        // 기존 프로필 업데이트
        const { error: updateError } = await supabase
          .from('candidate_profiles')
          .update({
            ...profile,
            resume_url: resumeUrl
          })
          .eq('id', candidateId)

        if (updateError) {
          console.error('Profile update error:', updateError)
          alert('프로필 업데이트 중 오류가 발생했습니다.')
          return
        }
      }

      // 학력 정보 저장
      // 기존 데이터 삭제 후 재입력
      await supabase
        .from('education')
        .delete()
        .eq('candidate_id', candidateId)

      const validEducations = educations.filter(edu =>
        edu.institution && edu.degree
      ).map(edu => ({
        ...edu,
        candidate_id: candidateId
      }))

      if (validEducations.length > 0) {
        const { error: eduError } = await supabase
          .from('education')
          .insert(validEducations)

        if (eduError) {
          console.error('Education save error:', eduError)
        }
      }

      // 경력 정보 저장
      await supabase
        .from('work_experience')
        .delete()
        .eq('candidate_id', candidateId)

      const validExperiences = experiences.filter(exp =>
        exp.company_name && exp.job_title
      ).map(exp => ({
        ...exp,
        candidate_id: candidateId
      }))

      if (validExperiences.length > 0) {
        const { error: expError } = await supabase
          .from('work_experience')
          .insert(validExperiences)

        if (expError) {
          console.error('Experience save error:', expError)
        }
      }

      // 자격증 정보 저장
      await supabase
        .from('certifications')
        .delete()
        .eq('candidate_id', candidateId)

      const validCertifications = certifications.filter(cert =>
        cert.name && cert.issuing_organization
      ).map(cert => ({
        ...cert,
        candidate_id: candidateId
      }))

      if (validCertifications.length > 0) {
        const { error: certError } = await supabase
          .from('certifications')
          .insert(validCertifications)

        if (certError) {
          console.error('Certification save error:', certError)
        }
      }

      alert('프로필이 성공적으로 저장되었습니다!')
      router.push('/jobs/seeking') // 구직 페이지로 이동

    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[800px] mx-auto px-5">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-slate-700 mb-6">구직자 프로필 등록</h1>

          {/* 진행 상태 */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex-1 text-center ${currentStep >= 1 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-slate-700 text-white' : 'bg-gray-200'
              }`}>1</div>
              <div className="mt-2 text-sm">기본 정보</div>
            </div>
            <div className={`flex-1 text-center ${currentStep >= 2 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-slate-700 text-white' : 'bg-gray-200'
              }`}>2</div>
              <div className="mt-2 text-sm">학력</div>
            </div>
            <div className={`flex-1 text-center ${currentStep >= 3 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-slate-700 text-white' : 'bg-gray-200'
              }`}>3</div>
              <div className="mt-2 text-sm">경력</div>
            </div>
            <div className={`flex-1 text-center ${currentStep >= 4 ? 'text-slate-700' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                currentStep >= 4 ? 'bg-slate-700 text-white' : 'bg-gray-200'
              }`}>4</div>
              <div className="mt-2 text-sm">추가 정보</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: 기본 정보 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">기본 정보</h2>

                {/* 이름 */}
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-slate-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    required
                  />
                </div>

                {/* 생년월일, 성별 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-semibold text-slate-700 mb-2">
                      생년월일
                    </label>
                    <input
                      type="date"
                      id="date_of_birth"
                      value={profile.date_of_birth}
                      onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-2">
                      성별
                    </label>
                    <select
                      id="gender"
                      value={profile.gender}
                      onChange={(e) => setProfile({...profile, gender: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    >
                      <option value="">선택</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                    </select>
                  </div>
                </div>

                {/* 연락처 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* 지역 */}
                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2">거주 지역</div>
                  <div className="space-y-3">
                    <select
                      value={profile.province_id}
                      onChange={(e) => setProfile({...profile, province_id: e.target.value, regency_id: ''})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    >
                      <option value="">시/도 선택</option>
                      {provinces.map((province) => (
                        <option key={province.province_id} value={province.province_id}>
                          {province.province_name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={profile.regency_id}
                      onChange={(e) => setProfile({...profile, regency_id: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      disabled={!profile.province_id}
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

                {/* 희망 직종 */}
                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2">희망 직종</div>
                  <div className="space-y-3">
                    <select
                      value={profile.category_id}
                      onChange={(e) => setProfile({...profile, category_id: e.target.value, subcategory_id: ''})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    >
                      <option value="">대분류 선택</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={profile.subcategory_id}
                      onChange={(e) => setProfile({...profile, subcategory_id: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      disabled={!profile.category_id}
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

                {/* 현재 직함 및 경력 수준 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="current_title" className="block text-sm font-semibold text-slate-700 mb-2">
                      현재 직함
                    </label>
                    <input
                      type="text"
                      id="current_title"
                      value={profile.current_title}
                      onChange={(e) => setProfile({...profile, current_title: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      placeholder="예: Software Developer"
                    />
                  </div>
                  <div>
                    <label htmlFor="experience_level" className="block text-sm font-semibold text-slate-700 mb-2">
                      경력 수준
                    </label>
                    <select
                      id="experience_level"
                      value={profile.experience_level}
                      onChange={(e) => setProfile({...profile, experience_level: e.target.value})}
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
                </div>

                {/* 희망 급여 */}
                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2">희망 급여 (IDR)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={profile.expected_salary_min}
                      onChange={(e) => setProfile({...profile, expected_salary_min: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      placeholder="최소 급여"
                    />
                    <input
                      type="number"
                      value={profile.expected_salary_max}
                      onChange={(e) => setProfile({...profile, expected_salary_max: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      placeholder="최대 급여"
                    />
                  </div>
                </div>

                {/* 보유 기술 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    보유 기술
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      placeholder="예: JavaScript, Python"
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
                    {profile.skills.map((skill, index) => (
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

                {/* 자기소개 */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-2">
                    자기소개
                  </label>
                  <textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none h-32"
                    placeholder="간단한 자기소개를 작성해주세요..."
                  />
                </div>

                {/* 공개 설정 */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.is_profile_public}
                      onChange={(e) => setProfile({...profile, is_profile_public: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">프로필을 공개합니다</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.is_open_to_work}
                      onChange={(e) => setProfile({...profile, is_open_to_work: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">구직 중임을 표시합니다</span>
                  </label>
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

            {/* Step 2: 학력 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-700">학력 정보</h2>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    + 학력 추가
                  </button>
                </div>

                {educations.map((edu, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">학력 {index + 1}</h3>
                      {educations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        학교명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          학위 <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          required
                        >
                          <option value="sma">고등학교 (SMA/SMK)</option>
                          <option value="d3">전문학사 (D3)</option>
                          <option value="s1">학사 (S1)</option>
                          <option value="s2">석사 (S2)</option>
                          <option value="s3">박사 (S3)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          전공
                        </label>
                        <input
                          type="text"
                          value={edu.field_of_study}
                          onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          시작일 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={edu.start_date}
                          onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          종료일
                        </label>
                        <input
                          type="date"
                          value={edu.end_date}
                          onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          disabled={edu.is_current}
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={edu.is_current}
                        onChange={(e) => updateEducation(index, 'is_current', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">현재 재학 중</span>
                    </label>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        설명
                      </label>
                      <textarea
                        value={edu.description}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none h-24"
                        placeholder="관련 활동이나 성과를 작성해주세요..."
                      />
                    </div>
                  </div>
                ))}

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

            {/* Step 3: 경력 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-700">경력 정보</h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    + 경력 추가
                  </button>
                </div>

                {experiences.map((exp, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">경력 {index + 1}</h3>
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          회사명
                        </label>
                        <input
                          type="text"
                          value={exp.company_name}
                          onChange={(e) => updateExperience(index, 'company_name', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          직함
                        </label>
                        <input
                          type="text"
                          value={exp.job_title}
                          onChange={(e) => updateExperience(index, 'job_title', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          고용 형태
                        </label>
                        <select
                          value={exp.employment_type}
                          onChange={(e) => updateExperience(index, 'employment_type', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                        >
                          <option value="full_time">정규직</option>
                          <option value="part_time">파트타임</option>
                          <option value="contract">계약직</option>
                          <option value="internship">인턴십</option>
                          <option value="freelance">프리랜서</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          근무 지역
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          placeholder="예: Jakarta"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          시작일
                        </label>
                        <input
                          type="date"
                          value={exp.start_date}
                          onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          종료일
                        </label>
                        <input
                          type="date"
                          value={exp.end_date}
                          onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          disabled={exp.is_current}
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exp.is_current}
                        onChange={(e) => updateExperience(index, 'is_current', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">현재 재직 중</span>
                    </label>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        업무 설명
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none h-24"
                        placeholder="담당 업무를 설명해주세요..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        주요 성과
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={achievementInput}
                          onChange={(e) => setAchievementInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addAchievement(index, achievementInput)
                            }
                          }}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          placeholder="예: 매출 20% 증가"
                        />
                        <button
                          type="button"
                          onClick={() => addAchievement(index, achievementInput)}
                          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                        >
                          추가
                        </button>
                      </div>
                      <div className="space-y-1">
                        {exp.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex items-center gap-2">
                            <span className="text-sm">• {achievement}</span>
                            <button
                              type="button"
                              onClick={() => removeAchievement(index, achIndex)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                  >
                    이전 단계
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
                  >
                    다음 단계
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: 추가 정보 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">추가 정보</h2>

                {/* 자격증 */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">자격증</h3>
                    <button
                      type="button"
                      onClick={addCertification}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      + 자격증 추가
                    </button>
                  </div>

                  {certifications.map((cert, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 space-y-4 mb-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">자격증 {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            자격증명
                          </label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            발급 기관
                          </label>
                          <input
                            type="text"
                            value={cert.issuing_organization}
                            onChange={(e) => updateCertification(index, 'issuing_organization', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            취득일
                          </label>
                          <input
                            type="date"
                            value={cert.issue_date}
                            onChange={(e) => updateCertification(index, 'issue_date', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            만료일
                          </label>
                          <input
                            type="date"
                            value={cert.expiry_date}
                            onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          자격증 번호
                        </label>
                        <input
                          type="text"
                          value={cert.credential_id}
                          onChange={(e) => updateCertification(index, 'credential_id', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 이력서 업로드 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    이력서 업로드
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="w-full"
                  />
                  {profile.resume_url && (
                    <p className="mt-2 text-sm text-gray-600">
                      현재 이력서가 업로드되어 있습니다.
                    </p>
                  )}
                </div>

                {/* 포트폴리오 링크 */}
                <div>
                  <label htmlFor="portfolio_url" className="block text-sm font-semibold text-slate-700 mb-2">
                    포트폴리오 URL
                  </label>
                  <input
                    type="url"
                    id="portfolio_url"
                    value={profile.portfolio_url}
                    onChange={(e) => setProfile({...profile, portfolio_url: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    placeholder="https://"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedin_url" className="block text-sm font-semibold text-slate-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    placeholder="https://linkedin.com/in/"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                  >
                    이전 단계
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
                  >
                    {loading ? '저장 중...' : '프로필 저장'}
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