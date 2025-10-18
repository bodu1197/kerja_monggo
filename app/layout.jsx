import './globals.css'
import { SupabaseProvider } from './components/SupabaseProvider'

export const metadata = {
  title: 'Kerja Monggo - Lowongan Kerja Indonesia',
  description: 'Platform pencarian lowongan kerja terbaik di Indonesia. Temukan pekerjaan impian Anda atau cari kandidat terbaik.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="w-full h-full">
      <body className="w-full min-h-screen overflow-x-hidden" style={{background: '#fafafa'}}>
        <SupabaseProvider>
          <div className="w-full mx-auto bg-white" style={{maxWidth: '600px', minHeight: '100vh', paddingBottom: '70px', display: 'flex', flexDirection: 'column'}}>
            {children}
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
