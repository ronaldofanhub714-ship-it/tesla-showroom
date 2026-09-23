  /** @type {import('next').NextConfig} */
  const nextConfig = {
    // 👇 tell Next to generate a fully static site
    output: 'export',          // → writes everything to ./out

    // Optional but recommended for a clean URL base
    basePath: '',              // keep it empty unless you use a custom sub‑path

    // If you use image optimization locally, keep it unoptimized for export
    images: { unoptimized: true },

    // If you have custom rewrites or redirects, keep them (they’ll be copied over)
    // rewrites: async () => ({}),
  };
