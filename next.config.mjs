/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.', // Export to root instead of /out
  images: { unoptimized: true },
};

export default nextConfig;
