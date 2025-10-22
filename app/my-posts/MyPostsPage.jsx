'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function MyPostsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    loadMyPosts()
  }, [])

  const loadMyPosts = async () => {
    try {
      const supabase = createClient()

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (!authUser) {
        alert('Login is required.')
        router.push('/login')
        return
      }

      setUser(authUser)

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUserInfo(userData)

      if (userData?.user_type === 'employer') {
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            companies!inner(
              company_name,
              user_id
            ),
            provinces(province_name),
            regencies(regency_name),
            category:categories!job_posts_category_id_fkey(name),
            subcategory:categories!job_posts_subcategory_id_fkey(name)
          `)
          .eq('companies.user_id', authUser.id)
          .order('created_at', { ascending: false })

        if (jobsData && jobsData.length > 0) {
          const transformedJobs = jobsData.map(job => ({
            ...job,
            company: { company_name: job.companies?.company_name },
            province: job.provinces,
            regency: job.regencies,
            category: job.category,
            subcategory: job.subcategory
          }))
          setPosts(transformedJobs)
        } else {
          setPosts([])
        }
      } else if (userData?.user_type === 'job_seeker') {
        const { data: profilesData, error: profileError } = await supabase
          .from('candidate_profiles')
          .select(`
            *,
            province:provinces(province_name),
            regency:regencies(regency_name),
            category:categories(name)
          `)
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })

        setPosts(profilesData || [])
      }
    } catch (error) {
      console.error('Error loading posts:', error)
      alert('An error occurred while loading data. Please check the console.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus postingan ini?')) return

    const supabase = createClient()

    try {
      if (userInfo?.user_type === 'employer') {
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('id', postId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('candidate_profiles')
          .delete()
          .eq('id', postId)

        if (error) throw error
      }

      alert('Postingan berhasil dihapus.')
      loadMyPosts() // Refresh posts
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus postingan.')
    }
  }

  const handleToggleStatus = async (postId, currentStatus) => {
    const supabase = createClient()
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'

    try {
      if (userInfo?.user_type === 'employer') {
        const { error } = await supabase
          .from('jobs')
          .update({ status: newStatus })
          .eq('id', postId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('candidate_profiles')
          .update({ status: newStatus })
          .eq('id', postId)

        if (error) throw error
      }

      alert(newStatus === 'active' ? 'Postingan diaktifkan.' : 'Postingan dijeda.')
      loadMyPosts() // Refresh posts
    } catch (error) {
      alert('Terjadi kesalahan saat memperbarui status.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {userInfo?.user_type === 'employer' ? 'Postingan Saya' : 'Profil Pencari Kerja Saya'}
            </h1>
            <p className="text-slate-600 mt-1">
              Kelola postingan Anda
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Kembali
          </button>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Tidak ada postingan
            </h3>
            <p className="text-gray-500 mb-6">
              {userInfo?.user_type === 'employer'
                ? 'Buat postingan pekerjaan dan temukan talenta.'
                : 'Buat profil pencari kerja dan temukan pekerjaan.'}
            </p>
            <button
              onClick={() => router.push(userInfo?.user_type === 'employer' ? '/post' : '/profile')}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600"
            >
              {userInfo?.user_type === 'employer' ? 'Buat Postingan Pekerjaan' : 'Buat Profil Pencari Kerja'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Judul</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={userInfo?.user_type === 'employer' ? `/jobs/hiring/${post.id}` : `/jobs/seeking/${post.id}`}
                        className="text-slate-800 font-medium hover:text-blue-600 transition"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        post.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {post.status === 'active' ? 'Aktif' : 'Dijeda'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(post.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => router.push(userInfo?.user_type === 'employer' ? `/post?edit=${post.id}` : `/profile?edit=${post.id}`)}
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => handleToggleStatus(post.id, post.status)}
                          className={`px-3 py-1.5 text-sm rounded transition font-medium ${
                            post.status === 'active'
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {post.status === 'active' ? 'Jeda' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
