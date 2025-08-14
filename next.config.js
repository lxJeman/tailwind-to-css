/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint configuration for build
  eslint: {
    // Only run ESLint on production code, not tests
    dirs: ['src/app', 'src/components', 'src/services', 'src/types'],
  },
  
  // TypeScript configuration
  typescript: {
    // Don't fail build on type errors in development
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;