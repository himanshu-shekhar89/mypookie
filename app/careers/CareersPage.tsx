"use client";

import { FormEvent, useEffect, useState } from "react";

const api =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-production-22bd.up.railway.app";
type Campaign = {
  title: string;
  summary: string;
  active: boolean;
  defaultDiscountPercent: number;
  defaultCommissionPaise: number;
  monthlyEarningCapPaise: number;
};
const fallback: Campaign = {
  title: "Social media promotional partner",
  summary:
    "Share mypookie with your Instagram or Snapchat community and earn from every verified purchase made with your personal coupon.",
  active: true,
  defaultDiscountPercent: 10,
  defaultCommissionPaise: 1000,
  monthlyEarningCapPaise: 10000000,
};

export function CareersPage() {
  const [campaign, setCampaign] = useState(fallback);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch(`${api}/api/public/careers/campaign`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setCampaign)
      .catch(() => {});
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file)
      return setMessage("Please add a screenshot of your social profile.");
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    form.set("screenshot", file);
    try {
      const response = await fetch(`${api}/api/public/careers/applications`, {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.detail ||
            error?.message ||
            "Application could not be submitted.",
        );
      }
      event.currentTarget.reset();
      setFile(null);
      setMessage(
        "Application received! Our team will review your profile and contact you by email.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Application could not be submitted.",
      );
    } finally {
      setBusy(false);
    }
  }
  const cap = `₹${(campaign.monthlyEarningCapPaise / 100).toLocaleString("en-IN")}`;
  return (
    <main className="careers-page">
      <nav>
        <a className="career-brand" href="/">
          <img src="/mypookie-logo-mark.svg" alt="" /> <b>mypookie.</b>
          <small>BETA</small>
        </a>
        <a href="/">Back home</a>
      </nav>
      <header className="career-hero">
        <span>CAREERS · CREATOR PARTNERSHIPS</span>
        <h1>
          Turn your audience into
          <br />
          <em>something meaningful.</em>
        </h1>
        <p>
          Join a growing gifting brand, share moments people genuinely want to
          send, and earn when your community creates one.
        </p>
        <a href="#apply">Join the campaign ↓</a>
      </header>
      <section className="career-role">
        <div>
          <small>FEATURED OPPORTUNITY</small>
          <h2>{campaign.title}</h2>
          <p>{campaign.summary}</p>
          <div className="career-platforms">
            <span>◎ Instagram</span>
            <span>◌ Snapchat</span>
            <span>India · Remote</span>
          </div>
        </div>
        <aside>
          <small>MONTHLY EARNING POTENTIAL</small>
          <strong>Up to {cap}</strong>
          <p>
            Performance-based commission from verified, paid orders. Actual
            earnings depend on coupon usage and campaign terms.
          </p>
        </aside>
      </section>
      <section className="career-how">
        <small>HOW IT WORKS</small>
        <h2>Your handle. Your code. Your earnings.</h2>
        <div>
          {[
            [
              "01",
              "Apply",
              "Tell us about your audience and upload a profile screenshot.",
            ],
            [
              "02",
              "Get approved",
              "We review authenticity, audience fit and content quality.",
            ],
            [
              "03",
              "Receive your code",
              `Get a personal ${campaign.defaultDiscountPercent}% coupon with tracked sales.`,
            ],
            [
              "04",
              "Earn per sale",
              `Start from ₹${campaign.defaultCommissionPaise / 100} per verified use; final rate is set on approval.`,
            ],
          ].map(([n, t, d]) => (
            <article key={n}>
              <b>{n}</b>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="career-apply" id="apply">
        <div>
          <small>JOIN THE CAMPAIGN</small>
          <h2>Let’s grow together.</h2>
          <p>
            Send your real public profile details. We manually review every
            application.
          </p>
          <ul>
            <li>Instagram or Snapchat profile</li>
            <li>Original, active social presence</li>
            <li>Comfortable promoting digital gifts</li>
            <li>18 years or older</li>
          </ul>
        </div>
        <form onSubmit={submit}>
          <label>
            Full name
            <input
              name="fullName"
              maxLength={100}
              required
              placeholder="Your name"
            />
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              maxLength={180}
              required
              placeholder="you@example.com"
            />
          </label>
          <label>
            Platform
            <select name="platform" required defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="SNAPCHAT">Snapchat</option>
            </select>
          </label>
          <label>
            Social handle
            <input
              name="socialHandle"
              maxLength={100}
              required
              placeholder="@yourhandle"
            />
          </label>
          <label>
            Followers / audience size
            <input
              name="audienceSize"
              type="number"
              min="0"
              placeholder="Optional"
            />
          </label>
          <label className="career-wide">
            Why are you a good fit?
            <textarea
              name="pitch"
              maxLength={700}
              placeholder="Tell us about your content and audience…"
            />
          </label>
          <label className="career-upload career-wide">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <span>＋</span>
            <b>{file ? file.name : "Upload social profile screenshot"}</b>
            <small>JPG, PNG or WebP · maximum 5 MB</small>
          </label>
          <label className="career-consent career-wide">
            <input type="checkbox" required />
            <span>
              I confirm these details are mine and may be reviewed to assess
              this application.
            </span>
          </label>
          <button className="career-wide" disabled={busy || !campaign.active}>
            {!campaign.active
              ? "Applications paused"
              : busy
                ? "Submitting…"
                : "Submit application →"}
          </button>
          {message && <output className="career-wide">{message}</output>}
        </form>
      </section>
      <footer>
        <span>© 2026 mypookie.</span>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </main>
  );
}
