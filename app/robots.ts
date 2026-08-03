import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules:{
      userAgent:"*",
      allow:"/",
      disallow:["/*?gift=", "/*?group=", "/*?admin="],
    },
    sitemap:"https://www.mypookie.store/sitemap.xml",
    host:"https://www.mypookie.store",
  };
}
