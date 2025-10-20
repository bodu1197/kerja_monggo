import { createClient } from '../../utils/supabase-server'
import HiringPage from './HiringPage'

export const metadata = {
  title: 'Lowongan Kerja - KerjaMonggo',
  description: 'Cari lowongan kerja terbaik di Indonesia',
}

export default async function Page() {
  const supabase = await createClient()

  // provinces 데이터 가져오기
  const { data: provinces, error: provincesError } = await supabase
    .from('provinces')
    .select('province_id, province_name')
    .order('province_name')

  console.log('SERVER - Provinces:', provinces?.length, provincesError)

  // categories 데이터 가져오기 (1차 카테고리만 - parent_category가 null)
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('category_id, name, icon')
    .is('parent_category', null)
    .order('category_id')

  console.log('SERVER - Categories:', categories?.length, categoriesError)

  // job_posts 데이터 가져오기
  const { data: jobs, error: jobsError } = await supabase
    .from('job_posts')
    .select(`
      *,
      province:provinces(province_name),
      regency:regencies(regency_name),
      category:categories!job_posts_category_id_fkey(name),
      subcategory:categories!job_posts_subcategory_id_fkey(name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50)

  console.log('SERVER - Jobs:', jobs?.length, jobsError)

  // 데이터 변환
  const transformedJobs = jobs?.map(job => ({
    ...job,
    province_name: job.province?.province_name,
    regency_name: job.regency?.regency_name,
    category_name: job.category?.name,
    subcategory_name: job.subcategory?.name,
  })) || []

  console.log('SERVER - Transformed Jobs:', transformedJobs.length)
  console.log('SERVER - Passing to HiringPage:', {
    provinces: provinces?.length || 0,
    categories: categories?.length || 0,
    jobs: transformedJobs.length
  })

  return (
    <HiringPage
      initialProvinces={provinces || []}
      initialCategories={categories || []}
      initialJobs={transformedJobs}
    />
  )
}
