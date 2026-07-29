"use client";

import { useEffect, useRef, useState } from "react";

type PreviewBlock = {
  id: string;
  icon: string;
  name: string;
  color: string;
  message: string;
  config?: Record<string, string>;
};

const wheelPrizes = ["Movie night", "Breakfast", "A long hug", "Mystery date", "Your choice", "Sweet treat"];

export function BuilderLivePreview({ block, name, theme, ambience }: { block: PreviewBlock; name: string; theme: string; ambience: string }) {
  const [opened, setOpened] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState("Tap spin to test it");
  const [spinning, setSpinning] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [dodge, setDodge] = useState(false);
  const [puzzle, setPuzzle] = useState([1, 0, 2, 3, 4, 5, 6, 7, 8]);
  const [picked, setPicked] = useState<number | null>(null);
  const [clue, setClue] = useState(0);
  const [calendar, setCalendar] = useState<number[]>([]);
  const config = block.config || {};
  const customWheelPrizes = (config.prizes || wheelPrizes.join("\n")).split("\n").map(item => item.trim()).filter(Boolean).slice(0, 6);
  while (customWheelPrizes.length < 6) customWheelPrizes.push(wheelPrizes[customWheelPrizes.length]);
  const treasureClues = (config.clues || "Start where we first said hello.\nLook beside your favourite photo.\nYour surprise is waiting at our café.").split("\n").map(item => item.trim()).filter(Boolean);

  function spinWheel() {
    if (spinning) return;
    const winner = Math.floor(Math.random() * customWheelPrizes.length);
    setSpinning(true);
    setWheelResult("Spinning…");
    setWheelRotation(value => {
      const current = ((value % 360) + 360) % 360;
      const target = (360 - (winner * 60 + 30)) % 360;
      return value + 1440 + ((target - current + 360) % 360);
    });
    window.setTimeout(() => {
      setWheelResult(`You won: ${customWheelPrizes[winner]} ♡`);
      setSpinning(false);
    }, 2600);
  }

  function moveTile(index: number) {
    if (picked === null) {
      setPicked(index);
      return;
    }
    const distance = Math.abs(Math.floor(picked / 3) - Math.floor(index / 3)) + Math.abs((picked % 3) - (index % 3));
    if (distance !== 1) {
      setPicked(null);
      return;
    }
    setPuzzle(current => {
      const next = [...current];
      [next[picked], next[index]] = [next[index], next[picked]];
      return next;
    });
    setPicked(null);
  }

  const solved = puzzle.every((tile, index) => tile === index);

  return (
    <div className={`builder-live-card live-theme-${theme.toLowerCase().replaceAll(" ", "-")}`}>
      {ambience === "Petals" && <div className="live-ambience petals" aria-hidden="true"><i>✿</i><i>·</i><i>✿</i><i>·</i><i>✿</i></div>}
      {ambience === "Soft sparkles" && <div className="live-ambience sparkles" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i></div>}
      <div className="live-recipient-label">A LITTLE SOMETHING FOR {name.toUpperCase()}</div>
      <div className={`live-block-icon ${block.color}`}>{block.icon}</div>
      <h3>{block.name}</h3>
      {block.id !== "letter" && block.id !== "voice" && <p>{block.message}</p>}
      <div className="live-interaction">
        {block.id === "letter" && <button className={`live-letter ${opened ? "opened" : ""}`} onClick={() => setOpened(value => !value)}><span>{block.message.slice(0, 100)}<small>{config.signoff || "— sent with love"}</small></span><i/><b>♥</b></button>}
        {block.id === "voice" && <VoicePreview audioUrl={config.audioUrl} />}
        {block.id === "flowers" && <button className={`live-flowers ${opened ? "opened" : ""}`} onClick={() => setOpened(value => !value)}><span>🌷</span><span>{config.flowerStyle === "Classic red roses" ? "🌹" : config.flowerStyle === "Wildflower garden" ? "🌼" : "🌸"}</span><span>🌷</span><small>{opened ? config.flowerNote || "blooming for you" : "tap to bloom"}</small></button>}
        {block.id === "quiz" && <div className="live-quiz"><strong>{config.question || "Where did we first meet?"}</strong><div><button onClick={() => setQuizAnswer("Perfect — you remembered! ♡")}>{config.answer1 || "At our favourite café"}</button><button className={dodge && config.interaction !== "Normal answers + score" ? "dodged" : ""} onPointerEnter={() => config.interaction !== "Normal answers + score" && setDodge(value => !value)} onClick={() => setQuizAnswer("So close — try again!")}>{config.answer2 || "I forgot"}</button></div><output>{quizAnswer}</output></div>}
        {block.id === "wheel" && <div className="live-wheel-scene"><div className="live-wheel-shell"><i className="live-wheel-pointer"/><div className="live-wheel" style={{transform:`rotate(${wheelRotation}deg)`}}>{customWheelPrizes.map((prize,index)=><span key={`${prize}-${index}`} style={{transform:`rotate(${index*60+30}deg) translateY(-82px)`}}>{prize}</span>)}<b>♡</b></div></div><button onClick={spinWheel} disabled={spinning}>{spinning?"Spinning…":"Spin the wheel"}</button><output>{wheelResult}</output></div>}
        {block.id === "puzzle" && <div className="live-puzzle"><div className="live-puzzle-reference"><img src={config.imageUrl || "/mypookie-puzzle-picnic.png"} alt="Completed puzzle reference"/><small>reference</small></div><div className={`live-puzzle-grid ${solved?"solved":""}`}>{puzzle.map((tile,index)=><button key={`${tile}-${index}`} className={picked===index?"picked":""} onClick={()=>moveTile(index)} style={{backgroundImage:`url('${config.imageUrl || "/mypookie-puzzle-picnic.png"}')`,backgroundPosition:`${(tile%3)*50}% ${Math.floor(tile/3)*50}%`}} aria-label={`Puzzle piece ${index+1}`}/>)}{solved&&<div className="live-puzzle-success">Perfect! ✦<small>{config.successMessage || "Memory restored"}</small></div>}</div></div>}
        {block.id === "memory" && <div className="live-memory"><button onClick={() => setOpened(value => !value)}><img src={opened?"/mypookie-puzzle-picnic.png":config.imageUrl || "/mypookie-letter-photo.png"} alt="Shared memory"/><span>{opened?"Our favourite picnic":config.caption || "The fair lights & us"}<small>{config.date || "tap for the next memory →"}</small></span></button></div>}
        {block.id === "scratch" && <ScratchPreview revealText={config.revealText} revealDetail={config.revealDetail} />}
        {block.id === "treasure" && <div className="live-treasure"><div>{treasureClues[clue] || config.finalSurprise || "Your surprise is waiting."}</div><button onClick={()=>setClue(value=>(value+1)%Math.max(treasureClues.length,1))}>{clue===treasureClues.length-1?"Start again":"Unlock next clue"} →</button></div>}
        {block.id === "calendar" && <div className="live-calendar">{Array.from({length:Math.min(Number(config.days) || 7, 14)},(_,index)=><button key={index} className={calendar.includes(index)?"opened":""} onClick={()=>setCalendar(current=>current.includes(index)?current:[...current,index])}><span>{index+1}</span><b>{["♡","✦","🌸","💌","🎟️","🍫","🎁"][index%7]}</b></button>)}</div>}
        {block.id === "gift" && <button className={`live-gift-card ${opened?"opened":""}`} onClick={()=>setOpened(value=>!value)}><small>{config.brand || "MYPOOKIE. GIFT"}</small><strong>{opened?config.code || "POOKIE-LOVE-24":"•••• •••• ••••"}</strong><span>{opened?config.giftMessage || "Code revealed — tap to hide":"Tap to reveal the gift code"}</span></button>}
      </div>
      <div className="live-device-hint">This is what {name || "your recipient"} will interact with</div>
    </div>
  );
}

