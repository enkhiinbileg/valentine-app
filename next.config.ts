import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-936143032a234078ac47ee7d8f982685.r2.dev',
      },
    ],
  },
};

export default nextConfig;
