/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
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
