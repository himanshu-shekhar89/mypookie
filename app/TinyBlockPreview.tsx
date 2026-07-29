"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "./soundFx";

type Props = {
  id:string;
  config:Record<string,string>;
  onComplete?:()=>void;
  onReward?:(reward:string)=>void;
};
type Pair={left:string;right:string};
type PairPhoto={id:string;image:string;caption:string};
type Milestone={year:string;label:string};
type BoardNote={from:string;message:string};

function parse<T>(value:string|undefined,fallback:T):T{try{return value?JSON.parse(value) as T:fallback}catch{return fallback}}
function lines(value:string|undefined,fallback:string[]){const result=(value||"").split("\n").map(item=>item.trim()).filter(Boolean);return result.length?result:fallback}
function randomIndex(length:number){return length?globalThis.crypto.getRandomValues(new Uint32Array(1))[0]%length:0}
function shuffle<T>(values:T[]){const next=[...values];const random=new Uint32Array(next.length);globalThis.crypto.getRandomValues(random);for(let index=next.length-1;index>0;index--){const target=random[index]%(index+1);[next[index],next[target]]=[next[target],next[index]]}return next}

export function TinyBlockPreview(props:Props){
  if(props.id==="wouldrather")return <WouldRather {...props}/>;
  if(props.id==="neverhave")return <NeverHave {...props}/>;
  if(props.id==="truthdare")return <TruthDare {...props}/>;
  if(props.id==="tapheart")return <TapHeart {...props}/>;
  if(props.id==="matchpair")return <MatchPair {...props}/>;
  if(props.id==="countdownus")return <CountdownUs {...props}/>;
  if(props.id==="constellation")return <Constellation {...props}/>;
  if(props.id==="growthring")return <GrowthRing {...props}/>;
  if(props.id==="movie")return <MovieReveal {...props}/>;
  if(props.id==="alwaysyou")return <AlwaysYou {...props}/>;
  if(props.id==="excuse")return <ExcuseGenerator {...props}/>;
  if(props.id==="roast")return <RoastCards {...props}/>;
  if(props.id==="fortune")return <FortuneCookie {...props}/>;
  if(props.id==="mysterybox")return <MysteryBox {...props}/>;
  if(props.id==="playlist")return <PlaylistReveal {...props}/>;
  if(props.id==="countdowninvite")return <CountdownInvite {...props}/>;
  if(props.id==="groupboard")return <GroupBoard {...props}/>;
  return null;
}

function WouldRather({config,onComplete,onReward}:Props){
  const pairs=parse<Pair[]>(config.pairs,[{left:"Sunrise date",right:"Midnight drive"}]);
  const [index,setIndex]=useState(0);const [picks,setPicks]=useState<string[]>([]);const pointer=useRef<number|null>(null);
  if(index>=pairs.length)return <div className="tiny-finish"><span>⇄</span><strong>Your choices are in</strong>{picks.map((pick,itemIndex)=><small key={itemIndex}>{itemIndex+1}. {pick}</small>)}<b>The sender will see this pick list.</b></div>;
  function choose(value:string){playSound("tile");const next=[...picks,value];setPicks(next);setIndex(current=>current+1);if(index===pairs.length-1){playSound("win");onReward?.(`Would Rather picks: ${next.join(" · ")}`);onComplete?.()}}
  const pair=pairs[index];
  return <div className="swipe-deck"><div className="deck-progress">{index+1}/{pairs.length}</div><article onPointerDown={event=>pointer.current=event.clientX} onPointerUp={event=>{if(pointer.current===null)return;const distance=event.clientX-pointer.current;if(Math.abs(distance)>45)choose(distance<0?pair.left:pair.right);pointer.current=null}}><small>WOULD YOU RATHER</small><strong>{pair.left}</strong><span>OR</span><strong>{pair.right}</strong><p>Swipe left or right—or tap a choice.</p></article><div><button onClick={()=>choose(pair.left)}>← {pair.left}</button><button onClick={()=>choose(pair.right)}>{pair.right} →</button></div></div>;
}

