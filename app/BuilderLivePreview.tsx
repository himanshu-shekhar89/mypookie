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

export function BuilderLivePreview({ block, name, theme, ambience, onInteract }: { block: PreviewBlock; name: string; theme: string; ambience: string; onInteract?: () => void }) {
  const [opened, setOpened] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState("Tap spin to test it");
  const [spinning, setSpinning] = useState(false);
  const [wheelSpinCount, setWheelSpinCount] = useState(0);
  const [puzzle, setPuzzle] = useState([1, 0, 2, 3, 4, 5, 6, 7, 8]);
  const [picked, setPicked] = useState<number | null>(null);
  const [calendar, setCalendar] = useState<number[]>([]);
  const config = block.config || {};
  const customWheelPrizes = (config.prizes || wheelPrizes.slice(0,5).join("\n")).split("\n").map(item => item.trim()).filter(Boolean).slice(0, 5);
  const wheelOptions = customWheelPrizes.length >= 2 ? customWheelPrizes : wheelPrizes.slice(0,5);
  const wheelSlice = 360 / wheelOptions.length;
  const wheelColors = ["#ff6f91","#ffb86b","#9b8cff","#5fc9ae","#e8496d"];
  const wheelGradient = `conic-gradient(${wheelOptions.map((_,index)=>`${wheelColors[index]} ${index*wheelSlice}deg ${(index+1)*wheelSlice}deg`).join(",")})`;

  function spinWheel() {
    const maxSpins = Math.min(Number(config.spins) || 1, 6);
    if (spinning || wheelSpinCount >= maxSpins) return;
    const planned = (config.plannedResults || "").split("\n").map(item=>item.trim());
    const plannedIndex = config.resultMode === "Plan every spin" ? wheelOptions.findIndex(item=>item.toLowerCase()===String(planned[wheelSpinCount]||"").toLowerCase()) : -1;
    const randomValue = window.crypto.getRandomValues(new Uint32Array(1))[0];
    const winner = plannedIndex >= 0 ? plannedIndex : randomValue % wheelOptions.length;
    setSpinning(true);
    setWheelResult("Spinning…");
    setWheelRotation(value => {
      const current = ((value % 360) + 360) % 360;
      const target = (360 - (winner * wheelSlice + wheelSlice / 2)) % 360;
      return value + 1440 + ((target - current + 360) % 360);
    });
    window.setTimeout(() => {
      setWheelResult(`You won: ${wheelOptions[winner]} ♡`);
      setWheelSpinCount(value=>value+1);
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
      <div className="live-interaction" onClickCapture={onInteract} onPointerDownCapture={onInteract}>
        {block.id === "letter" && <button className={`live-letter ${opened ? "opened" : ""}`} onClick={() => setOpened(value => !value)}><span>{block.message.slice(0, 100)}<small>{config.signoff || "— sent with love"}</small></span><i/><b>♥</b></button>}
        {block.id === "voice" && <VoicePreview audioUrl={config.audioUrl} />}
        {block.id === "flowers" && <EGiftPreview config={config} />}
        {block.id === "quiz" && <QuizPlay config={config} />}
        {block.id === "wheel" && <div className="live-wheel-scene"><div className="live-wheel-shell"><i className="live-wheel-pointer"/><div className="live-wheel" style={{transform:`rotate(${wheelRotation}deg)`,background:wheelGradient}}>{wheelOptions.map((prize,index)=><span key={`${prize}-${index}`} style={{transform:`rotate(${index*wheelSlice+wheelSlice/2}deg) translateY(-82px)`}}>{prize}</span>)}<b>♡</b></div></div><button onClick={spinWheel} disabled={spinning||wheelSpinCount>=(Number(config.spins)||1)}>{spinning?"Spinning…":wheelSpinCount>=(Number(config.spins)||1)?"No spins left":"Spin the wheel"}</button><output>{wheelResult} · {Math.max((Number(config.spins)||1)-wheelSpinCount,0)} left</output></div>}
        {block.id === "puzzle" && <div className="live-puzzle"><div className="live-puzzle-reference"><img src={config.imageUrl || "/mypookie-puzzle-picnic.png"} alt="Completed puzzle reference"/><small>reference</small></div><div className={`live-puzzle-grid ${solved?"solved":""}`}>{puzzle.map((tile,index)=><button key={`${tile}-${index}`} className={picked===index?"picked":""} onClick={()=>moveTile(index)} style={{backgroundImage:`url('${config.imageUrl || "/mypookie-puzzle-picnic.png"}')`,backgroundPosition:`${(tile%3)*50}% ${Math.floor(tile/3)*50}%`}} aria-label={`Puzzle piece ${index+1}`}/>)}{solved&&<div className="live-puzzle-success">Perfect! ✦<small>{config.successMessage || "Memory restored"}</small></div>}</div></div>}
        {block.id === "memory" && <MemoryBook config={config} />}
        {block.id === "scratch" && <ScratchPreview revealText={config.revealText} revealDetail={config.revealDetail} />}
        {block.id === "treasure" && <TreasurePlay config={config} />}
        {block.id === "calendar" && <div className="live-calendar">{Array.from({length:Math.min(Number(config.days) || 7, 14)},(_,index)=><button key={index} className={calendar.includes(index)?"opened":""} onClick={()=>setCalendar(current=>current.includes(index)?current:[...current,index])}><span>{index+1}</span><b>{["♡","✦","🌸","💌","🎟️","🍫","🎁"][index%7]}</b></button>)}</div>}
        {block.id === "gift" && <GiftCardPlay config={config} />}
      </div>
      <div className="live-device-hint">This is what {name || "your recipient"} will interact with</div>
    </div>
  );
}

type QuizQuestion = { id:string; question:string; options:{text:string;image:string}[]; correctIndex:number; interaction:"floating"|"normal" };
type MemoryItem = { id:string; image:string; caption:string };
type TreasureClue = { clue:string; hint:string; answer:string };

function parseJson<T>(value:string|undefined,fallback:T):T{try{return value?JSON.parse(value) as T:fallback}catch{return fallback}}

function EGiftPreview({config}:{config:Record<string,string>}){
  const [playing,setPlaying]=useState(false);
  const symbols:Record<string,string[]>={
    "Flower shower":["🌸","🌷","🌼","🌺","🌹"],
    "Fireworks":["✨","🎆","🎇","✨","⭐"],
    "Birthday party":["🎈","🎂","🎉","🎁","🥳"],
    "Christmas magic":["🎄","❄️","🎁","⭐","🔔"],
    "Hearts":["💗","💕","💖","💘","♡"],
    "Snowfall":["❄️","✦","❅","❄️","✧"],
  };
  const items=symbols[config.effect]||symbols["Flower shower"];
  return <button className={`egift-stage ${playing?"playing":""} intensity-${(config.intensity||"Lush").toLowerCase()}`} onClick={()=>setPlaying(value=>!value)}><div className="egift-burst">{Array.from({length:22},(_,index)=><i key={index} style={{"--x":`${(index*37)%100}%`,"--delay":`${(index%7)*-.35}s`,"--drift":`${(index%2?1:-1)*(18+index%5*7)}px`} as React.CSSProperties}>{items[index%items.length]}</i>)}</div><span>{items[1]}</span><strong>{config.effect||"Flower shower"}</strong><p>{config.effectNote||"A beautiful celebration, just for you."}</p><small>{playing?"Tap to pause":"Tap to fill the screen"}</small></button>;
}

function QuizPlay({config}:{config:Record<string,string>}){
  const fallback:QuizQuestion[]=[{id:"q1",question:"Where did we first meet?",options:[{text:"At our favourite café",image:""},{text:"At a party",image:""},{text:"Online",image:""},{text:"I forgot",image:""}],correctIndex:0,interaction:"floating"}];
  const questions=parseJson<QuizQuestion[]>(config.quizQuestions,fallback);
  const [index,setIndex]=useState(0);
  const [score,setScore]=useState(0);
  const [feedback,setFeedback]=useState("");
  const [positions,setPositions]=useState([{x:2,y:5},{x:52,y:5},{x:2,y:55},{x:52,y:55}]);
  if(index>=questions.length)return <div className="quiz-finished"><b>{score}/{questions.length}</b><strong>You know this story beautifully ♡</strong><button onClick={()=>{setIndex(0);setScore(0)}}>Play again</button></div>;
  const question=questions[index];
  if(!question)return <div className="quiz-finished">Add a question on the right.</div>;
  function moveWrongAnswers(event:React.PointerEvent<HTMLDivElement>){
    if(question.interaction!=="floating")return;
    const rect=event.currentTarget.getBoundingClientRect();
    const px=event.clientX-rect.left,py=event.clientY-rect.top;
    setPositions(current=>current.map((position,optionIndex)=>{
      if(optionIndex===question.correctIndex)return position;
      const cx=rect.width*(position.x/100)+70,cy=rect.height*(position.y/100)+28;
      if(Math.hypot(px-cx,py-cy)>125)return position;
      const nx=px<rect.width/2?58:2;
      const ny=py<rect.height/2?62:4;
      return{x:Math.max(2,Math.min(65,nx+((optionIndex*13)%17))),y:Math.max(3,Math.min(70,ny+((optionIndex*9)%13)))};
    }));
  }
  function answer(optionIndex:number){
    if(question.interaction==="floating"&&optionIndex!==question.correctIndex)return;
    const correct=optionIndex===question.correctIndex;
    setFeedback(correct?"Perfect — you got it! ♡":"Not quite, but that was cute.");
    if(correct)setScore(value=>value+1);
    window.setTimeout(()=>{if(index<questions.length-1){setIndex(value=>value+1);setFeedback("");setPositions([{x:2,y:5},{x:52,y:5},{x:2,y:55},{x:52,y:55}])}else setIndex(questions.length)},700);
  }
  return <div className="advanced-quiz"><div className="quiz-dots">{questions.map((_,dot)=><i key={dot} className={dot<index?"done":dot===index?"current":""}/>)}</div><strong>{question.question}</strong><div className="runaway-stage" onPointerMove={moveWrongAnswers}>{question.options.slice(0,4).map((option,optionIndex)=><button key={optionIndex} className={optionIndex===question.correctIndex?"desired":""} style={{left:`${positions[optionIndex]?.x||2}%`,top:`${positions[optionIndex]?.y||5}%`}} onClick={()=>answer(optionIndex)}>{option.image&&<img src={option.image} alt=""/>}<span>{option.text||`Option ${optionIndex+1}`}</span></button>)}</div><output>{feedback||`${index+1} of ${questions.length} · ${question.interaction==="floating"?"wrong answers run away":"normal scoring"}`}</output></div>;
}

function MemoryBook({config}:{config:Record<string,string>}){
  const items=parseJson<MemoryItem[]>(config.memoryItems,[]);
  const pages=[{id:"cover",image:"/mypookie-letter-photo.png",caption:"Our little book of us"},...items];
  const [page,setPage]=useState(0);
  const [turning,setTurning]=useState(false);
  function turn(direction:number){if(turning)return;setTurning(true);window.setTimeout(()=>{setPage(value=>(value+direction+pages.length)%pages.length);setTurning(false)},360)}
  const current=pages[page];
  return <div className="memory-book"><div className={`memory-page ${turning?"turning":""}`}><div className="book-spine"/><img src={current.image} alt={page===0?"Memory book cover":"Uploaded memory"}/><div><small>{page===0?"MEMORY LANE":`PAGE ${page} OF ${items.length}`}</small><strong>{current.caption}</strong></div></div><div className="book-controls"><button onClick={()=>turn(-1)}>←</button><span>{page+1}/{pages.length} · turn the page</span><button onClick={()=>turn(1)}>→</button></div></div>;
}

function TreasurePlay({config}:{config:Record<string,string>}){
  const clues=parseJson<TreasureClue[]>(config.treasureClues,[{clue:"Start where we first said hello.",hint:"Think of our favourite café.",answer:"cafe"}]);
  const [index,setIndex]=useState(0);const [answer,setAnswer]=useState("");const [message,setMessage]=useState("");const [showHint,setShowHint]=useState(false);
  const current=clues[index];
  if(index>=clues.length)return <div className="treasure-winner"><span>🏆</span><strong>You found it!</strong><p>{config.finalSurprise||"A mystery date for us"}</p><button onClick={()=>{setIndex(0);setAnswer("");setMessage("")}}>Play again</button></div>;
  function check(){const normalize=(value:string)=>value.trim().toLowerCase().replace(/[^a-z0-9]/g,"");if(normalize(answer)===normalize(current.answer)){setMessage("Correct! Next clue unlocked ✦");window.setTimeout(()=>{setIndex(value=>value+1);setAnswer("");setMessage("");setShowHint(false)},650)}else setMessage("Not yet — look again or use the hint.")}
  return <div className="advanced-treasure"><div className="treasure-progress">{clues.map((_,dot)=><i key={dot} className={dot<index?"done":dot===index?"current":""}/>)}</div><small>CLUE {index+1}</small><strong>{current.clue}</strong>{showHint&&<p>Hint: {current.hint||"No hint for this one — you’ve got this!"}</p>}<input value={answer} onChange={event=>setAnswer(event.target.value)} onKeyDown={event=>event.key==="Enter"&&check()} placeholder="Type your answer"/><div><button onClick={()=>setShowHint(true)}>Show hint</button><button onClick={check}>Check answer →</button></div><output>{message}</output></div>;
}

function GiftCardPlay({config}:{config:Record<string,string>}){
  const [revealed,setRevealed]=useState(false);
  if(config.interaction==="Scratchable card")return <GiftScratchCard config={config}/>;
  const isFlip=config.interaction!=="Blur to unblur";
  return <button className={`advanced-gift-card ${revealed?"revealed":""} ${isFlip?"flip-mode":"blur-mode"}`} onClick={()=>setRevealed(value=>!value)}><div className="gift-face gift-front"><small>MYPOOKIE. PRESENTS</small><strong>{config.brand||"A gift for you"}</strong><span>{isFlip?"Tap to flip":"Tap to bring it into focus"}</span></div><div className="gift-face gift-back"><small>{config.showValue!=="false"?config.value:"A LITTLE SOMETHING"}</small>{config.showCode!=="false"&&<strong>{config.code||"POOKIE-LOVE-24"}</strong>}{config.showNote!=="false"&&<span>{config.giftMessage}</span>}</div></button>;
}

function GiftScratchCard({config}:{config:Record<string,string>}){
  const canvasRef=useRef<HTMLCanvasElement>(null);const down=useRef(false);
  useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const rect=canvas.getBoundingClientRect();const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=rect.width*ratio;canvas.height=rect.height*ratio;const ctx=canvas.getContext("2d");if(!ctx)return;ctx.scale(ratio,ratio);const gradient=ctx.createLinearGradient(0,0,rect.width,rect.height);gradient.addColorStop(0,"#9b8cff");gradient.addColorStop(1,"#ff6f91");ctx.fillStyle=gradient;ctx.fillRect(0,0,rect.width,rect.height);ctx.fillStyle="#fff";ctx.font="800 11px Nunito";ctx.textAlign="center";ctx.fillText("SCRATCH TO OPEN YOUR GIFT",rect.width/2,rect.height/2)},[]);
  function scratch(event:React.PointerEvent<HTMLCanvasElement>){if(!down.current&&event.type==="pointermove")return;const canvas=canvasRef.current;if(!canvas)return;const rect=canvas.getBoundingClientRect();const ctx=canvas.getContext("2d");if(!ctx)return;ctx.save();ctx.globalCompositeOperation="destination-out";ctx.beginPath();ctx.arc(event.clientX-rect.left,event.clientY-rect.top,25,0,Math.PI*2);ctx.fill();ctx.restore()}
  return <div className="gift-scratch-card"><div><small>{config.showValue!=="false"?config.value:"MYPOOKIE. GIFT"}</small>{config.showCode!=="false"&&<strong>{config.code}</strong>}{config.showNote!=="false"&&<span>{config.giftMessage}</span>}</div><canvas ref={canvasRef} onPointerDown={event=>{down.current=true;event.currentTarget.setPointerCapture(event.pointerId);scratch(event)}} onPointerMove={scratch} onPointerUp={()=>down.current=false}/></div>;
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
