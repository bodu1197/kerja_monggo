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
    <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s'}}>
      <div
        style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'}}
        onClick={onClose}
      ></div>

      <div style={{position: 'relative', maxWidth: '600px', width: '100%', background: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', transform: isOpen ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #e5e7eb'}}>
          <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#2c3e50', margin: 0}}>검색 필터</h3>
          <button
            onClick={onClose}
            style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#666', transition: 'color 0.3s'}}
          >
            <svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{flex: 1, overflowY: 'auto', padding: '24px'}}>
          {/* 유형 선택 */}
          <div style={{marginBottom: '28px'}}>
            <label style={{display: 'block', fontSize: '15px', fontWeight: '600', color: '#2c3e50', marginBottom: '12px'}}>유형</label>
            <div style={{display: 'flex', gap: '8px'}}>
              {['all', 'job', 'worker'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '2px solid',
                    borderColor: selectedType === type ? '#2c3e50' : '#e5e7eb',
                    background: selectedType === type ? '#2c3e50' : 'white',
                    color: selectedType === type ? 'white' : '#666'
                  }}
                >
                  {type === 'all' ? '전체' : type === 'job' ? '구직' : '구인'}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 선택 */}
          <div style={{marginBottom: '28px'}}>
            <label style={{display: 'block', fontSize: '15px', fontWeight: '600', color: '#2c3e50', marginBottom: '12px'}}>Wilayah (지역)</label>
            <div style={{position: 'relative', marginBottom: '12px'}}>
              <select
                id="filterRegion1"
                value={region1}
                onChange={(e) => setRegion1(e.target.value)}
                style={{width: '100%', height: '52px', padding: '0 48px 0 16px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', color: '#333', cursor: 'pointer', appearance: 'none', outline: 'none'}}
              >
                <option value="">모든 지역</option>
                <option value="jakarta">Jakarta</option>
                <option value="surabaya">Surabaya</option>
                <option value="bandung">Bandung</option>
                <option value="medan">Medan</option>
                <option value="bali">Bali</option>
              </select>
              <svg style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#666', pointerEvents: 'none'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <div style={{position: 'relative'}}>
              <select
                id="filterRegion2"
                value={region2}
                onChange={(e) => setRegion2(e.target.value)}
                disabled={!region1}
                style={{width: '100%', height: '52px', padding: '0 48px 0 16px', background: region1 ? 'white' : '#f3f4f6', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', color: region1 ? '#333' : '#999', cursor: region1 ? 'pointer' : 'not-allowed', appearance: 'none', outline: 'none'}}
              >
                <option value="">세부 지역</option>
                {region2Options.map((r) => (
                  <option key={r} value={r.toLowerCase().replace(/\s+/g, '-')}>{r}</option>
                ))}
              </select>
              <svg style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#666', pointerEvents: 'none'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* 직업 선택 */}
          <div style={{marginBottom: '28px'}}>
            <label style={{display: 'block', fontSize: '15px', fontWeight: '600', color: '#2c3e50', marginBottom: '12px'}}>Pekerjaan (직업)</label>
            <div style={{position: 'relative', marginBottom: '12px'}}>
              <select
                id="filterJob1"
                value={job1}
                onChange={(e) => setJob1(e.target.value)}
                style={{width: '100%', height: '52px', padding: '0 48px 0 16px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', color: '#333', cursor: 'pointer', appearance: 'none', outline: 'none'}}
              >
                <option value="">모든 직업</option>
                <option value="it">IT & Teknologi</option>
                <option value="finance">Keuangan & Akuntansi</option>
                <option value="marketing">Marketing & Penjualan</option>
                <option value="education">Pendidikan</option>
                <option value="healthcare">Kesehatan</option>
              </select>
              <svg style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#666', pointerEvents: 'none'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <div style={{position: 'relative'}}>
              <select
                id="filterJob2"
                value={job2}
                onChange={(e) => setJob2(e.target.value)}
                disabled={!job1}
                style={{width: '100%', height: '52px', padding: '0 48px 0 16px', background: job1 ? 'white' : '#f3f4f6', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', color: job1 ? '#333' : '#999', cursor: job1 ? 'pointer' : 'not-allowed', appearance: 'none', outline: 'none'}}
              >
                <option value="">세부 직업</option>
                {job2Options.map((j) => (
                  <option key={j} value={j.toLowerCase().replace(/\s+/g, '-')}>{j}</option>
                ))}
              </select>
              <svg style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#666', pointerEvents: 'none'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* 버튼 */}
          <div style={{display: 'flex', gap: '12px', marginTop: '8px'}}>
            <button
              onClick={handleReset}
              style={{flex: 1, padding: '14px', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', background: '#f3f4f6', color: '#666'}}
            >
              초기화
            </button>
            <button
              onClick={handleApply}
              style={{flex: 1, padding: '14px', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', background: '#2c3e50', color: 'white'}}
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
