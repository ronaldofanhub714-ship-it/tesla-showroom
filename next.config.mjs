/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export
  output: 'export',

  // Optimize images for static export (next.js will inline them)
  images: {
    unoptimized: true,
  },

  // If you use environment variables, you can expose them here
  // env: {
  //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  // },

  // Any other custom config you need can go here
};

export default nextConfig;
