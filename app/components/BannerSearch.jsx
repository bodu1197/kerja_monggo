'use client'

export default function BannerSearch() {
  return (
    <section className="w-full h-[220px] bg-gradient-to-br from-[#2c3e50] to-[#34495e] flex items-center justify-center">
      <div className="flex gap-4 w-full max-w-[500px] px-5">
        <button className="flex-1 h-14 border-2 border-white bg-white/10 backdrop-blur-md text-white text-base font-semibold rounded-xl hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg transition-all active:translate-y-0">
          Mencari Pekerjaan
        </button>
        <button className="flex-1 h-14 border-2 border-white bg-white/10 backdrop-blur-md text-white text-base font-semibold rounded-xl hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg transition-all active:translate-y-0">
          Mencari Pekerja
        </button>
      </div>
    </section>
  )
}
