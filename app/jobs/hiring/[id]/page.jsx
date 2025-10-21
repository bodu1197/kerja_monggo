import JobDetailPage from './JobDetailPage'
import { createClient } from '../../../utils/supabase-server'

export default async function Page({ params }) {
  const { id } = params
  const supabase = await createClient()

  console.log('=== JobDetailPage 로드 시작 ===')
  console.log('Job ID:', id)

  // 서버 사이드에서 job 데이터 가져오기
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies(company_name, contact_person, phone, email),
      province:provinces(province_name),
      regency:regencies(regency_name),
      category:categories!job_posts_category_id_fkey(name),
      subcategory:categories!job_posts_subcategory_id_fkey(name)
    `)
    .eq('id', id)
    .single()

  console.log('Job Data:', job)
  console.log('Job Error:', error)

  if (error) {
    console.error('❌ 에러 발생:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h2>
          <p className="text-gray-700 mb-2">채용 공고를 불러오는 중 오류가 발생했습니다.</p>
          <p className="text-sm text-gray-500 mb-4">에러: {error.message}</p>
          <a href="/jobs/hiring" className="text-blue-600 hover:underline">← 목록으로 돌아가기</a>
        </div>
      </div>
    )
  }

  if (!job) {
    console.error('❌ Job이 null입니다')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">채용 공고를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">해당 채용 공고가 삭제되었거나 존재하지 않습니다.</p>
          <a href="/jobs/hiring" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            목록으로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  const transformedJob = {
    ...job,
    company_name: job.companies?.company_name,
    contact_person: job.companies?.contact_person,
    phone: job.companies?.phone,
    email: job.companies?.email,
    whatsapp: job.whatsapp, // jobs 테이블에서 직접 가져옴
    province_name: job.province?.province_name,
    regency_name: job.regency?.regency_name,
    category_name: job.category?.name,
    subcategory_name: job.subcategory?.name,
  }

  console.log('✅ Transformed Job:', transformedJob)
  console.log('=== JobDetailPage 로드 완료 ===')

  return <JobDetailPage job={transformedJob} />
}