function NeverHave({config,onComplete,onReward}:Props){
  const statements=lines(config.statements,["Danced in the kitchen","Re-read our old chats"]);
  const [index,setIndex]=useState(0);const [have,setHave]=useState(0);
  if(index>=statements.length)return <div className="tiny-finish"><span>✋</span><strong>{have} “I have” {have===1?"moment":"moments"}</strong><p>Lightly confessed. Entirely shareable.</p></div>;
  function answer(did:boolean){playSound("tile");const total=have+(did?1:0);setHave(total);setIndex(value=>value+1);if(index===statements.length-1){onReward?.(`Never Have I Ever: ${total}/${statements.length} “I have”`);onComplete?.();playSound("win")}}
  return <div className="never-have-deck"><div className="deck-progress">{index+1}/{statements.length}</div><article><small>NEVER HAVE I EVER…</small><strong>{statements[index]}</strong></article><div><button onClick={()=>answer(false)}>I haven’t</button><button onClick={()=>answer(true)}>I have</button></div></div>;
}

function TruthDare({config,onComplete,onReward}:Props){
  const truths=lines(config.truths,["What was your first impression of me?"]);const dares=lines(config.dares,["Send me your cutest selfie"]);
  const [rotation,setRotation]=useState(0);const [result,setResult]=useState("");const [spinning,setSpinning]=useState(false);
  function spin(){if(spinning)return;setSpinning(true);setResult("");playSound("wheel");const truth=randomIndex(2)===0;const prompts=truth?truths:dares;const prompt=prompts[randomIndex(prompts.length)];setRotation(value=>value+1440+(truth?0:180));window.setTimeout(()=>{setSpinning(false);setResult(`${truth?"TRUTH":"DARE"} · ${prompt}`);onReward?.(`${truth?"Truth":"Dare"}: ${prompt}`);onComplete?.();playSound("win")},1800)}
  return <div className="truth-dare-play"><div className="td-wheel" style={{transform:`rotate(${rotation}deg)`}}><span>TRUTH</span><span>DARE</span><i>♡</i></div><i className="td-pointer"/><button onClick={spin} disabled={spinning}>{spinning?"Choosing…":"Spin roulette"}</button><output>{result||"Truth or dare? Let chance decide."}</output></div>;
}

function TapHeart({config,onComplete,onReward}:Props){
  const duration=Math.min(Math.max(Number(config.duration)||10,5),15);
  const [time,setTime]=useState(duration);const [score,setScore]=useState(0);const [playing,setPlaying]=useState(false);const [position,setPosition]=useState({left:48,top:46});const completed=useRef(false);
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setTime(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer)},[playing]);
  useEffect(()=>{if(time!==0||!playing||completed.current)return;completed.current=true;setPlaying(false);playSound("win");onReward?.(`Heart-tap score: ${score}`);onComplete?.()},[time,playing,score,onComplete,onReward]);
  function start(){completed.current=false;setScore(0);setTime(duration);setPlaying(true);playSound("reveal")}
  function tap(){if(!playing)return;setScore(value=>value+1);playSound("tile");setPosition({left:8+randomIndex(78),top:8+randomIndex(67)})}
  return <div className="rhythm-heart-game"><header><strong>{playing?`${time}s`:(time===0?`${score} hearts`:"Ready?")}</strong><span>{config.scoreTitle||"Official heart-catching score"} · {score}</span></header><div>{playing&&<button style={{left:`${position.left}%`,top:`${position.top}%`}} onClick={tap}>♥</button>}{!playing&&<button className="start-heart" onClick={start}>{time===0?"Play again":"Start 10-second burst"}</button>}<i/><i/><i/></div></div>;
}

