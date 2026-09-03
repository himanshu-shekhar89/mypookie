"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "./soundFx";
import { DrawingCanvas } from "./DrawingCanvas";

type Props = {
  id: string;
  blockInstanceId?: string;
  config: Record<string, string>;
  giftId?: string;
  recipientSession?: string;
  recipientName?: string;
  senderName?: string;
  onComplete?: () => void;
  onAdvance?: () => void;
  onReward?: (reward: string) => void;
  onConfig?: (key: string, value: string) => void;
};
type Pair = {
  left: string;
  right: string;
  senderPick?: string;
  leftReaction?: string;
  rightReaction?: string;
};
type NeverHaveCard = {
  id: string;
  statement: string;
  senderPick?: string;
  haventReaction?: string;
  haveReaction?: string;
};
type PairPhoto = { id: string; image: string; caption: string };
type AlwaysQuestion = { id: string; question: string; answers: string[] };
type ExcuseRound = { id: string; situation: string; senderExcuse: string };
type BoardNote = { from: string; message: string; photos?: string[] };
type SavedResponse = {
  id: string;
  contributorName: string;
  responseText: string;
  photoUrls: string;
};
const api =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-production-22bd.up.railway.app";

function parse<T>(value: string | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lines(value: string | undefined, fallback: string[]) {
  const result = (value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  return result.length ? result : fallback;
}
function randomIndex(length: number) {
  return length
    ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % length
    : 0;
}
function recipientHeaders(session?: string) {
  return {
    "Content-Type": "application/json",
    "X-Recipient-Session": session || "",
  };
}
function shuffle<T>(values: T[]) {
  const next = [...values];
  const random = new Uint32Array(next.length);
  globalThis.crypto.getRandomValues(random);
  for (let index = next.length - 1; index > 0; index--) {
    const target = random[index] % (index + 1);
    [next[index], next[target]] = [next[target], next[index]];
  }
  return next;
}

export function TinyBlockPreview(props: Props) {
  if (props.id === "wouldrather") return <WouldRather {...props} />;
  if (props.id === "neverhave") return <NeverHave {...props} />;
  if (props.id === "truthdare") return <TruthDare {...props} />;
  if (props.id === "tapheart") return <TapHeart {...props} />;
  if (props.id === "matchpair") return <MatchPair {...props} />;
  if (props.id === "countdownus") return <CountdownUs {...props} />;
  if (props.id === "constellation") return <Constellation {...props} />;
  if (props.id === "growthring") return <GrowthRing {...props} />;
  if (props.id === "movie" || props.id === "song")
    return <BondReveal {...props} />;
  if (props.id === "alwaysyou") return <AlwaysYou {...props} />;
  if (props.id === "excuse") return <ExcuseGenerator {...props} />;
  if (props.id === "roast") return <RoastCards {...props} />;
  if (props.id === "fortune") return <FortuneCookie {...props} />;
  if (props.id === "tarot") return <TarotFortune {...props} />;
  if (props.id === "drawtogether") return <DrawTogether {...props} />;
  if (props.id === "mysterybox") return <MysteryBox {...props} />;
  if (props.id === "playlist") return <PlaylistReveal {...props} />;
  if (props.id === "countdowninvite") return <CountdownInvite {...props} />;
  if (props.id === "groupboard") return <GroupBoard {...props} />;
  return null;
}

function WouldRather({ config, senderName, onComplete, onReward }: Props) {
  const pairs = parse<Pair[]>(config.pairs, [
    { left: "Sunrise date", right: "Midnight drive" },
  ]);
  const mode = config.wouldRatherMode || "playAlong";
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [selected, setSelected] = useState<{
    value: string;
    side: "left" | "right";
  } | null>(null);
  const pointer = useRef<number | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIndex(0);
      setPicks([]);
      setSelected(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [mode, config.pairs]);
  if (index >= pairs.length)
    return (
      <div className="tiny-finish">
        <span>⇄</span>
        <strong>Your choices are in</strong>
        {picks.map((pick, itemIndex) => (
          <small key={itemIndex}>
            {itemIndex + 1}. {pick}
          </small>
        ))}
        <b>The sender will see this pick list.</b>
      </div>
    );
  const pair = pairs[index];
  const person = senderName || "The sender";
  function choose(value: string, side: "left" | "right") {
    if (selected) return;
    playSound("tile");
    setSelected({ value, side });
    window.setTimeout(() => playSound("reveal"), 120);
  }
  function next() {
    if (!selected) return;
    const nextPicks = [...picks, selected.value];
    setPicks(nextPicks);
    setSelected(null);
    setIndex((current) => current + 1);
    if (index === pairs.length - 1) {
      playSound("win");
      onReward?.(`Would Rather picks: ${nextPicks.join(" · ")}`);
      onComplete?.();
    }
  }
  const reaction = selected
    ? selected.side === "left"
      ? pair.leftReaction
      : pair.rightReaction
    : "";
  const senderChoice =
    pair.senderPick === "left"
      ? pair.left
      : pair.senderPick === "right"
        ? pair.right
        : "";
  return (
    <div className="swipe-deck">
      <div className="deck-progress">
        {index + 1}/{pairs.length}
      </div>
      <article
        onPointerDown={(event) => {
          if (!selected) pointer.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (pointer.current === null || selected) return;
          const distance = event.clientX - pointer.current;
          if (Math.abs(distance) > 45)
            choose(
              distance < 0 ? pair.left : pair.right,
              distance < 0 ? "left" : "right",
            );
          pointer.current = null;
        }}
      >
        <small>WOULD YOU RATHER</small>
        <strong>{pair.left}</strong>
        <span>OR</span>
        <strong>{pair.right}</strong>
        <p>
          {selected
            ? "Choice locked—see what they left for you."
            : "Swipe left or right—or tap a choice."}
        </p>
      </article>
      {selected ? (
        <section className="choice-reaction-reveal">
          <small>
            {mode === "react"
              ? `${person} reacted to your choice`
              : `${person} played along`}
          </small>
          <strong>
            {mode === "react"
              ? reaction || "That choice earned a very knowing smile 👀"
              : senderChoice
                ? senderChoice === selected.value
                  ? `“I picked this too!” ♡`
                  : `“I chose ${senderChoice}.”`
                : "They left this one entirely up to you ♡"}
          </strong>
          <button onClick={next}>
            {index === pairs.length - 1 ? "See my choices ✓" : "Next card →"}
          </button>
        </section>
      ) : (
        <div>
          <button onClick={() => choose(pair.left, "left")}>
            ← {pair.left}
          </button>
          <button onClick={() => choose(pair.right, "right")}>
            {pair.right} →
          </button>
        </div>
      )}
    </div>
  );
}

function NeverHave({ config, senderName, onComplete, onReward }: Props) {
  const statements = lines(config.statements, [
    "Danced in the kitchen",
    "Re-read our old chats",
  ]);
  const fallback = statements.map((statement, index) => ({
    id: `never-${index}`,
    statement,
  }));
  const cards = parse<NeverHaveCard[]>(config.neverHaveCards, fallback);
  const mode = config.neverHaveMode || "playAlong";
  const [index, setIndex] = useState(0);
  const [have, setHave] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIndex(0);
      setHave(0);
      setSelected(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [mode, config.neverHaveCards, config.statements]);
  if (index >= cards.length)
    return (
      <div className="tiny-finish">
        <span>✋</span>
        <strong>
          {have} “I have” {have === 1 ? "moment" : "moments"}
        </strong>
        <p>Lightly confessed. Entirely shareable.</p>
      </div>
    );
  const card = cards[index];
  const person = senderName || "The sender";
  function answer(did: boolean) {
    if (selected !== null) return;
    playSound("tile");
    setSelected(did);
    window.setTimeout(() => playSound("reveal"), 120);
  }
  function next() {
    if (selected === null) return;
    const total = have + (selected ? 1 : 0);
    setHave(total);
    setSelected(null);
    setIndex((value) => value + 1);
    if (index === cards.length - 1) {
      onReward?.(`Never Have I Ever: ${total}/${cards.length} “I have”`);
      onComplete?.();
      playSound("win");
    }
  }
  const reaction =
    selected === null ? "" : selected ? card.haveReaction : card.haventReaction;
  const senderChoice =
    card.senderPick === "have"
      ? true
      : card.senderPick === "havent"
        ? false
        : null;
  return (
    <div className="never-have-deck">
      <div className="deck-progress">
        {index + 1}/{cards.length}
      </div>
      <article>
        <small>NEVER HAVE I EVER…</small>
        <strong>{card.statement}</strong>
      </article>
      {selected !== null ? (
        <section className="choice-reaction-reveal">
          <small>
            {mode === "react"
              ? `${person} reacted to your choice`
              : `${person} played along`}
          </small>
          <strong>
            {mode === "react"
              ? reaction || "That answer definitely deserves a story 👀"
              : senderChoice === null
                ? "They left this confession entirely to you ♡"
                : senderChoice === selected
                  ? "“Same answer as me!” ♡"
                  : `“I chose ${senderChoice ? "I have" : "I haven’t"}.”`}
          </strong>
          <button onClick={next}>
            {index === cards.length - 1
              ? "See my confession score ✓"
              : "Next statement →"}
          </button>
        </section>
      ) : (
        <div>
          <button onClick={() => answer(false)}>I haven’t</button>
          <button onClick={() => answer(true)}>I have</button>
        </div>
      )}
    </div>
  );
}

function TruthDare({
  config,
  giftId,
  recipientSession,
  recipientName,
  blockInstanceId,
  onComplete,
  onReward,
}: Props) {
  const truths = lines(config.truths, [
    "What was your first impression of me?",
  ]);
  const dares = lines(config.dares, ["Send me your cutest selfie"]);
  const maxSpins = Math.min(8, Math.max(1, Number(config.truthDareSpins) || 1));
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [resultType, setResultType] = useState<"TRUTH" | "DARE" | "">("");
  const [spinning, setSpinning] = useState(false);
  const [answer, setAnswer] = useState("");
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [spinCount, setSpinCount] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  function spin() {
    if (spinning || resultType || spinCount >= maxSpins) return;
    setSpinning(true);
    setResult("");
    setAnswer("");
    setSaveState("idle");
    playSound("wheel");
    const truth = randomIndex(2) === 0;
    const prompts = truth ? truths : dares;
    const prompt = prompts[randomIndex(prompts.length)];
    const target = truth ? 270 : 90;
    setRotation((value) => {
      const current = ((value % 360) + 360) % 360;
      const offset = (((target - current) % 360) + 360) % 360;
      return value + 1440 + offset;
    });
    window.setTimeout(() => {
      setSpinning(false);
      setResult(prompt);
      setResultType(truth ? "TRUTH" : "DARE");
      playSound("reveal");
    }, 1800);
  }
  async function finish() {
    if (resultType === "TRUTH" && !answer.trim()) return;
    setSaveState("saving");
    try {
      if (giftId && resultType === "TRUTH") {
        const response = await fetch(
          `${api}/api/public/gifts/${giftId}/responses`,
          {
            method: "POST",
            headers: recipientHeaders(recipientSession),
            body: JSON.stringify({
              blockId: blockInstanceId || "truthdare",
              responseType: "TRUTH",
              contributorName: recipientName || "Recipient",
              responseText: `${result} — ${answer.trim()}`,
              photoUrls: [],
            }),
          },
        );
        if (!response.ok) throw new Error();
      }
      const reward =
        resultType === "TRUTH"
          ? `Truth answer: ${answer.trim()}`
          : `Dare accepted: ${result}`;
      const nextCount = spinCount + 1;
      setSaveState("saved");
      setSpinCount(nextCount);
      setHistory((current) => [...current, `${resultType}: ${result}`]);
      onReward?.(reward);
      playSound("win");
      if (nextCount >= maxSpins) onComplete?.();
      else
        window.setTimeout(() => {
          setResult("");
          setResultType("");
          setAnswer("");
          setSaveState("idle");
        }, 650);
    } catch {
      setSaveState("error");
    }
  }
  const complete = spinCount >= maxSpins;
  return (
    <div className="truth-dare-play">
      <div className="td-spin-progress">
        Spin {Math.min(spinCount + 1, maxSpins)} of {maxSpins}
      </div>
      <div className="td-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
        <span>TRUTH</span>
        <span>DARE</span>
        <i>♡</i>
      </div>
      <i className="td-pointer" />
      <button
        onClick={spin}
        disabled={spinning || Boolean(resultType) || complete}
      >
        {spinning
          ? "Choosing…"
          : complete
            ? "All spins complete ✓"
            : resultType
              ? "Complete this result"
              : "Spin roulette"}
      </button>
      <output>
        {resultType ? (
          <>
            <b>{resultType}</b> · {result}
          </>
        ) : complete ? (
          "Every roulette moment is complete."
        ) : (
          "Truth or dare? Let chance decide."
        )}
      </output>
      {resultType === "TRUTH" && (
        <div className="truth-answer-box">
          <label>
            Your answer
            <textarea
              rows={3}
              maxLength={500}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type the truth…"
            />
          </label>
          <button
            onClick={finish}
            disabled={
              !answer.trim() || saveState === "saving" || saveState === "saved"
            }
          >
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? spinCount >= maxSpins
                  ? "Saved for sender ✓"
                  : "Saved · next spin…"
                : "Save answer for sender"}
          </button>
          {saveState === "error" && (
            <small>Couldn’t save yet. Please try again.</small>
          )}
        </div>
      )}
      {resultType === "DARE" && (
        <button
          className="dare-done"
          onClick={finish}
          disabled={saveState === "saved"}
        >
          {saveState === "saved"
            ? spinCount >= maxSpins
              ? "Dare accepted ✓"
              : "Accepted · next spin…"
            : "I’ll do it →"}
        </button>
      )}
      {history.length > 0 && (
        <div className="td-history">
          {history.map((item, index) => (
            <small key={index}>✓ {item}</small>
          ))}
        </div>
      )}
    </div>
  );
}

function TapHeart({ config, onComplete, onReward }: Props) {
  const duration = Math.min(Math.max(Number(config.duration) || 10, 5), 15);
  const levels = Math.min(Math.max(Number(config.tapLevels) || 1, 1), 6);
  const triesAllowed = Math.min(Math.max(Number(config.tapTries) || 3, 1), 10);
  const targetLabel = (config.tapTargetLabel || "hearts").trim() || "hearts";
  const [time, setTime] = useState(duration);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [tries, setTries] = useState(triesAllowed);
  const [avoidPosition, setAvoidPosition] = useState({ left: 68, top: 30 });
  const [position, setPosition] = useState({ left: 48, top: 46 });
  const completed = useRef(false);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setTime((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (!playing) return;
    const mover = window.setInterval(
      () => {
        setPosition({ left: 8 + randomIndex(78), top: 8 + randomIndex(67) });
        setAvoidPosition({
          left: 8 + randomIndex(78),
          top: 8 + randomIndex(67),
        });
      },
      Math.max(360, 1050 - level * 125),
    );
    return () => window.clearInterval(mover);
  }, [playing, level]);
  useEffect(() => {
    if (time !== 0 || !playing || completed.current) return;
    completed.current = true;
    setPlaying(false);
    playSound("win");
    onReward?.(`${targetLabel} tapped: ${score}`);
    onComplete?.();
  }, [time, playing, score, onComplete, onReward, targetLabel]);
  function start() {
    completed.current = false;
    setScore(0);
    setTime(duration);
    setPlaying(true);
    setLevel(1);
    setTries(triesAllowed);
    playSound("reveal");
  }
  function tap() {
    if (!playing) return;
    setScore((value) => value + 1);
    setLevel(Math.min(levels, 1 + Math.floor((score + 1) / 5)));
    playSound("tile");
    setPosition({ left: 8 + randomIndex(78), top: 8 + randomIndex(67) });
  }
  function tapAvoid() {
    if (!playing) return;
    const next = tries - 1;
    setTries(next);
    playSound("incorrect");
    if (next <= 0) {
      setPlaying(false);
      onReward?.(`${targetLabel} tapped: ${score} · ran out of tries`);
      onComplete?.();
    }
  }
  return (
    <div
      className={`rhythm-heart-game ${config.tapImage ? "custom-target" : ""}`}
    >
      <header>
        <strong>
          {playing
            ? `${time}s`
            : time === 0
              ? `${score} ${targetLabel}`
              : "Ready?"}
        </strong>
        <span>
          {config.scoreTitle || "Official heart-catching score"} · {score} ·
          Level {level}/{levels} · {tries} tries
        </span>
      </header>
      <div>
        {playing && (
          <button
            style={{ left: `${position.left}%`, top: `${position.top}%` }}
            onClick={tap}
            aria-label={`Tap ${targetLabel}`}
          >
            {config.tapImage ? <img src={config.tapImage} alt="" /> : "♥"}
          </button>
        )}
        {playing && (
          <button
            className="avoid-target"
            style={{
              left: `${avoidPosition.left}%`,
              top: `${avoidPosition.top}%`,
            }}
            onClick={tapAvoid}
            aria-label="Do not tap"
          >
            {config.avoidImage ? (
              <img src={config.avoidImage} alt="Do not tap" />
            ) : (
              "×"
            )}
          </button>
        )}
        {!playing && (
          <button className="start-heart" onClick={start}>
            {time === 0 ? "Play again" : `Start ${duration}-second burst`}
          </button>
        )}
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function MatchPair({ config, onComplete, onReward }: Props) {
  const uploaded = parse<PairPhoto[]>(config.pairPhotos, []).slice(0, 6);
  const desiredPairs = Math.max(
    2,
    Math.min(
      6,
      Math.floor((Number.parseInt(config.matchGrid || "8", 10) || 8) / 2),
    ),
  );
  const samples = [
    { id: "a", image: "/mypookie-letter-photo.png", caption: "Fair day" },
    { id: "b", image: "/mypookie-puzzle-picnic.png", caption: "Picnic" },
    { id: "c", image: "/mypookie-memory-polaroids.png", caption: "Us" },
    { id: "d", image: "/mypookie-letter-photo.png", caption: "Golden hour" },
    {
      id: "e",
      image: "/mypookie-puzzle-picnic.png",
      caption: "Little adventures",
    },
    {
      id: "f",
      image: "/mypookie-memory-polaroids.png",
      caption: "Favourite days",
    },
    { id: "g", image: "/mypookie-letter-photo.png", caption: "Sweet chaos" },
    { id: "h", image: "/mypookie-puzzle-picnic.png", caption: "Together" },
    {
      id: "i",
      image: "/mypookie-memory-polaroids.png",
      caption: "Our chapter",
    },
    { id: "j", image: "/mypookie-letter-photo.png", caption: "Tiny joys" },
    { id: "k", image: "/mypookie-puzzle-picnic.png", caption: "Best company" },
    { id: "l", image: "/mypookie-memory-polaroids.png", caption: "Always us" },
  ];
  const photos = (uploaded.length >= desiredPairs ? uploaded : samples).slice(
    0,
    desiredPairs,
  );
  const makeDeck = () =>
    shuffle(
      photos.flatMap((photo) => [
        { ...photo, cardId: `${photo.id}-a` },
        { ...photo, cardId: `${photo.id}-b` },
      ]),
    );
  const [cards, setCards] = useState(makeDeck);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  function flip(index: number) {
    if (
      open.length >= 2 ||
      open.includes(index) ||
      matched.includes(cards[index].id)
    )
      return;
    playSound("page");
    const next = [...open, index];
    setOpen(next);
    if (next.length === 2) {
      if (cards[next[0]].id === cards[next[1]].id) {
        const nextMatched = [...matched, cards[index].id];
        window.setTimeout(() => {
          setMatched(nextMatched);
          setOpen([]);
          playSound("correct");
          if (nextMatched.length === photos.length) {
            playSound("win");
            onReward?.("Matched every photo pair");
            onComplete?.();
          }
        }, 350);
      } else
        window.setTimeout(() => {
          setOpen([]);
          playSound("incorrect");
        }, 650);
    }
  }
  function choose(index: number) {
    if (open.length === 1) setMoves((value) => value + 1);
    flip(index);
  }
  const columns = cards.length <= 4 ? 2 : cards.length <= 12 ? 4 : 6;
  return (
    <div className="match-pair-game">
      <header>
        <div>
          <strong>Match the memories</strong>
          <span>
            {matched.length}/{photos.length} pairs · {moves} moves
          </span>
        </div>
        <button
          disabled={moves > 0 || open.length > 0 || matched.length > 0}
          onClick={() => setCards(makeDeck())}
        >
          ↻ Shuffle
        </button>
      </header>
      <div
        className={`match-grid cards-${cards.length}`}
        style={{ gridTemplateColumns: `repeat(${columns},1fr)` }}
      >
        {cards.map((card, index) => (
          <button
            key={card.cardId}
            className={`${open.includes(index) || matched.includes(card.id) ? "open" : ""} ${matched.includes(card.id) ? "matched" : ""}`}
            onClick={() => choose(index)}
          >
            <span>♡</span>
            <figure>
              <img src={card.image} alt={card.caption} />
              <figcaption>{card.caption}</figcaption>
            </figure>
          </button>
        ))}
      </div>
    </div>
  );
}

function useClock(dateValue: string | undefined, mode: "since" | "until") {
  const calculate = useCallback(() => {
    const target = new Date(dateValue || Date.now()).getTime();
    const difference =
      mode === "since" ? Date.now() - target : target - Date.now();
    return Math.max(0, difference);
  }, [dateValue, mode]);
  const [difference, setDifference] = useState(calculate);
  useEffect(() => {
    const timer = window.setInterval(() => setDifference(calculate()), 1000);
    return () => window.clearInterval(timer);
  }, [calculate]);
  const days = Math.floor(difference / 86400000),
    hours = Math.floor(difference / 3600000) % 24,
    minutes = Math.floor(difference / 60000) % 60,
    seconds = Math.floor(difference / 1000) % 60;
  return { days, hours, minutes, seconds };
}

function CountdownUs({ config, onComplete }: Props) {
  const time = useClock(config.sinceDate, "since");
  const [held, setHeld] = useState(false);
  return (
    <div className="relationship-counter">
      <small>{config.counterLabel || "SINCE OUR STORY BEGAN"}</small>
      <div>
        <b>
          {time.days}
          <span>days</span>
        </b>
        <b>
          {String(time.hours).padStart(2, "0")}
          <span>hours</span>
        </b>
        <b>
          {String(time.minutes).padStart(2, "0")}
          <span>minutes</span>
        </b>
        <b>
          {String(time.seconds).padStart(2, "0")}
          <span>seconds</span>
        </b>
      </div>
      <button
        className={held ? "held" : ""}
        onClick={() => {
          if (!held) {
            setHeld(true);
            playSound("reveal");
            onComplete?.();
          }
        }}
      >
        {held ? "This moment is ours ♡" : "Hold this moment"}
      </button>
    </div>
  );
}

function Constellation({ config, onComplete }: Props) {
  const [chosen, setChosen] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const stars = useMemo(
    () =>
      Array.from({ length: 64 }, (_, index) => ({
        left: (index * 47) % 97,
        top: (index * 31) % 91,
        size: 2 + (index % 3),
      })),
    [],
  );
  const senderShapes: Record<string, string> = {
    Heart: "18,30 30,18 42,30 50,48 58,30 70,18 82,30",
    Crown: "18,62 25,28 43,48 55,20 70,48 82,28 88,62",
    Infinity:
      "15,48 28,30 45,48 55,58 72,30 86,48 72,66 55,48 45,38 28,66 15,48",
    "Little bear":
      "25,32 34,24 42,34 58,34 66,24 75,32 70,60 50,72 30,60 25,32",
  };
  const senderPoints =
    senderShapes[config.constellationShape || "Heart"] || senderShapes.Heart;
  const recipientPoints = chosen
    .map((index) => `${stars[index].left},${stars[index].top}`)
    .join(" ");
  const fortunes = [
    "Two paths that keep finding the same sky.",
    "Your differences make a brighter pattern.",
    "A playful chapter is about to begin.",
    "This bond grows strongest through shared adventures.",
  ];
  const fortune =
    fortunes[chosen.reduce((sum, value) => sum + value, 0) % fortunes.length];
  function choose(index: number) {
    if (revealed || chosen.includes(index)) return;
    playSound("tile");
    setChosen((current) => [...current, index]);
  }
  function reveal() {
    if (chosen.length < 2) return;
    setRevealed(true);
    playSound("win");
    onComplete?.();
  }
  return (
    <div
      className={`constellation-map ${config.skyStyle?.toLowerCase().replaceAll(" ", "-")} ${revealed ? "revealed" : ""}`}
    >
      <div className="cosmic-orb planet-one" />
      <div className="cosmic-orb planet-two" />
      <div className="shooting-star" />
      {stars.map((star, index) => (
        <i
          role="button"
          tabIndex={0}
          aria-label={`Star ${index + 1}`}
          className={chosen.includes(index) ? "chosen" : ""}
          onClick={() => choose(index)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") choose(index);
          }}
          key={index}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
          }}
        />
      ))}
      {!revealed && (
        <>
          <header className="constellation-prompt">
            <small>DRAW IN THE STARS</small>
            <strong>Choose as many stars as feel right</strong>
            <span>{chosen.length} selected · connect at least two</span>
          </header>
          <svg
            className="recipient-star-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline points={recipientPoints} />
          </svg>
          <button
            className="constellation-reveal"
            disabled={chosen.length < 2}
            onClick={reveal}
          >
            Join our skies ✦
          </button>
        </>
      )}
      {revealed && (
        <div className="constellation-pair">
          <section>
            <small>FROM THEM</small>
            <svg viewBox="0 0 100 100">
              <polyline points={senderPoints} />
            </svg>
            <strong>
              {config.starName ||
                config.constellationShape ||
                "Their constellation"}
            </strong>
          </section>
          <section>
            <small>FROM YOU</small>
            <svg viewBox="0 0 100 100">
              <polyline points={recipientPoints} />
            </svg>
            <strong>Your constellation</strong>
          </section>
          <p>
            <b>YOUR SKY FORTUNE</b>
            {fortune}
            <em>{config.starMessage}</em>
          </p>
        </div>
      )}
    </div>
  );
}

