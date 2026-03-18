import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://unkit.site";

function getBaseUrl(): string {
  const candidate = process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_SITE_URL;
  return candidate.endsWith("/") ? candidate.slice(0, -1) : candidate;
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}