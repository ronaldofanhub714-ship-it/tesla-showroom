 /** @type {import('next').NextConfig} */
  const nextConfig = {
    // Enable static export (creates an /out folder after a build).
    output: 'export',

    // Disable image optimization so all images are inlined during
    // the static export – useful for small sites.
    images: {
      unoptimized: true,
    },

    // If you need to expose env vars to the client,
    // uncomment and fill the block below.
    //env: {
    //  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    //},

    // Add any other custom config here if required
  };

  export default nextConfig;
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
