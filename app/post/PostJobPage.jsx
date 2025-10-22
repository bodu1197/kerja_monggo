'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const initialFormData = {
  company_name: '',
  contact_person: '',
  phone: '',
  email: '',
  title: '',
  description: '',
  province_id: '',
  regency_id: '',
  category_id: '',
  subcategory_id: '',
  deadline: '',
}

export default function PostJobPage({ initialProvinces = [], initialCategories = [] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(!!editId)
  const [provinces] = useState(initialProvinces)
  const [regencies, setRegencies] = useState([])
  const [categories] = useState(initialCategories)
  const [subcategories, setSubcategories] = useState([])
  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    const defaultDeadline = new Date()
    defaultDeadline.setDate(defaultDeadline.getDate() + 30)
    setFormData(prev => ({ ...prev, deadline: defaultDeadline.toISOString().slice(0, 16) }))
  }, [])

  useEffect(() => {
    if (editId) {
      setIsEditMode(true)
      loadExistingJobData(editId)
    } else {
      setIsEditMode(false)
      setFormData(initialFormData)
      loadExistingCompanyInfo()
    }
  }, [editId])

  useEffect(() => {
    if (formData.province_id) {
      loadRegencies(formData.province_id)
    } else {
      setRegencies([])
    }
  }, [formData.province_id])

  useEffect(() => {
    if (formData.category_id && categories.length > 0) {
      loadSubcategories(formData.category_id)
    } else {
      setSubcategories([])
    }
  }, [formData.category_id, categories])

  const loadExistingJobData = async (jobId) => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data: job, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies(
            company_name,
            contact_person,
            phone,
            email,
            province_id,
            regency_id
          )
        `)
        .eq('id', jobId)
        .single()

      if (error) {
        alert('Gagal memuat data pekerjaan.')
        router.push('/my-posts')
        return
      }

      if (job) {
        const newFormData = {
          company_name: job.companies?.company_name || '',
          contact_person: job.companies?.contact_person || '',
          phone: job.companies?.phone || '',
          email: job.companies?.email || '',
          title: job.title || '',
          description: job.description || '',
          province_id: job.province_id || '',
          regency_id: job.regency_id || '',
          category_id: job.category_id || '',
          subcategory_id: job.subcategory_id || '',
          deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 16) : '',
        }
        setFormData(newFormData)
      }
    } catch (error) {
      alert('Terjadi kesalahan tak terduga.')
      router.push('/my-posts')
    } finally {
      setLoading(false)
    }
  }

  const loadExistingCompanyInfo = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (companies) {
      setFormData(prev => ({
        ...prev,
        company_name: companies.company_name || '',
        contact_person: companies.contact_person || '',
        phone: companies.phone || '',
        email: companies.email || '',
        province_id: companies.province_id || '',
        regency_id: companies.regency_id || ''
      }))
    }
  }

  const loadRegencies = async (provinceId) => {
    const supabase = createClient()

    const { data: regenciesData } = await supabase
      .from('regencies')
      .select('regency_id, regency_name')
      .eq('province_id', provinceId)
      .order('regency_name')

    if (regenciesData) {
      setRegencies(regenciesData)
    }
  }

  const loadSubcategories = async (parentCategoryId) => {
    const supabase = createClient()

    const parentCategory = categories.find(cat => cat.category_id === parseInt(parentCategoryId))

    if (!parentCategory) return

    const { data: subcategoriesData } = await supabase
      .from('categories')
      .select('category_id, name')
      .eq('parent_category', parentCategory.name)
      .order('name')

    if (subcategoriesData) {
      setSubcategories(subcategoriesData)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.deadline) {
      alert('Silakan pilih batas waktu.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        alert('Login diperlukan.')
        router.push('/login')
        return
      }

      let { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      let companyId

      if (!companies || companies.length === 0) {
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            user_id: user.id,
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            phone: formData.phone,
            email: formData.email,
            regency_id: formData.regency_id,
            province_id: formData.province_id
          }])
          .select()
          .single()

        if (createError) {
          alert('Gagal membuat profil perusahaan.')
          return
        }

        companyId = newCompany.id
      } else {
        companyId = companies[0].id

        const updateData = {
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          phone: formData.phone,
          email: formData.email,
          regency_id: formData.regency_id,
          province_id: formData.province_id
        }

        const { error: updateError } = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', companyId)

        if (updateError) {
        }
      }

      const jobData = {
        company_id: companyId,
        title: formData.title,
        description: formData.description,
        province_id: formData.province_id,
        regency_id: formData.regency_id,
        category_id: formData.subcategory_id || formData.category_id,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        status: 'active'
      }

      if (isEditMode && editId) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editId)

        if (error) {
          alert('Gagal memperbarui pekerjaan: ' + error.message)
          return
        }

        alert('Pekerjaan berhasil diperbarui!')
        router.push('/my-posts')
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .insert([jobData])
          .select()

        if (error) {
          alert('Gagal memasukkan pekerjaan: ' + error.message)
          return
        }

        alert('Pekerjaan berhasil diposting!')
        router.push('/jobs/hiring')
      }

    } catch (error) {
      alert('Terjadi kesalahan tak terduga.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[800px] mx-auto px-5">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information */}
            <div className="space-y-6">
                {/* Company Name */}
                <div>
                  <label htmlFor="company_name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    required
                  />
                </div>

                {/* Contact Person */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact_person" className="block text-sm font-semibold text-slate-700 mb-2">
                      Nama Kontak <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                      Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    required
                  />
                </div>
            </div>

            {/* Job Information */}
            <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                    Judul Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    placeholder="Contoh: Pengembang Perangkat Lunak Senior"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                    Deskripsi <span className="text-red-500">*</span> (minimal 50 karakter)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none h-32"
                    placeholder="Jelaskan lingkungan kerja, budaya perusahaan, peluang pertumbuhan, dll..."
                    required
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/50 karakter
                  </div>
                </div>


                {/* Location */}
                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2">Lokasi Kerja</div>
                  <div className="space-y-3">
                    <select
                      value={formData.province_id}
                      onChange={(e) => setFormData({...formData, province_id: e.target.value, regency_id: ''})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map((province) => (
                        <option key={province.province_id} value={province.province_id}>
                          {province.province_name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={formData.regency_id}
                      onChange={(e) => setFormData({...formData, regency_id: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      disabled={!formData.province_id}
                      required
                    >
                      <option value="">Pilih Kota/Kabupaten</option>
                      {regencies.map((regency) => (
                        <option key={regency.regency_id} value={regency.regency_id}>
                          {regency.regency_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
            </div>

            {/* Detailed Conditions */}
            <div className="space-y-6">
                {/* Job Category */}
                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2">Kategori Pekerjaan</div>
                  <div className="space-y-3">
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value, subcategory_id: ''})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      required
                    >
                      <option value="">Pilih Kategori Utama</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={formData.subcategory_id}
                      onChange={(e) => setFormData({...formData, subcategory_id: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                      disabled={!formData.category_id}
                    >
                      <option value="">Pilih Sub-kategori (opsional)</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.category_id} value={subcategory.category_id}>
                          {subcategory.icon} {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label htmlFor="deadline" className="block text-sm font-semibold text-slate-700 mb-2">
                    Batas Waktu Lamaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-700 focus:outline-none"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Default: 30 hari dari sekarang | Bisa diatur hingga 90 hari
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
                  >
                    {loading
                      ? (isEditMode ? 'Memperbarui...' : 'Memposting...')
                      : (isEditMode ? 'Perbarui Pekerjaan' : 'Posting Pekerjaan')}
                  </button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}