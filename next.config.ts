import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "@prisma/adapter-libsql",
    "@libsql/client",
  ],
};

export default nextConfig;
