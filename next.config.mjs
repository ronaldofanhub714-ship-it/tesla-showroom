/** @type {import('next').NextConfig} 
const nextConfig = {
  output: 'export', // CRITICAL: Generates static HTML in /out folder
  images: { unoptimized: true }, // Required for static export
};

export default nextConfig;*/


/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next', // Temporarily disable static export to test if site loads at all
  images: { unoptimized: true },
};
export default nextConfig;
