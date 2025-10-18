/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['zthksbitvezxwhbymatz.supabase.co'],
  },
  async headers() {
    return [
      {
        // 모든 파일에 적용되는 헤더
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // HTML 페이지에만 CSP 적용 (정적 파일 제외)
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'; upgrade-insecure-requests;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
