'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'
import Banner from './components/Banner'
import JobCard from './components/JobCard'
import Footer from './components/Footer'
import BottomTab from './components/BottomTab'

// Sample job data
const sampleJobs = [
  { type: 'job', title: 'Software Developer dicari', region: 'Jakarta Pusat', category: 'IT & Teknologi', subcategory: 'Software Developer', description: '3년 이상 경력의 소프트웨어 개발자를 찾습니다.', days: 1 },
  { type: 'worker', title: 'Web Developer 구함', region: 'Jakarta Selatan', category: 'IT & Teknologi', subcategory: 'Web Developer', description: 'React 및 Node.js 경험이 있는 개발자', days: 2 },
  { type: 'job', title: 'Marketing Manager 채용', region: 'Surabaya Pusat', category: 'Marketing & Penjualan', subcategory: 'Marketing Manager', description: '디지털 마케팅 전문가를 찾습니다.', days: 3 },
  { type: 'worker', title: 'Akuntan 필요', region: 'Bandung Kota', category: 'Keuangan & Akuntansi', subcategory: 'Akuntan', description: '회계 자격증 소지자 우대', days: 1 },
  { type: 'job', title: 'Guru 구인', region: 'Medan Kota', category: 'Pendidikan', subcategory: 'Guru', description: '초등학교 교사를 모집합니다.', days: 4 },
  { type: 'worker', title: 'Perawat 급구', region: 'Denpasar', category: 'Kesehatan', subcategory: 'Perawat', description: '병원 간호사 경력 2년 이상', days: 1 },
  { type: 'job', title: 'Data Analyst 채용', region: 'Jakarta Timur', category: 'IT & Teknologi', subcategory: 'Data Analyst', description: 'Python 및 SQL 능통자', days: 5 },
  { type: 'worker', title: 'Sales Executive', region: 'Surabaya Selatan', category: 'Marketing & Penjualan', subcategory: 'Sales Executive', description: 'B2B 영업 경험자 우대', days: 2 },
  { type: 'job', title: 'UI/UX Designer', region: 'Bandung Barat', category: 'IT & Teknologi', subcategory: 'UI/UX Designer', description: 'Figma 및 Adobe XD 사용 가능자', days: 3 },
  { type: 'worker', title: 'Dokter 구함', region: 'Badung', category: 'Kesehatan', subcategory: 'Dokter', description: '일반의 또는 전문의', days: 1 },
  { type: 'job', title: 'Digital Marketing', region: 'Jakarta Barat', category: 'Marketing & Penjualan', subcategory: 'Digital Marketing', description: 'SNS 마케팅 전문가', days: 2 },
  { type: 'worker', title: 'System Administrator', region: 'Cimahi', category: 'IT & Teknologi', subcategory: 'System Administrator', description: 'Linux 서버 관리 경험', days: 4 }
]

const regionData = {
  jakarta: ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Barat'],
  surabaya: ['Surabaya Pusat', 'Surabaya Utara', 'Surabaya Selatan', 'Surabaya Timur', 'Surabaya Barat'],
  bandung: ['Bandung Kota', 'Bandung Barat', 'Cimahi', 'Kabupaten Bandung'],
  medan: ['Medan Kota', 'Medan Utara', 'Medan Selatan', 'Deli Serdang'],
  bali: ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Ubud']
}

const jobData = {
  it: ['Software Developer', 'Web Developer', 'Data Analyst', 'System Administrator', 'UI/UX Designer'],
  finance: ['Akuntan', 'Analis Keuangan', 'Auditor', 'Kasir', 'Manager Keuangan'],
  marketing: ['Marketing Manager', 'Sales Executive', 'Digital Marketing', 'Brand Manager', 'Account Executive'],
  education: ['Guru', 'Dosen', 'Tutor', 'Kepala Sekolah', 'Konselor'],
  healthcare: ['Dokter', 'Perawat', 'Apoteker', 'Bidan', 'Ahli Gizi']
}

