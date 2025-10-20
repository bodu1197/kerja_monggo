import { createClient } from '../utils/supabase-server'
import ProfilePage from './ProfilePage'

export const metadata = {
  title: '구직자 프로필 등록 - KerjaMonggo',
  description: '구직자 프로필을 등록하세요',
}

export default async function Page() {
  const supabase = await createClient()

  // provinces 데이터 가져오기
  const { data: provinces } = await supabase
    .from('provinces')
    .select('province_id, province_name')
    .order('province_name')

  // categories 데이터 가져오기 (1차 카테고리만)
  const { data: categories } = await supabase
    .from('categories')
    .select('category_id, name, icon')
    .is('parent_category', null)
    .order('category_id')

  return (
    <ProfilePage
      initialProvinces={provinces || []}
      initialCategories={categories || []}
    />
  )
}
