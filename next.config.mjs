/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrerendering: true,
  allowedDevOrigins: ["192.168.1.7"],
};

export default nextConfig;