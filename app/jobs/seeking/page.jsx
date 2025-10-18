import { createClient } from '../../utils/supabase-server'
import SeekingPage from './SeekingPage'

export const metadata = {
  title: 'Cari Talent - KerjaMonggo',
  description: 'Temukan talent terbaik untuk perusahaan Anda',
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

  // job_seeker_posts 데이터 가져오기
  const { data: seekers } = await supabase
    .from('job_seeker_posts')
    .select(`
      *,
      province:provinces(name),
      regency:regencies(name),
      category:categories!job_seeker_posts_category_id_fkey(name),
      subcategory:categories!job_seeker_posts_subcategory_id_fkey(name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50)

  // 데이터 변환
  const transformedSeekers = seekers?.map(seeker => ({
    ...seeker,
    province_name: seeker.province?.name,
    regency_name: seeker.regency?.name,
    category_name: seeker.category?.name,
    subcategory_name: seeker.subcategory?.name,
  })) || []

  return (
    <SeekingPage
      initialProvinces={provinces || []}
      initialCategories={categories || []}
      initialJobs={transformedSeekers}
    />
  )
}
