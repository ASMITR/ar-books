import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account/",
        "/checkout/",
        "/cart/",
        "/login/",
        "/register/",
        "/forgot-password/",
        "/thank-you/",
        "/setup/",
        "/demo/",
        "/api/",
      ],
    },
    sitemap: "https://www.asmitrajaramkarbooks.store/sitemap.xml",
  };
}
