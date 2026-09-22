/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // CRITICAL: Generates static HTML in /out folder
  images: { unoptimized: true }, // Required for static export
};

export default nextConfig;
