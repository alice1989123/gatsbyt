/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    API: process.env.API,
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    
  },
}

module.exports = nextConfig
