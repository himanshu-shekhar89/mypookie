"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  authHeaders,
  currentFirebaseUser,
  signInWithFirebase,
  signOutFirebase,
} from "./authClient";

const api =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-production-22bd.up.railway.app";
const rootAdmins = new Set([
  "himaanshushekharr.pvt@gmail.com",
  "himanshushekharr.pvt@gmail.com",
]);
type Overview = {
  users: number;
  gifts: number;
  orders: number;
  paidOrders: number;
  revenuePaise: number;
  responses: number;
  activeCoupons: number;
  integrations: { firebase: boolean; groq: boolean; razorpay: boolean };
};
type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  maxDiscountPaise: number | null;
  minOrderPaise: number;
  usageLimit: number | null;
  usedCount: number;
  couponType: "STANDARD" | "INFLUENCER";
  commissionPaisePerUse: number;
  commissionOwedPaise: number;
  validFrom: string | null;
  expiresAt: string | null;
  active: boolean;
};
type Activity = {
  id: string;
  name: string;
  description: string;
  pricePaise: number;
  active: boolean;
};
type Bundle = {
  id: string;
  name: string;
  description: string;
  pricePaise: number;
  activityIds: string;
  recipientType: "Lover" | "Friend" | "Parents" | "Sibling" | "Other";
  active: boolean;
};
type Gift = {
  id: string;
  title: string;
  recipientName: string;
  occasion: string;
  status: string;
  totalPaise: number;
  updatedAt: string;
};
type Order = {
  id: string;
  giftId: string;
  amountPaise: number;
  discountPaise: number;
  couponCode: string | null;
  status: string;
  providerOrderId: string;
  createdAt: string;
};
type User = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
};
type CareerCampaign = {
  id: string;
  title: string;
  summary: string;
  active: boolean;
  defaultDiscountPercent: number;
  defaultCommissionPaise: number;
  defaultCommissionType: "FIXED" | "PERCENT";
  defaultCommissionPercent: number;
  monthlyEarningCapPaise: number;
};
type CareerApplication = {
  id: string;
  fullName: string;
  email: string;
  platform: string;
  socialHandle: string;
  socialProfileUrl?: string;
  phone?: string;
  screenshotUrl: string;
  audienceSize: number | null;
  pitch: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  couponId: string | null;
  adminNote: string | null;
  createdAt: string;
};
type InvitationBulkRequest = {id:string;name:string;email:string;phone:string;quantity:number;eventType:string;message:string|null;status:string;adminNote:string|null;createdAt:string};
type Tab =
  | "overview"
  | "coupons"
  | "activities"
  | "bundles"
  | "gifts"
  | "orders"
  | "users"
  | "careers"
  | "bulk-invitations"
  | "settings";