function GrowthRing({
  config,
  giftId,
  recipientSession,
  recipientName,
  blockInstanceId,
  onComplete,
}: Props) {
  const sender = parse<string[]>(config.growthSenderMemories, [
    "The day our story began",
    "Our funniest adventure",
    "When this bond felt unbreakable",
    "A challenge that made us stronger",
    "The chapter we are growing into next",
  ]).slice(0, 5);
  const [answers, setAnswers] = useState(() => sender.map(() => ""));
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  async function reveal() {
    if (answers.some((answer) => !answer.trim()) || saving) return;
    setSaving(true);
    try {
      if (giftId)
        await fetch(`${api}/api/public/gifts/${giftId}/responses`, {
          method: "POST",
          headers: recipientHeaders(recipientSession),
          body: JSON.stringify({
            blockId: blockInstanceId || "growthring",
            responseType: "GROWTH",
            contributorName: recipientName || "Recipient",
            responseText: JSON.stringify(answers),
            photoUrls: [],
          }),
        });
    } finally {
      setSaving(false);
      setRevealed(true);
      playSound("win");
      onComplete?.();
    }
  }
  if (!revealed)
    return (
      <div className="growth-memory-form">
        <span>∞</span>
        <small>ADD YOUR SIDE OF THE STORY</small>
        <strong>Which moments grew this bond?</strong>
        {answers.map((answer, index) => (
          <label key={index}>
            <b>{index + 1}</b>
            <textarea
              rows={2}
              maxLength={120}
              value={answer}
              onChange={(event) =>
                setAnswers((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? event.target.value : item,
                  ),
                )
              }
              placeholder={
                index === 0
                  ? "A beginning you treasure…"
                  : index === 1
                    ? "A moment that still makes you smile…"
                    : "A memory that changed your bond…"
              }
            />
          </label>
        ))}
        <button
          onClick={reveal}
          disabled={answers.some((answer) => !answer.trim()) || saving}
        >
          {saving ? "Saving your memories…" : "Grow our shared timeline →"}
        </button>
      </div>
    );
  const moments = sender.flatMap((memory, index) => [
    { who: "FROM THEM", text: memory },
    { who: "FROM YOU", text: answers[index] },
  ]);
  return (
    <div className="growth-timeline">
      <header>
        <span>∞</span>
        <div>
          <small>SIX MOMENTS · ONE STORY</small>
          <strong>Look how far you’ve grown together.</strong>
        </div>
      </header>
      <div>
        {moments.map((moment, index) => (
          <article
            key={index}
            style={{ "--delay": `${index * 0.14}s` } as React.CSSProperties}
          >
            <i>{index + 1}</i>
            <small>{moment.who}</small>
            <strong>{moment.text}</strong>
          </article>
        ))}
      </div>
      <footer>Not rings in a tree—moments still moving forward. ♡</footer>
    </div>
  );
}

