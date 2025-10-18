/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['zthksbitvezxwhbymatz.supabase.co'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
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
