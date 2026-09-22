/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // CRITICAL: Enables static HTML generation
  images: { unoptimized: true }, // Required for static export
};

export default nextConfig;
