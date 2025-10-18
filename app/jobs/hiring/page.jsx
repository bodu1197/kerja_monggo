import { createClient } from '../../utils/supabase-server'
import HiringPage from './HiringPage'

export const metadata = {
  title: 'Lowongan Kerja - KerjaMonggo',
  description: 'Cari lowongan kerja terbaik di Indonesia',
}

export default async function Page() {
  const supabase = await createClient()

  // provinces 데이터 가져오기
  const { data: provinces } = await supabase
    .from('provinces')
    .select('id, name')
    .order('name')

  // categories 데이터 가져오기 (parent_category만)
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, parent_category')
    .is('parent_category', null)
    .order('name')

  // job_posts 데이터 가져오기
  const { data: jobs } = await supabase
    .from('job_posts')
    .select(`
      *,
      province:provinces(name),
      regency:regencies(name),
      category:categories!job_posts_category_id_fkey(name),
      subcategory:categories!job_posts_subcategory_id_fkey(name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50)

  // 데이터 변환
  const transformedJobs = jobs?.map(job => ({
    ...job,
    province_name: job.province?.name,
    regency_name: job.regency?.name,
    category_name: job.category?.name,
    subcategory_name: job.subcategory?.name,
  })) || []

  return (
    <HiringPage
      initialProvinces={provinces || []}
      initialCategories={categories || []}
      initialJobs={transformedJobs}
    />
  )
}
