/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  // Çevrimiçi katman varsayılan olarak pakete girmez; yalnızca açıkça "1" verilirse derlenir.
  env: {
    NEXT_PUBLIC_ENABLE_ONLINE: process.env.NEXT_PUBLIC_ENABLE_ONLINE === "1" ? "1" : "0",
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
