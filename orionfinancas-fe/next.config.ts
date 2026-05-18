import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
        // Proxy to Backend
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/:path*`
      }
    ]
  }
};


export default nextConfig;
