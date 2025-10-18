export default function Home() {
  return (
    <div className="pb-20">
      {/* Search Section */}
      <div className="bg-primary text-white px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">
          Temukan Pekerjaan Impian
        </h1>
        <p className="text-sm text-green-100 mb-4">
          Ribuan lowongan kerja menanti Anda
        </p>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari pekerjaan, perusahaan, atau lokasi..."
            className="w-full px-4 py-3 pr-12 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-dark text-white p-2 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Location Button */}
        <button className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Cari di Sekitar Saya</span>
        </button>
      </div>

      {/* Quick Categories */}
      <div className="px-4 py-4 bg-white">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Kategori Populer</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '💻', name: 'IT' },
            { icon: '🏗️', name: 'Konstruksi' },
            { icon: '🏨', name: 'Perhotelan' },
            { icon: '🛒', name: 'Retail' },
            { icon: '💰', name: 'Keuangan' },
            { icon: '📚', name: 'Pendidikan' },
            { icon: '🏥', name: 'Kesehatan' },
            { icon: '🎨', name: 'Desain' },
          ].map((cat, idx) => (
            <button
              key={idx}
              className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-xs text-gray-700 font-medium text-center">{cat.name}</span>
            </button>
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
          {/* Job Card Example */}
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex gap-3">
                {/* Company Logo */}
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-xl">🏢</span>
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    Software Engineer
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">PT Tech Indonesia</p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      📍 Jakarta
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      💼 Full-time
                    </span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                      💰 8-15 Juta
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">2 hari yang lalu</p>
                </div>

                {/* Bookmark */}
                <button className="text-gray-400 hover:text-primary transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="px-4 py-6 bg-white mt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">10K+</div>
            <div className="text-xs text-gray-600 mt-1">Lowongan Aktif</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">5K+</div>
            <div className="text-xs text-gray-600 mt-1">Perusahaan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">50K+</div>
            <div className="text-xs text-gray-600 mt-1">Pencari Kerja</div>
          </div>
        </div>
      </div>
    </div>
  )
}