type BondAnalysis = {
  title: string;
  subtitle: string;
  senderRole: string;
  recipientRole: string;
  tagline: string;
  genre: string;
};

function BondReveal({
  id,
  config,
  giftId,
  recipientSession,
  recipientName,
  senderName,
  blockInstanceId,
  onComplete,
  onReward,
}: Props) {
  const fallback = [
    "Where did you first meet?",
    "What do you always laugh about?",
    "What snack do you usually share?",
    "Who texts first most often?",
    "Which day together do you remember most?",
    "What little habit of theirs makes you smile?",
  ];
  const questionCount = id === "movie" ? 3 : 6;
  const questions = parse<string[]>(config.bondQuestions, fallback).slice(
    0,
    questionCount,
  );
  const normalized = Array.from(
    { length: questionCount },
    (_, index) => questions[index] || fallback[index],
  );
  const senderAnswers = parse<string[]>(config.senderBondAnswers, []);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [analysis, setAnalysis] = useState<BondAnalysis | null>(null);
  const [state, setState] = useState<"answering" | "analyzing" | "error">(
    "answering",
  );
  function next() {
    if (!value.trim()) return;
    const nextAnswers = [...answers, value.trim()];
    setAnswers(nextAnswers);
    setValue("");
    if (index < normalized.length - 1) {
      setIndex((current) => current + 1);
      playSound("tile");
    } else void analyze(nextAnswers);
  }
  async function analyze(recipientAnswers: string[]) {
    setState("analyzing");
    try {
      if (giftId)
        await fetch(`${api}/api/public/gifts/${giftId}/responses`, {
          method: "POST",
          headers: recipientHeaders(recipientSession),
          body: JSON.stringify({
            blockId: blockInstanceId || id,
            responseType: id === "movie" ? "MOVIE_BOND" : "SONG_BOND",
            contributorName: recipientName || "Recipient",
            responseText: JSON.stringify({
              questions: normalized,
              answers: recipientAnswers,
            }),
            photoUrls: [],
          }),
        });
      const response = await fetch(`${api}/api/ai/bond-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: id,
          senderName: senderName || "The sender",
          recipientName: recipientName || "The recipient",
          questions: normalized,
          senderAnswers,
          recipientAnswers,
          preference: id === "movie" ? config.genre : config.songStyle,
        }),
      });
      if (!response.ok) throw new Error();
      const result = (await response.json()) as BondAnalysis;
      setAnalysis(result);
      playSound("win");
      onReward?.(
        `${id === "movie" ? "Movie" : "Song"} reveal: ${result.title}`,
      );
      onComplete?.();
    } catch {
      setState("error");
    }
  }
  if (!analysis)
    return (
      <div className={`bond-recipient-quiz mode-${id}`}>
        <header>
          <span>{id === "movie" ? "▰" : "♪"}</span>
          <div>
            <small>
              {id === "movie" ? "CASTING YOUR STORY" : "FINDING YOUR SOUND"}
            </small>
            <strong>
              Answer the same questions as {senderName || "your person"}.
            </strong>
          </div>
        </header>
        {state === "analyzing" ? (
          <div className="bond-analyzing">
            <i />
            <strong>AI is comparing both sides of your bond…</strong>
            <small>
              Finding the title, characters and story only you two could make.
            </small>
          </div>
        ) : state === "error" ? (
          <div className="bond-analyzing error">
            <strong>The reveal paused for a moment.</strong>
            <button onClick={() => void analyze(answers)}>
              Try the analysis again
            </button>
          </div>
        ) : (
          <>
            <div className="bond-progress">
              {normalized.map((_, dot) => (
                <i key={dot} className={dot <= index ? "active" : ""} />
              ))}
            </div>
            <small>
              QUESTION {index + 1} OF {normalized.length}
            </small>
            <strong>{normalized[index]}</strong>
            <textarea
              autoFocus
              rows={3}
              maxLength={180}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Your honest answer…"
            />
            <button onClick={next} disabled={!value.trim()}>
              {index === normalized.length - 1
                ? "Create our reveal ✦"
                : "Next question →"}
            </button>
          </>
        )}
      </div>
    );
  const template = (config.posterTemplate || "Golden musical")
    .toLowerCase()
    .replaceAll(" ", "-");
  return (
    <div className={`bond-result mode-${id}`}>
      {id === "movie" ? (
        <div
          className={`movie-poster poster-${template} uploaded revealed`}
          style={
            config.posterImage
              ? {
                  backgroundImage: `linear-gradient(transparent 10%,rgba(30,15,24,.82)),url("${config.posterImage}")`,
                }
              : undefined
          }
        >
          <small>A MYPOOKIE. {analysis.genre.toUpperCase()}</small>
          <strong>{analysis.title}</strong>
          <p>{analysis.tagline}</p>
          <b>
            {senderName}: {analysis.senderRole}
            <br />
            {recipientName}: {analysis.recipientRole}
          </b>
          <span>NOW PLAYING · FOREVER</span>
        </div>
      ) : (
        <div className="song-reveal-card">
          <div className="song-disc">
            <i />
            <span>♪</span>
          </div>
          <small>YOUR BOND SOUNDS LIKE</small>
          <strong>{analysis.title}</strong>
          <em>{analysis.genre}</em>
          <p>{analysis.tagline}</p>
          <div>
            <span>{senderName}</span>
            <b>{analysis.senderRole}</b>
            <span>{recipientName}</span>
            <b>{analysis.recipientRole}</b>
          </div>
        </div>
      )}
      <p>{analysis.subtitle}</p>
    </div>
  );
}

function AlwaysYou({ config, onComplete, onReward }: Props) {
  const fallback: AlwaysQuestion[] = [
    {
      id: "always-1",
      question: config.question || "Who makes every day better?",
      answers: lines(config.answers, ["You", "Still you", "Obviously you"]),
    },
  ];
  const questions = parse<AlwaysQuestion[]>(
    config.alwaysYouQuestions,
    fallback,
  ).slice(0, 7);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const current = questions[index] || fallback[0];
  function choose(answer: string) {
    if (selected) return;
    setSelected(answer);
    playSound("correct");
    window.setTimeout(() => {
      if (index >= questions.length - 1) {
        playSound("win");
        onReward?.(`Completed ${questions.length} little questions`);
        onComplete?.();
      } else {
        setIndex((value) => value + 1);
        setSelected(null);
      }
    }, 650);
  }
  return (
    <div className="always-you-quiz">
      <small>
        LITTLE QUESTION {index + 1} OF {questions.length}
      </small>
      <strong>{current.question}</strong>
      <div>
        {current.answers.slice(0, 4).map((answer) => (
          <button
            key={answer}
            onClick={() => choose(answer)}
            className={selected === answer ? "selected" : ""}
          >
            {answer}
            {selected === answer && <span> ✓ chosen</span>}
          </button>
        ))}
      </div>
      {selected && <p>Choice saved. On to the next little question. ♡</p>}
    </div>
  );
}

function ExcuseGenerator({
  config,
  giftId,
  recipientSession,
  recipientName,
  blockInstanceId,
  onComplete,
  onReward,
}: Props) {
  const legacy = lines(config.excuses, [
    "There is an emergency hug shortage.",
  ]).map((senderExcuse, index) => ({
    id: `legacy-${index}`,
    situation: "We need a playful excuse to meet right now.",
    senderExcuse,
  }));
  const rounds = parse<ExcuseRound[]>(config.excuseRounds, legacy);
  const [round] = useState(
    () => rounds[randomIndex(rounds.length)] || legacy[0],
  );
  const [stage, setStage] = useState<
    "ready" | "choosing" | "writing" | "revealed"
  >("ready");
  const [recipientExcuse, setRecipientExcuse] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  function pull() {
    if (stage !== "ready") return;
    setStage("choosing");
    playSound("lever");
    window.setTimeout(() => {
      setStage("writing");
      playSound("reveal");
    }, 850);
  }
  async function reveal() {
    if (!recipientExcuse.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      if (giftId) {
        const response = await fetch(
          `${api}/api/public/gifts/${giftId}/responses`,
          {
            method: "POST",
            headers: recipientHeaders(recipientSession),
            body: JSON.stringify({
              blockId: blockInstanceId || "excuse",
              responseType: "EXCUSE",
              contributorName: recipientName || "Recipient",
              responseText: JSON.stringify({
                situation: round.situation,
                senderExcuse: round.senderExcuse,
                recipientExcuse: recipientExcuse.trim(),
              }),
              photoUrls: [],
            }),
          },
        );
        if (!response.ok) throw new Error();
      }
      setStage("revealed");
      playSound("win");
      onReward?.(
        `Our excuse: ${round.senderExcuse} + ${recipientExcuse.trim()}`,
      );
      onComplete?.();
    } catch {
      setError("Couldn’t save your excuse yet. Try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className={`excuse-duet stage-${stage}`}>
      <header>
        <small>THE SITUATION</small>
        <strong>
          {stage === "ready"
            ? "Pull to get your situation"
            : stage === "choosing"
              ? "Choosing something suitably ridiculous…"
              : round.situation}
        </strong>
      </header>
      {stage === "ready" || stage === "choosing" ? (
        <button
          className={`excuse-lever ${stage === "choosing" ? "pulled" : ""}`}
          onClick={pull}
          disabled={stage === "choosing"}
          aria-label="Pull for an excuse situation"
        >
          <i />
          <b />
        </button>
      ) : stage === "writing" ? (
        <section className="excuse-write">
          <small>{recipientName || "Your"} turn</small>
          <strong>Make your best excuse.</strong>
          <textarea
            autoFocus
            rows={3}
            maxLength={140}
            value={recipientExcuse}
            onChange={(event) => setRecipientExcuse(event.target.value)}
            placeholder="Make it believable… or beautifully ridiculous."
          />
          <button
            onClick={() => void reveal()}
            disabled={!recipientExcuse.trim() || saving}
          >
            {saving ? "Saving both sides…" : "Reveal both excuses →"}
          </button>
          {error && <output>{error}</output>}
        </section>
      ) : (
        <section className="excuse-reveal">
          <article>
            <small>THEIR EXCUSE</small>
            <strong>{round.senderExcuse}</strong>
          </article>
          <span>＋</span>
          <article>
            <small>YOUR EXCUSE</small>
            <strong>{recipientExcuse}</strong>
          </article>
          <p>Official verdict: suspiciously convincing together. ✓</p>
        </section>
      )}
    </div>
  );
}

function RoastCards({ config, onComplete }: Props) {
  const roasts = lines(config.roasts, [
    "You steal the blanket and look innocent",
  ]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  function flip() {
    if (!flipped) {
      setFlipped(true);
      playSound("page");
      onComplete?.();
    } else {
      setFlipped(false);
      setIndex((value) => (value + 1) % roasts.length);
    }
  }
  return (
    <button className={`roast-card ${flipped ? "flipped" : ""}`} onClick={flip}>
      <div>
        <span>♨</span>
        <strong>Roast me gently</strong>
        <small>Tap to reveal complaint #{index + 1}</small>
      </div>
      <div>
        <small>LOVING COMPLAINT #{index + 1}</small>
        <strong>{roasts[index]}</strong>
        <span>…and I would still choose you.</span>
      </div>
    </button>
  );
}

const tarotFallbacks = [
  "A quiet wish is already finding its way toward you.",
  "Your next brave choice opens a surprisingly beautiful door.",
  "A familiar smile will make an ordinary day feel magical.",
  "Trust the gentle beginning; it carries more than it first reveals.",
  "Something you give freely will return to you as joy.",
  "The path ahead becomes clearer when you choose what feels kind.",
  "A lovely coincidence is waiting just beyond your usual routine.",
  "Your warmth is about to turn a small moment into a memory.",
  "The chapter approaching you has room for wonder and good news.",
];

function TarotFortune({ config, onComplete, onAdvance, onReward }: Props) {
  const [phase, setPhase] = useState<"intro" | "cards" | "revealed">("intro");
  const [fortunes, setFortunes] = useState(tarotFallbacks);
  const [loading, setLoading] = useState(true);
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`${api}/api/ai/tarot-fortunes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        theme: config.tarotTheme || "love, joy and gentle new beginnings",
      }),
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { fortunes?: string[] }) => {
        const next = (data.fortunes || [])
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 9);
        if (next.length === 9) setFortunes(next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [config.tarotGeneration]);

  function reveal(index: number) {
    if (chosen !== null) return;
    setChosen(index);
    playSound("reveal");
    window.setTimeout(() => {
      setPhase("revealed");
      playSound("win");
      onReward?.(`Tarot fortune: ${fortunes[index]}`);
      onComplete?.();
    }, 720);
  }

  return (
    <div className={`tarot-fortune tarot-${phase}`}>
      {phase === "intro" ? (
        <div className="tarot-cat-intro">
          <img src="/tarot/tarot-cat.gif" alt="Animated tarot cat" />
          <div className="tarot-cat-bubble">
            <small>THE TAROT CAT WHISPERS</small>
            <strong>Are you ready to meet the fortune meant for you?</strong>
            <span>{loading ? "The stars are arranging your cards…" : "Nine fresh fortunes are ready."}</span>
          </div>
          <button disabled={loading} onClick={() => { playSound("tile"); setPhase("cards"); }}>
            {loading ? "Reading the stars…" : "Yes, deal my cards ✦"}
          </button>
        </div>
      ) : (
        <div className="tarot-table">
          <header>
            <small>THE CAT HAS DEALT YOUR DESTINY</small>
            <strong>{phase === "revealed" ? "Your card has spoken" : "Choose the card that calls to you"}</strong>
          </header>
          <div className="tarot-card-grid">
            {fortunes.map((fortune, index) => {
              const flipped = chosen === index;
              return (
                <button
                  aria-label={flipped ? `Fortune: ${fortune}` : `Flip tarot card ${index + 1}`}
                  className={flipped ? "flipped" : chosen !== null ? "dimmed" : ""}
                  key={index}
                  onClick={() => reveal(index)}
                >
                  <span className="tarot-card-inner">
                    <i className="tarot-card-back" />
                    <i
                      className="tarot-card-face"
                      style={{ backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%` }}
                    >
                      <em>{fortune}</em>
                    </i>
                  </span>
                </button>
              );
            })}
          </div>
          {phase === "revealed" && chosen !== null && (
            <><p className="tarot-reading">{fortunes[chosen]}</p><button className="tarot-next" onClick={() => onAdvance?.()}>Continue to the next moment →</button></>
          )}
        </div>
      )}
    </div>
  );
}

function DrawTogether({ config, giftId, recipientSession, recipientName, senderName, blockInstanceId, onComplete, onReward, onConfig }: Props) {
  const [recipientDrawing, setRecipientDrawing] = useState("");
  const [saved, setSaved] = useState(() => Boolean(config.senderDrawing && !(giftId && recipientSession)));
  const prompt = config.drawPrompt || "A flower";
  const isRecipient = Boolean(giftId && recipientSession);

  useEffect(() => {
    if (!isRecipient) return;
    fetch(`${api}/api/public/gifts/${giftId}/responses?blockId=${encodeURIComponent(blockInstanceId || "drawtogether")}`, { headers: recipientHeaders(recipientSession) })
      .then(response => response.ok ? response.json() : [])
      .then((items: SavedResponse[]) => {
        const match = items.find(item => item.responseText === "DRAW_TOGETHER");
        if (!match) return;
        const images = parse<string[]>(match.photoUrls, []);
        if (images[0]) { setRecipientDrawing(images[0]); setSaved(true); onComplete?.(); }
      }).catch(() => {});
  }, [blockInstanceId, giftId, isRecipient, onComplete, recipientSession]);

  async function save(image: string) {
    setRecipientDrawing(image);
    if (isRecipient) {
      const response = await fetch(`${api}/api/public/gifts/${giftId}/responses`, { method: "POST", headers: recipientHeaders(recipientSession), body: JSON.stringify({ blockId: blockInstanceId || "drawtogether", responseType: "DRAW_TOGETHER", contributorName: recipientName || "Recipient", responseText: "DRAW_TOGETHER", photoUrls: [image] }) });
      if (!response.ok) return;
    } else {
      onConfig?.("senderDrawing", image);
    }
    setSaved(true); playSound("win"); onReward?.(`You both drew: ${prompt}`); onComplete?.();
  }

  return <section className="draw-together">
    <small>ONE PROMPT · TWO IMAGINATIONS</small><h3>Draw Together</h3><p>Draw it your way. You only see each other’s art after saving.</p><span className="drawing-prompt">Draw: {prompt}</span>
    {!saved ? <DrawingCanvas initial={isRecipient ? "" : config.senderDrawing || ""} onSave={save} saveLabel={isRecipient ? "Finish my drawing" : config.senderDrawing ? "Update my drawing" : "Save my drawing"} /> : isRecipient ? <div className="drawing-comparison">
      <figure>{config.senderDrawing ? <img src={config.senderDrawing} alt={`${senderName || "Sender"}'s drawing`} /> : <div className="drawing-missing">Sender drawing coming soon</div>}<figcaption>{senderName || "Sender"}</figcaption></figure>
      <figure>{recipientDrawing ? <img src={recipientDrawing} alt={`${recipientName || "Recipient"}'s drawing`} /> : <div className="drawing-missing">Your drawing</div>}<figcaption>{recipientName || "Recipient"}</figcaption></figure>
    </div> : <div className="sender-drawing-saved"><img src={recipientDrawing || config.senderDrawing} alt="Your saved drawing"/><strong>Your drawing is saved</strong><span>The recipient will draw the same prompt before seeing yours.</span><button onClick={() => setSaved(false)}>Edit drawing</button></div>}
  </section>;
}

function FortuneCookie({ config, onComplete, onReward }: Props) {
  const fortunes = lines(config.fortunes, [
    "A surprise date is closer than you think",
  ]);
  const [fortune, setFortune] = useState("");
  function crack() {
    if (fortune) return;
    const value = fortunes[randomIndex(fortunes.length)];
    setFortune(value);
    playSound("reveal");
    onReward?.(`Fortune: ${value}`);
    onComplete?.();
  }
  return (
    <button
      className={`fortune-cookie design-${(config.cookieDesign || "Classic golden").toLowerCase().replaceAll(" ", "-")} ${fortune ? "cracked" : ""}`}
      onClick={crack}
    >
      <span className="fortune-sparkles" aria-hidden="true">
        <i>✦</i>
        <i>♡</i>
        <i>✧</i>
        <i>⋆</i>
        <i>✦</i>
      </span>
      <div className="fortune-cookie-art" aria-hidden="true">
        <span className="cookie-whole">
          <img src="/games/fortune-cookie-v1.png" alt="" />
        </span>
        <span className="cookie-half cookie-half-left">
          <img src="/games/fortune-cookie-v1.png" alt="" />
        </span>
        <span className="cookie-half cookie-half-right">
          <img src="/games/fortune-cookie-v1.png" alt="" />
        </span>
        <span className="cookie-crumbs">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
      {fortune ? <p>{fortune}</p> : <strong>Tap to crack your fortune</strong>}
    </button>
  );
}

function MysteryBox({ config, onComplete, onReward }: Props) {
  const surprises = lines(config.surprises, ["A long drive"]);
  const [state, setState] = useState<"closed" | "shaking" | "open">("closed");
  const [result, setResult] = useState("");
  function open() {
    if (state !== "closed") return;
    setState("shaking");
    playSound("lever");
    window.setTimeout(() => {
      const value =
        config.boxMode === "Always reveal the first"
          ? surprises[0]
          : surprises[randomIndex(surprises.length)];
      setResult(value);
      setState("open");
      playSound("win");
      onReward?.(value);
      onComplete?.();
    }, 1050);
  }
  return (
    <button className={`mystery-box-play ${state}`} onClick={open}>
      {state === "open" && (
        <div className="box-prize">
          <span>✦</span>
          <strong>{result}</strong>
          <i>YOUR SURPRISE</i>
        </div>
      )}
      <div className="box-lid">
        <i />
      </div>
      <div className="box-body">
        <span>{state === "open" ? "✦" : "♡"}</span>
      </div>
      <strong className="box-instruction">
        {state === "closed"
          ? "Tap the box"
          : state === "shaking"
            ? "Something is moving…"
            : "Surprise!"}
      </strong>
    </button>
  );
}

function PlaylistReveal({ config, onComplete }: Props) {
  const dedication =
    config.dedication || "Press play whenever you want to feel closer to me.";
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started || typed.length >= dedication.length) return;
    const timer = window.setTimeout(
      () => setTyped(dedication.slice(0, typed.length + 1)),
      24,
    );
    return () => window.clearTimeout(timer);
  }, [started, typed, dedication]);
  useEffect(() => {
    if (started && typed.length === dedication.length) {
      playSound("reveal");
      onComplete?.();
    }
  }, [started, typed.length, dedication.length, onComplete]);
  return (
    <div className="playlist-reveal">
      <div className="vinyl">
        <i />
        <span>♡</span>
      </div>
      <small>PLAYLIST FOR YOU</small>
      <strong>{config.playlistTitle || "Songs that feel like us"}</strong>
      {started ? (
        <>
          <p>
            {typed}
            <i />
          </p>
          <a href={config.playlistUrl || "#"} target="_blank" rel="noreferrer">
            Open playlist ↗
          </a>
        </>
      ) : (
        <button onClick={() => setStarted(true)}>Read the dedication</button>
      )}
    </div>
  );
}

function CountdownInvite({ config, onComplete, onReward }: Props) {
  const time = useClock(config.eventDate, "until");
  const [rsvp, setRsvp] = useState(false);
  return (
    <div className="countdown-invite">
      <small>YOU’RE INVITED</small>
      <strong>{config.eventTitle || "Our surprise date"}</strong>
      <div>
        <b>
          {time.days}
          <span>days</span>
        </b>
        <b>
          {String(time.hours).padStart(2, "0")}
          <span>hours</span>
        </b>
        <b>
          {String(time.minutes).padStart(2, "0")}
          <span>min</span>
        </b>
        <b>
          {String(time.seconds).padStart(2, "0")}
          <span>sec</span>
        </b>
      </div>
      <p>{config.inviteNote}</p>
      <button
        className={rsvp ? "accepted" : ""}
        onClick={() => {
          if (!rsvp) {
            setRsvp(true);
            playSound("win");
            onReward?.(`RSVP: I'm in for ${config.eventTitle || "the date"}`);
            onComplete?.();
          }
        }}
      >
        {rsvp ? "You’re in! See you there ♡" : "I’m in 💛"}
      </button>
    </div>
  );
}

function GroupBoard({ config, giftId, recipientSession, onComplete }: Props) {
  const starter = parse<BoardNote[]>(config.boardNotes, [
    { from: "Someone who loves you", message: "You make every room warmer." },
  ]);
  const [received, setReceived] = useState<BoardNote[]>([]);
  const [index, setIndex] = useState(0);
  const [viewed, setViewed] = useState<number[]>([0]);
  useEffect(() => {
    if (!giftId) return;
    fetch(`${api}/api/public/gifts/${giftId}/responses?blockId=groupboard`, {
      headers: recipientHeaders(recipientSession),
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((responses: SavedResponse[]) =>
        setReceived(
          responses.map((response) => ({
            from: response.contributorName,
            message: response.responseText,
            photos: parse<string[]>(response.photoUrls, []),
          })),
        ),
      )
      .catch(() => {});
  }, [giftId, recipientSession]);
  const notes = [...starter, ...received];
  const current = notes[index] || starter[0];
  function select(next: number) {
    setIndex(next);
    const nextViewed = viewed.includes(next) ? viewed : [...viewed, next];
    setViewed(nextViewed);
    playSound("page");
    if (nextViewed.length === notes.length) onComplete?.();
  }
  return (
    <div className="group-message-board names-first">
      <header>
        <span>♡</span>
        <div>
          <small>A CARD FROM EVERYONE</small>
          <strong>{notes.length} people left something for you</strong>
        </div>
      </header>
      <div className="board-names">
        {notes.map((note, noteIndex) => (
          <button
            key={`${note.from}-${noteIndex}`}
            className={noteIndex === index ? "active" : ""}
            onClick={() => select(noteIndex)}
          >
            <span>{note.from.slice(0, 1).toUpperCase()}</span>
            {note.from}
          </button>
        ))}
      </div>
      <div className="board-reveal-card">
        <small>A NOTE FROM</small>
        <strong>{current.from}</strong>
        <p>{current.message}</p>
        {current.photos && current.photos.length > 0 && (
          <div>
            {current.photos.map((photo, photoIndex) => (
              <img
                src={photo}
                alt={`Memory from ${current.from} ${photoIndex + 1}`}
                key={photoIndex}
              />
            ))}
          </div>
        )}
      </div>
      <footer>
        <span>
          {viewed.length}/{notes.length} opened
        </span>
        <small>Tap every name to complete this moment</small>
      </footer>
    </div>
  );
}
