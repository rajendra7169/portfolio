// robots.txt: everything is open to search engines except the Stories back office.
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/stories/admin", "/stories/signin"] },
    sitemap: "https://rajendrapandey.info.np/sitemap.xml",
  };
}
