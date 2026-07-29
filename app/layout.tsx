import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyPookie — A gift they experience",
  description: "Build a beautiful interactive gift from messages, memories, games and surprises.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
