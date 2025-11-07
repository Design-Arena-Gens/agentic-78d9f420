/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["https://agentic-78d9f420.vercel.app"]
    }
  }
};

export default nextConfig;
