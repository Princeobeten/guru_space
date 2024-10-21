/** @type {import('next').NextConfig} */
const nextConfig = {
  // Other Next.js config options
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/login',
        has: [
          {
            type: 'cookie',
            key: 'user',
            value: 'authenticated',
          },
        ],
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/sign-up',
        has: [
          {
            type: 'cookie',
            key: 'user',
            value: 'authenticated',
          },
        ],
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;