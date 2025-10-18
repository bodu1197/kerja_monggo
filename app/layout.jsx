import './globals.css'
import { SupabaseProvider } from './components/SupabaseProvider'
import Script from 'next/script'

export const metadata = {
  title: 'Kerja Monggo - Lowongan Kerja Indonesia',
  description: 'Platform pencarian lowongan kerja terbaik di Indonesia. Temukan pekerjaan impian Anda atau cari kandidat terbaik.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </head>
      <body className="m-0 p-0 bg-white overflow-x-hidden">
        <SupabaseProvider>
          <div className="max-w-[600px] mx-auto bg-white min-h-screen flex flex-col pb-[70px]">
            {children}
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
