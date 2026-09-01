"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { authHeaders } from "../authClient";
import "./invitations.css";
import "./invitations-v2.css";
import "./invitations-v3.css";
import "./invitations-v4.css";
type EventItem = {
  name: string;
  date: string;
  time: string;
  venue: string;
  mapUrl: string;
  note: string;
  sticker: string;
  pageDesign: string;
  posterImage: string;
};
type Details = {
  couple: string;
  receiverName: string;
  hostLine: string;
  message: string;
  theme: string;
  animation: string;
  coverImage: string;
  coverDesign: string;
  border: string;
  gallery: string[];
  events: EventItem[];
  musicUrl: string;
  musicName: string;
  showCountdown: boolean;
  countdownDate: string;
};
const api =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-production-22bd.up.railway.app";
const traditions = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Civil",
  "Interfaith",
  "Custom",
];
const artwork: Record<string, string> = {
  Hindu: "/invite-hindu.png",
  Muslim: "/invite-muslim.png",
  Christian: "/invite-christian.png",
  Custom: "/invite-custom.png",
};
const templates = [
  {
    name: "Hindu wedding",
    tradition: "Hindu",
    image: artwork.Hindu,
    copy: "Mandap, marigolds and a joyful beginning.",
  },
  {
    name: "Nikah & Walima",
    tradition: "Muslim",
    image: artwork.Muslim,
    copy: "An elegant emerald celebration.",
  },
  {
    name: "Church wedding",
    tradition: "Christian",
    image: artwork.Christian,
    copy: "Soft florals and timeless details.",
  },
  {
    name: "Engagement",
    tradition: "Custom",
    image: artwork.Custom,
    copy: "A joyful beginning-of-forever announcement.",
  },
  {
    name: "Custom event",
    tradition: "Custom",
    image: artwork.Custom,
    copy: "Birthday, anniversary—or anything you imagine.",
  },
];
const blankEvent = (
  name = "Custom page",
  sticker = "Celebration",
): EventItem => ({
  name,
  date: "",
  time: "",
  venue: "",
  mapUrl: "",
  note: "",
  sticker,
  pageDesign: "Ivory bloom",
  posterImage: "",
});
const eventCatalog: Record<string, [string, string][]> = {
  Hindu: [
    ["Haldi", "Haldi"],
    ["Mehendi", "Mehendi"],
    ["Sangeet", "Sangeet"],
    ["Baraat", "Wedding"],
    ["Shaadi", "Wedding"],
    ["Reception", "Reception"],
    ["Godh Bharai", "Celebration"],
    ["Griha Pravesh", "Celebration"],
    ["Inauguration", "Celebration"],
  ],
  Muslim: [
    ["Manjha", "Haldi"],
    ["Mehendi", "Mehendi"],
    ["Nikah", "Nikah"],
    ["Rukhsati", "Wedding"],
    ["Walima", "Reception"],
  ],
  Christian: [
    ["Engagement", "Engagement"],
    ["Bridal shower", "Celebration"],
    ["Church ceremony", "Christian"],
    ["Reception", "Reception"],
  ],
  Sikh: [
    ["Roka", "Engagement"],
    ["Chunni ceremony", "Celebration"],
    ["Jaggo", "Sangeet"],
    ["Anand Karaj", "Sikh"],
    ["Reception", "Reception"],
  ],
  Civil: [
    ["Engagement", "Engagement"],
    ["Civil ceremony", "Wedding"],
    ["Dinner & reception", "Reception"],
  ],
  Interfaith: [
    ["Welcome ceremony", "Celebration"],
    ["Wedding ceremony", "Wedding"],
    ["Reception", "Reception"],
  ],
  Custom: [
    ["Birthday", "Celebration"],
    ["Baby shower", "Celebration"],
    ["Godh Bharai", "Celebration"],
    ["Housewarming", "Celebration"],
    ["Inauguration", "Celebration"],
    ["Anniversary", "Celebration"],
  ],
};
const pageStyles = [
  "Ivory bloom",
  "Rose garden",
  "Emerald arch",
  "Midnight gold",
  "Marigold glow",
  "Royal blue",
  "Lilac dream",
  "Terracotta",
  "Minimal pearl",
  "Festive teal",
];
const empty: Details = {
  couple: "Aarav & Aanya",
  receiverName: "",
  hostLine: "TOGETHER WITH THEIR FAMILIES",
  message: "With joyful hearts, we invite you to celebrate with us.",
  theme: "garden",
  animation: "page",
  coverImage: artwork.Hindu,
  coverDesign: "Editorial",
  border: "Golden arch",
  gallery: [],
  events: [],
  musicUrl: "",
  musicName: "Our celebration song",
  showCountdown: false,
  countdownDate: "",
};
const stickerNames = [
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Wedding",
  "Engagement",
  "Reception",
  "Nikah",
  "Christian",
  "Sikh",
  "Calendar",
  "Countdown",
  "Celebration",
];
function Sticker({ kind }: { kind: string }) {
  const n = Math.max(0, stickerNames.indexOf(kind));
  return (
    <i
      className="invite-sticker"
      style={
        {
          "--sx": `${(n % 4) * 33.333}%`,
          "--sy": `${Math.floor(n / 4) * 50}%`,
        } as CSSProperties
      }
    />
  );
}
function calendarUrl(e: EventItem) {
  const start = `${e.date.replaceAll("-", "")}T${(e.time || "12:00").replace(":", "")}00`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.name || "Celebration")}&dates=${start}/${start}&location=${encodeURIComponent(e.venue)}&details=${encodeURIComponent(e.note)}`;
}
function Countdown({ date }: { date?: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 47);
    return () => clearInterval(timer);
  }, []);
  if (!date) return <strong className="invite-countdown">Choose a date</strong>;
  const remaining = Math.max(0, new Date(date).getTime() - now),
    days = Math.floor(remaining / 86400000),
    hours = Math.floor(remaining / 3600000) % 24,
    minutes = Math.floor(remaining / 60000) % 60,
    seconds = Math.floor(remaining / 1000) % 60,
    ms = remaining % 1000;
  return (
    <div className="countdown-units">
      {[
        [days, "DAYS"],
        [hours, "HOURS"],
        [minutes, "MIN"],
        [seconds, "SEC"],
        [String(ms).padStart(3, "0"), "MS"],
      ].map(([value, label]) => (
        <span key={label}>
          <b>{value}</b>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}
function InvitationBook({
  details,
  page,
  setPage,
  editable = false,
}: {
  details: Details;
  page: number;
  setPage: (n: number) => void;
  editable?: boolean;
}) {
  const [shower, setShower] = useState(false);
  const total = details.events.length + 1 + (details.showCountdown ? 1 : 0);
  const event =
    page > 0 && page <= details.events.length ? details.events[page - 1] : null;
  const countdownPage = details.showCountdown && page === total - 1;
  function open() {
    setShower(true);
    setTimeout(() => {
      setShower(false);
      if (total > 1) setPage(1);
    }, 850);
  }
  return (
    <div
      className={`invite-book theme-${details.theme} motion-${details.animation}`}
    >
      <article
        key={page}
        className={`invite-book-page design-${details.coverDesign.toLowerCase()} border-${details.border.toLowerCase().replaceAll(" ", "-")}`}
      >
        {page === 0 && (
          <>
            <img
              className="invite-page-art"
              src={details.coverImage || artwork.Custom}
              alt="Invitation cover"
            />
            <div className="invite-cover-copy">
              {details.receiverName && (
                <em>Especially for {details.receiverName}</em>
              )}
              <small>{details.hostLine}</small>
              <h1>{details.couple}</h1>
              <p>{details.message}</p>
              <button onClick={open}>Click to open invitation ✦</button>
            </div>
            {shower && (
              <div className="opening-shower">
                {Array.from({ length: 35 }, (_, i) => (
                  <i key={i}>{i % 3 === 0 ? "♥" : i % 3 === 1 ? "✦" : "✿"}</i>
                ))}
              </div>
            )}
          </>
        )}
        {event && (
          <div
            className={`invite-event-page event-${event.name.toLowerCase().replaceAll(" ", "-")} design-${event.pageDesign.toLowerCase().replaceAll(" ", "-")}`}
          >
            {event.posterImage ? (
              <img
                className="event-poster"
                src={event.posterImage}
                alt="Custom event poster"
              />
            ) : (
              <Sticker kind={event.sticker} />
            )}
            <small>YOU’RE INVITED TO</small>
            <h1>{event.name || `Event ${page}`}</h1>
            <p>
              {event.note ||
                "A beautiful moment, made brighter with you there."}
            </p>
            <div className="invite-date-card">
              <b>{event.date || "Date coming soon"}</b>
              <span>{event.time || "Time coming soon"}</span>
              <span>{event.venue || "Venue coming soon"}</span>
            </div>
            <div className="invite-event-links">
              {event.mapUrl && (
                <a href={event.mapUrl} target="_blank">
                  Open map ↗
                </a>
              )}
              {event.date && (
                <a href={calendarUrl(event)} target="_blank">
                  Add to calendar ＋
                </a>
              )}
            </div>
          </div>
        )}
        {countdownPage && (
          <div className="invite-countdown-page">
            <Sticker kind="Countdown" />
            <small>COUNTING DOWN TO</small>
            <h1>Our celebration</h1>
            <Countdown date={details.countdownDate} />
            <p>We cannot wait to celebrate with you.</p>
          </div>
        )}
      </article>
      <div className="invite-book-nav">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          ←
        </button>
        <span>
          {page === 0
            ? "Cover"
            : countdownPage
              ? "Countdown"
              : event?.name || `Event ${page}`}{" "}
          · {page + 1}/{total}
        </span>
        <button disabled={page === total - 1} onClick={() => setPage(page + 1)}>
          →
        </button>
      </div>
      {editable && (
        <small className="invite-preview-note">
          This is how guests will turn through your invitation.
        </small>
      )}
    </div>
  );
}

export default function Invitations() {
  const [mode, setMode] = useState<"landing" | "builder" | "public">("landing");
  const [tradition, setTradition] = useState("Hindu");
  const [details, setDetails] = useState<Details>(empty);
  const [page, setPage] = useState(0);
  const [id, setId] = useState("");
  const [share, setShare] = useState("");
  const [copied, setCopied] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSent, setBulkSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const token = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("invite") || "",
    [],
  );
  useEffect(() => {
    if (!token) return;
    setMode("public");
    fetch(`${api}/api/public/invitations/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        const saved = JSON.parse(data.detailsJson);
        setTradition(data.tradition);
        setDetails({ ...empty, ...saved, events: saved.events || [] });
      })
      .catch(() =>
        setDetails({
          ...empty,
          couple: "Invitation unavailable",
          message: "This invitation link is not available.",
        }),
      );
  }, [token]);
  useEffect(() => () => audio.current?.pause(), []);
  function chooseTemplate(t: (typeof templates)[number]) {
    setTradition(t.tradition);
    setDetails({ ...empty, coverImage: t.image, events: [] });
    setPage(0);
    setMode("builder");
  }
  function updateEvent(index: number, key: keyof EventItem, value: string) {
    setDetails((d) => ({
      ...d,
      events: d.events.map((e, i) =>
        i === index ? { ...e, [key]: value } : e,
      ),
    }));
  }
  function moveEvent(index: number, dir: number) {
    const next = [...details.events],
      target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDetails({ ...details, events: next });
    setPage(target + 1);
  }
  async function upload(files: FileList | null, kind: "cover" | "music") {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(
        `${api}/api/media/${kind === "music" ? "audio" : "image"}`,
        { method: "POST", headers: await authHeaders(), body: form },
      );
      if (!response.ok) throw new Error();
      const url = (await response.json()).url;
      setDetails((d) =>
        kind === "cover"
          ? { ...d, coverImage: url }
          : { ...d, musicUrl: url, musicName: file.name },
      );
    } finally {
      setBusy(false);
    }
  }
  async function uploadEventPoster(index: number, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${api}/api/media/image`, {
        method: "POST",
        headers: await authHeaders(),
        body: form,
      });
      if (!response.ok) throw new Error();
      updateEvent(index, "posterImage", (await response.json()).url);
    } finally {
      setBusy(false);
    }
  }
  function toggleMusic() {
    if (!details.musicUrl) return;
    if (!audio.current) audio.current = new Audio(details.musicUrl);
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else {
      void audio.current.play();
      setPlaying(true);
    }
  }
  async function save(publish = false) {
    setBusy(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      };
      const body = JSON.stringify({
        title: `Invitation: ${details.couple}`,
        tradition,
        detailsJson: JSON.stringify(details),
      });
      let invitationId = id;
      if (!id) {
        const r = await fetch(`${api}/api/invitations`, {
          method: "POST",
          headers,
          body,
        });
        if (!r.ok) throw new Error("Sign in from the main page first.");
        const saved = await r.json();
        invitationId = saved.id;
        setId(saved.id);
      } else if (
        !(
          await fetch(`${api}/api/invitations/${id}`, {
            method: "PUT",
            headers,
            body,
          })
        ).ok
      )
        throw new Error("Invitation could not be saved.");
      if (publish) {
        const r = await fetch(
          `${api}/api/invitations/${invitationId}/publish`,
          { method: "POST", headers: await authHeaders() },
        );
        if (!r.ok) throw new Error("Invitation could not be published.");
        setShare(
          `${window.location.origin}/invitations?invite=${(await r.json()).shareToken}`,
        );
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (mode === "public")
    return (
      <main className="invite-app public-invite">
        <button className="public-music" onClick={toggleMusic}>
          {playing ? "Pause music" : "♫ Play music"}
        </button>
        <InvitationBook details={details} page={page} setPage={setPage} />
      </main>
    );
  if (mode === "landing")
    return (
      <Landing
        onBlank={() => {
          setDetails({ ...empty, events: [] });
          setMode("builder");
        }}
        onTemplate={chooseTemplate}
      />
    );
  return (
    <main className="invite-app">
      <Nav />
      <div className="invite-studio-shell">
        <aside className="invite-controls-v2">
          <div className="invite-kicker">INVITATION STUDIO</div>
          <h1>Build it page by page</h1>
          <p className="studio-intro">
            Create the cover, then add only the events you want.
          </p>
          <Panel
            number="01"
            title="Cover page"
            copy="Choose the celebration once, then personalize it"
          >
            <Field label="CELEBRATION STYLE">
              <select
                value={tradition}
                onChange={(e) => setTradition(e.target.value)}
              >
                {traditions.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="NAMES OR EVENT TITLE">
              <input
                value={details.couple}
                onChange={(e) =>
                  setDetails({ ...details, couple: e.target.value })
                }
              />
            </Field>
            <Field label="RECEIVER NAME (OPTIONAL)">
              <input
                placeholder="Especially for…"
                value={details.receiverName}
                onChange={(e) =>
                  setDetails({ ...details, receiverName: e.target.value })
                }
              />
            </Field>
            <Field label="INTRO LINE">
              <input
                value={details.hostLine}
                onChange={(e) =>
                  setDetails({ ...details, hostLine: e.target.value })
                }
              />
            </Field>
            <Field label="MESSAGE">
              <textarea
                rows={3}
                value={details.message}
                onChange={(e) =>
                  setDetails({ ...details, message: e.target.value })
                }
              />
            </Field>
            <div className="studio-grid">
              <Field label="PAGE DESIGN">
                <select
                  value={details.coverDesign}
                  onChange={(e) =>
                    setDetails({ ...details, coverDesign: e.target.value })
                  }
                >
                  {[
                    "Editorial",
                    "Royal",
                    "Minimal",
                    "Garden",
                    "Marigold",
                    "Midnight",
                    "Emerald",
                    "Pastel",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="BORDER">
                <select
                  value={details.border}
                  onChange={(e) =>
                    setDetails({ ...details, border: e.target.value })
                  }
                >
                  <option>Golden arch</option>
                  <option>Floral vines</option>
                  <option>Scalloped</option>
                  <option>None</option>
                </select>
              </Field>
            </div>
            <Field label="COVER PHOTO OR ART">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void upload(e.target.files, "cover")}
              />
            </Field>
            <div className="cover-art-options">
              {Object.entries(artwork)
                .filter(([name]) => name === tradition || name === "Custom")
                .map(([name, url]) => (
                  <button
                    key={name}
                    className={details.coverImage === url ? "active" : ""}
                    onClick={() => setDetails({ ...details, coverImage: url })}
                  >
                    <img src={url} alt="" />
                    <span>{name}</span>
                  </button>
                ))}
            </div>
          </Panel>
          <Panel
            number="02"
            title="Event pages"
            copy="Choose a block, then open it only when you want to customise"
          >
            <div className="event-block-library">
              {(eventCatalog[tradition] || eventCatalog.Custom).map(
                ([name, sticker]) => {
                  const selectedIndex = details.events.findIndex(
                    (event) => event.name === name,
                  );
                  return (
                    <button
                      className={selectedIndex >= 0 ? "selected" : ""}
                      key={name}
                      onClick={() => {
                        if (selectedIndex >= 0) {
                          setPage(selectedIndex + 1);
                          return;
                        }
                        setDetails({
                          ...details,
                          events: [
                            ...details.events,
                            blankEvent(name, sticker),
                          ],
                        });
                        setPage(details.events.length + 1);
                      }}
                    >
                      <Sticker kind={sticker} />
                      <span>{name}</span>
                      <b>{selectedIndex >= 0 ? "✓" : "＋"}</b>
                    </button>
                  );
                },
              )}
            </div>
            {details.events.map((event, index) => (
              <EventEditor
                key={index}
                event={event}
                index={index}
                total={details.events.length}
                update={updateEvent}
                uploadPoster={uploadEventPoster}
                move={moveEvent}
                remove={() => {
                  setDetails({
                    ...details,
                    events: details.events.filter((_, i) => i !== index),
                  });
                  setPage(0);
                }}
                preview={() => setPage(index + 1)}
              />
            ))}
            <button
              className="add-event-page"
              onClick={() => {
                setDetails({
                  ...details,
                  events: [...details.events, blankEvent()],
                });
                setPage(details.events.length + 1);
              }}
            >
              ＋ Add a custom page
            </button>
            <div className="countdown-choice">
              <label>
                <input
                  type="checkbox"
                  checked={details.showCountdown}
                  onChange={(e) =>
                    setDetails({ ...details, showCountdown: e.target.checked })
                  }
                />
                <span>
                  <b>Add a countdown page</b>
                  <small>
                    Build anticipation until your chosen date and time.
                  </small>
                </span>
              </label>
              {details.showCountdown && (
                <input
                  type="datetime-local"
                  value={details.countdownDate}
                  onChange={(e) =>
                    setDetails({ ...details, countdownDate: e.target.value })
                  }
                />
              )}
            </div>
            {!details.events.length && (
              <small className="empty-event-note">
                Choose an event block above. Nothing is added automatically.
              </small>
            )}
          </Panel>
          <Panel number="03" title="Page motion" copy="Choose how pages move">
            <Field label="PAGE TRANSITION">
              <select
                value={details.animation}
                onChange={(e) =>
                  setDetails({ ...details, animation: e.target.value })
                }
              >
                <option value="page">Paper turn</option>
                <option value="bloom">Flower bloom</option>
                <option value="rise">Gentle rise</option>
                <option value="fade">Soft fade</option>
              </select>
            </Field>
          </Panel>
          <div className="invitation-price">
            <span>
              {details.events.length + 1 + (details.showCountdown ? 1 : 0)}{" "}
              pages
            </span>
            <b>
              ₹
              {251 +
                Math.max(
                  0,
                  details.events.length +
                    1 +
                    (details.showCountdown ? 1 : 0) -
                    7,
                ) *
                  10}
            </b>
            <small>₹251 for the first 7 pages · ₹10 per extra page</small>
          </div>
          <div className="invite-actions">
            <button
              className="invite-button light"
              disabled={busy}
              onClick={() => void save()}
            >
              Save draft
            </button>
            <button
              className="invite-button"
              disabled={busy}
              onClick={() => void save(true)}
            >
              Publish & share
            </button>
          </div>
          {share && (
            <div className="invite-share">
              <b>Your invitation is ready</b>
              <p>{share}</p>
              <button
                className="invite-button"
                onClick={() => {
                  void navigator.clipboard.writeText(share);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
              >
                {copied ? "✓ Link copied" : "Copy link"}
              </button>
            </div>
          )}
          <button className="bulk-order-cta" onClick={() => setBulkOpen(true)}>
            Need invitations in bulk? Request discounted pricing →
          </button>
        </aside>
        <section className="invite-preview-stage">
          <div className="preview-stage-top">
            <div>
              <small>LIVE INVITATION</small>
              <b>
                {page === 0
                  ? "Cover"
                  : details.showCountdown && page === details.events.length + 1
                    ? "Countdown"
                    : details.events[page - 1]?.name}
              </b>
            </div>
            <label className="preview-soundtrack">
              ♫ Soundtrack
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => void upload(e.target.files, "music")}
              />
            </label>
            {details.musicUrl && (
              <button onClick={toggleMusic}>
                {playing ? "❚❚ Pause" : "▶ Play"}
              </button>
            )}
          </div>
          <InvitationBook
            details={details}
            editable
            page={Math.min(
              page,
              details.events.length + (details.showCountdown ? 1 : 0),
            )}
            setPage={setPage}
          />
        </section>
      </div>
      {bulkOpen && (
        <BulkRequest
          sent={bulkSent}
          onClose={() => setBulkOpen(false)}
          onSent={() => setBulkSent(true)}
        />
      )}
    </main>
  );
}

function EventEditor({
  event,
  index,
  total,
  update,
  uploadPoster,
  move,
  remove,
  preview,
}: {
  event: EventItem;
  index: number;
  total: number;
  update: (i: number, k: keyof EventItem, v: string) => void;
  uploadPoster: (i: number, f: FileList | null) => void;
  move: (i: number, d: number) => void;
  remove: () => void;
  preview: () => void;
}) {
  return (
    <details className="event-page-editor" defaultOpen>
      <summary>
        <span>
          <b>{event.name || `Custom page ${index + 1}`}</b>
          <small>Tap to customise this page</small>
        </span>
        <div>
          <button
            disabled={!index}
            onClick={(e) => {
              e.preventDefault();
              move(index, -1);
            }}
          >
            ↑
          </button>
          <button
            disabled={index === total - 1}
            onClick={(e) => {
              e.preventDefault();
              move(index, 1);
            }}
          >
            ↓
          </button>
          <button
            className="danger"
            onClick={(e) => {
              e.preventDefault();
              remove();
            }}
          >
            ×
          </button>
          <i>⌄</i>
        </div>
      </summary>
      <div className="event-editor-body">
        <Field label="PAGE TITLE">
          <input
            value={event.name}
            onChange={(e) => update(index, "name", e.target.value)}
          />
        </Field>
        <div className="studio-grid">
          <Field label="DATE">
            <input
              type="date"
              value={event.date}
              onChange={(e) => update(index, "date", e.target.value)}
            />
          </Field>
          <Field label="TIME">
            <input
              type="time"
              value={event.time}
              onChange={(e) => update(index, "time", e.target.value)}
            />
          </Field>
        </div>
        <Field label="VENUE">
          <input
            value={event.venue}
            onChange={(e) => update(index, "venue", e.target.value)}
          />
        </Field>
        <Field label="MAP LINK">
          <input
            value={event.mapUrl}
            onChange={(e) => update(index, "mapUrl", e.target.value)}
          />
        </Field>
        <Field label="SHORT NOTE">
          <textarea
            rows={2}
            value={event.note}
            onChange={(e) => update(index, "note", e.target.value)}
          />
        </Field>
        <Field label="CUSTOM POSTER OR PHOTO">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void uploadPoster(index, e.target.files)}
          />
        </Field>
        {event.posterImage && (
          <button
            className="remove-poster"
            onClick={() => update(index, "posterImage", "")}
          >
            Remove custom poster
          </button>
        )}
        <Field label="PAGE DESIGN">
          <select
            value={event.pageDesign}
            onChange={(e) => update(index, "pageDesign", e.target.value)}
          >
            {pageStyles.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <button className="preview-page-button" onClick={preview}>
          Preview this page →
        </button>
      </div>
    </details>
  );
}
function BulkRequest({
  sent,
  onClose,
  onSent,
}: {
  sent: boolean;
  onClose: () => void;
  onSent: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    quantity: "25",
    eventType: "Wedding",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch(`${api}/api/public/invitation-bulk-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      if (!r.ok) throw new Error();
      onSent();
    } catch {
      alert("Request could not be sent. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="bulk-modal" role="dialog" aria-modal="true">
      <section>
        <button className="bulk-close" onClick={onClose}>
          ×
        </button>
        {sent ? (
          <div className="bulk-success">
            <span>✓</span>
            <h2>Request received</h2>
            <p>Our team will contact you with discounted bulk pricing.</p>
            <button className="invite-button" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="invite-kicker">BULK INVITATIONS</div>
            <h2>Let’s plan something bigger.</h2>
            <p>
              Tell us what you need. Our team will contact you with a custom
              discount.
            </p>
            <Field label="YOUR NAME">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="EMAIL">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <div className="studio-grid">
              <Field label="PHONE">
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="QUANTITY">
                <input
                  required
                  min="10"
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="EVENT TYPE">
              <input
                value={form.eventType}
                onChange={(e) =>
                  setForm({ ...form, eventType: e.target.value })
                }
              />
            </Field>
            <Field label="WHAT DO YOU NEED?">
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </Field>
            <button className="invite-button" disabled={busy}>
              {busy ? "Sending…" : "Send bulk request →"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
function Panel({
  number,
  title,
  copy,
  children,
}: {
  number: string;
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <section className="studio-panel">
      <header>
        <span>{number}</span>
        <div>
          <b>{title}</b>
          <small>{copy}</small>
        </div>
      </header>
      {children}
    </section>
  );
}
function Landing({
  onBlank,
  onTemplate,
}: {
  onBlank: () => void;
  onTemplate: (t: (typeof templates)[number]) => void;
}) {
  return (
    <main className="invite-app">
      <Nav />
      <section className="invite-hero">
        <div>
          <div className="invite-kicker">MYPOOKIE INVITATIONS</div>
          <h1>Every celebration deserves a beautiful beginning.</h1>
          <p>
            Create a page-turning invitation with music, maps and every moment
            in one link.
          </p>
          <div className="invite-actions">
            <button className="invite-button" onClick={onBlank}>
              Start from scratch →
            </button>
            <button
              className="invite-button light"
              onClick={() =>
                document
                  .getElementById("templates")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Choose a design
            </button>
          </div>
        </div>
        <div className="invite-showcase">
          <div className="invite-card invite-card-art">
            <img src={artwork.Hindu} alt="Hindu wedding invitation artwork" />
            <div>
              <small>TOGETHER WITH THEIR FAMILIES</small>
              <h2>Aarav & Aanya</h2>
              <p>invite you to celebrate</p>
            </div>
          </div>
        </div>
      </section>
      <section className="invite-template-section" id="templates">
        <div className="invite-kicker">CHOOSE YOUR BEGINNING</div>
        <h2>Made for your celebration</h2>
        <p>Design the cover first. Add event pages only when you are ready.</p>
        <div className="invite-template-grid">
          {templates.map((t) => (
            <button key={t.name} onClick={() => onTemplate(t)}>
              <img src={t.image} alt={`${t.name} invitation design`} />
              <span>
                <b>{t.name}</b>
                <small>{t.copy}</small>
                <em>Use this design →</em>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
function Nav() {
  return (
    <nav className="invite-nav">
      <a className="invite-brand" href="/">
        <img src="/mypookie-logo-mark.svg" alt="" />
        <span>mypookie.</span>
        <small>BETA</small>
      </a>
      <div className="invite-nav-links">
        <a href="/#how">How it works</a>
        <a href="/#ideas">Gift ideas</a>
        <a className="active" href="/invitations">
          Invitations
        </a>
        <a href="/careers">Careers</a>
      </div>
      <a className="invite-button light" href="/">
        Create a gift
      </a>
    </nav>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="invite-field">
      <label>{label}</label>
      {children}
    </div>
  );
}
