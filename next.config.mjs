/** @type {import('next').NextConfig} */
const nextConfig = {

  experimental: {
    serverActions: false, // o cualquier otro experimental que tengas
    turbo: false,         // desactiva Turbopack experimental si lo tienes
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig