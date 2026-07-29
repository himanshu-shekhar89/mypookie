"use client";

import { useEffect, useRef, useState } from "react";
import { playSound } from "./soundFx";
import { TinyBlockPreview } from "./TinyBlockPreview";

type PreviewBlock = {
  id: string;
  icon: string;
  name: string;
  color: string;
  message: string;
  config?: Record<string, string>;
};

const wheelPrizes = ["Movie night", "Breakfast", "A long hug", "Mystery date", "Your choice", "Sweet treat"];

export function BuilderLivePreview({ block, name, theme, ambience, giftId, onInteract, onComplete, onReward }: { block: PreviewBlock; name: string; theme: string; ambience: string; giftId?:string; onInteract?: () => void; onComplete?: () => void; onReward?: (reward:string) => void }) {
  const [opened, setOpened] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState("Tap spin to test it");
  const [spinning, setSpinning] = useState(false);
  const [wheelSpinCount, setWheelSpinCount] = useState(0);
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
    playSound("wheel");
    setWheelRotation(value => {
      const current = ((value % 360) + 360) % 360;
      const target = (360 - (winner * wheelSlice + wheelSlice / 2)) % 360;
      return value + 1440 + ((target - current + 360) % 360);
    });
    window.setTimeout(() => {
      setWheelResult(`You won: ${wheelOptions[winner]} ♡`);
      const nextCount=wheelSpinCount+1;
      setWheelSpinCount(nextCount);
      playSound("win");
      onReward?.(wheelOptions[winner]);
      if(nextCount>=maxSpins)onComplete?.();
      setSpinning(false);
    }, 2600);
  }

  return (
    <div className={`builder-live-card live-theme-${theme.toLowerCase().replaceAll(" ", "-")}`}>
      {ambience === "Petals" && <div className="live-ambience petals" aria-hidden="true"><i>✿</i><i>·</i><i>✿</i><i>·</i><i>✿</i></div>}
      {ambience === "Soft sparkles" && <div className="live-ambience sparkles" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i></div>}
      <div className="live-recipient-label">A LITTLE SOMETHING FOR {name.toUpperCase()}</div>
      <div className={`live-block-icon ${block.color}`}>{block.icon}</div>
      <h3>{block.name}</h3>
      {block.id !== "letter" && block.id !== "voice" && block.id !== "video" && <p>{block.message}</p>}
      <div className="live-interaction" onClickCapture={onInteract} onPointerDownCapture={onInteract}>
        {block.id === "letter" && <button className={`live-letter ${opened ? "opened" : ""}`} onClick={() => {if(!opened){playSound("envelope");onComplete?.()}setOpened(value => !value)}}><span>{block.message.slice(0, 100)}<small>{config.signoff || "— sent with love"}</small></span><i/><b>♥</b></button>}
        {block.id === "voice" && <VoicePreview audioUrl={config.audioUrl} onComplete={onComplete} />}
        {block.id === "video" && <VideoNotePlay config={config} onComplete={onComplete} />}
        {block.id === "flowers" && <EGiftPreview config={config} onComplete={onComplete} />}
        {block.id === "quiz" && <QuizPlay config={config} onComplete={onComplete} onReward={onReward} />}
        {block.id === "thisorthat" && <ThisOrThatPlay config={config} onComplete={onComplete} onReward={onReward} />}
        {block.id === "emoji" && <EmojiDecoderPlay config={config} onComplete={onComplete} onReward={onReward} />}
        {block.id === "heartcatch" && <HeartCatchPlay config={config} onComplete={onComplete} onReward={onReward} />}
        {["wouldrather","neverhave","truthdare","tapheart","matchpair","countdownus","constellation","growthring","movie","alwaysyou","excuse","roast","fortune","mysterybox","playlist","countdowninvite","groupboard"].includes(block.id) && <TinyBlockPreview id={block.id} config={config} giftId={giftId} recipientName={name} onComplete={onComplete} onReward={onReward} />}
        {block.id === "wheel" && <div className="live-wheel-scene"><div className="live-wheel-shell"><i className="live-wheel-pointer"/><div className="live-wheel" style={{transform:`rotate(${wheelRotation}deg)`,background:wheelGradient}}>{wheelOptions.map((prize,index)=><span key={`${prize}-${index}`} style={{transform:`rotate(${index*wheelSlice+wheelSlice/2}deg) translateY(-82px)`}}>{prize}</span>)}<b>♡</b></div></div><button onClick={spinWheel} disabled={spinning||wheelSpinCount>=(Number(config.spins)||1)}>{spinning?"Spinning…":wheelSpinCount>=(Number(config.spins)||1)?"No spins left":"Spin the wheel"}</button><output>{wheelResult} · {Math.max((Number(config.spins)||1)-wheelSpinCount,0)} left</output></div>}
        {block.id === "slots" && <SlotMachinePlay config={config} onComplete={onComplete} onReward={onReward} />}
        {block.id === "puzzle" && <PhotoPuzzlePlay key={`${config.difficulty}-${config.imageUrl}`} config={config} onComplete={onComplete} onReward={onReward} />}
        {block.id === "memory" && <MemoryBook config={config} onComplete={onComplete} />}
        {block.id === "scratch" && <ScratchPreview revealText={config.revealText} revealDetail={config.revealDetail} coating={config.coating} onComplete={onComplete} onReward={onReward} />}
        {block.id === "treasure" && <TreasurePlay config={config} onComplete={onComplete} onReward={onReward} />}
        {block.id === "calendar" && <CalendarPlay config={config} onComplete={onComplete} onReward={onReward} />}
        {block.id === "gift" && <GiftCardPlay config={config} onComplete={onComplete} onReward={onReward} />}
      </div>
      <div className="live-device-hint">This is what {name || "your recipient"} will interact with</div>
    </div>
  );
}

