/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { webpack, isServer }) {

    

    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  
}

module.exports = nextConfig
