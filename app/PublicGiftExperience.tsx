"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BuilderLivePreview } from "./BuilderLivePreview";
import { GiftSoundtrack, type SoundtrackSettings } from "./GiftSoundtrack";
import {
  experienceBackgroundStyle,
  type ExperienceBackground,
} from "./experienceBackground";

type GiftBlock = {
  instanceId?: string;
  id: string;
  icon: string;
  name: string;
  color: string;
  message: string;
  config?: Record<string, string>;
};
type PublicGift = {
  id: string;
  senderName?: string;
  recipientName: string;
  theme: string;
  ambience: string;
  blocksJson: string;
  scheduledAt?: string | null;
  requiresPin: boolean;
  accessGranted: boolean;
  opensRemaining: number;
  recipientSession?: string | null;
};
type CompatibilityReport = {
  score: number;
  matches: number;
  total: number;
  label: string;
  answers: Array<{
    prompt: string;
    senderChoice: string;
    recipientChoice: string;
    match: boolean;
  }>;
};
const api =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-production-22bd.up.railway.app";
const gameBlocks = new Set([
  "quiz",
  "thisorthat",
  "emoji",
  "heartcatch",
  "wouldrather",
  "neverhave",
  "truthdare",
  "tapheart",
  "matchpair",
  "wheel",
  "slots",
  "puzzle",
  "scratch",
  "treasure",
  "alwaysyou",
  "excuse",
  "roast",
  "fortune",
  "mysterybox",
]);
function transitionStyle(block: GiftBlock) {
  return (
    block.config?.transitionStyle ||
    (gameBlocks.has(block.id) ? "Soft zoom" : "None")
  );
}
function transitionClass(block: GiftBlock) {
  return `transition-${transitionStyle(block).toLowerCase().replaceAll(" ", "-")}`;
}

function parseBlocks(value: string) {
  try {
    const parsed = JSON.parse(value);
    return (
      Array.isArray(parsed) ? parsed : parsed.blocks || []
    ) as GiftBlock[];
  } catch {
    return [];
  }
}

function parseRecipientGender(value: string) {
  try {
    const parsed = JSON.parse(value) as { recipientGender?: string };
    return Array.isArray(parsed) ? "" : parsed.recipientGender || "";
  } catch {
    return "";
  }
}
function parseExperienceSettings(value: string): {
  soundtrack?: SoundtrackSettings;
  experienceBackground?: ExperienceBackground;
} {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? {} : parsed;
  } catch {
    return {};
  }
}

