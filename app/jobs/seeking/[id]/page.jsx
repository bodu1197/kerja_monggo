import WorkerDetailPage from './WorkerDetailPage'
import { createClient } from '../../../utils/supabase-server'

export default async function Page({ params }) {
  const { id } = params
  const supabase = await createClient()

  // 서버 사이드에서 job seeker 데이터 가져오기
  const { data: worker, error } = await supabase
    .from('job_seeker_posts')
    .select(`
      *,
      province:provinces(province_name),
      regency:regencies(regency_name),
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
    province_name: worker.province?.province_name,
    regency_name: worker.regency?.regency_name,
    category_name: worker.category?.name,
    subcategory_name: worker.subcategory?.name,
  }

  return <WorkerDetailPage worker={transformedWorker} />
}