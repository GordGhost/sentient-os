/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The existing static landing page lives at /public/landing.html and is served
  // verbatim (not rebuilt). The root route redirects to it; see src/app/page.tsx.
};

export default nextConfig;