export default function Home() {
  const [filteredJobs, setFilteredJobs] = useState(sampleJobs)
  const [selectedType, setSelectedType] = useState('all')
  const [region1, setRegion1] = useState('')
  const [region2, setRegion2] = useState('')
  const [job1, setJob1] = useState('')
  const [job2, setJob2] = useState('')
  const [region2Options, setRegion2Options] = useState([])
  const [job2Options, setJob2Options] = useState([])

  useEffect(() => {
    if (region1 && regionData[region1]) {
      setRegion2Options(regionData[region1])
      setRegion2('')
    } else {
      setRegion2Options([])
      setRegion2('')
    }
  }, [region1])

  useEffect(() => {
    if (job1 && jobData[job1]) {
      setJob2Options(jobData[job1])
      setJob2('')
    } else {
      setJob2Options([])
      setJob2('')
    }
  }, [job1])

  useEffect(() => {
    handleApply()
  }, [selectedType, region1, region2, job1, job2])

  const handleReset = () => {
    setSelectedType('all')
    setRegion1('')
    setRegion2('')
    setJob1('')
    setJob2('')
  }

  const handleApply = () => {
    let filtered = sampleJobs.filter(job => {
      if (selectedType !== 'all' && job.type !== selectedType) return false

      if (region1) {
        const region1Text = document.querySelector(`#filterRegion1 option[value="${region1}"]`)?.textContent || ''
        if (!job.region.includes(region1Text.split(' ')[0])) return false
      }

      if (job1) {
        const job1Text = document.querySelector(`#filterJob1 option[value="${job1}"]`)?.textContent || ''
        if (job.category !== job1Text) return false
      }

      if (job2) {
        const job2Text = document.querySelector(`#filterJob2 option[value="${job2}"]`)?.textContent || ''
        if (job.subcategory !== job2Text) return false
      }

      return true
    })

    setFilteredJobs(filtered)
  }

  return (
    <>
      <Header />
      <Banner />

      <main className="flex-1 p-0 text-[#333] bg-[#fafafa] relative pb-20">
        <div className="absolute top-0 left-0 right-0 h-px" style={{background: 'linear-gradient(90deg, transparent, #e0e0e0 20%, #e0e0e0 80%, transparent)'}}></div>

        {/* 검색 필터 영역 */}
        <div className="max-w-[1200px] mx-auto px-5 py-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-6">검색 필터</h2>

            {/* 유형 선택 */}
            <div className="mb-6">
              <label className="block text-[15px] font-semibold text-[#2c3e50] mb-3">유형</label>
              <div className="flex gap-2">
                {['all', 'job', 'worker'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex-1 px-3 py-3 rounded-[10px] text-sm font-semibold cursor-pointer transition-all border-2 ${
                      selectedType === type
                        ? 'bg-[#2c3e50] border-[#2c3e50] text-white'
                        : 'bg-white border-[#e0e0e0] text-[#666] hover:border-[#2c3e50] hover:text-[#2c3e50]'
                    }`}
                  >
                    {type === 'all' ? '전체' : type === 'job' ? '구직' : '구인'}
                  </button>
                ))}
              </div>
            </div>

            {/* 지역 선택 */}
            <div className="mb-6">
              <label className="block text-[15px] font-semibold text-[#2c3e50] mb-3">Wilayah (지역)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    id="filterRegion1"
                    value={region1}
                    onChange={(e) => setRegion1(e.target.value)}
                    className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-[#e0e0e0] rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
                  >
                    <option value="">모든 지역</option>
                    <option value="jakarta">Jakarta</option>
                    <option value="surabaya">Surabaya</option>
                    <option value="bandung">Bandung</option>
                    <option value="medan">Medan</option>
                    <option value="bali">Bali</option>
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
                      <option key={r} value={r.toLowerCase().replace(/\s+/g, '-')}>{r}</option>
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
              <label className="block text-[15px] font-semibold text-[#2c3e50] mb-3">Pekerjaan (직업)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    id="filterJob1"
                    value={job1}
                    onChange={(e) => setJob1(e.target.value)}
                    className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-[#e0e0e0] rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
                  >
                    <option value="">모든 직업</option>
                    <option value="it">IT & Teknologi</option>
                    <option value="finance">Keuangan & Akuntansi</option>
                    <option value="marketing">Marketing & Penjualan</option>
                    <option value="education">Pendidikan</option>
                    <option value="healthcare">Kesehatan</option>
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
                      <option key={j} value={j.toLowerCase().replace(/\s+/g, '-')}>{j}</option>
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
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">
              검색 결과 ({filteredJobs.length}개)
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {filteredJobs.map((job, index) => (
                <JobCard key={index} job={job} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomTab />
    </>
  )
}