type QuizQuestion = { id:string; question:string; options:{text:string;image:string}[]; correctIndex:number; interaction:"floating"|"normal" };
type MemoryItem = { id:string; image:string; caption:string };
type TreasureClue = { clue:string; hint:string; answer:string; photo?:string; caption?:string };
type ThisOrThatRound = { prompt:string; left:string; right:string };

function parseJson<T>(value:string|undefined,fallback:T):T{try{return value?JSON.parse(value) as T:fallback}catch{return fallback}}

function EGiftPreview({config,onComplete}:{config:Record<string,string>;onComplete?:()=>void}){
  const [playing,setPlaying]=useState(false);
  const symbols:Record<string,string[]>={
    "Rose garden":["❀","✦","·","❁","♡"],
    "Golden fireworks":["✦","✧","⋆","•","✦"],
    "Birthday glow":["○","✦","⌁","•","✧"],
    "Winter lights":["❅","✦","·","❆","✧"],
    "Floating hearts":["♡","♥","·","♡","✦"],
    "Starlight":["✦","✧","⋆","·","✦"],
  };
  const scene=config.effect||"Rose garden";
  const items=symbols[scene]||symbols["Rose garden"];
  return <button className={`egift-stage celebration-scene scene-${scene.toLowerCase().replaceAll(" ","-")} ${playing?"playing":""} intensity-${(config.intensity||"Lush").toLowerCase()}`} onClick={()=>{if(!playing){playSound("celebration");onComplete?.()}setPlaying(value=>!value)}}><div className="egift-burst">{Array.from({length:24},(_,index)=><i key={index} style={{"--x":`${(index*37)%100}%`,"--delay":`${(index%7)*-.35}s`,"--drift":`${(index%2?1:-1)*(18+index%5*7)}px`} as React.CSSProperties}>{items[index%items.length]}</i>)}</div><div className="celebration-halo"><i/><i/><i/><span>✦</span></div><strong>{scene}</strong><p>{config.effectNote||"A beautiful celebration, just for you."}</p><small>{playing?"Tap to pause":"Tap to light up the moment"}</small></button>;
}

function VideoNotePlay({config,onComplete}:{config:Record<string,string>;onComplete?:()=>void}){
  const [started,setStarted]=useState(false);
  const effect=(config.videoEffect||"Retro cam").toLowerCase().replaceAll(" ","-").replace("&","and");
  return <div className={`video-note-player video-effect-${effect}`}>{config.videoUrl?<><div className="video-screen"><video src={config.videoUrl} controls playsInline onPlay={()=>{if(!started){setStarted(true);playSound("reveal")}}} onEnded={onComplete}/>{config.videoEffect==="Retro cam"&&<><span className="retro-rec">● REC</span><span className="retro-date">MYPOOKIE · 1998</span><i className="retro-scan"/></>}</div><strong>{config.videoCaption||"A little face-to-face moment, just for you."}</strong><small>Watch to the end to continue</small></>:<div className="video-note-empty"><span>▶</span><strong>Your video note will appear here</strong><small>Record or upload it in the customizer.</small></div>}</div>;
}

function ThisOrThatPlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const rounds=parseJson<ThisOrThatRound[]>(config.thisOrThatRounds,[{prompt:"Our perfect evening",left:"Movie night",right:"Long drive"}]);
  const [index,setIndex]=useState(0);
  const [choices,setChoices]=useState<string[]>([]);
  if(index>=rounds.length)return <div className="this-or-that-finish"><span>♡</span><strong>Your little favourites</strong>{choices.map((choice,choiceIndex)=><small key={choiceIndex}>{rounds[choiceIndex]?.prompt}: <b>{choice}</b></small>)}</div>;
  const round=rounds[index];
  function choose(value:string){playSound("tile");const next=[...choices,value];setChoices(next);if(index===rounds.length-1){playSound("win");onReward?.(`This or that: ${value}`);onComplete?.()}setIndex(current=>current+1)}
  return <div className="this-or-that-play"><div className="quiz-dots">{rounds.map((_,dot)=><i key={dot} className={dot<index?"done":dot===index?"current":""}/>)}</div><small>QUICK CHOICE {index+1}</small><strong>{round.prompt}</strong><div><button onClick={()=>choose(round.left)}>{round.left}</button><span>OR</span><button onClick={()=>choose(round.right)}>{round.right}</button></div></div>;
}

function EmojiDecoderPlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const [answer,setAnswer]=useState("");const [hint,setHint]=useState(false);const [message,setMessage]=useState("");
  function check(){const normalize=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,"");if(normalize(answer)===normalize(config.emojiAnswer||"our rainy cafe date")){setMessage("Decoded perfectly! ♡");playSound("win");onReward?.("Decoded the secret memory");onComplete?.()}else{setMessage("Not quite—try the hint.");playSound("incorrect")}}
  return <div className="emoji-decoder-play"><small>DECODE THE MEMORY</small><strong>{config.emojiClue||"☕ + 🌧 + ♡"}</strong>{hint&&<p>{config.emojiHint||"Think about where we hid from the rain."}</p>}<input value={answer} onChange={event=>setAnswer(event.target.value)} onKeyDown={event=>event.key==="Enter"&&check()} placeholder="Type your guess"/><div><button onClick={()=>setHint(true)}>Hint</button><button onClick={check}>Decode →</button></div><output>{message}</output></div>;
}

function HeartCatchPlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const target=Math.min(Math.max(Number(config.target)||6,3),10);const [caught,setCaught]=useState(0);
  const left=8+(caught*37)%78;const top=12+(caught*53)%64;
  function catchHeart(){const next=caught+1;setCaught(next);playSound("tile");if(next>=target){playSound("win");onReward?.(config.prize||"A pocketful of kisses");onComplete?.()}}
  return <div className={`heart-catch-play ${caught>=target?"finished":""}`}><header><span>{caught}/{target}</span><strong>{caught>=target?"Prize unlocked!":"Catch every heart"}</strong></header>{caught<target?<div className="heart-catch-stage"><button style={{left:`${left}%`,top:`${top}%`}} onClick={catchHeart} aria-label="Catch this heart">♥</button><i/><i/><i/></div>:<div className="heart-catch-prize"><span>♡</span><strong>{config.prize||"A pocketful of kisses"}</strong></div>}</div>;
}

function QuizPlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const fallback:QuizQuestion[]=[{id:"q1",question:"Where did we first meet?",options:[{text:"At our favourite café",image:""},{text:"At a party",image:""},{text:"Online",image:""},{text:"I forgot",image:""}],correctIndex:0,interaction:"floating"}];
  const questions=parseJson<QuizQuestion[]>(config.quizQuestions,fallback);
  const [index,setIndex]=useState(0);
  const [score,setScore]=useState(0);
  const [feedback,setFeedback]=useState("");
  const [order,setOrder]=useState(()=>questions[0]?.options.map((_,optionIndex)=>optionIndex) || []);
  const [offsets,setOffsets]=useState<Record<number,{x:number;y:number}>>({});
  const dodged=useRef<Set<number>>(new Set());
  if(index>=questions.length)return <div className="quiz-finished"><b>{score}/{questions.length}</b><strong>You know this story beautifully ♡</strong><button onClick={()=>{setIndex(0);setScore(0);setFeedback("");setOrder(questions[0]?.options.map((_,optionIndex)=>optionIndex)||[])}}>Play again</button></div>;
  const question=questions[index];
  if(!question)return <div className="quiz-finished">Add a question on the right.</div>;
  function floatFromCursor(event:React.PointerEvent<HTMLDivElement>){
    if(question.interaction!=="floating")return;
    const pointer={x:event.clientX,y:event.clientY};
    const next:Record<number,{x:number;y:number}>={};
    event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-option]").forEach(button=>{
      const optionIndex=Number(button.dataset.option);
      if(optionIndex===question.correctIndex){next[optionIndex]={x:0,y:0};return}
      const rect=button.getBoundingClientRect();
      const dx=rect.left+rect.width/2-pointer.x;
      const dy=rect.top+rect.height/2-pointer.y;
      const distance=Math.max(Math.hypot(dx,dy),1);
      if(distance<125){
        if(!dodged.current.has(optionIndex)){dodged.current.add(optionIndex);playSound("incorrect")}
        const drift=Math.min(11,3+(125-distance)*.1);
        next[optionIndex]={x:dx/distance*drift,y:dy/distance*drift};
      }else{next[optionIndex]={x:0,y:0};dodged.current.delete(optionIndex)}
    });
    setOffsets(next);
  }
  function answer(optionIndex:number){
    if(question.interaction==="floating"&&optionIndex!==question.correctIndex){
      playSound("incorrect");
      setFeedback("That answer is playing hard to catch ✦");
      return;
    }
    const correct=optionIndex===question.correctIndex;
    playSound(correct?"correct":"incorrect");
    setFeedback(correct?"Perfect — you got it! ♡":"Not quite, but that was cute.");
    if(correct)setScore(value=>value+1);
    const finalScore=score+(correct?1:0);
    window.setTimeout(()=>{if(index<questions.length-1){const nextIndex=index+1;setIndex(nextIndex);setFeedback("");setOffsets({});dodged.current.clear();setOrder(questions[nextIndex].options.map((_,optionPosition)=>optionPosition))}else{setIndex(questions.length);playSound("win");onReward?.(`Quiz score: ${finalScore}/${questions.length}`);onComplete?.()}},700);
  }
  const visibleOrder=[...order.filter(optionIndex=>optionIndex<question.options.length),...question.options.map((_,optionIndex)=>optionIndex).filter(optionIndex=>!order.includes(optionIndex))];
  return <div className="advanced-quiz"><div className="quiz-dots">{questions.map((_,dot)=><i key={dot} className={dot<index?"done":dot===index?"current":""}/>)}</div><strong>{question.question}</strong><div className="runaway-stage" onPointerMove={floatFromCursor} onPointerLeave={()=>{setOffsets({});dodged.current.clear()}}>{visibleOrder.map(optionIndex=>{const option=question.options[optionIndex];const offset=offsets[optionIndex]||{x:0,y:0};return <button data-option={optionIndex} key={optionIndex} className={optionIndex===question.correctIndex?"desired":""} style={{transform:`translate(${offset.x}px,${offset.y}px)`}} onClick={()=>answer(optionIndex)}>{option.image&&<img src={option.image} alt=""/>}<span>{option.text||`Option ${optionIndex+1}`}</span></button>})}</div><output>{feedback||`${index+1} of ${questions.length} · ${question.interaction==="floating"?"wrong answers float away from the cursor":"normal scoring"}`}</output></div>;
}

function SlotMachinePlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const prizes=(config.prizes||"Movie night\nBreakfast date\nA long hug\nSweet treat").split("\n").map(item=>item.trim()).filter(Boolean).slice(0,5);
  const options=prizes.length?prizes:["A lovely surprise"];
  const symbols=["♡","✦","🍓","🎁","🌙"];
  const [reels,setReels]=useState([0,1,2]);
  const [rolling,setRolling]=useState(false);
  const [pulls,setPulls]=useState(0);
  const [result,setResult]=useState("Pull the lever");
  const maxPulls=Math.min(Number(config.pulls)||1,6);
  function pull(){
    if(rolling||pulls>=maxPulls)return;
    const planned=(config.plannedResults||"").split("\n");
    const plannedIndex=config.resultMode==="Plan every pull"?options.indexOf(planned[pulls]||""):-1;
    const random=globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
    const winner=plannedIndex>=0?plannedIndex:random%options.length;
    playSound("lever");setRolling(true);setResult("The reels are spinning…");
    const timer=window.setInterval(()=>setReels(Array.from({length:3},()=>globalThis.crypto.getRandomValues(new Uint32Array(1))[0]%options.length)),110);
    window.setTimeout(()=>{window.clearInterval(timer);const nextPulls=pulls+1;setReels([winner,winner,winner]);setPulls(nextPulls);setResult(`Jackpot: ${options[winner]} ♡`);playSound("win");onReward?.(options[winner]);if(nextPulls>=maxPulls)onComplete?.();setRolling(false)},1350);
  }
  return <div className="live-slot-machine"><div className="slot-machine-rig"><div className={`slot-machine-reels ${rolling?"rolling":""}`}>{reels.map((reel,index)=><i key={index}>{symbols[reel%symbols.length]}</i>)}</div><button className={`slot-machine-lever ${rolling?"pulled":""}`} onClick={pull} disabled={rolling||pulls>=maxPulls} aria-label="Pull slot-machine lever"><b/><span/></button></div><output>{pulls>=maxPulls&&!rolling?`${result} · no pulls left`:`${result} · ${maxPulls-pulls} left`}</output></div>;
}

function shuffleTiles(size:number){
  const values=Array.from({length:size*size},(_,index)=>index);
  const random=new Uint32Array(values.length);
  globalThis.crypto.getRandomValues(random);
  for(let index=values.length-1;index>0;index--){
    const swapIndex=random[index]%(index+1);
    [values[index],values[swapIndex]]=[values[swapIndex],values[index]];
  }
  if(values.every((tile,index)=>tile===index))[values[0],values[1]]=[values[1],values[0]];
  return values;
}

function PhotoPuzzlePlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const size=Math.min(Math.max(Number(config.difficulty?.match(/\d+/)?.[0])||3,3),5);
  const image=config.imageUrl||"/mypookie-puzzle-picnic.png";
  const [tiles,setTiles]=useState<number[]>(()=>shuffleTiles(size));
  const [picked,setPicked]=useState<number|null>(null);
  const [phase,setPhase]=useState<"playing"|"perfect"|"photo">("playing");

  const solved=tiles.length===size*size&&tiles.every((tile,index)=>tile===index);

  function moveTile(index:number){
    if(phase!=="playing")return;
    if(picked===null){setPicked(index);return}
    const distance=Math.abs(Math.floor(picked/size)-Math.floor(index/size))+Math.abs((picked%size)-(index%size));
    if(distance===1){
      const next=[...tiles];
      [next[picked],next[index]]=[next[index],next[picked]];
      setTiles(next);
      playSound("tile");
      if(next.every((tile,tileIndex)=>tile===tileIndex)){
        setPhase("perfect");
        playSound("win");
        onReward?.("Completed the photo puzzle");
        onComplete?.();
        window.setTimeout(()=>setPhase("photo"),900);
      }
    }
    setPicked(null);
  }

  function reshuffle(){setTiles(shuffleTiles(size));setPicked(null);setPhase("playing")}

  if(phase==="photo")return <div className="puzzle-complete-photo"><img src={image} alt="Completed puzzle"/><strong>Perfect! ✦</strong><span>{config.successMessage||"You put this memory back together."}</span><button onClick={reshuffle}>Play again</button></div>;

  return <div className="live-puzzle"><div className="live-puzzle-reference"><img src={image} alt="Completed puzzle reference"/><small>reference · {size}×{size}</small></div><div><div className={`live-puzzle-grid ${solved?"solved":""}`} style={{gridTemplateColumns:`repeat(${size},1fr)`}}>{tiles.map((tile,index)=><button key={`${tile}-${index}`} className={picked===index?"picked":""} onClick={()=>moveTile(index)} style={{backgroundImage:`url("${image}")`,backgroundSize:`${size*100}% ${size*100}%`,backgroundPosition:`${(tile%size)*100/(size-1)}% ${Math.floor(tile/size)*100/(size-1)}%`}} aria-label={`Puzzle piece ${index+1}`}/>)}{phase==="perfect"&&<div className="live-puzzle-success">Perfect! ✦<small>{config.successMessage||"Memory restored"}</small></div>}</div><button className="puzzle-shuffle" onClick={reshuffle}>↻ Shuffle again</button></div></div>;
}

