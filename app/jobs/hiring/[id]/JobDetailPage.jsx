'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '../../../components/Footer'
import { IoLocationSharp, IoCall, IoBriefcase, IoTime, IoSchool, IoCash, IoArrowBack, IoCalendar } from 'react-icons/io5'
import { FaWhatsapp, FaEnvelope, FaShareAlt, FaFlag } from 'react-icons/fa'

export default function JobDetailPage({ job }) {
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Gaji tidak disebutkan'
    if (min && max) {
      return `Rp ${min.toLocaleString('id-ID')} - Rp ${max.toLocaleString('id-ID')}`
    }
    if (min) return `Mulai Rp ${min.toLocaleString('id-ID')}`
    if (max) return `Sampai Rp ${max.toLocaleString('id-ID')}`
  }

  const handleShare = async (method) => {
    const url = window.location.href
    const title = job.title
    const text = `${job.title} - ${job.company_name || 'Lowongan Kerja'}`

    if (method === 'copy') {
      await navigator.clipboard.writeText(url)
      alert('Link berhasil disalin!')
      setShowShareDialog(false)
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    }
  }

  const handleReport = (reason) => {
    console.log('Report reason:', reason)
    // Implement report functionality
    alert('Laporan berhasil dikirim. Terima kasih!')
    setShowReportDialog(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 md:hidden shadow-sm">
        <div className="flex items-center p-4">
          <Link href="/jobs/hiring" className="mr-4">
            <IoArrowBack className="text-2xl text-gray-700" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 truncate flex-1">{job.title}</h1>
          <button onClick={() => setShowShareDialog(true)} className="ml-4">
            <FaShareAlt className="text-xl text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        {/* Desktop Back Button */}
        <div className="hidden md:flex items-center mb-6">
          <Link href="/jobs/hiring" className="flex items-center text-gray-600 hover:text-gray-800 transition">
            <IoArrowBack className="mr-2" />
            Kembali ke daftar lowongan
          </Link>
        </div>

        {/* Job Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              {job.company_name && (
                <h2 className="text-xl text-gray-700 mb-3">{job.company_name}</h2>
              )}
              <div className="flex items-center text-gray-600 mb-2">
                <IoLocationSharp className="mr-2" />
                <span>{job.province_name}, {job.regency_name}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  {job.category_name}
                </span>
                {job.subcategory_name && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {job.subcategory_name}
                  </span>
                )}
                {job.employment_type && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {job.employment_type === 'full_time' ? 'Full Time' :
                     job.employment_type === 'part_time' ? 'Part Time' :
                     job.employment_type === 'contract' ? 'Kontrak' :
                     job.employment_type === 'freelance' ? 'Freelance' :
                     job.employment_type === 'internship' ? 'Magang' : job.employment_type}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden md:flex flex-col gap-2">
              <button
                onClick={() => setShowShareDialog(true)}
                className="p-2 text-gray-500 hover:text-gray-700 transition"
              >
                <FaShareAlt className="text-xl" />
              </button>
              <button
                onClick={() => setShowReportDialog(true)}
                className="p-2 text-gray-500 hover:text-red-600 transition"
              >
                <FaFlag className="text-xl" />
              </button>
            </div>
          </div>

          {/* Posted Date */}
          <div className="text-sm text-gray-500 mt-4">
            Diposting: {new Date(job.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* 마감기일 - 최우선 표시 */}
          {job.deadline && (
            <div className="bg-white border-2 border-red-200 rounded-lg p-4 shadow-sm">
              <IoCalendar className="text-2xl text-red-600 mb-2" />
              <h3 className="text-sm font-semibold text-gray-700">마감기일</h3>
              <p className="text-sm font-bold text-red-700">
                {new Date(job.deadline).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24))}일 남음
              </p>
            </div>
          )}

          {/* 근무 형태 */}
          {job.employment_type && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <IoBriefcase className="text-2xl text-blue-600 mb-2" />
              <h3 className="text-sm font-semibold text-gray-700">근무 형태</h3>
              <p className="text-sm font-bold text-gray-900">
                {job.employment_type === 'full_time' ? 'Full Time' :
                 job.employment_type === 'part_time' ? 'Part Time' :
                 job.employment_type === 'contract' ? 'Kontrak' :
                 job.employment_type === 'freelance' ? 'Freelance' :
                 job.employment_type === 'internship' ? 'Magang' : job.employment_type}
              </p>
            </div>
          )}

          {/* 급여 */}
          {(job.salary_min || job.salary_max) && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <IoCash className="text-2xl text-green-600 mb-2" />
              <h3 className="text-sm font-semibold text-gray-700">Gaji</h3>
              <p className="text-sm font-bold text-gray-900">
                {formatSalary(job.salary_min, job.salary_max)}
              </p>
            </div>
          )}

          {/* 경험 */}
          {job.experience_level && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <IoBriefcase className="text-2xl text-indigo-600 mb-2" />
              <h3 className="text-sm font-semibold text-gray-700">경력</h3>
              <p className="text-sm font-bold text-gray-900">
                {job.experience_level === 'entry' ? 'Entry Level' :
                 job.experience_level === 'junior' ? 'Junior' :
                 job.experience_level === 'mid' ? 'Mid Level' :
                 job.experience_level === 'senior' ? 'Senior' :
                 job.experience_level === 'lead' ? 'Lead' :
                 job.experience_level === 'executive' ? 'Executive' : job.experience_level}
              </p>
            </div>
          )}

          {/* 학력 */}
          {job.education_level && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <IoSchool className="text-2xl text-purple-600 mb-2" />
              <h3 className="text-sm font-semibold text-gray-700">최소 학력</h3>
              <p className="text-sm font-bold text-gray-900">
                {job.education_level === 'sma' ? 'SMA/SMK' :
                 job.education_level === 'd3' ? 'D3' :
                 job.education_level === 's1' ? 'S1' :
                 job.education_level === 's2' ? 'S2' :
                 job.education_level === 's3' ? 'S3' : job.education_level}
              </p>
            </div>
          )}

          {/* 상태 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <IoTime className="text-2xl text-orange-600 mb-2" />
            <h3 className="text-sm font-semibold text-gray-700">공고 상태</h3>
            <p className="text-sm font-bold text-gray-900">
              {job.status === 'active' ? '모집 중' :
               job.status === 'paused' ? '일시중지' :
               job.status === 'closed' ? '마감' :
               job.status === 'filled' ? '채용완료' : job.status}
            </p>
          </div>
        </div>

        {/* Company Info */}
        {(job.company_name || job.province_name) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <IoBriefcase className="mr-2 text-blue-600" />
              회사 정보
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {job.company_name && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">회사명</h3>
                  <p className="text-base font-bold text-gray-900">{job.company_name}</p>
                </div>
              )}
              {job.province_name && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                    <IoLocationSharp className="mr-1" />
                    위치
                  </h3>
                  <p className="text-base text-gray-900">{job.province_name}, {job.regency_name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">업무 내용</h2>
          <div className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">{job.description}</div>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Persyaratan</h2>
            <div className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">{job.requirements}</div>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Benefit</h2>
            <div className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">{job.benefits}</div>
          </div>
        )}

        {/* Contact CTA - Mobile Sticky */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden shadow-lg">
          <button
            onClick={() => setShowContactDialog(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Hubungi Perusahaan
          </button>
        </div>

        {/* Contact CTA - Desktop */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tertarik dengan lowongan ini?</h2>
          <button
            onClick={() => setShowContactDialog(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Hubungi Perusahaan
          </button>
        </div>

        {/* Report Button - Mobile */}
        <div className="md:hidden text-center mb-20">
          <button
            onClick={() => setShowReportDialog(true)}
            className="text-gray-500 text-sm flex items-center justify-center mx-auto"
          >
            <FaFlag className="mr-2" />
            Laporkan lowongan ini
          </button>
        </div>
      </div>

      {/* Contact Dialog */}
      {showContactDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowContactDialog(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <IoCall className="text-3xl text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Hubungi Perusahaan</h3>
              <p className="text-gray-600 text-sm">Pilih metode kontak untuk melamar posisi ini</p>
            </div>

            <div className="space-y-3">
              {job.whatsapp && (
                <a
                  href={`https://wa.me/${job.whatsapp}?text=${encodeURIComponent(`Halo, saya tertarik dengan lowongan ${job.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center">
                    <FaWhatsapp className="text-3xl mr-4" />
                    <div className="text-left">
                      <p className="font-bold text-lg">Chat via WhatsApp</p>
                      <p className="text-green-100 text-sm">{job.whatsapp}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {job.phone && (
                <a
                  href={`tel:${job.phone}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center">
                    <IoCall className="text-3xl mr-4" />
                    <div className="text-left">
                      <p className="font-bold text-lg">Telepon Langsung</p>
                      <p className="text-blue-100 text-sm">{job.phone}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {job.email && (
                <a
                  href={`mailto:${job.email}?subject=${encodeURIComponent(`Lamaran untuk ${job.title}`)}&body=${encodeURIComponent('Kepada Yth. HRD,\n\nSaya tertarik untuk melamar posisi ' + job.title + '.\n\n')}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center">
                    <FaEnvelope className="text-3xl mr-4" />
                    <div className="text-left">
                      <p className="font-bold text-lg">Kirim Email</p>
                      <p className="text-purple-100 text-sm">{job.email}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {job.contact && !job.whatsapp && !job.phone && !job.email && (
                <div className="p-4 bg-gray-100 border-2 border-gray-300 rounded-xl">
                  <p className="text-gray-900 font-bold mb-2 text-center">Informasi Kontak</p>
                  <p className="text-gray-700 text-center">{job.contact}</p>
                </div>
              )}

              {!job.whatsapp && !job.phone && !job.email && !job.contact && (
                <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
                  <p className="text-yellow-800 font-semibold">Informasi kontak tidak tersedia</p>
                  <p className="text-yellow-700 text-sm mt-1">Silakan coba lagi nanti</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowContactDialog(false)}
              className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Bagikan Lowongan</h3>

            <div className="space-y-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
              >
                <FaWhatsapp className="text-xl text-green-600 mr-2" />
                <span className="text-gray-800">Share ke WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
              >
                <span className="text-gray-800">Salin Link</span>
              </button>
            </div>

            <button
              onClick={() => setShowShareDialog(false)}
              className="w-full mt-4 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Laporkan Lowongan</h3>
            <p className="text-gray-600 mb-4">Pilih alasan pelaporan:</p>

            <div className="space-y-2">
              {['Penipuan', 'Konten Tidak Pantas', 'Spam', 'Informasi Palsu', 'Lainnya'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-left hover:border-green-500 transition"
                >
                  <span className="text-gray-800">{reason}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowReportDialog(false)}
              className="w-full mt-4 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}