function MatchPair({config,onComplete,onReward}:Props){
  const uploaded=parse<PairPhoto[]>(config.pairPhotos,[]);
  const photos=uploaded.length>=2?uploaded:[{id:"a",image:"/mypookie-letter-photo.png",caption:"Fair day"},{id:"b",image:"/mypookie-puzzle-picnic.png",caption:"Picnic"},{id:"c",image:"/mypookie-memory-polaroids.png",caption:"Us"}];
  const [cards]=useState(()=>shuffle(photos.flatMap(photo=>[{...photo,cardId:`${photo.id}-a`},{...photo,cardId:`${photo.id}-b`}])));const [open,setOpen]=useState<number[]>([]);const [matched,setMatched]=useState<string[]>([]);
  function flip(index:number){if(open.length>=2||open.includes(index)||matched.includes(cards[index].id))return;playSound("page");const next=[...open,index];setOpen(next);if(next.length===2){if(cards[next[0]].id===cards[next[1]].id){const nextMatched=[...matched,cards[index].id];window.setTimeout(()=>{setMatched(nextMatched);setOpen([]);playSound("correct");if(nextMatched.length===photos.length){playSound("win");onReward?.("Matched every photo pair");onComplete?.()}},350)}else window.setTimeout(()=>{setOpen([]);playSound("incorrect")},650)}}
  return <div className="match-pair-game"><header><strong>Match the memories</strong><span>{matched.length}/{photos.length} pairs</span></header><div style={{gridTemplateColumns:`repeat(${Math.min(photos.length,3)},1fr)`}}>{cards.map((card,index)=><button key={card.cardId} className={`${open.includes(index)||matched.includes(card.id)?"open":""} ${matched.includes(card.id)?"matched":""}`} onClick={()=>flip(index)}><span>♡</span><figure><img src={card.image} alt={card.caption}/><figcaption>{card.caption}</figcaption></figure></button>)}</div></div>;
}

function useClock(dateValue:string|undefined,mode:"since"|"until"){
  const calculate=useCallback(()=>{const target=new Date(dateValue||Date.now()).getTime();const difference=mode==="since"?Date.now()-target:target-Date.now();return Math.max(0,difference)},[dateValue,mode]);
  const [difference,setDifference]=useState(calculate);
  useEffect(()=>{const timer=window.setInterval(()=>setDifference(calculate()),1000);return()=>window.clearInterval(timer)},[calculate]);
  const days=Math.floor(difference/86400000),hours=Math.floor(difference/3600000)%24,minutes=Math.floor(difference/60000)%60,seconds=Math.floor(difference/1000)%60;
  return {days,hours,minutes,seconds};
}

function CountdownUs({config,onComplete}:Props){
  const time=useClock(config.sinceDate,"since");const [held,setHeld]=useState(false);
  return <div className="relationship-counter"><small>{config.counterLabel||"SINCE OUR STORY BEGAN"}</small><div><b>{time.days}<span>days</span></b><b>{String(time.hours).padStart(2,"0")}<span>hours</span></b><b>{String(time.minutes).padStart(2,"0")}<span>minutes</span></b><b>{String(time.seconds).padStart(2,"0")}<span>seconds</span></b></div><button className={held?"held":""} onClick={()=>{if(!held){setHeld(true);playSound("reveal");onComplete?.()}}}>{held?"This moment is ours ♡":"Hold this moment"}</button></div>;
}

function Constellation({config,onComplete}:Props){
  const [revealed,setRevealed]=useState(false);const stars=useMemo(()=>Array.from({length:46},(_,index)=>({left:(index*47)%97,top:(index*31)%91,size:2+(index%3)})),[]);
  return <div className={`constellation-map ${config.skyStyle?.toLowerCase().replaceAll(" ","-")} ${revealed?"revealed":""}`}>{stars.map((star,index)=><i key={index} style={{left:`${star.left}%`,top:`${star.top}%`,width:star.size,height:star.size}}/>)}<span className="constellation-lines"/><button onClick={()=>{if(!revealed){setRevealed(true);playSound("reveal");onComplete?.()}}}><b>✦</b><strong>{revealed?(config.starName||"Your star"):"Find the brightest star"}</strong></button>{revealed&&<p>{config.starMessage}</p>}</div>;
}

