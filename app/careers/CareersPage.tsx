"use client";

import { FormEvent, useEffect, useState } from "react";
import { authHeaders, signInWithFirebase, watchFirebaseAuth } from "../authClient";

const api =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-production-22bd.up.railway.app";
type Campaign = {
  title: string;
  summary: string;
  active: boolean;
  defaultDiscountPercent: number;
  defaultCommissionPaise: number;
  defaultCommissionType?: "FIXED" | "PERCENT";
  defaultCommissionPercent?: number;
  monthlyEarningCapPaise: number;
};
const fallback: Campaign = {
  title: "Social media promotional partner",
  summary:
    "Share mypookie with your Instagram or Snapchat community and earn from every verified purchase made with your personal coupon.",
  active: true,
  defaultDiscountPercent: 10,
  defaultCommissionPaise: 1000,
  defaultCommissionType: "FIXED",
  defaultCommissionPercent: 0,
  monthlyEarningCapPaise: 10000000,
};

export function CareersPage() {
  const [campaign, setCampaign] = useState(fallback);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<{ displayName: string | null; email: string | null } | null>(null);
  const [dashboard, setDashboard] = useState<Record<string, any> | null>(null);
  useEffect(() => {
    fetch(`${api}/api/public/careers/campaign`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setCampaign)
      .catch(() => {});
  }, []);
  useEffect(() => watchFirebaseAuth((next) => {
    setUser(next);
    if (!next) { setDashboard(null); return; }
    void authHeaders().then((headers) => fetch(`${api}/api/public/careers/me`, { headers, cache: "no-store" }))
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setDashboard).catch(() => setDashboard(null));
  }), []);
  async function googleLogin() {
    try { await signInWithFirebase("google"); }
    catch { setMessage("Google sign-in could not be completed. Please try again."); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${api}/api/public/careers/applications`, {
        method: "POST",
        headers: await authHeaders(),
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
      setMessage(
        "Application received! Our team will review your profile and contact you shortly.",
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
              "Share your public profile link and phone number.",
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
              campaign.defaultCommissionType === "PERCENT"
                ? `Earn up to ${campaign.defaultCommissionPercent || 0}% per verified order; your final rate is set by admin.`
                : `Earn per verified order; your final commission is set by admin.`,
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
        {!user ? (
          <div className="career-google-gate">
            <span>G</span><h3>Continue with Google</h3>
            <p>Your Google account securely connects your application to your private coupon dashboard.</p>
            <button type="button" onClick={googleLogin}>Sign in with Google →</button>
          </div>
        ) : dashboard?.status === "APPROVED" ? (
          <div className="influencer-dashboard">
            <small>YOUR CREATOR DASHBOARD</small><h3>Welcome, {user.displayName || "creator"}</h3>
            <div className="influencer-stats">
              <article><span>Coupon</span><strong>{dashboard.couponCode}</strong></article>
              <article><span>Verified uses</span><strong>{dashboard.uses || 0}</strong></article>
              <article><span>Earnings</span><strong>₹{((dashboard.earningsPaise || 0) / 100).toLocaleString("en-IN")}</strong></article>
            </div>
            <div className="usage-chart" aria-label="Coupon uses by day">
              {Object.entries(dashboard.dailyUsage || {}).map(([day, value]) => <div key={day}><i style={{ height: `${Math.max(12, Number(value) * 22)}px` }} /><small>{day.slice(5)}</small></div>)}
              {!Object.keys(dashboard.dailyUsage || {}).length && <p>Your usage graph will appear after the first verified order.</p>}
            </div>
          </div>
        ) : dashboard && dashboard.status !== "NOT_APPLIED" ? (
          <div className="career-google-gate"><span>✓</span><h3>Application {String(dashboard.status).toLowerCase()}</h3><p>Signed in as {user.email}. Your dashboard will unlock after approval.</p></div>
        ) : <form onSubmit={submit}>
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
            Phone number
            <input
              name="phone"
              type="tel"
              maxLength={20}
              required
              placeholder="+91 98765 43210"
            />
          </label>
          <label className="career-wide">
            Social media profile link
            <input
              name="socialProfileUrl"
              type="url"
              maxLength={500}
              required
              placeholder="https://instagram.com/yourprofile"
            />
          </label>
          <label>
            Email address <small>(optional)</small>
            <input
              name="email"
              type="email"
              maxLength={180}
              placeholder="you@example.com"
            />
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
        </form>}
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
