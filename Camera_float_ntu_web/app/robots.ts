import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://camera-float-ntu-web.waynspace.com";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}${basePath}/sitemap.xml`,
  };
}