function GrowthRing({config,onComplete}:Props){
  const milestones=parse<Milestone[]>(config.milestones,[{year:"2024",label:"We met"}]);const [active,setActive]=useState(0);
  function next(){const next=Math.min(active+1,milestones.length-1);setActive(next);playSound("page");if(next===milestones.length-1)onComplete?.()}
  return <div className="growth-ring-play"><div>{milestones.map((item,index)=><button key={index} className={index<=active?"seen":""} style={{inset:`${index*15}px`}} onClick={()=>{setActive(index);if(index===milestones.length-1)onComplete?.()}} aria-label={`${item.year}: ${item.label}`}/>) }<span>♡</span></div><article><small>{milestones[active]?.year}</small><strong>{milestones[active]?.label}</strong><button onClick={next} disabled={active===milestones.length-1}>{active===milestones.length-1?"Every ring is us":"Next ring →"}</button></article></div>;
}

function MovieReveal({config,onComplete}:Props){
  const [revealed,setRevealed]=useState(false);
  return <button className={`movie-poster ${revealed?"revealed":""}`} onClick={()=>{if(!revealed){setRevealed(true);playSound("reveal");onComplete?.()}}}><div className="movie-curtain left"/><div className="movie-curtain right"/><small>A MYPOOKIE. {String(config.genre||"ROMANCE").toUpperCase()}</small><strong>{config.movieTitle||"Us, Somehow"}</strong><p>{config.tagline}</p><b>STARRING {config.starring}</b><span>{revealed?"NOW PLAYING · FOREVER":"Tap for the premiere"}</span></button>;
}

function AlwaysYou({config,onComplete,onReward}:Props){
  const answers=lines(config.answers,["You","Still you","Obviously you"]);const [selected,setSelected]=useState<string|null>(null);
  function choose(answer:string){if(!selected){setSelected(answer);playSound("win");onReward?.("Every answer was you");onComplete?.()}}
  return <div className="always-you-quiz"><small>ONE VERY IMPORTANT QUESTION</small><strong>{config.question||"Who makes every day better?"}</strong><div>{answers.map(answer=><button key={answer} onClick={()=>choose(answer)} className={selected===answer?"selected":""}>{answer}{selected&&<span> ✓ correct</span>}</button>)}</div>{selected&&<p>Plot twist: every answer was always you. ♡</p>}</div>;
}

function ExcuseGenerator({config,onComplete,onReward}:Props){
  const options=lines(config.excuses,["I need expert help choosing dessert"]);const [result,setResult]=useState("Pull for a perfectly valid excuse");const [pulling,setPulling]=useState(false);
  function pull(){if(pulling)return;setPulling(true);playSound("lever");window.setTimeout(()=>{const value=options[randomIndex(options.length)];setResult(value);setPulling(false);playSound("win");onReward?.(`Excuse: ${value}`);onComplete?.()},850)}
  return <div className="excuse-machine"><div><small>OFFICIAL EXCUSE TO SEE ME</small><strong>{pulling?"Generating something extremely convincing…":result}</strong></div><button className={pulling?"pulled":""} onClick={pull} aria-label="Pull excuse lever"><i/><b/></button></div>;
}

function RoastCards({config,onComplete}:Props){
  const roasts=lines(config.roasts,["You steal the blanket and look innocent"]);const [index,setIndex]=useState(0);const [flipped,setFlipped]=useState(false);
  function flip(){if(!flipped){setFlipped(true);playSound("page");onComplete?.()}else{setFlipped(false);setIndex(value=>(value+1)%roasts.length)}}
  return <button className={`roast-card ${flipped?"flipped":""}`} onClick={flip}><div><span>♨</span><strong>Roast me gently</strong><small>Tap to reveal complaint #{index+1}</small></div><div><small>LOVING COMPLAINT #{index+1}</small><strong>{roasts[index]}</strong><span>…and I would still choose you.</span></div></button>;
}

function FortuneCookie({config,onComplete,onReward}:Props){
  const fortunes=lines(config.fortunes,["A surprise date is closer than you think"]);const [fortune,setFortune]=useState("");
  function crack(){if(fortune)return;const value=fortunes[randomIndex(fortunes.length)];setFortune(value);playSound("reveal");onReward?.(`Fortune: ${value}`);onComplete?.()}
  return <button className={`fortune-cookie ${fortune?"cracked":""}`} onClick={crack}><div><i/><i/><span>✦</span></div>{fortune?<p>{fortune}</p>:<strong>Tap to crack your fortune</strong>}</button>;
}

