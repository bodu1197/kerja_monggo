import { createClient } from './utils/supabase-server'
import JobCard from './components/JobCard'

export default async function Home() {
  const supabase = await createClient()

  // Fetch latest jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (
        id,
        name,
        logo_url
      ),
      regencies (
        id,
        name,
        province_id
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')
    .limit(8)

  // Count statistics
  const { count: jobCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: companyCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  const { count: candidateCount } = await supabase
    .from('candidate_profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      {/* Quick Categories */}
      <div className="px-4 py-4 bg-white">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Kategori Populer</h2>
        <div className="grid grid-cols-4 gap-3">
          {(categories || []).map((cat) => (
            <a
              key={cat.id}
              href={`/jobs?category=${cat.id}`}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition min-h-[60px]"
            >
              <span className="text-xs text-gray-700 font-medium text-center">{cat.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Latest Jobs */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-900">Lowongan Terbaru</h2>
          <a href="/jobs" className="text-sm text-primary font-medium">Lihat Semua →</a>
        </div>

        <div className="space-y-3">
          {(jobs || []).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}

          {(!jobs || jobs.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada lowongan kerja tersedia</p>
            </div>
          )}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="px-4 py-6 bg-white mt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{jobCount || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Lowongan Aktif</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{companyCount || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Perusahaan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{candidateCount || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Pencari Kerja</div>
          </div>
        </div>
      </div>
    </div>
  )
}
