'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '../../../components/SupabaseProvider'
import { createClient } from '@/lib/supabase/client'
import { MapPinIcon, BriefcaseIcon, ClockIcon, CalendarIcon, UsersIcon, BuildingOffice2Icon, PhoneIcon, EnvelopeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import LoadingState from '../../../components/LoadingState'
import Footer from '../../../components/Footer'

export default function JobDetailPage({ jobId }) {
  const supabase = useSupabase()
  const router = useRouter()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return

      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*),
          province:provinces(province_name),
          regency:regencies(regency_name),
          category:categories!job_posts_category_id_fkey(name, icon),
          subcategory:categories!job_posts_subcategory_id_fkey(name, icon)
        `)
        .eq('id', jobId)
        .single()

      if (fetchError) {
        setError('Gagal memuat lowongan pekerjaan.')
        setJob(null)
      } else {
        const transformedJob = {
          ...data,
          company_name: data.company?.company_name,
          contact_person: data.company?.contact_person,
          phone: data.company?.phone,
          email: data.company?.email,
          province_name: data.province?.province_name,
          regency_name: data.regency?.regency_name,
          category_name: data.category?.name,
          category_icon: data.category?.icon,
          subcategory_name: data.subcategory?.name,
          subcategory_icon: data.subcategory?.icon,
        }
        setJob(transformedJob)

        const { data: { user } } = await supabase.auth.getUser()
        if (user && data.company.user_id === user.id) {
          setIsOwner(true)
        }
      }
      setLoading(false)
    }

    fetchJob()
  }, [jobId, supabase])

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus lowongan ini?')) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (error) throw error
      alert('Lowongan berhasil dihapus.')
      router.push('/my-posts')
    } catch (error) {
      alert('Gagal menghapus lowongan.')
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>
  }

  if (!job) {
    return <div className="text-center text-gray-400 py-12">Lowongan tidak ditemukan.</div>
  }

  return (
    <div className="bg-dark-200 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="bg-dark-100 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 bg-gray-800">
            <h1 className="text-3xl font-bold text-white">{job.title}</h1>
            <p className="text-xl text-primary mt-1">{job.company_name}</p>
            {isOwner && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => router.push(`/post?edit=${job.id}`)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Ubah
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Hapus
                </button>
              </div>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Deskripsi Pekerjaan</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Ringkasan</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-3 text-primary" />
                    <span>{job.regency_name}, {job.province_name}</span>
                  </li>
                  <li className="flex items-center">
                    <BriefcaseIcon className="h-5 w-5 mr-3 text-primary" />
                    <span>{job.category_name} / {job.subcategory_name}</span>
                  </li>
                  <li className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-3 text-primary" />
                    <span>Berakhir pada: {new Date(job.deadline).toLocaleDateString('id-ID')}</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Informasi Perusahaan</h3>
                 <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <BuildingOffice2Icon className="h-5 w-5 mr-3 text-primary" />
                    <span>{job.company_name}</span>
                  </li>
                   <li className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-3 text-primary" />
                    <span>{job.phone}</span>
                  </li>
                   <li className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 mr-3 text-primary" />
                    <span>{job.email}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
