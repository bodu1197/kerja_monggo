'use client'

import { useState, useEffect } from 'react'

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

export default function FilterPanel({ isOpen, onClose, sampleJobs, onApplyFilter }) {
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

    // Build summary
    const parts = []
    if (selectedType !== 'all') {
      parts.push(selectedType === 'job' ? '구직' : '구인')
    }
    if (region1) {
      const region1Text = document.querySelector(`#filterRegion1 option[value="${region1}"]`)?.textContent || ''
      parts.push(region1Text)
    }
    if (job1) {
      const job1Text = document.querySelector(`#filterJob1 option[value="${job1}"]`)?.textContent || ''
      parts.push(job1Text)
    }
    const summary = parts.length > 0 ? parts.join(' · ') : '모든 구인/구직 정보'

    onApplyFilter(filtered, summary)
  }

  if (!isOpen) return null

  return (
    <div className={`fixed top-0 left-0 w-full h-full z-[2000] flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div
        className="absolute top-0 left-0 w-full h-full bg-black/50"
        style={{backdropFilter: 'blur(4px)'}}
        onClick={onClose}
      ></div>

      <div className={`relative max-w-[600px] w-full bg-white rounded-t-3xl max-h-[85vh] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-between items-center px-6 py-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-[#2c3e50] m-0">검색 필터</h3>
          <button
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer p-2 text-[#666] transition-colors hover:text-black"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* 유형 선택 */}
          <div className="mb-7">
            <label className="block text-[15px] font-semibold text-[#2c3e50] mb-3">유형</label>
            <div className="flex gap-2">
              {['all', 'job', 'worker'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex-1 px-3 py-3 rounded-[10px] text-sm font-semibold cursor-pointer transition-all border-2 ${
                    selectedType === type
                      ? 'bg-[#2c3e50] border-[#2c3e50] text-white'
                      : 'bg-white border-gray-200 text-[#666] hover:border-[#2c3e50] hover:text-[#2c3e50]'
                  }`}
                >
                  {type === 'all' ? '전체' : type === 'job' ? '구직' : '구인'}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 선택 */}
          <div className="mb-7">
            <label className="block text-[15px] font-semibold text-[#2c3e50] mb-3">Wilayah (지역)</label>
            <div className="relative mb-3">
              <select
                id="filterRegion1"
                value={region1}
                onChange={(e) => setRegion1(e.target.value)}
                className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-gray-200 rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-gray-100 disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
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
                className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-gray-200 rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-gray-100 disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
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

          {/* 직업 선택 */}
          <div className="mb-7">
            <label className="block text-[15px] font-semibold text-[#2c3e50] mb-3">Pekerjaan (직업)</label>
            <div className="relative mb-3">
              <select
                id="filterJob1"
                value={job1}
                onChange={(e) => setJob1(e.target.value)}
                className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-gray-200 rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-gray-100 disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
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
                className="w-full h-[52px] px-4 pr-12 bg-white border-2 border-gray-200 rounded-xl text-[15px] text-[#333] cursor-pointer transition-all focus:outline-none focus:border-[#2c3e50] focus:ring-4 focus:ring-[#2c3e50]/10 disabled:bg-gray-100 disabled:text-[#999] disabled:cursor-not-allowed appearance-none"
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

          {/* 버튼 */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 border-none rounded-[10px] text-[15px] font-semibold cursor-pointer transition-all bg-gray-100 text-[#666] hover:bg-gray-200 hover:text-[#333]"
            >
              초기화
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3.5 border-none rounded-[10px] text-[15px] font-semibold cursor-pointer transition-all bg-[#2c3e50] text-white hover:bg-[#34495e]"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
