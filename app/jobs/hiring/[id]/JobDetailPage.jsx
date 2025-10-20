'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '../../../components/Footer'
import { IoLocationSharp, IoCall, IoBriefcase, IoTime, IoSchool, IoCash, IoArrowBack } from 'react-icons/io5'
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {job.salary_min || job.salary_max ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <IoCash className="text-2xl text-green-600 mb-2" />
              <h3 className="text-sm text-gray-600">Gaji</h3>
              <p className="text-sm font-semibold text-gray-900">
                {formatSalary(job.salary_min, job.salary_max)}
              </p>
            </div>
          ) : null}

          {job.experience_level && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <IoBriefcase className="text-2xl text-blue-600 mb-2" />
              <h3 className="text-sm text-gray-600">Pengalaman</h3>
              <p className="text-sm font-semibold text-gray-900">
                {job.experience_level === 'entry' ? 'Entry Level' :
                 job.experience_level === 'junior' ? 'Junior' :
                 job.experience_level === 'mid' ? 'Mid Level' :
                 job.experience_level === 'senior' ? 'Senior' :
                 job.experience_level === 'lead' ? 'Lead' :
                 job.experience_level === 'executive' ? 'Executive' : job.experience_level}
              </p>
            </div>
          )}

          {job.education_level && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <IoSchool className="text-2xl text-purple-600 mb-2" />
              <h3 className="text-sm text-gray-600">Pendidikan</h3>
              <p className="text-sm font-semibold text-gray-900">
                {job.education_level === 'sma' ? 'SMA/SMK' :
                 job.education_level === 'd3' ? 'D3' :
                 job.education_level === 's1' ? 'S1' :
                 job.education_level === 's2' ? 'S2' :
                 job.education_level === 's3' ? 'S3' : job.education_level}
              </p>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <IoTime className="text-2xl text-orange-600 mb-2" />
            <h3 className="text-sm text-gray-600">Status</h3>
            <p className="text-sm font-semibold text-gray-900">
              {job.status === 'active' ? 'Aktif' :
               job.status === 'paused' ? 'Dipause' :
               job.status === 'closed' ? 'Ditutup' :
               job.status === 'filled' ? 'Sudah Terisi' : job.status}
            </p>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Pekerjaan</h2>
          <div className="text-gray-700 whitespace-pre-wrap">{job.description}</div>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Persyaratan</h2>
            <div className="text-gray-700 whitespace-pre-wrap">{job.requirements}</div>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Benefit</h2>
            <div className="text-gray-700 whitespace-pre-wrap">{job.benefits}</div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kontak Perusahaan</h3>

            <div className="space-y-4">
              {job.whatsapp && (
                <a
                  href={`https://wa.me/${job.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
                >
                  <FaWhatsapp className="text-2xl text-green-600 mr-3" />
                  <div>
                    <p className="text-gray-900 font-semibold">WhatsApp</p>
                    <p className="text-gray-600 text-sm">{job.whatsapp}</p>
                  </div>
                </a>
              )}

              {job.phone && (
                <a
                  href={`tel:${job.phone}`}
                  className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                >
                  <IoCall className="text-2xl text-blue-600 mr-3" />
                  <div>
                    <p className="text-gray-900 font-semibold">Telepon</p>
                    <p className="text-gray-600 text-sm">{job.phone}</p>
                  </div>
                </a>
              )}

              {job.email && (
                <a
                  href={`mailto:${job.email}`}
                  className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                >
                  <FaEnvelope className="text-2xl text-purple-600 mr-3" />
                  <div>
                    <p className="text-gray-900 font-semibold">Email</p>
                    <p className="text-gray-600 text-sm">{job.email}</p>
                  </div>
                </a>
              )}

              {job.contact && !job.whatsapp && !job.phone && !job.email && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-1">Kontak</p>
                  <p className="text-gray-600">{job.contact}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowContactDialog(false)}
              className="w-full mt-6 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
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