/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['localhost', 'skedyou.com'],
  },
}

module.exports = nextConfig
