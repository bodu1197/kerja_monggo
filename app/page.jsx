import Footer from './components/Footer'
import MainBanner from './components/MainBanner'

export default function Home() {
  return (
    <>
      <MainBanner />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            KerjaMonggo
          </h1>
          <p className="text-gray-400 mb-8">
            Platform Lowongan Kerja dan Pencarian Talent Terbaik di Indonesia
          </p>

          <div className="flex gap-4 justify-center mb-8">
            <a
              href="/jobs/hiring"
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Lowongan Kerja
            </a>
            <a
              href="/jobs/seeking"
              className="bg-dark-100 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition border border-gray-800"
            >
              Cari Talent
            </a>
          </div>

          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Cari lowongan kerja atau talent..."
              className="w-full px-4 py-3 bg-dark-100 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              readOnly
            />
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}
