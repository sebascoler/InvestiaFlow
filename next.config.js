/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,  // necesario en static export si usas next/image
  },
  eslint: { ignoreDuringBuilds: true },  // build solo landing; src/ es la app Vite
  typescript: { ignoreBuildErrors: true },
}

export default nextConfig
