/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static site (SSG) -> export to ./out so Vercel serves it as static
  // files, sidestepping the project's inherited Vite build settings. All meta,
  // OpenGraph and JSON-LD are pre-rendered into the HTML, so SEO is preserved.
  // Revert to server rendering (drop this) if server routes/SSR are added later.
  output: 'export',
  images: { unoptimized: true },
}

export default nextConfig
