/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Tell Next.js we’re intentionally using Turbopack
  turbopack: {},

  // ✅ Ignore those harmless Safari "Map/Symbol not defined" errors
  webpack(config) {
    config.ignoreWarnings = [
      { message: /Map is not defined/ },
      { message: /Symbol is not defined/ },
    ];
    return config;
  },
};

export default nextConfig;