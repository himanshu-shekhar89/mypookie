"use client";

import { useEffect, useRef, useState } from "react";
import { playSound } from "./soundFx";
import { TinyBlockPreview } from "./TinyBlockPreview";

type PreviewBlock = {
  instanceId?:string;
  id: string;
  icon: string;
  name: string;
  color: string;
  message: string;
  config?: Record<string, string>;
};

const wheelPrizes = ["Movie night", "Breakfast", "A long hug", "Mystery date", "Your choice", "Sweet treat"];

export function BuilderLivePreview({ block, name, senderName, theme, ambience, giftId, recipientSession, onInteract, onComplete, onReward }: { block: PreviewBlock; name: string; senderName?:string; theme: string; ambience: string; giftId?:string; recipientSession?:string; onInteract?: () => void; onComplete?: () => void; onReward?: (reward:string) => void }) {
  const [opened, setOpened] = useState(false);
  const [letterStage,setLetterStage]=useState<"closed"|"burst"|"revealed">("closed");
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

  function openLetter(){
    if(letterStage!=="closed")return;
    playSound("envelope");
    setOpened(true);
    setLetterStage("burst");
    window.setTimeout(()=>setLetterStage("revealed"),900);
    window.setTimeout(()=>onComplete?.(),1250);
  }
  function resetLetter(){setOpened(false);setLetterStage("closed")}
  const letterEffect=(config.animation||"Flower burst").toLowerCase().replaceAll(" ","-");
  const letterSymbols=config.animation==="Heart burst"?["♥","♡","♥"]:config.animation==="Golden sparkles"?["✦","✧","⋆"]:config.animation==="Classic unfold"?["·","✦","·"]:["✿","❀","❁"];
  const letterDensity=Math.min(40,Math.max(8,Number(config.effectDensity)||22));
  const envelopeStyle=(config.envelopeStyle||"Blush satin").toLowerCase().replaceAll(" ","-");
  const sealStyle=(config.envelopeSeal||"Wax heart").toLowerCase().replaceAll(" ","-").replaceAll("/","-");
  const pageStyle=(config.pageType||"Classic cream").toLowerCase().replaceAll(" ","-");
  const fontStyle=(config.letterFont||"Handwritten").toLowerCase().replaceAll(" ","-");
  const stampSymbols:Record<string,string>={"Rose stamp":"❀","Air mail":"✈","Golden heart":"♥","Postmark":"◎","None":""};
  const stickerSymbols:Record<string,string>={Daisies:"✿ ❀","Heart cluster":"♥ ♡","Stars":"✦ ✧",Smiley:"☺",None:""};
  const sealSymbols:Record<string,string>={"Wax heart":"♥","Monogram wax":(senderName||"M").slice(0,1).toUpperCase(),"Flower sticker":"✿","Star sticker":"✦","Glue strip":"—","None":""};

  return (
    <div className={`builder-live-card live-theme-${theme.toLowerCase().replaceAll(" ", "-")}`}>
      {ambience === "Petals" && <div className="live-ambience petals" aria-hidden="true"><i>✿</i><i>·</i><i>✿</i><i>·</i><i>✿</i></div>}
      {ambience === "Soft sparkles" && <div className="live-ambience sparkles" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i></div>}
      <div className="live-recipient-label">A LITTLE SOMETHING FOR {name.toUpperCase()}</div>
      <div className={`live-block-icon ${block.color}`}>{block.icon}</div>
      <h3>{block.name}</h3>
      {block.id !== "letter" && block.id !== "voice" && block.id !== "video" && <p>{block.message}</p>}
      <div className="live-interaction" onClickCapture={onInteract} onPointerDownCapture={onInteract}>
        {block.id === "letter" && <div className={`letter-reveal-scene effect-${letterEffect} stage-${letterStage} envelope-${envelopeStyle} seal-${sealStyle} page-${pageStyle} font-${fontStyle} ${block.message.length>200?"letter-copy-max":block.message.length>140?"letter-copy-long":""}`} style={{"--letter-ink":config.letterColor||"#3f3036"} as React.CSSProperties}><div className="letter-particles" aria-hidden="true">{Array.from({length:letterDensity},(_,index)=><i key={index} style={{"--angle":`${index*(360/letterDensity)}deg`,"--distance":`${70+(index%5)*18}px`,"--delay":`${(index%6)*.04}s`} as React.CSSProperties}>{letterSymbols[index%letterSymbols.length]}</i>)}</div><button className={`envelope-3d ${opened?"opened":""} ${letterStage==="revealed"?"message-ready":""}`} onClick={letterStage==="closed"?openLetter:resetLetter} aria-label={letterStage==="closed"?"Open the envelope":"Close and replay the letter"}><span className="envelope-card"><span className="envelope-face envelope-front"><i className="envelope-stamp">{stampSymbols[config.stampStyle||"Rose stamp"]}</i><strong>{config.frontText||`For ${name}`}</strong><em className="envelope-stickers">{stickerSymbols[config.stickerStyle||"Daisies"]}</em><b className="envelope-seal">{sealSymbols[config.envelopeSeal||"Wax heart"]}</b></span><span className="envelope-face envelope-back"><i className="envelope-flap"/><strong>{config.backText||`From ${senderName||"someone special"}`}</strong><b className="envelope-seal">{sealSymbols[config.envelopeSeal||"Wax heart"]}</b></span></span><article className="letter-sheet"><p>{block.message.slice(0,240)}</p><small>{config.signoff||"— sent with love"}</small></article></button><small className="letter-effect-caption">{letterStage==="closed"?"Tap the rotating envelope":letterStage==="burst"?"A little magic is unfolding…":"Tap to close and replay"}</small></div>}
        {block.id === "voice" && <VoicePreview audioUrl={config.audioUrl} playerStyle={config.playbackStyle} onComplete={onComplete} />}
        {block.id === "video" && <VideoNotePlay config={config} onComplete={onComplete} />}
        {block.id === "flowers" && <EGiftPreview config={config} onComplete={onComplete} />}
        {block.id === "quiz" && <QuizPlay config={config} onComplete={onComplete} onReward={onReward} />}
        {block.id === "thisorthat" && <ThisOrThatPlay config={config} giftId={giftId} recipientSession={recipientSession} blockInstanceId={block.instanceId||block.id} recipientName={name} onComplete={onComplete} onReward={onReward} />}
        {block.id === "emoji" && <EmojiDecoderPlay config={config} onComplete={onComplete} onReward={onReward} />}
        {block.id === "heartcatch" && <HeartCatchPlay config={config} onComplete={onComplete} onReward={onReward} />}
        {["wouldrather","neverhave","truthdare","tapheart","matchpair","countdownus","constellation","growthring","movie","song","alwaysyou","excuse","roast","fortune","mysterybox","playlist","countdowninvite","groupboard"].includes(block.id) && <TinyBlockPreview id={block.id} blockInstanceId={block.instanceId} config={config} giftId={giftId} recipientSession={recipientSession} recipientName={name} senderName={senderName} onComplete={onComplete} onReward={onReward} />}
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
type MemoryItem = { id:string; image:string; images?:string[]; layout?:string; caption:string; note?:string; arrow?:string; animation?:string };
type TreasureClue = { clue:string; hint:string; answer:string; photo?:string; caption?:string };
type ThisOrThatRound = { prompt:string; left:string; right:string; senderPick?:string };

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
  const [playing,setPlaying]=useState(false);
  const [failed,setFailed]=useState(false);
  const frame=config.videoFrame||config.videoEffect||"Retro cam";
  const frameClass=frame.toLowerCase().replaceAll(" ","-").replace("&","and");
  const captionFont=(config.videoCaptionFont||"Handwritten").toLowerCase().replaceAll(" ","-");
  const shower=config.videoShower||"Petal shower";
  const showerClass=shower.toLowerCase().replaceAll(" ","-");
  const showerSymbols=shower==="Flower shower"?["✿","❀","❁"]:shower==="Heart shower"?["♥","♡","♥"]:shower==="Golden sparkles"?["✦","✧","⋆"]:["❀","·","❁"];
  const density=shower==="None"?0:Math.min(36,Math.max(8,Number(config.videoShowerDensity)||18));
  return <div className={`video-note-player video-frame-${frameClass} caption-font-${captionFont}`} style={{"--video-caption":config.videoCaptionColor||"#3f3036"} as React.CSSProperties}>{density>0&&<div className={`video-shower shower-${showerClass} ${playing?"active":""}`} aria-hidden="true">{Array.from({length:density},(_,index)=><i key={index} style={{"--x":`${(index*43)%100}%`,"--delay":`${(index%9)*-.32}s`,"--sway":`${(index%2?1:-1)*(18+index%6*6)}px`} as React.CSSProperties}>{showerSymbols[index%showerSymbols.length]}</i>)}</div>}{config.videoUrl?<><div className="video-screen"><video key={config.videoUrl} src={config.videoUrl} controls playsInline preload="metadata" onLoadedMetadata={()=>setFailed(false)} onError={()=>setFailed(true)} onPlay={()=>{setPlaying(true);if(!started){setStarted(true);playSound("reveal")}}} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);onComplete?.()}}/>{frame==="Retro cam"&&<><span className="retro-rec">● REC</span><span className="retro-date">MYPOOKIE · MEMORY</span><i className="retro-scan"/></>}</div>{failed&&<p className="video-playback-error">This video format cannot play in this browser. Upload an MP4, MOV or WebM file from the editor.</p>}<strong>{config.videoCaption||"A little face-to-face moment, just for you."}</strong><small>Watch to the end to continue</small></>:<div className="video-note-empty"><span>▶</span><strong>Your video note will appear here</strong><small>Choose a finished video from your gallery.</small></div>}</div>;
}

