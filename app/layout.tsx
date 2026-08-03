import type { Metadata } from "next";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl="https://www.mypookie.store";
  const image=`${siteUrl}/og.png`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: "mypookie. — Create Personalized Interactive Gifts Online", template: "%s | mypookie." },
    description: "Create a personalized interactive digital gift with letters, photos, videos, puzzles, games and private surprises—then share it with one beautiful link.",
    keywords: ["personalized digital gift", "interactive gift online", "online gift for boyfriend", "online gift for girlfriend", "virtual birthday gift", "digital love letter"],
    alternates: { canonical: "/" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    icons: {
      icon: [{ url: "/mypookie-heart.svg", type: "image/svg+xml" }],
      shortcut: "/mypookie-heart.svg",
      apple: "/mypookie-heart.svg",
    },
    openGraph: { type:"website", url:siteUrl, siteName:"mypookie.", title:"mypookie. — Create Personalized Interactive Gifts Online", description:"Build a little world of letters, memories, games and private surprises for someone special.", images:[{url:image,width:1200,height:630,alt:"mypookie. interactive gift studio"}] },
    twitter: { card:"summary_large_image", title:"mypookie. — Create Personalized Interactive Gifts Online", description:"Build a little world of letters, memories, games and private surprises for someone special.", images:[image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData={"@context":"https://schema.org","@type":"WebApplication",name:"mypookie.",url:"https://www.mypookie.store",applicationCategory:"LifestyleApplication",operatingSystem:"Any",description:"Create personalized interactive digital gifts with messages, photos, videos, puzzles, games and surprises.",offers:{"@type":"Offer",priceCurrency:"INR"}};
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Caveat:wght@500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}} />{children}</body>
    </html>
  );
}
