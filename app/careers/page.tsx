import type { Metadata } from "next";
import { CareersPage } from "./CareersPage";
import "./careers.css";

export const metadata: Metadata = {
  title: "Careers & Creator Partnerships",
  description:
    "Join mypookie.'s social media promotional campaign and earn commission through your own tracked coupon code.",
  alternates: { canonical: "/careers" },
};

export default function Page() {
  return <CareersPage />;
}
