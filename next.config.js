/** @type {import('next').NextConfig} */
const nextConfig = {
   experimental: {
    appDir: true,
  },
  // env: {
  //   // Make these available in the built server bundle (pages/api)
  //   NEXT_CRYPTO_API: process.env.NEXT_CRYPTO_API,

  //   // keep your public ones too
  //   NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
  //   NEXT_PUBLIC_COGNITO_REDIRECT_URI: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
  //   NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  //   NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  // },
};

module.exports = nextConfig
