import WorkerDetailPage from './WorkerDetailPage'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function Page({ params }) {
  const { id } = params

  // 서버 사이드에서 job seeker 데이터 가져오기
  const { data: worker, error } = await supabase
    .from('job_seeker_posts')
    .select(`
      *,
      province:provinces(name),
      regency:regencies(name),
      category:categories!job_seeker_posts_category_id_fkey(name),
      subcategory:categories!job_seeker_posts_subcategory_id_fkey(name)
    `)
    .eq('id', id)
    .single()

  if (error || !worker) {
    return <div>Profil pencari kerja tidak ditemukan</div>
  }

  const transformedWorker = {
    ...worker,
    province_name: worker.province?.name,
    regency_name: worker.regency?.name,
    category_name: worker.category?.name,
    subcategory_name: worker.subcategory?.name,
  }

  return <WorkerDetailPage worker={transformedWorker} />
}