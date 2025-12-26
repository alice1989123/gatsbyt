/** @type {import('next').NextConfig} */
const nextConfig = {
   experimental: {
    appDir: true,
  },
  env: {
    // Make these available in the built server bundle (pages/api)
    NEXT_CRYPTO_API: process.env.NEXT_CRYPTO_API,
    NEXT_DEFAULT_REGION: process.env.NEXT_AWS_DEFAULT_REGION,

    NEXT_ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    NEXT_SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,

    // keep your public ones too
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    NEXT_PUBLIC_COGNITO_REDIRECT_URI: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  },
};

module.exports = nextConfig
