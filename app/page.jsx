'use client'

import { useState } from 'react'
import Header from './components/Header'
import Banner from './components/Banner'
import FilterBar from './components/FilterBar'
import JobCard from './components/JobCard'
import FilterPanel from './components/FilterPanel'
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

export default function Home() {
  const [filteredJobs, setFilteredJobs] = useState(sampleJobs)
  const [filterSummary, setFilterSummary] = useState('모든 구인/구직 정보')
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  return (
    <>
      <Header />
      <Banner />

      <main className="flex-1 bg-[#fafafa] relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        <FilterBar
          filterSummary={filterSummary}
          onFilterClick={() => setIsFilterPanelOpen(true)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {filteredJobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))}
        </div>
      </main>

      <Footer />

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        sampleJobs={sampleJobs}
        onApplyFilter={(jobs, summary) => {
          setFilteredJobs(jobs)
          setFilterSummary(summary)
          setIsFilterPanelOpen(false)
        }}
      />

      <BottomTab onSearchClick={() => setIsFilterPanelOpen(true)} />
    </>
  )
}
