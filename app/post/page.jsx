import { createClient } from '../utils/supabase-server'
import PostJobPage from './PostJobPage'

export const metadata = {
  title: '채용공고 등록 - KerjaMonggo',
  description: '채용공고를 등록하세요',
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
    <PostJobPage
      initialProvinces={provinces || []}
      initialCategories={categories || []}
    />
  )
}
