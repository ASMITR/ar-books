import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Asmit Rajaramkar Books",
    short_name: "AR Books",
    description:
      "Discover and purchase original eBooks by Asmit Rajaramkar — business, finance, personal development, fiction, and more.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#203A2B",
    theme_color: "#203A2B",
    categories: ["books", "education", "shopping"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse Books",
        short_name: "Books",
        description: "Browse all eBooks",
        url: "/books",
        icons: [{ src: "/icons/shortcut-books.png", sizes: "96x96" }],
      },
      {
        name: "My Library",
        short_name: "Library",
        description: "Access your purchased eBooks",
        url: "/account/library",
        icons: [{ src: "/icons/shortcut-library.png", sizes: "96x96" }],
      },
    ],
    screenshots: [
      {
        src: "/screenshots/home-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Home page — AR Books",
      },
      {
        src: "/screenshots/books-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Browse books — AR Books",
      },
    ],
  };
}
