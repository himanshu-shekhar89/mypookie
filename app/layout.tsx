import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders=await headers();
  const host=requestHeaders.get("x-forwarded-host")||requestHeaders.get("host")||"frontend-production-48ed.up.railway.app";
  const protocol=requestHeaders.get("x-forwarded-proto")||"https";
  const image=`${protocol}://${host}/og.png`;
  return {
    title: "mypookie. — A gift they experience",
    description: "Build a beautiful interactive gift from messages, memories, tiny games and surprises.",
    icons: {
      icon: [{ url: "/mypookie-heart.svg", type: "image/svg+xml" }],
      shortcut: "/mypookie-heart.svg",
      apple: "/mypookie-heart.svg",
    },
    openGraph: { title:"mypookie. — A gift they experience", description:"Build a little world of messages, memories, tiny games and surprises.", images:[{url:image,width:1200,height:630,alt:"mypookie. interactive gift studio"}] },
    twitter: { card:"summary_large_image", title:"mypookie. — A gift they experience", description:"Build a little world of messages, memories, tiny games and surprises.", images:[image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
      <body>{children}</body>
    </html>
  );
}
