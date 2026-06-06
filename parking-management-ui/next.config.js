/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: false,
  output: 'standalone',
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;