function MemoryBook({config,onComplete}:{config:Record<string,string>;onComplete?:()=>void}){
  const items=parseJson<MemoryItem[]>(config.memoryItems,[]);
  const pages=[{id:"cover",image:config.coverImage||"/mypookie-letter-photo.png",caption:config.coverCaption||"Our little book of us"},...items];
  const [page,setPage]=useState(0);
  const [turning,setTurning]=useState(false);
  const viewed=useRef<Set<number>>(new Set([0]));
  function turn(direction:number){if(turning)return;playSound("page");setTurning(true);window.setTimeout(()=>{const nextPage=(page+direction+pages.length)%pages.length;setPage(nextPage);viewed.current.add(nextPage);if(viewed.current.size>=pages.length)onComplete?.();setTurning(false)},360)}
  const current=pages[page];
  return <div className="memory-book"><div className={`memory-page ${turning?"turning":""}`}><div className="spiral-binding" aria-hidden="true">{Array.from({length:10},(_,index)=><i key={index}/>)}</div><div className="book-spine"/><img src={current.image} alt={page===0?"Memory book cover":"Uploaded memory"}/><div><small>{page===0?"MEMORY LANE":`PAGE ${page} OF ${items.length}`}</small><strong>{current.caption}</strong></div></div><div className="book-controls"><button onClick={()=>turn(-1)}>←</button><span>{page+1}/{pages.length} · turn the page</span><button onClick={()=>turn(1)}>→</button></div></div>;
}

function TreasurePlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const clues=parseJson<TreasureClue[]>(config.treasureClues,[{clue:"Start where we first said hello.",hint:"Think of our favourite café.",answer:"cafe",photo:"",caption:""}]);
  const [index,setIndex]=useState(0);const [answer,setAnswer]=useState("");const [message,setMessage]=useState("");const [showHint,setShowHint]=useState(false);const [stage,setStage]=useState<"clue"|"answer">("clue");
  const current=clues[index];
  if(index>=clues.length)return <div className="treasure-winner"><span>🏆</span><strong>You found it!</strong><p>{config.finalSurprise||"A mystery date for us"}</p><button onClick={()=>{setIndex(0);setAnswer("");setMessage("");setStage("clue")}}>Play again</button></div>;
  function check(){const normalize=(value:string)=>value.trim().toLowerCase().replace(/[^a-z0-9]/g,"");if(normalize(answer)===normalize(current.answer)){playSound("correct");setMessage("Correct! Next clue unlocked ✦");if(index===clues.length-1){playSound("win");onReward?.(config.finalSurprise||"Treasure hunt completed");onComplete?.()}window.setTimeout(()=>{setIndex(value=>value+1);setAnswer("");setMessage("");setShowHint(false);setStage("clue")},650)}else{playSound("incorrect");setMessage("Not yet — look again or use the hint.")}}
  return <div className="advanced-treasure"><div className="treasure-progress">{clues.map((_,dot)=><i key={dot} className={dot<index?"done":dot===index?"current":""}/>)}</div><small>CLUE {index+1}</small>{stage==="clue"?<div className="treasure-clue-stage">{current.photo&&<figure><img src={current.photo} alt="A visual clue"/>{current.caption&&<figcaption>{current.caption}</figcaption>}</figure>}<strong>{current.clue}</strong><button onClick={()=>setStage("answer")}>Next · answer this clue →</button></div>:<div className="treasure-answer-stage"><strong>{current.clue}</strong>{showHint&&<p>Hint: {current.hint||"No hint for this one — you’ve got this!"}</p>}<input autoFocus value={answer} onChange={event=>setAnswer(event.target.value)} onKeyDown={event=>event.key==="Enter"&&check()} placeholder="Type your answer"/><div><button onClick={()=>setStage("clue")}>← Back to clue</button><button onClick={()=>setShowHint(true)}>Show hint</button><button onClick={check}>Check →</button></div><output>{message}</output></div>}</div>;
}

function CalendarPlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const days=Math.min(Number(config.days)||7,30);
  const defaults=["A reason I adore you","A favourite memory","A tiny promise","A photo that makes me smile","Your song of the day","A little challenge","Your final surprise"];
  const stored=parseJson<string[]>(config.calendarNotes,defaults);
  const notes=Array.from({length:days},(_,index)=>stored[index]||`A little surprise for day ${index+1}`);
  const [opened,setOpened]=useState<number[]>([]);
  const [selectedDay,setSelectedDay]=useState<number|null>(null);
  const [today,setToday]=useState("");
  useEffect(()=>{const refresh=()=>setToday(new Date().toISOString().slice(0,10));refresh()},[]);
  const start=config.startDate?new Date(`${config.startDate}T00:00:00`):null;
  const current=today?new Date(`${today}T00:00:00`):null;
  const elapsed=start&&current?Math.floor((current.getTime()-start.getTime())/86400000)+1:1;
  const available=config.unlockRule==="Recipient can open anytime"?days:Math.min(Math.max(elapsed,1),days);
  function openDay(index:number){if(index>=available)return;const isNew=!opened.includes(index);setOpened(current=>current.includes(index)?current:[...current,index]);setSelectedDay(index);playSound("reveal");if(isNew){onReward?.(`Day ${index+1}: ${notes[index]}`);onComplete?.()}}
  return <div className="calendar-experience"><header><span>▣</span><div><small>{config.unlockRule==="Recipient can open anytime"?"OPEN ANYTIME":"ONE NEW DOOR EACH DAY"}</small><strong>{available} of {days} {available===1?"day is":"days are"} ready</strong></div></header><p>{config.unlockRule==="Recipient can open anytime"?"Every surprise is available now. Tap any numbered door.":"Come back each day to unlock another note, memory or surprise."}</p><div className="calendar-doors">{notes.map((_,index)=><button key={index} className={`${opened.includes(index)?"opened":""} ${index>=available?"locked":""}`} onClick={()=>openDay(index)} aria-label={index>=available?`Day ${index+1} is locked`:`Open day ${index+1}`}><span>{index>=available?"⌾":index+1}</span><b>{opened.includes(index)?"♥":"✦"}</b></button>)}</div><div className={`calendar-reveal ${selectedDay===null?"empty":""}`}>{selectedDay===null?<><small>HOW IT WORKS</small><strong>Tap an available door to reveal today’s message.</strong></>:<><small>DAY {selectedDay+1}</small><strong>{notes[selectedDay]}</strong></>}</div></div>;
}

function GiftCardPlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const [revealed,setRevealed]=useState(false);
  if(config.interaction==="Scratchable card")return <GiftScratchCard config={config} onComplete={onComplete} onReward={onReward}/>;
  const isFlip=config.interaction!=="Blur to unblur";
  return <button className={`advanced-gift-card ${revealed?"revealed":""} ${isFlip?"flip-mode":"blur-mode"}`} onClick={()=>{if(!revealed){playSound("reveal");onReward?.(config.value||config.brand||"Gift card revealed");onComplete?.()}setRevealed(value=>!value)}}><div className="gift-face gift-front"><small>MYPOOKIE. PRESENTS</small><strong>{config.brand||"A gift for you"}</strong><span>{isFlip?"Tap to flip":"Tap to bring it into focus"}</span></div><div className="gift-face gift-back"><small>{config.showValue!=="false"?config.value:"A LITTLE SOMETHING"}</small>{config.showCode!=="false"&&<strong>{config.code||"POOKIE-LOVE-24"}</strong>}{config.showNote!=="false"&&<span>{config.giftMessage}</span>}</div></button>;
}

