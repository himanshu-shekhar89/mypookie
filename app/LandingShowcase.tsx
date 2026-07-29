"use client";

import { useEffect, useRef, useState } from "react";

const prizes = ["Movie night", "Breakfast", "A long hug", "Mystery date", "Your choice", "Sweet treat"];
const slotIcons = ["🎁", "🌸", "🍫", "🎟️", "⭐", "🧸"];

export function LandingShowcase() {
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelPrize, setWheelPrize] = useState("Tap spin to try it");
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotSymbols, setSlotSymbols] = useState(["🌸", "⭐", "🎁"]);
  const [slotPrize, setSlotPrize] = useState("Pull the lever");
  const [letterOpen, setLetterOpen] = useState(false);
  const [puzzle, setPuzzle] = useState([8, 2, 5, 1, 7, 0, 4, 6, 3]);
  const [picked, setPicked] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [puzzleHint, setPuzzleHint] = useState("Tap a piece, then one beside it");
  const scratchRef = useRef<HTMLCanvasElement>(null);
  const scratching = useRef(false);

  useEffect(() => {
    const canvas = scratchRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#b9aeb4");
    gradient.addColorStop(.5, "#ded5d9");
    gradient.addColorStop(1, "#a99da4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(255,255,255,.82)";
    ctx.font = "700 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH TO REVEAL", rect.width / 2, rect.height / 2 + 4);
  }, []);

  function spinWheel() {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelPrize("Spinning…");
    const winningIndex = Math.floor(Math.random() * prizes.length);
    setWheelRotation(value => {
      const currentAngle = ((value % 360) + 360) % 360;
      const targetAngle = (360 - (winningIndex * 60 + 30)) % 360;
      const exactOffset = (targetAngle - currentAngle + 360) % 360;
      return value + 1440 + exactOffset;
    });
    window.setTimeout(() => {
      setWheelPrize(`You won: ${prizes[winningIndex]} ♡`);
      setWheelSpinning(false);
    }, 3200);
  }

  function pullLever() {
    if (slotSpinning) return;
    setSlotSpinning(true);
    setSlotPrize("Rolling…");
    const timer = window.setInterval(() => {
      setSlotSymbols(Array.from({ length: 3 }, () => slotIcons[Math.floor(Math.random() * slotIcons.length)]));
    }, 85);
    window.setTimeout(() => {
      window.clearInterval(timer);
      const result = Array.from({ length: 3 }, () => slotIcons[Math.floor(Math.random() * slotIcons.length)]);
      setSlotSymbols(result);
      setSlotPrize(result.every(symbol => symbol === result[0]) ? "Jackpot: mystery date unlocked!" : `You found ${result.join(" ")} — one sweet surprise!`);
      setSlotSpinning(false);
    }, 2100);
  }

  function pickTile(index: number) {
    if (picked === null) {
      setPicked(index);
      return;
    }
    if (picked === index) {
      setPicked(null);
      return;
    }
    const firstRow = Math.floor(picked / 3);
    const firstCol = picked % 3;
    const nextRow = Math.floor(index / 3);
    const nextCol = index % 3;
    if (Math.abs(firstRow - nextRow) + Math.abs(firstCol - nextCol) !== 1) {
      setPuzzleHint("Only neighboring pieces can swap");
      setPicked(null);
      return;
    }
    setPuzzle(current => {
      const next = [...current];
      [next[picked], next[index]] = [next[index], next[picked]];
      return next;
    });
    setPuzzleHint("Nice move — keep going!");
    setPicked(null);
    setMoves(value => value + 1);
  }

  const puzzleSolved = puzzle.every((tile, index) => tile === index);

  function scratch(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!scratching.current && event.type === "pointermove") return;
    const canvas = scratchRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(event.clientX - rect.left, event.clientY - rect.top, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  return (
    <section className="experience-lab" id="ideas">
      <div className="lab-ambient" aria-hidden="true"><i/><i/><i/><b>✦</b><b>♡</b><b>✿</b></div>
      <div className="showcase-heading">
        <div><div className="section-kicker">TRY THE MAGIC YOURSELF</div><h2>Not a preview. <em>A tiny playground.</em></h2></div>
        <p>Spin, pull, solve, open and scratch. These are the same interactions your person receives inside their gift.</p>
      </div>

      <div className="play-grid">
        <article className="play-card wheel-card">
          <CardTitle number="01" eyebrow="SPIN & SURPRISE" title="Lucky wheel" />
          <div className="wheel-shell">
            <div className="wheel-pointer" aria-hidden="true" />
            <div className="real-wheel" style={{ transform: `rotate(${wheelRotation}deg)` }}>
              {prizes.map((prize, index) => <span key={prize} style={{ transform: `rotate(${index * 60 + 30}deg) translateY(-72px)` }}>{prize}</span>)}
              <i>♡</i>
            </div>
          </div>
          <button className="play-action" onClick={spinWheel} disabled={wheelSpinning}>{wheelSpinning ? "Spinning…" : "Spin the wheel"}</button>
          <output>{wheelPrize}</output>
        </article>

        <article className="play-card slot-card">
          <CardTitle number="02" eyebrow="PULL & WIN" title="Little jackpot" />
          <div className="slot-rig">
            <div className={`real-slots ${slotSpinning ? "rolling" : ""}`}>{slotSymbols.map((symbol, index) => <i key={index}>{symbol}</i>)}</div>
            <button className={`real-lever ${slotSpinning ? "pulled" : ""}`} onClick={pullLever} disabled={slotSpinning} aria-label="Pull the slot-machine lever"><b/><span/></button>
          </div>
          <small className="lever-hint">pull the lever →</small>
          <output>{slotPrize}</output>
        </article>

        <article className="play-card puzzle-card">
          <CardTitle number="03" eyebrow="PUT IT TOGETHER" title="3 × 3 photo puzzle" />
          <div className="puzzle-layout">
            <div className="reference-photo"><img src="/mypookie-puzzle-picnic.png" alt="Completed picnic memory" /><span>the real photo</span></div>
            <div className={`tile-grid ${puzzleSolved ? "solved" : ""}`}>{puzzle.map((tile, index) => <button key={`${tile}-${index}`} className={picked === index ? "picked" : ""} onClick={() => pickTile(index)} aria-label={`Puzzle tile ${index + 1}`} style={{ backgroundImage: "url('/mypookie-puzzle-picnic.png')", backgroundPosition: `${(tile % 3) * 50}% ${Math.floor(tile / 3) * 50}%` }} />)}{puzzleSolved && <div className="puzzle-success"><b>Perfect! ✦</b><span>You put this memory back together.</span></div>}</div>
          </div>
          <div className="puzzle-tools"><span>{puzzleSolved ? `Solved in ${moves} moves!` : `${moves} moves · ${puzzleHint}`}</span><button onClick={() => { setPuzzle([8,2,5,1,7,0,4,6,3]); setPicked(null); setMoves(0); setPuzzleHint("Tap a piece, then one beside it"); }}>Shuffle</button></div>
        </article>

        <article className="play-card letter-card">
          <CardTitle number="04" eyebrow="A NOTE FOR YOU" title="Open the letter" />
          <button className={`letter-demo ${letterOpen ? "opened" : ""}`} onClick={() => setLetterOpen(value => !value)} aria-label="Open animated letter">
            <div className="letter-sheet"><p>you’re my favourite<br/>notification.</p><span>— sent with love</span></div>
            <div className="envelope-back" />
            <div className="envelope-front" />
            <div className="envelope-flap" />
            <b>♡</b>
          </button>
          <output>{letterOpen ? "Tap again to tuck it away" : "Tap the wax seal to open"}</output>
        </article>

        <article className="play-card scratch-card">
          <CardTitle number="05" eyebrow="HIDDEN FOR YOU" title="Scratch & reveal" />
          <div className="scratch-stage">
            <div className="scratch-secret"><small>YOU UNLOCKED</small><strong>A candlelit dinner ♡</strong><span>Friday · 8:00 PM</span></div>
            <canvas ref={scratchRef} onPointerDown={event => { scratching.current = true; event.currentTarget.setPointerCapture(event.pointerId); scratch(event); }} onPointerMove={scratch} onPointerUp={() => { scratching.current = false; }} onPointerCancel={() => { scratching.current = false; }} aria-label="Scratch card coating" />
          </div>
          <output>Drag your finger or pointer across the card</output>
        </article>
      </div>
    </section>
  );
}

function CardTitle({ number, eyebrow, title }: { number: string; eyebrow: string; title: string }) {
  return <div className="lab-title"><span>{number}</span><div><small>{eyebrow}</small><strong>{title}</strong></div></div>;
}
