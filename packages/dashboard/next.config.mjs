/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@orion/shared"],
  env: {
    ORION_API_URL: process.env.ORION_API_URL || "http://localhost:6060",
  },
};

export default nextConfig;
