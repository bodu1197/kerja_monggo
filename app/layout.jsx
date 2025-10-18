import './globals.css'
import MainBanner from './components/MainBanner'
import { SupabaseProvider } from './components/SupabaseProvider'

export const metadata = {
  title: 'KerjaMonggo - Platform Lowongan Kerja',
  description: 'Platform pencarian lowongan kerja dan talent di Indonesia',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-dark-200">
        <SupabaseProvider>
          <nav className="bg-dark-100 border-b border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <a href="/" className="text-2xl font-bold text-primary">
                  KerjaMonggo
                </a>
                <div className="flex gap-4">
                  <a href="/jobs/hiring" className="text-gray-300 hover:text-primary transition">
                    Lowongan Kerja
                  </a>
                  <a href="/jobs/seeking" className="text-gray-300 hover:text-primary transition">
                    Cari Talent
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <MainBanner />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
