import { createClient } from './utils/supabase-server'
import HomePage from './HomePage'

export const metadata = {
  title: 'KerjaMonggo - 인도네시아 구인구직 플랫폼',
  description: '인도네시아 전역의 구인구직 정보를 검색하세요',
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
    <HomePage
      initialProvinces={provinces || []}
      initialCategories={categories || []}
    />
  )
}