function GiftScratchCard({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  return <div className="gift-scratch-card"><div><small>{config.showValue!=="false"?config.value:"MYPOOKIE. GIFT"}</small>{config.showCode!=="false"&&<strong>{config.code}</strong>}{config.showNote!=="false"&&<span>{config.giftMessage}</span>}</div><ScratchSurface label="SCRATCH TO OPEN YOUR GIFT" colors={["#9b8cff","#ff6f91"]} onReveal={()=>{playSound("win");onReward?.(config.value||config.brand||"Gift card revealed");onComplete?.()}}/></div>;
}

function VoicePreview({ audioUrl,onComplete }: { audioUrl?: string;onComplete?:()=>void }) {
  const [playing, setPlaying] = useState(false);
  const started=useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  function toggle() {
    if (audioUrl && audioRef.current) {
      if (playing) audioRef.current.pause();
      else void audioRef.current.play();
    }
    if(!started.current){started.current=true;playSound("reveal");onComplete?.()}
    setPlaying(value => !value);
  }
  return <div className={`live-voice ${playing?"playing":""}`}><button onClick={toggle}>{playing?"Ⅱ":"▶"}</button><div>{Array.from({length:22},(_,index)=><i key={index} style={{height:`${10+(index*7)%28}px`,animationDelay:`${index*.04}s`}}/>)}</div><span>{audioUrl ? playing?"Playing":"Ready" : "Record on the right"}</span>{audioUrl&&<audio ref={audioRef} src={audioUrl} onEnded={()=>setPlaying(false)}/>}</div>;
}

function ScratchSurface({label,colors,onReveal}:{label:string;colors:string[];onReveal?:()=>void}){
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratching = useRef(false);
  const lastPoint = useRef<{x:number;y:number}|null>(null);
  const [revealed,setRevealed]=useState(false);

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
    colors.forEach((color,index)=>gradient.addColorStop(index/Math.max(colors.length-1,1),color));
    context.fillStyle = gradient;
    context.fillRect(0, 0, rect.width, rect.height);
    context.fillStyle = "rgba(255,255,255,.22)";
    for(let x=-rect.height;x<rect.width;x+=22)context.fillRect(x,0,6,rect.height);
    context.fillStyle = "white";
    context.font = "800 12px Nunito";
    context.textAlign = "center";
    context.fillText(label, rect.width / 2, rect.height / 2 + 4);
  }, [colors,label]);

  function scratch(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!scratching.current && event.type === "pointermove") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    if (!context) return;
    const point={x:event.clientX-rect.left,y:event.clientY-rect.top};
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.lineWidth=48;
    context.lineCap="round";
    context.lineJoin="round";
    context.beginPath();
    if(lastPoint.current){context.moveTo(lastPoint.current.x,lastPoint.current.y);context.lineTo(point.x,point.y);context.stroke()}
    else{context.arc(point.x,point.y,24,0,Math.PI*2);context.fill()}
    context.restore();
    lastPoint.current=point;
    playSound("scratch");
  }

  function finish(event:React.PointerEvent<HTMLCanvasElement>){
    scratching.current=false;
    lastPoint.current=null;
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    const canvas=canvasRef.current;
    const context=canvas?.getContext("2d");
    if(!canvas||!context)return;
    const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
    let clear=0,total=0;
    for(let index=3;index<pixels.length;index+=80){total++;if(pixels[index]===0)clear++}
    if(!revealed&&clear/Math.max(total,1)>.28){setRevealed(true);playSound("reveal");onReveal?.()}
  }

  return <canvas className={revealed?"scratch-revealed":""} ref={canvasRef} onPointerDown={event=>{scratching.current=true;lastPoint.current=null;event.currentTarget.setPointerCapture(event.pointerId);scratch(event)}} onPointerMove={scratch} onPointerUp={finish} onPointerCancel={finish}/>;
}

function ScratchPreview({ revealText, revealDetail, coating,onComplete,onReward }: { revealText?: string; revealDetail?: string; coating?:string;onComplete?:()=>void;onReward?:(reward:string)=>void }) {
  const palettes:Record<string,string[]>={
    "Rose gold":["#b76e79","#efb8a8","#d98b99"],
    "Silver sparkle":["#7d8492","#d8dce5","#9ea6b5"],
    "Lilac shimmer":["#9b8cff","#c9bfff","#ff6f91"],
  };
  return <div className="live-scratch"><div><small>YOU UNLOCKED</small><strong>{revealText || "A candlelit dinner ♡"}</strong><span>{revealDetail || "Friday · 8:00 PM"}</span></div><ScratchSurface label="SCRATCH HERE" colors={palettes[coating||"Lilac shimmer"]||palettes["Lilac shimmer"]} onReveal={()=>{playSound("win");onReward?.(revealText||"Scratch surprise revealed");onComplete?.()}}/></div>;
}
