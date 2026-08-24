/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
  },
};

export default nextConfig;
