/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a fully static site in /out — this is what Cloudflare Pages deploys.
  // API routes live in /functions (Pages Functions), not in Next, so nothing
  // here needs a Node server.
  output: 'export',

  reactStrictMode: true,

  // Static exports have no image-optimization server, so Next must emit
  // plain <img> tags. remotePatterns are therefore unnecessary.
  images: {
    unoptimized: true
  }
};

export default nextConfig;
