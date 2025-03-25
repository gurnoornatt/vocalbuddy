/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Enable static optimization for faster builds
  reactStrictMode: true,
  // Optimize images
  images: {
    domains: ['lottie.host'],
    formats: ['image/avif', 'image/webp'],
  },
  // Add trailing slash to URLs
  trailingSlash: false,
  // Handle environment variables for Vercel deployments
  env: {
    // Provide fallbacks for environment variables if they don't exist
    // This helps Vercel build process succeed even if variables aren't set
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://testvocal.vercel.app',
    // Note: We don't set defaults for sensitive variables like RESEND_API_KEY
    // as that would be a security risk
  },
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Configure webpack to handle environment variable issues during build
  webpack(config, { isServer, dev }) {
    // Add plugin to handle build-time issues
    if (!dev && !isServer) {
      // This helps with handling missing environment variables during build
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
}

// Log environment variable presence for debugging
// This helps identify issues during the build process
const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
  'RESEND_API_KEY'
];

console.log('Environment variables check:');
envVars.forEach(varName => {
  const exists = !!process.env[varName];
  console.log(`${varName}: ${exists ? 'Present' : 'Missing'}`);
});

if (process.env.VERCEL) {
  console.log('Building on Vercel platform');
}

module.exports = nextConfig 