function ThisOrThatPlay({config,giftId,recipientSession,blockInstanceId,recipientName,onComplete,onReward}:{config:Record<string,string>;giftId?:string;recipientSession?:string;blockInstanceId:string;recipientName:string;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const rounds=parseJson<ThisOrThatRound[]>(config.thisOrThatRounds,[{prompt:"Our perfect evening",left:"Movie night",right:"Long drive"}]);
  const [index,setIndex]=useState(0);
  const [choices,setChoices]=useState<string[]>([]);
  if(index>=rounds.length)return <div className="this-or-that-finish"><span>♡</span><strong>Your little favourites</strong>{choices.map((choice,choiceIndex)=><small key={choiceIndex}>{rounds[choiceIndex]?.prompt}: <b>{choice}</b></small>)}</div>;
  const round=rounds[index];
  async function saveChoices(next:string[]){
    if(!giftId||config.compatibilityEnabled!=="true")return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app"}/api/public/gifts/${giftId}/responses`,{method:"POST",headers:{"Content-Type":"application/json","X-Recipient-Session":recipientSession||""},body:JSON.stringify({blockId:blockInstanceId,responseType:"THIS_OR_THAT",contributorName:recipientName||"Recipient",responseText:JSON.stringify({choices:next}),photoUrls:[]})}).catch(()=>{});
  }
  function choose(value:string){playSound("tile");const next=[...choices,value];setChoices(next);if(index===rounds.length-1){void saveChoices(next);playSound("win");onReward?.(`This or that: ${value}`);onComplete?.()}setIndex(current=>current+1)}
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
  const question=questions[index];
  const [hiddenOptions,setHiddenOptions]=useState<Set<number>>(()=>new Set());
  const hiddenOptionsRef=useRef<Set<number>>(new Set());
  useEffect(()=>{
    const timer=window.setTimeout(()=>{hiddenOptionsRef.current=new Set();setHiddenOptions(new Set());setFeedback("")},0);
    return()=>window.clearTimeout(timer);
  },[index,question?.id,question?.interaction]);
  if(index>=questions.length)return <div className="quiz-finished"><b>{score}/{questions.length}</b><strong>You know this story beautifully ♡</strong><button onClick={()=>{hiddenOptionsRef.current=new Set();setHiddenOptions(new Set());setIndex(0);setScore(0);setFeedback("");setOrder(questions[0]?.options.map((_,optionIndex)=>optionIndex)||[])}}>Play again</button></div>;
  if(!question)return <div className="quiz-finished">Add a question on the right.</div>;
  function hideFromCursor(event:React.PointerEvent<HTMLDivElement>){
    if(question.interaction!=="floating")return;
    const pointer={x:event.clientX,y:event.clientY};
    const stageElement=event.currentTarget;
    const buttons=Array.from(stageElement.querySelectorAll<HTMLButtonElement>("button[data-option]")).map(button=>({
      optionIndex:Number(button.dataset.option),
      rect:button.getBoundingClientRect()
    }));
    const next=new Set(hiddenOptionsRef.current);
    let changed=false;
    buttons.forEach(({optionIndex,rect})=>{
      if(optionIndex===question.correctIndex)return;
      const nearestX=Math.max(rect.left,Math.min(pointer.x,rect.right));
      const nearestY=Math.max(rect.top,Math.min(pointer.y,rect.bottom));
      if(Math.hypot(pointer.x-nearestX,pointer.y-nearestY)<64&&!next.has(optionIndex)){
        next.add(optionIndex);
        changed=true;
      }
    });
    if(changed){
      hiddenOptionsRef.current=next;
      setHiddenOptions(next);
      setFeedback("Oops — that answer disappeared ✦");
      playSound("incorrect");
    }
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
    window.setTimeout(()=>{if(index<questions.length-1){const nextIndex=index+1;hiddenOptionsRef.current=new Set();setHiddenOptions(new Set());setIndex(nextIndex);setFeedback("");setOrder(questions[nextIndex].options.map((_,optionPosition)=>optionPosition))}else{setIndex(questions.length);playSound("win");onReward?.(`Quiz score: ${finalScore}/${questions.length}`);onComplete?.()}},700);
  }
  const visibleOrder=[...order.filter(optionIndex=>optionIndex<question.options.length),...question.options.map((_,optionIndex)=>optionIndex).filter(optionIndex=>!order.includes(optionIndex))];
  return <div className="advanced-quiz"><div className="quiz-dots">{questions.map((_,dot)=><i key={dot} className={dot<index?"done":dot===index?"current":""}/>)}</div><strong>{question.question}</strong><div className="runaway-stage" onPointerMove={hideFromCursor}>{visibleOrder.map(optionIndex=>{const option=question.options[optionIndex];const wrongFloat=question.interaction==="floating"&&optionIndex!==question.correctIndex;const hidden=question.interaction==="floating"&&hiddenOptions.has(optionIndex);return <button data-option={optionIndex} key={optionIndex} className={`${optionIndex===question.correctIndex?"desired":""} ${wrongFloat?"vanishing-wrong":""} ${hidden?"quiz-option-hidden":""}`} onClick={()=>answer(optionIndex)}>{option.image&&<img src={option.image} alt=""/>}<span>{option.text||`Option ${optionIndex+1}`}</span></button>})}</div><output>{feedback||`${index+1} of ${questions.length} · ${question.interaction==="floating"?"wrong answers disappear when the cursor gets close":"normal scoring"}`}</output></div>;
}

function SlotMachinePlay({config,onComplete,onReward}:{config:Record<string,string>;onComplete?:()=>void;onReward?:(reward:string)=>void}){
  const prizes=(config.prizes||"Movie night\nBreakfast date\nA long hug\nSweet treat").split("\n").map(item=>item.trim()).filter(Boolean).slice(0,5);
  const options=prizes.length?prizes:["A lovely surprise"];
  const symbols=["♡","✦","🍓","🎁","🌙"];
  const [reels,setReels]=useState([0,1,2]);
  const [rolling,setRolling]=useState(false);
  const [stoppedReels,setStoppedReels]=useState(3);
  const [pulls,setPulls]=useState(0);
  const [result,setResult]=useState("Pull the lever");
  const timersRef=useRef<number[]>([]);
  const intervalRef=useRef<number|null>(null);
  const stoppedReelsRef=useRef(3);
  const maxPulls=Math.min(Number(config.pulls)||1,6);
  useEffect(()=>()=>{timersRef.current.forEach(timer=>window.clearTimeout(timer));if(intervalRef.current!==null)window.clearInterval(intervalRef.current)},[]);
  function pull(){
    if(rolling||pulls>=maxPulls)return;
    const planned=(config.plannedResults||"").split("\n");
    const plannedIndex=config.resultMode==="Plan every pull"?options.indexOf(planned[pulls]||""):-1;
    const random=globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
    const winner=plannedIndex>=0?plannedIndex:random%options.length;
    playSound("lever");setRolling(true);setStoppedReels(0);stoppedReelsRef.current=0;setResult("The reels are spinning…");
    const timer=window.setInterval(()=>setReels(current=>current.map((reel,index)=>index<stoppedReelsRef.current?reel:globalThis.crypto.getRandomValues(new Uint32Array(1))[0]%options.length)),90);
    intervalRef.current=timer;
    const stopReel=(index:number,label:string)=>window.setTimeout(()=>{
      stoppedReelsRef.current=index+1;
      setStoppedReels(index+1);
      setReels(current=>current.map((reel,reelIndex)=>reelIndex===index?winner:reel));
      setResult(label);
      playSound("tile");
    },700+index*420);
    timersRef.current=[stopReel(0,"First reel locked…"),stopReel(1,"Two reels match…")];
    timersRef.current.push(window.setTimeout(()=>{
      window.clearInterval(timer);intervalRef.current=null;
      stoppedReelsRef.current=3;setStoppedReels(3);
      const nextPulls=pulls+1;setReels([winner,winner,winner]);setPulls(nextPulls);setResult(`Jackpot: ${options[winner]} ♡`);playSound("win");onReward?.(options[winner]);if(nextPulls>=maxPulls)onComplete?.();setRolling(false);
    },1540));
  }
  return <div className="live-slot-machine"><div className="slot-machine-rig"><div className={`slot-machine-reels ${rolling?"rolling":""}`}>{reels.map((reel,index)=><i key={index} className={rolling&&index>=stoppedReels?"spinning":"stopped"}>{symbols[reel%symbols.length]}</i>)}</div><button className={`slot-machine-lever ${rolling?"pulled":""}`} onClick={pull} disabled={rolling||pulls>=maxPulls} aria-label="Pull slot-machine lever"><b/><span/></button></div><output>{pulls>=maxPulls&&!rolling?`${result} · no pulls left`:`${result} · ${maxPulls-pulls} left`}</output></div>;
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
  const [moves,setMoves]=useState(0);
  const [autoSolving,setAutoSolving]=useState(false);
  const autoTimers=useRef<number[]>([]);

  useEffect(()=>()=>autoTimers.current.forEach(timer=>window.clearTimeout(timer)),[]);

  const solved=tiles.length===size*size&&tiles.every((tile,index)=>tile===index);

  function moveTile(index:number){
    if(phase!=="playing"||autoSolving)return;
    if(picked===null){setPicked(index);return}
    const distance=Math.abs(Math.floor(picked/size)-Math.floor(index/size))+Math.abs((picked%size)-(index%size));
    if(distance===1){
      const next=[...tiles];
      const nextMoves=moves+1;
      [next[picked],next[index]]=[next[index],next[picked]];
      setTiles(next);
      setMoves(nextMoves);
      playSound("tile");
      if(next.every((tile,tileIndex)=>tile===tileIndex)){
        setPhase("perfect");
        playSound("win");
        onReward?.(`Completed the photo puzzle in ${nextMoves} move${nextMoves===1?"":"s"}`);
        onComplete?.();
        window.setTimeout(()=>setPhase("photo"),900);
      }
    }
    setPicked(null);
  }

  function finishPuzzle(finalMoves:number,auto=false){
    setPhase("perfect");
    setAutoSolving(false);
    playSound("win");
    onReward?.(auto?"Auto-solved the photo puzzle":`Completed the photo puzzle in ${finalMoves} move${finalMoves===1?"":"s"}`);
    onComplete?.();
    autoTimers.current.push(window.setTimeout(()=>setPhase("photo"),900));
  }

  function autoSolve(){
    if(phase!=="playing"||autoSolving)return;
    const working=[...tiles];
    const swaps:Array<[number,number]>=[];
    for(let target=0;target<working.length;target++){
      let position=working.indexOf(target);
      while(Math.floor(position/size)>Math.floor(target/size)){const next=position-size;swaps.push([position,next]);[working[position],working[next]]=[working[next],working[position]];position=next}
      while(Math.floor(position/size)<Math.floor(target/size)){const next=position+size;swaps.push([position,next]);[working[position],working[next]]=[working[next],working[position]];position=next}
      while(position>target){const next=position-1;swaps.push([position,next]);[working[position],working[next]]=[working[next],working[position]];position=next}
      while(position<target){const next=position+1;swaps.push([position,next]);[working[position],working[next]]=[working[next],working[position]];position=next}
    }
    setPicked(null);setAutoSolving(true);playSound("reveal");
    if(!swaps.length){finishPuzzle(moves,true);return}
    swaps.forEach(([from,to],index)=>autoTimers.current.push(window.setTimeout(()=>{
      setTiles(current=>{const next=[...current];[next[from],next[to]]=[next[to],next[from]];return next});
      setMoves(value=>value+1);playSound("tile");
      if(index===swaps.length-1)finishPuzzle(moves+swaps.length,true);
    },index*95)));
  }

  function reshuffle(){autoTimers.current.forEach(timer=>window.clearTimeout(timer));autoTimers.current=[];setTiles(shuffleTiles(size));setPicked(null);setMoves(0);setAutoSolving(false);setPhase("playing")}

  if(phase==="photo")return <div className="puzzle-complete-photo"><img src={image} alt="Completed puzzle"/><strong>Perfect! ✦</strong><span>{config.successMessage||"You put this memory back together."}</span><b className="puzzle-move-result">Solved in {moves} move{moves===1?"":"s"}</b><button onClick={reshuffle}>Play again</button></div>;

  return <div className="live-puzzle"><div className="live-puzzle-reference"><img src={image} alt="Completed puzzle reference"/><small>reference · {size}×{size}</small></div><div><div className="puzzle-move-count" aria-live="polite"><span>{autoSolving?"AUTO SOLVING":"MOVES"}</span><strong>{moves}</strong></div><div className={`live-puzzle-grid ${solved?"solved":""} ${autoSolving?"auto-solving":""}`} style={{gridTemplateColumns:`repeat(${size},1fr)`}}>{tiles.map((tile,index)=><button disabled={autoSolving} key={`${tile}-${index}`} className={picked===index?"picked":""} onClick={()=>moveTile(index)} style={{backgroundImage:`url("${image}")`,backgroundSize:`${size*100}% ${size*100}%`,backgroundPosition:`${(tile%size)*100/(size-1)}% ${Math.floor(tile/size)*100/(size-1)}%`}} aria-label={`Puzzle piece ${index+1}`}/>)}{phase==="perfect"&&<div className="live-puzzle-success">Perfect! ✦<small>{autoSolving?"Putting your memory together…":`Solved in ${moves} move${moves===1?"":"s"}`}</small></div>}</div><div className="puzzle-actions"><button className="puzzle-shuffle" onClick={reshuffle} disabled={autoSolving}>↻ Shuffle again</button>{config.autoSolver==="true"&&<button className="puzzle-auto-solve" onClick={autoSolve} disabled={autoSolving}>{autoSolving?"Solving…":"✦ Auto-solve"}</button>}</div></div></div>;
}

function MemoryBook({config,onComplete}:{config:Record<string,string>;onComplete?:()=>void}){
  const items=parseJson<MemoryItem[]>(config.memoryItems,[]).slice(0,config.extraPages==="true"?12:7);
  const pages=[{id:"cover",image:config.coverImage||"/mypookie-letter-photo.png",caption:config.coverCaption||"Our little book of us"},...items];
  const [page,setPage]=useState(0);
  const [turning,setTurning]=useState(false);
  const viewed=useRef<Set<number>>(new Set([0]));
  function turn(direction:number){if(turning)return;playSound("page");setTurning(true);window.setTimeout(()=>{const nextPage=(page+direction+pages.length)%pages.length;setPage(nextPage);viewed.current.add(nextPage);if(viewed.current.size>=pages.length)onComplete?.();setTurning(false)},360)}
  const current=pages[page];
  const style=(config.albumStyle||"Blush scrapbook").toLowerCase().replaceAll(" ","-");
  const albumFont=(config.albumFont||"Handwritten").toLowerCase().replaceAll(" ","-");
  const animation=(current.animation||"Polaroid pop").toLowerCase().replaceAll(" ","-");
  const pageImages=current.images?.length?current.images:[current.image];
  return <div className={`memory-book scrapbook-album album-${style} album-font-${albumFont}`} style={{"--album-ink":config.albumTextColor||"#49343e"} as React.CSSProperties}><div className={`memory-page scrapbook-page page-${animation} ${turning?"turning":""}`}><div className="album-corner-tape left"/><div className="album-corner-tape right"/>{pageImages.length>1?<div className={`memory-collage collage-${pageImages.length} layout-${(current.layout||"Four-photo grid").toLowerCase().replaceAll(" ","-")}`}>{pageImages.map((image,index)=><img src={image} alt={`Memory collage ${index+1}`} key={index}/>)}</div>:<img src={current.image} alt={page===0?"Memory album cover":"Uploaded memory"}/>}<div className="scrapbook-copy"><small>{page===0?"OUR MEMORY ALBUM":`MEMORY ${page} OF ${items.length}`}</small><strong>{current.caption}</strong>{current.note&&<p>{current.note}</p>}</div>{page>0&&current.arrow!=="None"&&<span className={`scrapbook-arrow arrow-${(current.arrow||"Curve right").toLowerCase().replaceAll(" ","-")}`}>↝</span>}<div className="album-stickers" aria-hidden="true"><i>♡</i><b>✦</b><em>together</em></div></div><div className="book-controls"><button onClick={()=>turn(-1)}>←</button><span>{page+1}/{pages.length} · turn the album page</span><button onClick={()=>turn(1)}>→</button></div></div>;
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

function VoicePreview({ audioUrl,playerStyle,onComplete }: { audioUrl?: string;playerStyle?:string;onComplete?:()=>void }) {
  const [playing, setPlaying] = useState(false);
  const [progress,setProgress]=useState(0);
  const [duration,setDuration]=useState(0);
  const started=useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const style=(playerStyle||"Classic waveform").toLowerCase().replaceAll(" ","-");
  function toggle() {
    if (audioUrl && audioRef.current) {
      if (playing) audioRef.current.pause();
      else void audioRef.current.play();
    } else {
      onComplete?.();
      setPlaying(value => !value);
    }
    if(!started.current){started.current=true;playSound("reveal")}
  }
  function seek(value:number){if(!audioRef.current||!duration)return;audioRef.current.currentTime=(value/100)*duration;setProgress(value)}
  return <div className={`live-voice voice-style-${style} ${playing?"playing":""}`}><button onClick={toggle} aria-label={playing?"Pause voice note":"Play voice note"}>{style==="floating-heart"?(playing?"♥":"♡"):(playing?"Ⅱ":"▶")}</button><div className="voice-visual">{Array.from({length:22},(_,index)=><i key={index} style={{height:`${10+(index*7)%28}px`,animationDelay:`${index*.04}s`}}/>)}</div><div className="voice-meta"><strong>{style==="floating-heart"?"A voice from the heart":style==="minimal-player"?"Voice message":"A little voice note"}</strong><span>{audioUrl ? playing?"Playing now":duration?`${Math.ceil(duration)} seconds · ready`:"Ready to play" : "Record on the right"}</span><input type="range" min="0" max="100" value={progress} onChange={event=>seek(Number(event.target.value))} aria-label="Voice-note progress"/></div>{audioUrl&&<audio ref={audioRef} src={audioUrl} preload="metadata" onLoadedMetadata={event=>setDuration(event.currentTarget.duration||0)} onTimeUpdate={event=>setProgress(event.currentTarget.duration?event.currentTarget.currentTime/event.currentTarget.duration*100:0)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);setProgress(100);onComplete?.()}}/>}</div>;
}

