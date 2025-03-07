/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['jsonwebtoken']
  }
}

module.exports = nextConfig