function MysteryBox({config,onComplete,onReward}:Props){
  const surprises=lines(config.surprises,["A long drive"]);const [state,setState]=useState<"closed"|"shaking"|"open">("closed");const [result,setResult]=useState("");
  function open(){if(state!=="closed")return;setState("shaking");playSound("lever");window.setTimeout(()=>{const value=config.boxMode==="Always reveal the first"?surprises[0]:surprises[randomIndex(surprises.length)];setResult(value);setState("open");playSound("win");onReward?.(value);onComplete?.()},1050)}
  return <button className={`mystery-box-play ${state}`} onClick={open}><div className="box-lid"><i/></div><div className="box-body"><span>{state==="open"?"✦":"♡"}</span></div><strong>{state==="closed"?"Tap the box":state==="shaking"?"Something is moving…":result}</strong></button>;
}

function PlaylistReveal({config,onComplete}:Props){
  const dedication=config.dedication||"Press play whenever you want to feel closer to me.";const [typed,setTyped]=useState("");const [started,setStarted]=useState(false);
  useEffect(()=>{if(!started||typed.length>=dedication.length)return;const timer=window.setTimeout(()=>setTyped(dedication.slice(0,typed.length+1)),24);return()=>window.clearTimeout(timer)},[started,typed,dedication]);
  useEffect(()=>{if(started&&typed.length===dedication.length){playSound("reveal");onComplete?.()}},[started,typed.length,dedication.length,onComplete]);
  return <div className="playlist-reveal"><div className="vinyl"><i/><span>♡</span></div><small>PLAYLIST FOR YOU</small><strong>{config.playlistTitle||"Songs that feel like us"}</strong>{started?<><p>{typed}<i/></p><a href={config.playlistUrl||"#"} target="_blank" rel="noreferrer">Open playlist ↗</a></>:<button onClick={()=>setStarted(true)}>Read the dedication</button>}</div>;
}

function CountdownInvite({config,onComplete,onReward}:Props){
  const time=useClock(config.eventDate,"until");const [rsvp,setRsvp]=useState(false);
  return <div className="countdown-invite"><small>YOU’RE INVITED</small><strong>{config.eventTitle||"Our surprise date"}</strong><div><b>{time.days}<span>days</span></b><b>{String(time.hours).padStart(2,"0")}<span>hours</span></b><b>{String(time.minutes).padStart(2,"0")}<span>min</span></b><b>{String(time.seconds).padStart(2,"0")}<span>sec</span></b></div><p>{config.inviteNote}</p><button className={rsvp?"accepted":""} onClick={()=>{if(!rsvp){setRsvp(true);playSound("win");onReward?.(`RSVP: I'm in for ${config.eventTitle||"the date"}`);onComplete?.()}}}>{rsvp?"You’re in! See you there ♡":"I’m in 💛"}</button></div>;
}

function GroupBoard({config,onComplete}:Props){
  const notes=parse<BoardNote[]>(config.boardNotes,[{from:"Someone who loves you",message:"You make every room warmer."}]);const [index,setIndex]=useState(0);const viewed=useRef(new Set([0]));
  function move(direction:number){const next=(index+direction+notes.length)%notes.length;setIndex(next);viewed.current.add(next);playSound("page");if(viewed.current.size===notes.length)onComplete?.()}
  return <div className="group-message-board"><header><span>♡</span><div><small>A CARD FROM EVERYONE</small><strong>{notes.length} people, one big message</strong></div></header><div className="board-stack">{notes.map((note,noteIndex)=><article key={noteIndex} className={noteIndex===index?"active":""} style={{transform:`translate(${(noteIndex-index)*7}px,${Math.abs(noteIndex-index)*4}px) rotate(${(noteIndex-index)*2}deg)`}}><p>{note.message}</p><strong>— {note.from}</strong></article>)}</div><footer><button onClick={()=>move(-1)}>←</button><span>{index+1}/{notes.length}</span><button onClick={()=>move(1)}>→</button></footer></div>;
}
