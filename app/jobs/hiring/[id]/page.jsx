import JobDetailPage from './JobDetailPage'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function Page({ params }) {
  const { id } = params

  // 서버 사이드에서 job 데이터 가져오기
  const { data: job, error } = await supabase
    .from('job_posts')
    .select(`
      *,
      province:provinces(name),
      regency:regencies(name),
      category:categories!job_posts_category_id_fkey(name),
      subcategory:categories!job_posts_subcategory_id_fkey(name)
    `)
    .eq('id', id)
    .single()

  if (error || !job) {
    return <div>Lowongan tidak ditemukan</div>
  }

  const transformedJob = {
    ...job,
    province_name: job.province?.name,
    regency_name: job.regency?.name,
    category_name: job.category?.name,
    subcategory_name: job.subcategory?.name,
  }

  return <JobDetailPage job={transformedJob} />
}