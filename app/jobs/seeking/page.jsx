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
    .select('province_id, province_name')
    .order('province_name')

  // categories 데이터 가져오기 (1차 카테고리만 - parent_category가 null)
  const { data: categories } = await supabase
    .from('categories')
    .select('category_id, name, icon')
    .is('parent_category', null)
    .order('category_id')

  // job_seeker_posts 데이터 가져오기
  const { data: seekers } = await supabase
    .from('candidate_profiles')
    .select(`
      *,
      province:provinces(province_name),
      regency:regencies(regency_name),
      category:categories!job_seeker_posts_category_id_fkey(name),
      subcategory:categories!job_seeker_posts_subcategory_id_fkey(name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50)

  // 데이터 변환
  const transformedSeekers = seekers?.map(seeker => ({
    ...seeker,
    province_name: seeker.province?.province_name,
    regency_name: seeker.regency?.regency_name,
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
