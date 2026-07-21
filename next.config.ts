import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生成独立运行产物，便于 Docker 镜像最小化部署
  output: "standalone",
  allowedDevOrigins: ["192.168.254.1", "192.168.31.46"],
};

export default nextConfig;
