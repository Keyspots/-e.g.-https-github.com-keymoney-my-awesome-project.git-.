/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'supabase.co'],
  },
};

module.exports = nextConfig;
