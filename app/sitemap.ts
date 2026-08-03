import type { MetadataRoute } from "next";

const siteUrl="https://www.mypookie.store";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified=new Date("2026-08-03");
  return [
    {url:siteUrl,lastModified,changeFrequency:"weekly",priority:1},
    {url:`${siteUrl}/contact`,lastModified,changeFrequency:"yearly",priority:.4},
    {url:`${siteUrl}/privacy`,lastModified,changeFrequency:"yearly",priority:.3},
    {url:`${siteUrl}/terms`,lastModified,changeFrequency:"yearly",priority:.3},
    {url:`${siteUrl}/refund-policy`,lastModified,changeFrequency:"yearly",priority:.3},
  ];
}