function ScratchSurface({label,colors,onReveal}:{label:string;colors:string[];onReveal?:()=>void}){
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratching = useRef(false);
  const lastPoint = useRef<{x:number;y:number}|null>(null);
  const [revealed,setRevealed]=useState(false);
  const touchedCells=useRef(new Set<string>());
  const revealOnce=useRef(false);
  const palette=colors.join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let paintedWidth=0;
    let paintedHeight=0;
    function paint(){
      const rect=canvas.getBoundingClientRect();
      const width=Math.round(rect.width),height=Math.round(rect.height);
      if(width<2||height<2||(width===paintedWidth&&height===paintedHeight))return;
      paintedWidth=width;paintedHeight=height;
      const ratio=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(width*ratio);
      canvas.height=Math.round(height*ratio);
      const context=canvas.getContext("2d");
      if(!context)return;
      context.setTransform(ratio,0,0,ratio,0,0);
      const gradient=context.createLinearGradient(0,0,width,height);
      colors.forEach((color,index)=>gradient.addColorStop(index/Math.max(colors.length-1,1),color));
      context.fillStyle=gradient;
      context.fillRect(0,0,width,height);
      context.fillStyle="rgba(255,255,255,.22)";
      for(let x=-height;x<width;x+=22)context.fillRect(x,0,6,height);
      context.fillStyle="white";
      context.font="800 12px Nunito";
      context.textAlign="center";
      context.fillText(label,width/2,height/2+4);
    }
    paint();
    const frame=window.requestAnimationFrame(paint);
    const retry=window.setTimeout(paint,250);
    const observer=typeof ResizeObserver!=="undefined"?new ResizeObserver(paint):null;
    observer?.observe(canvas);
    return()=>{window.cancelAnimationFrame(frame);window.clearTimeout(retry);observer?.disconnect()};
  }, [palette,label]);

  function reveal(){if(revealOnce.current)return;revealOnce.current=true;setRevealed(true);playSound("reveal");onReveal?.()}

  function scratch(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!scratching.current && event.type === "pointermove") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    if (!context) return;
    const point={x:event.clientX-rect.left,y:event.clientY-rect.top};
    const columns=12,rows=6,cellX=Math.floor(point.x/Math.max(rect.width/columns,1)),cellY=Math.floor(point.y/Math.max(rect.height/rows,1));
    for(let x=cellX-1;x<=cellX+1;x++)for(let y=cellY-1;y<=cellY+1;y++)if(x>=0&&x<columns&&y>=0&&y<rows)touchedCells.current.add(`${x}:${y}`);
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
    if(touchedCells.current.size/(columns*rows)>=.3)reveal();
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
    if(!revealed&&clear/Math.max(total,1)>.22)reveal();
  }

  return <canvas width={900} height={350} className={revealed?"scratch-complete":""} ref={canvasRef} onPointerDown={event=>{scratching.current=true;lastPoint.current=null;event.currentTarget.setPointerCapture(event.pointerId);scratch(event)}} onPointerMove={scratch} onPointerUp={finish} onPointerCancel={finish}/>;
}

function ScratchPreview({ revealText, revealDetail, coating,onComplete,onReward }: { revealText?: string; revealDetail?: string; coating?:string;onComplete?:()=>void;onReward?:(reward:string)=>void }) {
  const palettes:Record<string,string[]>={
    "Rose gold":["#b76e79","#efb8a8","#d98b99"],
    "Silver sparkle":["#7d8492","#d8dce5","#9ea6b5"],
    "Lilac shimmer":["#9b8cff","#c9bfff","#ff6f91"],
  };
  return <div className="live-scratch"><div><small>YOU UNLOCKED</small><strong>{revealText || "A candlelit dinner ♡"}</strong><span>{revealDetail || "Friday · 8:00 PM"}</span></div><ScratchSurface label="SCRATCH HERE" colors={palettes[coating||"Lilac shimmer"]||palettes["Lilac shimmer"]} onReveal={()=>{playSound("win");onReward?.(revealText||"Scratch surprise revealed");onComplete?.()}}/></div>;
}
