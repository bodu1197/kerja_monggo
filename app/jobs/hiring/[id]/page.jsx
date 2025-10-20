import JobDetailPage from './JobDetailPage'
import { createClient } from '../../../utils/supabase-server'

export default async function Page({ params }) {
  const { id } = params
  const supabase = await createClient()

  // 서버 사이드에서 job 데이터 가져오기
  const { data: job, error } = await supabase
    .from('job_posts')
    .select(`
      *,
      province:provinces(province_name),
      regency:regencies(regency_name),
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
    province_name: job.province?.province_name,
    regency_name: job.regency?.regency_name,
    category_name: job.category?.name,
    subcategory_name: job.subcategory?.name,
  }

  return <JobDetailPage job={transformedJob} />
}