export function PublicGiftExperience({ token }: { token: string }) {
  const [gift, setGift] = useState<PublicGift | null>(null);
  const [error, setError] = useState(false);
  const [accessPinInput, setAccessPinInput] = useState("");
  const [accessState, setAccessState] = useState<
    "idle" | "checking" | "wrong" | "limit"
  >("idle");
  const [now, setNow] = useState(0);
  const unlockRefetched = useRef(false);
  const [step, setStep] = useState(0);
  const [introSlide, setIntroSlide] = useState(0);
  const [complete, setComplete] = useState<number[]>([]);
  const [wins, setWins] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [reportPin, setReportPin] = useState("");
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [reportState, setReportState] = useState<
    "idle" | "loading" | "wrong" | "waiting"
  >("idle");
  const [rating, setRating] = useState(0);
  const [ratingNote, setRatingNote] = useState("");
  const [ratingState, setRatingState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [senderMessage, setSenderMessage] = useState("");
  const [messageState, setMessageState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const openIdRef = useRef("");
  const openHeaders = useCallback(
    (contentType = false) => {
      if (!openIdRef.current) {
        const key = `mypookie-open-${token}`;
        openIdRef.current =
          window.sessionStorage.getItem(key) || window.crypto.randomUUID();
        window.sessionStorage.setItem(key, openIdRef.current);
      }
      return contentType
        ? {
            "Content-Type": "application/json",
            "X-Gift-Open-Id": openIdRef.current,
          }
        : { "X-Gift-Open-Id": openIdRef.current };
    },
    [token],
  );
  useEffect(() => {
    fetch(`${api}/api/public/gifts/${token}`, { headers: openHeaders() })
      .then((response) => {
        if (response.status === 410) {
          setAccessState("limit");
          throw new Error("limit");
        }
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(setGift)
      .catch((reason) => {
        if (reason?.message !== "limit") setError(true);
      });
  }, [token, openHeaders]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (
      !gift?.scheduledAt ||
      unlockRefetched.current ||
      new Date(gift.scheduledAt).getTime() > now
    )
      return;
    unlockRefetched.current = true;
    fetch(
      `${api}/api/public/gifts/${token}${gift.requiresPin ? "/unlock" : ""}`,
      gift.requiresPin
        ? {
            method: "POST",
            headers: openHeaders(true),
            body: JSON.stringify({ pin: accessPinInput }),
          }
        : { headers: openHeaders() },
    )
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setGift)
      .catch(() => {
        unlockRefetched.current = false;
      });
  }, [gift, now, token, accessPinInput, openHeaders]);
  async function unlockGift() {
    if (!/^\d{4,8}$/.test(accessPinInput) || accessState === "checking") return;
    setAccessState("checking");
    const response = await fetch(`${api}/api/public/gifts/${token}/unlock`, {
      method: "POST",
      headers: openHeaders(true),
      body: JSON.stringify({ pin: accessPinInput }),
    }).catch(() => null);
    if (response?.ok) {
      setGift(await response.json());
      setAccessState("idle");
      return;
    }
    setAccessState(response?.status === 410 ? "limit" : "wrong");
  }
  useEffect(() => {
    if (introSlide !== 1) return;
    const current = gift ? parseBlocks(gift.blocksJson)[step] : null;
    const seconds = Math.min(
      2,
      Math.max(1, Number(current?.config?.transitionDuration) || 1.6),
    );
    const timer = window.setTimeout(() => setIntroSlide(2), seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [introSlide, step, gift]);
  if (accessState === "limit")
    return (
      <main className="public-gift-loading gift-access-ended">
        <span>◇</span>
        <h1>This gift has reached its opening limit.</h1>
        <p>The creator chose how many times it could be opened.</p>
      </main>
    );
  if (error)
    return (
      <main className="public-gift-loading">
        <span>♡</span>
        <h1>This gift link isn’t ready.</h1>
        <p>Ask the sender to publish it again.</p>
      </main>
    );
  if (!gift)
    return (
      <main className="public-gift-loading">
        <span>♡</span>
        <p>Preparing something beautiful…</p>
      </main>
    );
  if (gift.requiresPin && !gift.accessGranted)
    return (
      <main
        className={`recipient-preview public-recipient theme-${gift.theme.toLowerCase().replaceAll(" ", "-")}`}
      >
        <section className="gift-pin-lock">
          <span>♡</span>
          <small>PRIVATE GIFT FOR {gift.recipientName.toUpperCase()}</small>
          <h1>Enter the gift PIN</h1>
          <p>The creator protected this little world just for you.</p>
          <input
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={accessPinInput}
            onChange={(event) => {
              setAccessPinInput(
                event.target.value.replace(/\D/g, "").slice(0, 8),
              );
              setAccessState("idle");
            }}
            onKeyDown={(event) => event.key === "Enter" && void unlockGift()}
            placeholder="4–8 digit PIN"
          />
          <button
            onClick={() => void unlockGift()}
            disabled={accessPinInput.length < 4 || accessState === "checking"}
          >
            {accessState === "checking" ? "Opening…" : "Open my gift →"}
          </button>
          {accessState === "wrong" && (
            <output>
              That PIN isn’t correct. Check the shared message and try again.
            </output>
          )}
        </section>
      </main>
    );
  const reveal = gift.scheduledAt ? new Date(gift.scheduledAt).getTime() : 0;
  if (reveal > now) {
    const difference = reveal - now;
    const days = Math.floor(difference / 86400000);
    const hours = Math.floor(difference / 3600000) % 24;
    const minutes = Math.floor(difference / 60000) % 60;
    const seconds = Math.floor(difference / 1000) % 60;
    return (
      <main className="scheduled-gift-lock">
        <section>
          <span>♡</span>
          <small>A SURPRISE IS WAITING FOR</small>
          <h1>{gift.recipientName}</h1>
          <p>This little world opens in</p>
          <div>
            <b>
              {days}
              <i>days</i>
            </b>
            <b>
              {String(hours).padStart(2, "0")}
              <i>hours</i>
            </b>
            <b>
              {String(minutes).padStart(2, "0")}
              <i>minutes</i>
            </b>
            <b>
              {String(seconds).padStart(2, "0")}
              <i>seconds</i>
            </b>
          </div>
        </section>
      </main>
    );
  }
  const blocks = parseBlocks(gift.blocksJson);
  const experienceSettings = parseExperienceSettings(gift.blocksJson);
  const recipientGender = parseRecipientGender(gift.blocksJson);
  const returnPronoun =
    recipientGender === "Girl"
      ? "him"
      : recipientGender === "Boy"
        ? "her"
        : "them";
  const block = blocks[step];
  const currentComplete = complete.includes(step);
  function advanceMoment() {
    if (step < blocks.length - 1) {
      const next = step + 1;
      recordProgress(next + 1);
      setStep(next);
      setIntroSlide(transitionStyle(blocks[next]) !== "None" ? 1 : 2);
    } else finishGift();
  }
  const reportBlock = blocks.find(
    (item) =>
      item.id === "thisorthat" && item.config?.compatibilityEnabled === "true",
  );
  async function unlockReport() {
    if (!reportBlock || !/^\d{4,6}$/.test(reportPin)) return;
    setReportState("loading");
    const response = await fetch(
      `${api}/api/public/gifts/${gift!.id}/compatibility-report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Recipient-Session": gift!.recipientSession || "",
        },
        body: JSON.stringify({
          pin: reportPin,
          blockId: reportBlock.instanceId || reportBlock.id,
        }),
      },
    ).catch(() => null);
    if (response?.ok) {
      setReport(await response.json());
      setReportState("idle");
      return;
    }
    setReportState(response?.status === 409 ? "waiting" : "wrong");
  }
  async function submitRating() {
    if (rating < 1) return;
    setRatingState("saving");
    const response = await fetch(`${api}/api/public/gifts/${gift!.id}/rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Recipient-Session": gift.recipientSession || "",
      },
      body: JSON.stringify({ stars: rating, comment: ratingNote }),
    }).catch(() => null);
    setRatingState(response?.ok ? "saved" : "error");
  }
  async function sendMessageToSender() {
    if (!senderMessage.trim() || messageState === "sending") return;
    setMessageState("sending");
    const response = await fetch(
      `${api}/api/public/gifts/${gift!.id}/responses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Recipient-Session": gift!.recipientSession || "",
        },
        body: JSON.stringify({
          blockId: "final-message",
          responseType: "FINAL_MESSAGE",
          contributorName: gift!.recipientName,
          responseText: senderMessage.trim(),
          photoUrls: [],
        }),
      },
    ).catch(() => null);
    setMessageState(response?.ok ? "sent" : "error");
  }
  function finishGift() {
    void fetch(`${api}/api/public/gifts/${token}/complete`, {
      method: "POST",
      headers: { "X-Recipient-Session": gift!.recipientSession || "" },
    });
    setFinished(true);
  }
  function recordProgress(stage: number) {
    void fetch(`${api}/api/public/gifts/${token}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Recipient-Session": gift!.recipientSession || "",
      },
      body: JSON.stringify({ stage, totalStages: blocks.length }),
    });
  }
  if (finished)
    return (
      <main
        className={`recipient-preview public-recipient theme-${gift.theme.toLowerCase().replaceAll(" ", "-")}`}
      >
        <section className="gift-finale">
          <span>♡</span>
          <small>EVERY MOMENT COMPLETE</small>
          <h1>This little world is now yours.</h1>
          <p>
            {wins.length
              ? `You collected ${wins.length} surprise${wins.length === 1 ? "" : "s"} along the way.`
              : `Made for ${gift.recipientName}, with care.`}
          </p>
          {reportBlock && (
            <div className="compatibility-report-lock">
              {report ? (
                <>
                  <div className="report-score">
                    <b>{report.score}%</b>
                    <div>
                      <small>YOUR COMPATIBILITY STORY</small>
                      <strong>{report.label}</strong>
                      <span>
                        {report.matches} of {report.total} choices matched
                      </span>
                    </div>
                  </div>
                  <div className="report-answer-list">
                    {report.answers.map((answer, index) => (
                      <article
                        className={answer.match ? "match" : ""}
                        key={index}
                      >
                        <small>{answer.prompt}</small>
                        <div>
                          <span>
                            Sender: <b>{answer.senderChoice}</b>
                          </span>
                          <span>
                            Recipient: <b>{answer.recipientChoice}</b>
                          </span>
                        </div>
                        <em>
                          {answer.match
                            ? "Same choice ♡"
                            : "A lovely difference ✦"}
                        </em>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <small>PRIVATE SENDER REPORT</small>
                  <h2>Unlock the compatibility report</h2>
                  <p>
                    The sender’s checkout PIN is required. Recipient answers
                    stay hidden without it.
                  </p>
                  <div>
                    <input
                      inputMode="numeric"
                      maxLength={6}
                      value={reportPin}
                      onChange={(event) =>
                        setReportPin(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      onKeyDown={(event) =>
                        event.key === "Enter" && void unlockReport()
                      }
                      placeholder="Enter 4–6 digit PIN"
                    />
                    <button
                      onClick={() => void unlockReport()}
                      disabled={
                        reportState === "loading" || reportPin.length < 4
                      }
                    >
                      {reportState === "loading" ? "Checking…" : "View report"}
                    </button>
                  </div>
                  {reportState === "wrong" && (
                    <output>That PIN is not correct.</output>
                  )}
                  {reportState === "waiting" && (
                    <output>
                      The recipient needs to finish This or That first.
                    </output>
                  )}
                </>
              )}
            </div>
          )}
          <div
            className={`recipient-rating ${ratingState === "saved" ? "saved" : ""}`}
          >
            <small>ONE LAST LITTLE THING</small>
            <h2>
              {ratingState === "saved"
                ? "Thank you for the love ♡"
                : "How many stars would you give this gift?"}
            </h2>
            {ratingState !== "saved" && (
              <>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={star <= rating ? "active" : ""}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  maxLength={500}
                  value={ratingNote}
                  onChange={(event) => setRatingNote(event.target.value)}
                  placeholder="Optional: tell us what made you smile…"
                />
                <button
                  onClick={() => void submitRating()}
                  disabled={rating < 1 || ratingState === "saving"}
                >
                  {ratingState === "saving" ? "Sending…" : "Send my rating"}
                </button>
                {ratingState === "error" && (
                  <output>That didn’t send. Please try again.</output>
                )}
              </>
            )}
          </div>
          <div
            className={`recipient-message-back ${messageState === "sent" ? "sent" : ""}`}
          >
            <small>A NOTE BACK TO THEM</small>
            <h2>
              {messageState === "sent"
                ? `Sent to ${gift.senderName || "the sender"} ♡`
                : `Want to send ${gift.senderName || "the sender"} a message?`}
            </h2>
            {messageState !== "sent" && (
              <>
                <p>
                  Optional—tell them what you felt after opening their gift.
                </p>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={senderMessage}
                  onChange={(event) => setSenderMessage(event.target.value)}
                  placeholder="Write something from the heart…"
                />
                <div>
                  <span>{senderMessage.length}/1000</span>
                  <button
                    onClick={() => void sendMessageToSender()}
                    disabled={
                      !senderMessage.trim() || messageState === "sending"
                    }
                  >
                    {messageState === "sending" ? "Sending…" : "Send message"}
                  </button>
                </div>
                {messageState === "error" && (
                  <output>That message didn’t send. Please try again.</output>
                )}
              </>
            )}
          </div>
          <section className="return-gift-invite">
            <span>♡</span>
            <div>
              <small>RETURN THE FEELING</small>
              <h2>Want to create a gift for {returnPronoun} too?</h2>
              <p>
                Make a little world of your own—personalized with memories,
                games and surprises.
              </p>
            </div>
            <a href="/">
              Create a gift <b>→</b>
            </a>
          </section>
          <button
            className="replay-gift"
            onClick={() => {
              setFinished(false);
              setStep(0);
              setIntroSlide(0);
              setComplete([]);
              setWins([]);
              setReport(null);
              setReportPin("");
              setReportState("idle");
            }}
          >
            Experience the gift again
          </button>
        </section>
      </main>
    );
  if (!block)
    return (
      <main className="public-gift-loading">
        <span>♡</span>
        <h1>There’s nothing inside yet.</h1>
      </main>
    );
  const activityIntro = introSlide < 2;
  return (
    <main
      className={`recipient-preview public-recipient theme-${gift.theme.toLowerCase().replaceAll(" ", "-")}`}
      style={experienceBackgroundStyle(experienceSettings.experienceBackground)}
    >
      {experienceSettings.soundtrack && (
        <GiftSoundtrack
          settings={experienceSettings.soundtrack}
          blocks={blocks}
          step={step}
        />
      )}
      <div className="recipient-experience-shell">
        <div className="preview-count">
          {step + 1} of {blocks.length}
        </div>
        {activityIntro ? (
          <section
            className={`moment-slideshow ${introSlide === 0 ? "opening-slide" : `moment-teaser ${transitionClass(block)}`}`}
            style={
              introSlide === 1
                ? ({
                    "--transition-duration": `${Math.min(2, Math.max(1, Number(block.config?.transitionDuration) || 1.6))}s`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <div className="moment-slide-orbit" aria-hidden="true">
              <i />
              <i />
              <span>{introSlide === 0 ? "♡" : block.icon}</span>
            </div>
            {introSlide === 0 ? (
              <>
                <small>
                  A GIFT FROM{" "}
                  {(gift.senderName || "SOMEONE SPECIAL").toUpperCase()}
                </small>
                <h1>For you, {gift.recipientName}.</h1>
                <p>
                  A little world was made for you. Take it one moment at a time.
                </p>
                <button
                  onClick={() =>
                    setIntroSlide(transitionStyle(block) !== "None" ? 1 : 2)
                  }
                >
                  Open your gift<span>→</span>
                </button>
              </>
            ) : (
              <>
                <small>COMING NEXT</small>
                <h1>{block.name}</h1>
                <p>{block.message}</p>
                <div className="teaser-progress" aria-hidden="true">
                  <i />
                </div>
              </>
            )}
          </section>
        ) : (
          <div className={`activity-stage-enter ${transitionClass(block)}`}>
            <BuilderLivePreview
              key={`${block.instanceId || block.id}-${step}`}
              block={block}
              name={gift.recipientName}
              senderName={gift.senderName || "The sender"}
              theme={gift.theme}
              ambience={gift.ambience}
              giftId={gift.id}
              recipientSession={gift.recipientSession || undefined}
              onComplete={() =>
                setComplete((current) =>
                  current.includes(step) ? current : [...current, step],
                )
              }
              onAdvance={advanceMoment}
              onReward={(reward) => setWins((current) => [...current, reward])}
            />
          </div>
        )}
        {!activityIntro && (
          <div className="recipient-progress-gate">
            <button
              className="primary recipient-next"
              disabled={!currentComplete}
              onClick={advanceMoment}
            >
              {step < blocks.length - 1
                ? "Continue to the next moment"
                : "Finish this experience"}{" "}
              <span>→</span>
            </button>
            <small className={currentComplete ? "ready" : ""}>
              {currentComplete
                ? "Moment complete ✓"
                : "Complete this moment to unlock the next one"}
            </small>
          </div>
        )}
        {wins.length > 0 && (
          <div className="public-win-strip">
            <span>✦</span>
            <strong>
              {wins.length} surprise{wins.length === 1 ? "" : "s"} collected
            </strong>
            <small>{wins[wins.length - 1]}</small>
          </div>
        )}
      </div>
    </main>
  );
}
