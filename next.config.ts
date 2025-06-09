import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aion-chatbot.s3.eu-north-1.amazonaws.com", // Your S3 bucket hostname
        pathname: "/images/**", // Allow images inside the "images" folder
      },
      
    ],
  },
  

};

export default nextConfig;
