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
    education_level: 'sma',
    resume_url: '',
    portfolio_url: '',
    linkedin_url: '',
    title: '',
    bio: '',
    is_profile_public: true,
    is_open_to_work: true,
  })

  // 학력 정보

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
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      setProfile({
        ...profile,
        ...existingProfile
      })
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
            user_id: user.id,
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 기본 정보 */}
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
                  <div className="block text-sm font-semibold text-slate-700 mb-2">취업 희망지역</div>
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

                {/* 글 제목 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                    글 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={profile.title}
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    placeholder="예: 열정 넘치는 개발자 구직합니다"
                    required
                  />
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
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
                >
                  {loading ? '저장 중...' : '프로필 저장'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}