import './globals.css'
import { SupabaseProvider } from './components/SupabaseProvider'
import BannerSearch from './components/BannerSearch'

export const metadata = {
  title: 'KerjaMonggo - Lowongan Kerja Indonesia',
  description: 'Platform pencarian lowongan kerja terbaik di Indonesia. Temukan pekerjaan impian Anda atau cari kandidat terbaik.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <SupabaseProvider>
          <div className="mobile-container">
            {/* Header - Logo Center */}
            <header className="bg-white border-b border-gray-200">
              <div className="px-4 py-4">
                <div className="flex items-center justify-center">
                  <a href="/" className="text-2xl font-bold text-primary">
                    KerjaMonggo
                  </a>
                </div>
              </div>
            </header>

            {/* Banner - 600x220 */}
            <BannerSearch />

            {/* Main Content */}
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6">
              <div className="px-4">
                {/* Navigation Links */}
                <div className="flex justify-around items-center mb-6">
                  <a href="/" className="flex flex-col items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="text-xs mt-1 font-medium">Beranda</span>
                  </a>
                  <a href="/jobs" className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    <span className="text-xs mt-1">Lowongan</span>
                  </a>
                  <a href="/saved" className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    <span className="text-xs mt-1">Tersimpan</span>
                  </a>
                  <a href="/profile" className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs mt-1">Profil</span>
                  </a>
                </div>

                {/* Copyright */}
                <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                  <p>&copy; 2025 KerjaMonggo. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