function VoicePreview({ audioUrl }: { audioUrl?: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  function toggle() {
    if (audioUrl && audioRef.current) {
      if (playing) audioRef.current.pause();
      else void audioRef.current.play();
    }
    setPlaying(value => !value);
  }
  return <div className={`live-voice ${playing?"playing":""}`}><button onClick={toggle}>{playing?"Ⅱ":"▶"}</button><div>{Array.from({length:22},(_,index)=><i key={index} style={{height:`${10+(index*7)%28}px`,animationDelay:`${index*.04}s`}}/>)}</div><span>{audioUrl ? playing?"Playing":"Ready" : "Record on the right"}</span>{audioUrl&&<audio ref={audioRef} src={audioUrl} onEnded={()=>setPlaying(false)}/>}</div>;
}

function ScratchPreview({ revealText, revealDetail }: { revealText?: string; revealDetail?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratching = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    const gradient = context.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#9b8cff");
    gradient.addColorStop(.5, "#c9bfff");
    gradient.addColorStop(1, "#ff6f91");
    context.fillStyle = gradient;
    context.fillRect(0, 0, rect.width, rect.height);
    context.fillStyle = "white";
    context.font = "800 12px Nunito";
    context.textAlign = "center";
    context.fillText("SCRATCH HERE", rect.width / 2, rect.height / 2 + 4);
  }, []);

  function scratch(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!scratching.current && event.type === "pointermove") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    if (!context) return;
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(event.clientX - rect.left, event.clientY - rect.top, 24, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  return <div className="live-scratch"><div><small>YOU UNLOCKED</small><strong>{revealText || "A candlelit dinner ♡"}</strong><span>{revealDetail || "Friday · 8:00 PM"}</span></div><canvas ref={canvasRef} onPointerDown={event=>{scratching.current=true;event.currentTarget.setPointerCapture(event.pointerId);scratch(event)}} onPointerMove={scratch} onPointerUp={()=>scratching.current=false} onPointerCancel={()=>scratching.current=false}/></div>;
}
