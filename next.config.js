/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ["image.tmdb.org", "images.unsplash.com"],
  },
};

module.exports = nextConfig;
