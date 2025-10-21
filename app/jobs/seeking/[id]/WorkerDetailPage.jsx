'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '../../../components/Footer'
import { IoLocationSharp, IoCall, IoBriefcase, IoTime, IoSchool, IoCash, IoArrowBack, IoPerson, IoCalendar } from 'react-icons/io5'
import { FaWhatsapp, FaEnvelope, FaShareAlt, FaFlag, FaBriefcase, FaGraduationCap, FaTools } from 'react-icons/fa'

export default function WorkerDetailPage({ worker }) {
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)

  const formatSalary = (salary) => {
    if (!salary) return 'Gaji tidak disebutkan'
    return `Harapan Gaji: Rp ${salary.toLocaleString('id-ID')}`
  }

  const getAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleShare = async (method) => {
    const url = window.location.href
    const title = worker.title
    const text = `${worker.title} - ${worker.name || 'Pencari Kerja'}`

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
    <main className="min-h-screen bg-black">
      {/* Header Mobile */}
      <div className="sticky top-0 z-40 bg-black border-b border-gray-800 md:hidden">
        <div className="flex items-center p-4">
          <Link href="/jobs/seeking" className="mr-4">
            <IoArrowBack className="text-2xl text-white" />
          </Link>
          <h1 className="text-lg font-semibold text-white truncate flex-1">{worker.title}</h1>
          <button onClick={() => setShowShareDialog(true)} className="ml-4">
            <FaShareAlt className="text-xl text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        {/* Desktop Back Button */}
        <div className="hidden md:flex items-center mb-6">
          <Link href="/jobs/seeking" className="flex items-center text-gray-400 hover:text-white transition">
            <IoArrowBack className="mr-2" />
            Kembali ke daftar pencari kerja
          </Link>
        </div>

        {/* Worker Header */}
        <div className="bg-dark-100 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{worker.title}</h1>
              {worker.name && (
                <div className="flex items-center text-xl text-gray-300 mb-3">
                  <IoPerson className="mr-2" />
                  <span>{worker.name}</span>
                  {worker.birth_date && (
                    <span className="ml-2 text-gray-400">({getAge(worker.birth_date)} tahun)</span>
                  )}
                </div>
              )}
              <div className="flex items-center text-gray-400 mb-2">
                <IoLocationSharp className="mr-2" />
                <span>{worker.province_name}, {worker.regency_name}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-primary bg-opacity-20 text-primary text-sm rounded-full">
                  {worker.category_name}
                </span>
                {worker.subcategory_name && (
                  <span className="px-3 py-1 bg-dark-200 text-gray-300 text-sm rounded-full">
                    {worker.subcategory_name}
                  </span>
                )}
                {worker.gender && (
                  <span className="px-3 py-1 bg-blue-900 bg-opacity-30 text-blue-400 text-sm rounded-full">
                    {worker.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden md:flex flex-col gap-2">
              <button
                onClick={() => setShowShareDialog(true)}
                className="p-2 text-gray-400 hover:text-white transition"
              >
                <FaShareAlt className="text-xl" />
              </button>
              <button
                onClick={() => setShowReportDialog(true)}
                className="p-2 text-gray-400 hover:text-red-500 transition"
              >
                <FaFlag className="text-xl" />
              </button>
            </div>
          </div>

          {/* Posted Date */}
          <div className="text-sm text-gray-500 mt-4">
            Diposting: {new Date(worker.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {worker.expected_salary && (
            <div className="bg-dark-100 border border-gray-800 rounded-lg p-4">
              <IoCash className="text-2xl text-primary mb-2" />
              <h3 className="text-sm text-gray-400">Harapan Gaji</h3>
              <p className="text-sm font-semibold text-white">
                Rp {worker.expected_salary.toLocaleString('id-ID')}
              </p>
            </div>
          )}

          {worker.years_of_experience !== undefined && (
            <div className="bg-dark-100 border border-gray-800 rounded-lg p-4">
              <IoBriefcase className="text-2xl text-primary mb-2" />
              <h3 className="text-sm text-gray-400">Pengalaman</h3>
              <p className="text-sm font-semibold text-white">
                {worker.years_of_experience === 0 ? 'Fresh Graduate' : `${worker.years_of_experience} tahun`}
              </p>
            </div>
          )}

          {worker.education_level && (
            <div className="bg-dark-100 border border-gray-800 rounded-lg p-4">
              <IoSchool className="text-2xl text-primary mb-2" />
              <h3 className="text-sm text-gray-400">Pendidikan</h3>
              <p className="text-sm font-semibold text-white">
                {worker.education_level === 'sma' ? 'SMA/SMK' :
                 worker.education_level === 'd3' ? 'D3' :
                 worker.education_level === 's1' ? 'S1' :
                 worker.education_level === 's2' ? 'S2' :
                 worker.education_level === 's3' ? 'S3' : worker.education_level}
              </p>
            </div>
          )}

          {worker.is_available !== undefined && (
            <div className="bg-dark-100 border border-gray-800 rounded-lg p-4">
              <IoTime className="text-2xl text-primary mb-2" />
              <h3 className="text-sm text-gray-400">Status</h3>
              <p className="text-sm font-semibold text-white">
                {worker.is_available ? 'Tersedia' : 'Tidak Tersedia'}
              </p>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="bg-dark-100 border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Tentang Saya</h2>
          <div className="text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">{worker.description || 'Tidak ada deskripsi'}</div>
        </div>

        {/* Experience Section */}
        {worker.experience && (
          <div className="bg-dark-100 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaBriefcase className="mr-2" />
              Pengalaman Kerja
            </h2>
            <div className="text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">{worker.experience}</div>
          </div>
        )}

        {/* Education Section */}
        {worker.education && (
          <div className="bg-dark-100 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaGraduationCap className="mr-2" />
              Pendidikan
            </h2>
            <div className="text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">{worker.education}</div>
          </div>
        )}

        {/* Skills Section */}
        {worker.skills && worker.skills.length > 0 && (
          <div className="bg-dark-100 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaTools className="mr-2" />
              Keahlian
            </h2>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-dark-200 text-gray-300 text-sm rounded-full border border-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {worker.languages && worker.languages.length > 0 && (
          <div className="bg-dark-100 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Bahasa</h2>
            <div className="flex flex-wrap gap-2">
              {worker.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary bg-opacity-20 text-primary text-sm rounded-full"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact CTA - Mobile Sticky */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4 md:hidden">
          <button
            onClick={() => setShowContactDialog(true)}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Hubungi Pencari Kerja
          </button>
        </div>

        {/* Contact CTA - Desktop */}
        <div className="hidden md:block bg-dark-100 border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Tertarik dengan kandidat ini?</h2>
          <button
            onClick={() => setShowContactDialog(true)}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Hubungi Pencari Kerja
          </button>
        </div>

        {/* Report Button - Mobile */}
        <div className="md:hidden text-center mb-20">
          <button
            onClick={() => setShowReportDialog(true)}
            className="text-gray-400 text-sm flex items-center justify-center mx-auto"
          >
            <FaFlag className="mr-2" />
            Laporkan profil ini
          </button>
        </div>
      </div>

      {/* Contact Dialog */}
      {showContactDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowContactDialog(false)}>
          <div className="bg-dark-100 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-900 bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-3">
                <IoCall className="text-3xl text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Hubungi Kandidat</h3>
              <p className="text-gray-400 text-sm">Pilih metode kontak untuk menghubungi kandidat ini</p>
            </div>

            <div className="space-y-3">
              {worker.whatsapp && (
                <a
                  href={`https://wa.me/${worker.whatsapp}?text=${encodeURIComponent(`Halo, saya tertarik dengan profil ${worker.title || 'Anda'}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center">
                    <FaWhatsapp className="text-3xl mr-4" />
                    <div className="text-left">
                      <p className="font-bold text-lg">Chat via WhatsApp</p>
                      <p className="text-green-100 text-sm">{worker.whatsapp}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {worker.phone && (
                <a
                  href={`tel:${worker.phone}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center">
                    <IoCall className="text-3xl mr-4" />
                    <div className="text-left">
                      <p className="font-bold text-lg">Telepon Langsung</p>
                      <p className="text-blue-100 text-sm">{worker.phone}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {worker.email && (
                <a
                  href={`mailto:${worker.email}?subject=${encodeURIComponent(`Tertarik dengan profil ${worker.title || 'Anda'}`)}&body=${encodeURIComponent('Kepada Yth. ' + (worker.name || 'Kandidat') + ',\n\nSaya tertarik untuk mendiskusikan peluang kerja dengan Anda.\n\n')}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center">
                    <FaEnvelope className="text-3xl mr-4" />
                    <div className="text-left">
                      <p className="font-bold text-lg">Kirim Email</p>
                      <p className="text-purple-100 text-sm">{worker.email}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {worker.contact && !worker.whatsapp && !worker.phone && !worker.email && (
                <div className="p-4 bg-dark-200 border-2 border-gray-700 rounded-xl">
                  <p className="text-white font-bold mb-2 text-center">Informasi Kontak</p>
                  <p className="text-gray-300 text-center">{worker.contact}</p>
                </div>
              )}

              {!worker.whatsapp && !worker.phone && !worker.email && !worker.contact && (
                <div className="p-6 bg-yellow-900 bg-opacity-20 border-2 border-yellow-700 rounded-xl text-center">
                  <p className="text-yellow-400 font-semibold">Informasi kontak tidak tersedia</p>
                  <p className="text-yellow-500 text-sm mt-1">Silakan coba lagi nanti</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowContactDialog(false)}
              className="w-full mt-6 bg-gray-800 text-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-100 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Bagikan Profil</h3>

            <div className="space-y-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center justify-center p-3 bg-green-900 bg-opacity-20 border border-green-800 rounded-lg hover:bg-opacity-30 transition"
              >
                <FaWhatsapp className="text-xl text-green-400 mr-2" />
                <span className="text-white">Share ke WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center justify-center p-3 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg hover:bg-opacity-30 transition"
              >
                <span className="text-white">Salin Link</span>
              </button>
            </div>

            <button
              onClick={() => setShowShareDialog(false)}
              className="w-full mt-4 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-100 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Laporkan Profil</h3>
            <p className="text-gray-400 mb-4">Pilih alasan pelaporan:</p>

            <div className="space-y-2">
              {['Penipuan', 'Konten Tidak Pantas', 'Spam', 'Informasi Palsu', 'Lainnya'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason)}
                  className="w-full p-3 bg-dark-200 border border-gray-800 rounded-lg text-left hover:border-primary transition"
                >
                  <span className="text-white">{reason}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowReportDialog(false)}
              className="w-full mt-4 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition"
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