type CouponForm = {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  maxDiscountPaise: string;
  minOrderPaise: string;
  usageLimit: string;
  couponType: "STANDARD" | "INFLUENCER";
  commissionRupees: string;
  expiresAt: string;
  active: boolean;
};
const emptyCoupon: CouponForm = {
  code: "",
  discountType: "PERCENT",
  discountValue: 10,
  maxDiscountPaise: "",
  minOrderPaise: "0",
  usageLimit: "",
  couponType: "STANDARD",
  commissionRupees: "",
  expiresAt: "",
  active: true,
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = await authHeaders("local-admin");
  const response = await fetch(`${api}${path}`, {
    ...options,
    headers: {
      ...auth,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const error = new Error(
      response.status === 403 ? "ADMIN_REQUIRED" : "REQUEST_FAILED",
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  if (response.status === 204 || response.headers.get("content-length") === "0")
    return undefined as T;
  return response.json();
}

export function AdminPanel({ onExit }: { onExit: () => void }) {
  const [authState, setAuthState] = useState<
    "checking" | "signed-out" | "ready" | "forbidden"
  >("checking");
  const [profile, setProfile] = useState<{
    email?: string | null;
    displayName?: string | null;
  }>({});
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [careerCampaign, setCareerCampaign] = useState<CareerCampaign | null>(
    null,
  );
  const [careerApplications, setCareerApplications] = useState<
    CareerApplication[]
  >([]);
  const [bulkInvitationRequests,setBulkInvitationRequests]=useState<InvitationBulkRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const isRootAdmin = rootAdmins.has(profile.email?.trim().toLowerCase() || "");

  const load = useCallback(async () => {
    setLoading(true);
    setNotice("");
    try {
      const [
        summary,
        couponRows,
        activityRows,
        bundleRows,
        giftRows,
        orderRows,
        userRows,
        careerCampaignRow,
        careerApplicationRows,
        bulkInvitationRows,
      ] = await Promise.all([
        request<Overview>("/api/admin/overview"),
        request<Coupon[]>("/api/admin/coupons"),
        request<Activity[]>("/api/admin/activities"),
        request<Bundle[]>("/api/admin/bundles"),
        request<Gift[]>("/api/admin/gifts"),
        request<Order[]>("/api/admin/orders"),
        request<User[]>("/api/admin/users"),
        request<CareerCampaign>("/api/admin/careers/campaign"),
        request<CareerApplication[]>("/api/admin/careers/applications"),
        request<InvitationBulkRequest[]>("/api/admin/invitation-bulk-requests"),
      ]);
      setOverview(summary);
      setCoupons(couponRows);
      setActivities(activityRows);
      setBundles(bundleRows);
      setGifts(giftRows);
      setOrders(orderRows);
      setUsers(userRows);
      setCareerCampaign(careerCampaignRow);
      setCareerApplications(careerApplicationRows);
      setBulkInvitationRequests(bulkInvitationRows);
      setAuthState("ready");
    } catch (error) {
      setAuthState(
        (error as Error).message === "ADMIN_REQUIRED"
          ? "forbidden"
          : "signed-out",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void currentFirebaseUser()
      .then((user) => {
        if (!user) {
          setAuthState("signed-out");
          return;
        }
        setProfile(user);
        void load();
      })
      .catch(() => setAuthState("signed-out"));
  }, [load]);
  useEffect(() => {
    if (authState !== "ready") return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [authState, load]);
  async function login() {
    setLoading(true);
    setNotice("");
    try {
      const user = await signInWithFirebase("google");
      setProfile(user);
      const headers = await authHeaders("local-admin");
      await fetch(`${api}/api/auth/session`, { method: "POST", headers });
      await load();
    } catch {
      setNotice(
        "Google sign-in did not finish. Check the Firebase authorized domain and try again.",
      );
      setAuthState("signed-out");
    } finally {
      setLoading(false);
    }
  }
  async function logout() {
    await signOutFirebase();
    setAuthState("signed-out");
    setOverview(null);
  }
  async function createCoupon() {
    setLoading(true);
    setNotice("");
    try {
      const body = {
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue:
          couponForm.discountType === "FIXED"
            ? Number(couponForm.discountValue) * 100
            : Number(couponForm.discountValue),
        maxDiscountPaise: couponForm.maxDiscountPaise
          ? Number(couponForm.maxDiscountPaise) * 100
          : null,
        minOrderPaise: Number(couponForm.minOrderPaise || 0) * 100,
        usageLimit: couponForm.usageLimit
          ? Number(couponForm.usageLimit)
          : null,
        couponType: couponForm.couponType,
        commissionPaisePerUse:
          couponForm.couponType === "INFLUENCER"
            ? Number(couponForm.commissionRupees || 0) * 100
            : 0,
        validFrom: null,
        expiresAt: couponForm.expiresAt
          ? new Date(couponForm.expiresAt).toISOString()
          : null,
        active: couponForm.active,
      };
      await request("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setCouponForm(emptyCoupon);
      setNotice("Coupon created.");
      await load();
    } catch {
      setNotice("Coupon could not be created. Check that its code is unique.");
    } finally {
      setLoading(false);
    }
  }
  async function saveCoupon(coupon: Coupon, patch: Partial<Coupon> = {}) {
    const next = { ...coupon, ...patch };
    await request(`/api/admin/coupons/${coupon.id}`, {
      method: "PUT",
      body: JSON.stringify({
        code: next.code,
        discountType: next.discountType,
        discountValue: next.discountValue,
        maxDiscountPaise: next.maxDiscountPaise,
        minOrderPaise: next.minOrderPaise,
        usageLimit: next.usageLimit,
        couponType: next.couponType,
        commissionPaisePerUse: next.commissionPaisePerUse,
        validFrom: next.validFrom,
        expiresAt: next.expiresAt,
        active: next.active,
      }),
    });
    await load();
  }
  async function saveActivity(activity: Activity) {
    await request(`/api/admin/activities/${activity.id}`, {
      method: "PUT",
      body: JSON.stringify(activity),
    });
    setNotice(`${activity.name} updated.`);
    await load();
  }
  async function saveBundle(bundle: Bundle) {
    await request(`/api/admin/bundles/${bundle.id}`, {
      method: "PUT",
      body: JSON.stringify(bundle),
    });
    setNotice(`${bundle.name} updated.`);
    await load();
  }
  async function updateRole(user: User, role: string) {
    setNotice("");
    try {
      await request(`/api/admin/users/${user.id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      setNotice(`${user.email} is now ${role.toLowerCase()}.`);
      await load();
    } catch (error) {
      setNotice(
        (error as Error & { status?: number }).status === 403
          ? "Only the two root administrators can add or remove admins."
          : "This role could not be changed.",
      );
    }
  }
  async function saveCareerCampaign() {
    if (!careerCampaign) return;
    setLoading(true);
    try {
      await request("/api/admin/careers/campaign", {
        method: "PUT",
        body: JSON.stringify(careerCampaign),
      });
      setNotice("Careers campaign updated.");
      await load();
    } finally {
      setLoading(false);
    }
  }
  async function decideCareer(
    application: CareerApplication,
    decision: "approve" | "reject",
  ) {
    setLoading(true);
    setNotice("");
    try {
      if (decision === "approve") {
        const commissionType = (window.prompt("Commission type for this influencer: FIXED or PERCENT", careerCampaign?.defaultCommissionType || "FIXED") || "FIXED").toUpperCase() === "PERCENT" ? "PERCENT" : "FIXED";
        const suggestedCommission = commissionType === "PERCENT" ? (careerCampaign?.defaultCommissionPercent || 10) : ((careerCampaign?.defaultCommissionPaise || 1000) / 100);
        const commissionValue = Math.max(0, Number(window.prompt(commissionType === "PERCENT" ? "Commission percentage per paid order" : "Fixed commission in rupees per paid order", String(suggestedCommission))) || 0);
        const base =
          application.socialHandle
            .replace(/^@/, "")
            .replace(/[^a-z0-9]/gi, "")
            .toUpperCase()
            .slice(0, 14) || "POOKIE";
        await request(
          `/api/admin/careers/applications/${application.id}/approve`,
          {
            method: "POST",
            body: JSON.stringify({
              couponCode: `${base}${application.id.slice(0, 4).toUpperCase()}`,
              discountPercent: careerCampaign?.defaultDiscountPercent || 10,
              commissionPaisePerUse:
                commissionType === "FIXED" ? commissionValue * 100 : 0,
              commissionType,
              commissionPercent: commissionType === "PERCENT" ? Math.min(100, commissionValue) : 0,
              adminNote: "Approved through careers console",
            }),
          },
        );
        setNotice(
          `${application.fullName} approved and influencer coupon created.`,
        );
      } else {
        await request(
          `/api/admin/careers/applications/${application.id}/reject`,
          {
            method: "POST",
            body: JSON.stringify({
              adminNote:
                "Application did not meet the current campaign criteria.",
            }),
          },
        );
        setNotice(`${application.fullName}'s application was declined.`);
      }
      await load();
    } catch {
      setNotice(
        "Decision could not be saved. The generated coupon may already exist—edit the handle or create one manually.",
      );
    } finally {
      setLoading(false);
    }
  }
  const nav = useMemo(
    () =>
      [
        { id: "overview", icon: "⌂", label: "Overview" },
        { id: "coupons", icon: "%", label: "Coupons" },
        { id: "activities", icon: "✦", label: "Blocks & pricing" },
        { id: "bundles", icon: "▦", label: "Bundles" },
        { id: "gifts", icon: "♡", label: "Gifts" },
        { id: "orders", icon: "₹", label: "Orders" },
        { id: "users", icon: "◎", label: "Users" },
        { id: "careers", icon: "↗", label: "Careers" },
        { id: "bulk-invitations", icon: "✉", label: "Bulk invitations" },
        { id: "settings", icon: "⚙", label: "Integrations" },
      ] as { id: Tab; icon: string; label: string }[],
    [],
  );

  if (authState === "checking")
    return (
      <main className="admin-auth">
        <span>♡</span>
        <p>Opening your control room…</p>
      </main>
    );
  if (authState === "signed-out")
    return (
      <main className="admin-auth">
        <section>
          <button className="brand" onClick={onExit}>
            <span className="brand-heart">♥</span> mypookie.
          </button>
          <i>⚙</i>
          <small>PRIVATE OPERATIONS CONSOLE</small>
          <h1>Everything behind the magic.</h1>
          <p>
            Sign in with the approved administrator account to manage pricing,
            coupons, gifts, payments and integrations.
          </p>
          <button className="admin-google" disabled={loading} onClick={login}>
            <b>G</b>
            {loading ? "Connecting securely…" : "Continue with Google"}
          </button>
          {notice && <output>{notice}</output>}
          <button className="admin-back" onClick={onExit}>
            ← Return to mypookie.
          </button>
        </section>
      </main>
    );
  if (authState === "forbidden")
    return (
      <main className="admin-auth">
        <section>
          <button className="brand" onClick={onExit}>
            <span className="brand-heart">♥</span> mypookie.
          </button>
          <i>⌁</i>
          <small>ACCESS LIMITED</small>
          <h1>This account is not an admin.</h1>
          <p>
            {profile.email} is signed in, but it is not on the administrator
            allowlist.
          </p>
          <button className="admin-google" onClick={logout}>
            Sign out and use another account
          </button>
          <button className="admin-back" onClick={onExit}>
            ← Return to mypookie.
          </button>
        </section>
      </main>
    );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <button className="brand" onClick={onExit}>
          <span className="brand-heart">♥</span> mypookie.
        </button>
        <small>ADMIN CONSOLE</small>
        <nav>
          {nav.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              onClick={() => setTab(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-profile">
          <b>
            {(profile.displayName || profile.email || "A")
              .charAt(0)
              .toUpperCase()}
          </b>
          <span>
            <strong>{profile.displayName || "Administrator"}</strong>
            <small>{profile.email}</small>
          </span>
          <button onClick={logout}>↗</button>
        </div>
      </aside>
      <section className="admin-workspace">
        <header>
          <div>
            <small>MYPOOKIE OPERATIONS</small>
            <h1>{nav.find((item) => item.id === tab)?.label}</h1>
          </div>
          <div>
            <button onClick={() => void load()}>
              {loading ? "Refreshing…" : "↻ Refresh"}
            </button>
            <button className="admin-view-site" onClick={onExit}>
              View site ↗
            </button>
          </div>
        </header>
        {notice && <div className="admin-notice">{notice}</div>}
        {tab === "overview" && overview && (
          <AdminOverview
            data={overview}
            gifts={gifts.slice(0, 5)}
            orders={orders.slice(0, 5)}
          />
        )}
        {tab === "coupons" && (
          <section className="admin-section">
            <div className="admin-section-head">
              <div>
                <small>DISCOUNTS</small>
                <h2>Coupon control</h2>
                <p>Create codes without touching checkout code.</p>
              </div>
            </div>
            <div className="coupon-create">
              <label>
                Code
                <input
                  value={couponForm.code}
                  onChange={(event) =>
                    setCouponForm({
                      ...couponForm,
                      code: event.target.value.toUpperCase(),
                    })
                  }
                  placeholder="POOKIE20"
                />
              </label>
              <label>
                Type
                <select
                  value={couponForm.discountType}
                  onChange={(event) =>
                    setCouponForm({
                      ...couponForm,
                      discountType: event.target.value as "PERCENT" | "FIXED",
                    })
                  }
                >
                  <option value="PERCENT">Percentage</option>
                  <option value="FIXED">Fixed ₹</option>
                </select>
              </label>
              <label>
                Coupon owner
                <select
                  value={couponForm.couponType}
                  onChange={(event) =>
                    setCouponForm({
                      ...couponForm,
                      couponType: event.target.value as
                        "STANDARD" | "INFLUENCER",
                    })
                  }
                >
                  <option value="STANDARD">Standard promotion</option>
                  <option value="INFLUENCER">Influencer partner</option>
                </select>
              </label>
              {couponForm.couponType === "INFLUENCER" && (
                <label>
                  Commission / sale ₹
                  <input
                    type="number"
                    min="0"
                    value={couponForm.commissionRupees}
                    onChange={(event) =>
                      setCouponForm({
                        ...couponForm,
                        commissionRupees: event.target.value,
                      })
                    }
                  />
                </label>
              )}
              <label>
                Value
                <input
                  type="number"
                  min="1"
                  value={couponForm.discountValue}
                  onChange={(event) =>
                    setCouponForm({
                      ...couponForm,
                      discountValue: Number(event.target.value),
                    })
                  }
                />
              </label>
              <label>
                Minimum ₹
                <input
                  type="number"
                  min="0"
                  value={couponForm.minOrderPaise}
                  onChange={(event) =>
                    setCouponForm({
                      ...couponForm,
                      minOrderPaise: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Usage limit
                <input
                  type="number"
                  min="1"
                  value={couponForm.usageLimit}
                  onChange={(event) =>
                    setCouponForm({
                      ...couponForm,
                      usageLimit: event.target.value,
                    })
                  }
                  placeholder="Unlimited"
                />
              </label>
              <label>
                Expires
                <input
                  type="datetime-local"
                  value={couponForm.expiresAt}
                  onChange={(event) =>
                    setCouponForm({
                      ...couponForm,
                      expiresAt: event.target.value,
                    })
                  }
                />
              </label>
              <button
                disabled={!couponForm.code || loading}
                onClick={createCoupon}
              >
                ＋ Create coupon
              </button>
            </div>
            {coupons.some((coupon) => coupon.couponType === "INFLUENCER") && (
              <section className="influencer-coupons">
                <small>INFLUENCER PAYOUTS</small>
                <h3>Commission due</h3>
                <div>
                  {coupons
                    .filter((coupon) => coupon.couponType === "INFLUENCER")
                    .map((coupon) => {
                      const paidUses = orders.filter(
                        (order) =>
                          order.status === "PAID" &&
                          order.couponCode?.toUpperCase() ===
                            coupon.code.toUpperCase(),
                      ).length;
                      return (
                        <article key={coupon.id}>
                          <strong>{coupon.code}</strong>
                          <span>
                            {paidUses} paid uses × ₹
                            {coupon.commissionPaisePerUse / 100}
                          </span>
                          <b>
                            ₹
                            {(
                              (paidUses * coupon.commissionPaisePerUse) /
                              100
                            ).toLocaleString("en-IN")}{" "}
                            due
                          </b>
                        </article>
                      );
                    })}
                </div>
              </section>
            )}
            <div className="admin-table">
              <div className="admin-table-row heading">
                <span>Code</span>
                <span>Offer</span>
                <span>Usage</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {coupons.map((coupon) => (
                <div className="admin-table-row" key={coupon.id}>
                  <strong>{coupon.code}</strong>
                  <span>
                    {coupon.discountType === "PERCENT"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue / 100}`}
                  </span>
                  <span>
                    {coupon.usedCount}
                    {coupon.usageLimit
                      ? ` / ${coupon.usageLimit}`
                      : " · unlimited"}
                  </span>
                  <span
                    className={coupon.active ? "status-live" : "status-off"}
                  >
                    {coupon.active ? "Active" : "Disabled"}
                  </span>
                  <button
                    onClick={() =>
                      saveCoupon(coupon, { active: !coupon.active })
                    }
                  >
                    {coupon.active ? "Disable" : "Enable"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        {tab === "activities" && (
          <section className="admin-section">
            <div className="admin-section-head">
              <div>
                <small>CATALOG</small>
                <h2>Blocks and pricing</h2>
                <p>
                  Changes affect every new gift and server-calculated checkout.
                </p>
              </div>
            </div>
            <div className="admin-card-grid">
              {activities.map((activity) => (
                <article className="admin-edit-card" key={activity.id}>
                  <div>
                    <span>✦</span>
                    <label className="admin-switch">
                      <input
                        type="checkbox"
                        checked={activity.active}
                        onChange={(event) =>
                          setActivities((current) =>
                            current.map((item) =>
                              item.id === activity.id
                                ? { ...item, active: event.target.checked }
                                : item,
                            ),
                          )
                        }
                      />
                      <i />
                    </label>
                  </div>
                  <input
                    className="admin-title-input"
                    value={activity.name}
                    onChange={(event) =>
                      setActivities((current) =>
                        current.map((item) =>
                          item.id === activity.id
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <textarea
                    value={activity.description}
                    onChange={(event) =>
                      setActivities((current) =>
                        current.map((item) =>
                          item.id === activity.id
                            ? { ...item, description: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <label>
                    Price ₹
                    <input
                      type="number"
                      value={activity.pricePaise / 100}
                      onChange={(event) =>
                        setActivities((current) =>
                          current.map((item) =>
                            item.id === activity.id
                              ? {
                                  ...item,
                                  pricePaise: Number(event.target.value) * 100,
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <button onClick={() => saveActivity(activity)}>
                    Save block
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
        {tab === "bundles" && (
          <section className="admin-section">
            <div className="admin-section-head">
              <div>
                <small>PACKAGES</small>
                <h2>Bundle manager</h2>
                <p>
                  Control every recipient-specific experience and its price.
                </p>
              </div>
            </div>
            <div className="admin-card-grid bundles">
              {bundles.map((bundle) => (
                <article className="admin-edit-card" key={bundle.id}>
                  <div>
                    <span>▦</span>
                    <label className="admin-switch">
                      <input
                        type="checkbox"
                        checked={bundle.active}
                        onChange={(event) =>
                          setBundles((current) =>
                            current.map((item) =>
                              item.id === bundle.id
                                ? { ...item, active: event.target.checked }
                                : item,
                            ),
                          )
                        }
                      />
                      <i />
                    </label>
                  </div>
                  <label>
                    Made for
                    <select
                      value={bundle.recipientType}
                      onChange={(event) =>
                        setBundles((current) =>
                          current.map((item) =>
                            item.id === bundle.id
                              ? {
                                  ...item,
                                  recipientType: event.target
                                    .value as Bundle["recipientType"],
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      <option>Lover</option>
                      <option>Friend</option>
                      <option>Parents</option>
                      <option>Sibling</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <input
                    className="admin-title-input"
                    value={bundle.name}
                    onChange={(event) =>
                      setBundles((current) =>
                        current.map((item) =>
                          item.id === bundle.id
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <textarea
                    value={bundle.description}
                    onChange={(event) =>
                      setBundles((current) =>
                        current.map((item) =>
                          item.id === bundle.id
                            ? { ...item, description: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <label>
                    Bundle price ₹
                    <input
                      type="number"
                      value={bundle.pricePaise / 100}
                      onChange={(event) =>
                        setBundles((current) =>
                          current.map((item) =>
                            item.id === bundle.id
                              ? {
                                  ...item,
                                  pricePaise: Number(event.target.value) * 100,
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <button onClick={() => saveBundle(bundle)}>
                    Save bundle
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
        {tab === "gifts" && (
          <DataTable
            title="All gifts"
            columns={["Gift", "Recipient", "Occasion", "Value", "Status"]}
            rows={gifts.map((gift) => [
              gift.title,
              gift.recipientName,
              gift.occasion,
              `₹${gift.totalPaise / 100}`,
              gift.status,
            ])}
          />
        )}
        {tab === "orders" && (
          <DataTable
            title="Payments and orders"
            columns={["Order", "Amount", "Coupon", "Status", "Created"]}
            rows={orders.map((order) => [
              order.id.slice(0, 8),
              `₹${order.amountPaise / 100}`,
              order.couponCode || "—",
              order.status,
              new Date(order.createdAt).toLocaleDateString(),
            ])}
          />
        )}
        {tab === "users" && (
          <section className="admin-section">
            <div className="admin-section-head">
              <div>
                <small>ACCOUNTS</small>
                <h2>Users and roles</h2>
                <p>
                  {isRootAdmin
                    ? "You are a root administrator and can grant or remove admin access."
                    : "Admin access can only be changed by a root administrator."}
                </p>
              </div>
            </div>
            <div className="admin-table users">
              <div className="admin-table-row heading">
                <span>User</span>
                <span>Email</span>
                <span>Joined</span>
                <span>Role</span>
                <span>Access</span>
              </div>
              {users.map((user) => (
                <div className="admin-table-row" key={user.id}>
                  <strong>{user.displayName || "mypookie user"}</strong>
                  <span>{user.email}</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  <span>
                    {rootAdmins.has(user.email?.trim().toLowerCase())
                      ? "ROOT ADMIN"
                      : user.role}
                  </span>
                  <small>
                    {rootAdmins.has(user.email?.trim().toLowerCase())
                      ? "Permanent admin"
                      : "User access only"}
                  </small>
                </div>
              ))}
            </div>
          </section>
        )}
        {tab === "careers" && careerCampaign && (
          <section className="admin-section careers-admin">
            <div className="admin-section-head">
              <div>
                <small>PARTNER PROGRAM</small>
                <h2>Careers campaign</h2>
                <p>
                  Control applications and automatically issue tracked
                  influencer coupons.
                </p>
              </div>
              <a href="/careers" target="_blank">
                View public page ↗
              </a>
            </div>
            <div className="career-campaign-editor">
              <label>
                Campaign title
                <input
                  value={careerCampaign.title}
                  onChange={(e) =>
                    setCareerCampaign({
                      ...careerCampaign,
                      title: e.target.value,
                    })
                  }
                />
              </label>
              <label className="wide">
                Public description
                <textarea
                  value={careerCampaign.summary}
                  onChange={(e) =>
                    setCareerCampaign({
                      ...careerCampaign,
                      summary: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Default customer discount %
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={careerCampaign.defaultDiscountPercent}
                  onChange={(e) =>
                    setCareerCampaign({
                      ...careerCampaign,
                      defaultDiscountPercent: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Default commission type
                <select value={careerCampaign.defaultCommissionType || "FIXED"} onChange={(e)=>setCareerCampaign({...careerCampaign,defaultCommissionType:e.target.value as "FIXED"|"PERCENT"})}>
                  <option value="FIXED">Fixed ₹ per sale</option>
                  <option value="PERCENT">Percentage per sale</option>
                </select>
              </label>
              <label>
                {careerCampaign.defaultCommissionType === "PERCENT" ? "Default commission %" : "Default commission per sale ₹"}
                <input type="number" min="0" max={careerCampaign.defaultCommissionType === "PERCENT" ? "100" : undefined}
                  value={careerCampaign.defaultCommissionType === "PERCENT" ? careerCampaign.defaultCommissionPercent || 0 : careerCampaign.defaultCommissionPaise / 100}
                  onChange={(e) => setCareerCampaign(careerCampaign.defaultCommissionType === "PERCENT" ? {...careerCampaign,defaultCommissionPercent:Number(e.target.value)} : {...careerCampaign,defaultCommissionPaise:Number(e.target.value)*100})}/>
              </label>
              <label>
                Public monthly potential ₹
                <input
                  type="number"
                  min="1"
                  value={careerCampaign.monthlyEarningCapPaise / 100}
                  onChange={(e) =>
                    setCareerCampaign({
                      ...careerCampaign,
                      monthlyEarningCapPaise: Number(e.target.value) * 100,
                    })
                  }
                />
              </label>
              <label className="career-active">
                <input
                  type="checkbox"
                  checked={careerCampaign.active}
                  onChange={(e) =>
                    setCareerCampaign({
                      ...careerCampaign,
                      active: e.target.checked,
                    })
                  }
                />
                <span>Accepting applications</span>
              </label>
              <button disabled={loading} onClick={saveCareerCampaign}>
                Save campaign
              </button>
            </div>
            <div className="admin-section-head career-applicant-head">
              <div>
                <small>APPLICATIONS</small>
                <h2>
                  {
                    careerApplications.filter(
                      (item) => item.status === "PENDING",
                    ).length
                  }{" "}
                  awaiting review
                </h2>
              </div>
            </div>
            <div className="career-applications">
              {careerApplications.length === 0 && <p>No applications yet.</p>}
              {careerApplications.map((application) => (
                <article key={application.id}>
                  <a
                    href={application.socialProfileUrl || application.screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {application.screenshotUrl ? <img src={application.screenshotUrl} alt={`${application.socialHandle} profile`} /> : <span>Open social profile ↗</span>}
                  </a>
                  <div>
                    <small>
                      {application.platform} · {application.status}
                    </small>
                    <h3>{application.fullName}</h3>
                    <strong>{application.socialHandle}</strong>
                    <p>
                      {application.phone || application.email}
                      {application.email && application.phone ? ` · ${application.email}` : ""}
                      {application.audienceSize != null
                        ? ` · ${application.audienceSize.toLocaleString("en-IN")} followers`
                        : ""}
                    </p>
                    {application.pitch && (
                      <blockquote>{application.pitch}</blockquote>
                    )}
                    {application.couponId && (
                      <b className="career-approved">
                        Influencer coupon issued
                      </b>
                    )}
                  </div>
                  {application.status === "PENDING" && (
                    <footer>
                      <button
                        disabled={loading}
                        onClick={() => decideCareer(application, "approve")}
                      >
                        Approve + issue code
                      </button>
                      <button
                        disabled={loading}
                        onClick={() => decideCareer(application, "reject")}
                      >
                        Decline
                      </button>
                    </footer>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
        {tab === "bulk-invitations" && (
          <section className="admin-section">
            <div className="admin-section-head"><div><small>SALES LEADS</small><h2>Bulk invitation requests</h2><p>Contact customers and track every discounted bulk enquiry.</p></div><b>{bulkInvitationRequests.filter(item=>item.status==="PENDING").length} new</b></div>
            <div className="career-applications bulk-request-admin">
              {bulkInvitationRequests.length===0&&<p>No bulk requests yet.</p>}
              {bulkInvitationRequests.map(item=><article key={item.id}><div><small>{new Date(item.createdAt).toLocaleString()}</small><h3>{item.name} · {item.quantity} invitations</h3><p><b>{item.eventType}</b> · <a href={`mailto:${item.email}`}>{item.email}</a> · <a href={`tel:${item.phone}`}>{item.phone}</a></p>{item.message&&<p>{item.message}</p>}<label>Admin note<textarea defaultValue={item.adminNote||""} id={`bulk-note-${item.id}`}/></label><div className="career-actions"><button onClick={async()=>{const note=(document.getElementById(`bulk-note-${item.id}`) as HTMLTextAreaElement)?.value||"";await request(`/api/admin/invitation-bulk-requests/${item.id}`,{method:"PUT",body:JSON.stringify({status:"CONTACTED",adminNote:note})});setNotice(`${item.name} marked contacted.`);await load()}}>Mark contacted</button><button onClick={async()=>{await request(`/api/admin/invitation-bulk-requests/${item.id}`,{method:"PUT",body:JSON.stringify({status:"CLOSED",adminNote:item.adminNote||""})});await load()}}>Close</button><span>{item.status}</span></div></div></article>)}
            </div>
          </section>
        )}
        {tab === "settings" && overview && (
          <section className="admin-section">
            <div className="admin-section-head">
              <div>
                <small>SYSTEMS</small>
                <h2>Integration health</h2>
                <p>
                  Secrets stay server-side. This screen only shows connection
                  readiness.
                </p>
              </div>
            </div>
            <div className="integration-grid">
              <Integration
                name="Firebase Authentication"
                detail="Google sign-in and protected admin access"
                ready={overview.integrations.firebase}
              />
              <Integration
                name="Groq AI"
                detail="Playful quiz question generation"
                ready={overview.integrations.groq}
              />
              <Integration
                name="Razorpay"
                detail="Orders, Checkout and signature verification"
                ready={overview.integrations.razorpay}
              />
              <Integration
                name="Database"
                detail="Coupons, gifts, orders and responses"
                ready
              />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function AdminOverview({
  data,
  gifts,
  orders,
}: {
  data: Overview;
  gifts: Gift[];
  orders: Order[];
}) {
  const metrics = [
    ["Revenue", `₹${(data.revenuePaise / 100).toLocaleString("en-IN")}`, "↗"],
    ["Paid orders", String(data.paidOrders), "✓"],
    ["Gifts created", String(data.gifts), "♡"],
    ["Users", String(data.users), "◎"],
    ["Responses", String(data.responses), "✦"],
    ["Active coupons", String(data.activeCoupons), "%"],
  ];
  return (
    <>
      <div className="admin-metrics">
        {metrics.map((metric) => (
          <article key={metric[0]}>
            <span>{metric[2]}</span>
            <small>{metric[0]}</small>
            <strong>{metric[1]}</strong>
          </article>
        ))}
      </div>
      <div className="admin-overview-grid">
        <DataTable
          title="Recent gifts"
          columns={["Gift", "Recipient", "Value", "Status"]}
          rows={gifts.map((gift) => [
            gift.title,
            gift.recipientName,
            `₹${gift.totalPaise / 100}`,
            gift.status,
          ])}
        />
        <DataTable
          title="Recent orders"
          columns={["Order", "Amount", "Coupon", "Status"]}
          rows={orders.map((order) => [
            order.id.slice(0, 8),
            `₹${order.amountPaise / 100}`,
            order.couponCode || "—",
            order.status,
          ])}
        />
      </div>
    </>
  );
}
function DataTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <section className="admin-section data">
      <div className="admin-section-head">
        <div>
          <small>LIVE DATA</small>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="admin-data-table">
        <div
          style={{
            gridTemplateColumns: `repeat(${columns.length},minmax(110px,1fr))`,
          }}
        >
          {columns.map((column) => (
            <strong key={column}>{column}</strong>
          ))}
        </div>
        {rows.length ? (
          rows.map((row, index) => (
            <div
              key={index}
              style={{
                gridTemplateColumns: `repeat(${columns.length},minmax(110px,1fr))`,
              }}
            >
              {row.map((value, itemIndex) => (
                <span key={itemIndex}>{value}</span>
              ))}
            </div>
          ))
        ) : (
          <p>No records yet.</p>
        )}
      </div>
    </section>
  );
}
function Integration({
  name,
  detail,
  ready,
}: {
  name: string;
  detail: string;
  ready: boolean;
}) {
  return (
    <article className="integration-card">
      <span className={ready ? "ready" : ""}>{ready ? "✓" : "!"}</span>
      <div>
        <strong>{name}</strong>
        <p>{detail}</p>
      </div>
      <b>{ready ? "Connected" : "Needs keys"}</b>
    </article>
  );
}
