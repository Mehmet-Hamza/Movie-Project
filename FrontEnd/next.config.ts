import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  /* config options here */
  images : {
    remotePatterns : [
      {
        protocol : "https",
        hostname : "upload.wikimedia.org" 
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      }
    ]
  }
};

export default nextConfig;
