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

      // 사용자 정보 가져오기
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        alert('로그인이 필요합니다.')
        router.push('/login')
        return
      }

      setUser(authUser)

      // users 테이블에서 user_type 확인
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUserInfo(userData)

      // user_type에 따라 다른 테이블에서 데이터 가져오기
      if (userData?.user_type === 'employer') {
        // companies 테이블과 JOIN해서 채용 공고 가져오기
        const { data: jobsData, error } = await supabase
          .from('jobs')
          .select(`
            *,
            companies!inner(
              company_name,
              user_id
            ),
            provinces(province_name),
            regencies(regency_name),
            categories(name)
          `)
          .eq('companies.user_id', authUser.id)
          .order('created_at', { ascending: false })

        console.log('Jobs query result:', jobsData, error)

        if (jobsData) {
          // companies 객체를 company로 변환
          const transformedJobs = jobsData.map(job => ({
            ...job,
            company: { company_name: job.companies?.company_name },
            province: job.provinces,
            regency: job.regencies,
            category: job.categories
          }))
          setPosts(transformedJobs)
        } else {
          setPosts([])
        }
      } else if (userData?.user_type === 'job_seeker') {
        // 구직 프로필 가져오기
        const { data: profilesData } = await supabase
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
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

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

      alert('삭제되었습니다.')
      loadMyPosts() // 새로고침
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 중 오류가 발생했습니다.')
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

      alert(newStatus === 'active' ? '게시글이 활성화되었습니다.' : '게시글이 일시정지되었습니다.')
      loadMyPosts() // 새로고침
    } catch (error) {
      console.error('Status update error:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {userInfo?.user_type === 'employer' ? '내 채용공고' : '내 구직 프로필'}
            </h1>
            <p className="text-slate-600 mt-1">
              등록한 게시글을 관리하세요
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50"
          >
            뒤로가기
          </button>
        </div>

        {/* 게시글 목록 */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              등록된 게시글이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              {userInfo?.user_type === 'employer'
                ? '채용 공고를 등록하고 인재를 찾아보세요'
                : '구직 프로필을 등록하고 일자리를 찾아보세요'}
            </p>
            <button
              onClick={() => router.push(userInfo?.user_type === 'employer' ? '/post' : '/profile')}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600"
            >
              {userInfo?.user_type === 'employer' ? '채용 공고 등록' : '구직 프로필 등록'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-800">
                        {post.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {post.status === 'active' ? '활성' : '일시정지'}
                      </span>
                    </div>

                    {userInfo?.user_type === 'employer' && post.company?.company_name && (
                      <p className="text-slate-600 mb-2">{post.company.company_name}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {post.province?.province_name && (
                        <span>📍 {post.province.province_name}, {post.regency?.regency_name}</span>
                      )}
                      {post.category?.name && (
                        <span>💼 {post.category.name}</span>
                      )}
                      <span>📅 {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>

                    {post.description && (
                      <p className="text-slate-600 mt-3 line-clamp-2">
                        {post.description}
                      </p>
                    )}
                    {post.bio && (
                      <p className="text-slate-600 mt-3 line-clamp-2">
                        {post.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Link
                    href={userInfo?.user_type === 'employer' ? `/jobs/hiring/${post.id}` : `/jobs/seeking/${post.id}`}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                  >
                    상세보기
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(post.id, post.status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      post.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {post.status === 'active' ? '일시정지' : '활성화'}
                  </button>

                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium ml-auto"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
