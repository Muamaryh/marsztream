/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  async redirects() {
    return [
      {
        source: '/live',
        destination: '/',
        permanent: false,
      },
      {
        source: '/drama/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/watch/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/library',
        destination: '/',
        permanent: false,
      },
      {
        source: '/search',
        destination: '/',
        permanent: false,
      },
    ];
  }
};

export default nextConfig;
