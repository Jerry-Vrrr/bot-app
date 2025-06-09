import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "integbot.s3.ap-southeast-2.amazonaws.com", // Your S3 bucket hostname
        pathname: "/images/**", // Allow images inside the "images" folder
      },
      
    ],
  },
  

};

export default nextConfig;
