import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Proxy to Backend (mantém o prefixo /api pois o backend monta as rotas em /api/*)
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/:path*`
      }
    ]
  }
};


export default nextConfig;
