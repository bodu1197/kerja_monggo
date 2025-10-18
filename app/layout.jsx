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
            {/* Header - Logo Center - FIXED */}
            <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50" style={{maxWidth: '600px', margin: '0 auto', height: '60px'}}>
              <div className="h-full flex items-center justify-center">
                <a href="/" className="text-2xl font-bold text-black">
                  KerjaMonggo
                </a>
              </div>
            </header>

            {/* Main Content with padding for fixed header and footer */}
            <main className="min-h-screen bg-[#fafafa]" style={{paddingTop: '60px', paddingBottom: '70px'}}>
              {/* Banner - 600x220 */}
              <BannerSearch />

              {children}
            </main>

            {/* Footer - FIXED */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" style={{maxWidth: '600px', margin: '0 auto', height: '70px', boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)'}}>
              <div className="h-full flex justify-around items-center">
                <a href="/" className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-[#666] hover:text-black transition-all active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-xs font-medium">Beranda</span>
                </a>
                <a href="/jobs" className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-[#666] hover:text-black transition-all active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">Lowongan</span>
                </a>
                <a href="/saved" className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-[#666] hover:text-black transition-all active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="text-xs font-medium">Tersimpan</span>
                </a>
                <a href="/profile" className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-[#666] hover:text-black transition-all active:scale-95">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs font-medium">Profil</span>
                </a>
              </div>
            </footer>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
