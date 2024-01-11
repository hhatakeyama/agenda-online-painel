/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    loader: 'cloudinary',
    domains: ['localhost', 'admin.gatacompleta.com', 'dev.gatacompleta.com', 'gatacompleta.com'],
    path: 'https://res.cloudinary.com/gatacompleta/image/fetch/'
  },
}

module.exports = nextConfig
