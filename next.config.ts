import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const revision =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  "construtheo-offline-v1";

const paginasOffline = [
  "/",
  "/splash",
  "/login",
  "/painel/cliente",
  "/painel/calculos",
  "/calc/concreto",
  "/calc/blocos",
  "/calc/argamassa",
  "/calc/agregados",
  "/calc/vidros",
  "/calc/tinta",
  "/calc/fiacao",
  "/calc/encanamento",
];

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",

  disable: process.env.NODE_ENV === "development",

  cacheOnNavigation: true,
  reloadOnOnline: true,

  additionalPrecacheEntries: paginasOffline.map((url) => ({
    url,
    revision,
  })),
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "qbkcsqbfmaozmwleyihw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withSerwist(nextConfig);