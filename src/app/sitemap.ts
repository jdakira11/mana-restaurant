import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl();
  return [
    { url: `${url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${url}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${url}/aviso-legal`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${url}/creditos`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
