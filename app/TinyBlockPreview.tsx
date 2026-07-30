"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "./soundFx";

type Props = {
  id:string;
  blockInstanceId?:string;
  config:Record<string,string>;
  giftId?:string;
  recipientName?:string;
  senderName?:string;
  onComplete?:()=>void;
  onReward?:(reward:string)=>void;
};
type Pair={left:string;right:string};
type PairPhoto={id:string;image:string;caption:string};
type BoardNote={from:string;message:string;photos?:string[]};
type SavedResponse={id:string;contributorName:string;responseText:string;photoUrls:string};
const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";

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
  if(props.id==="movie"||props.id==="song")return <BondReveal {...props}/>;
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

function TruthDare({config,giftId,recipientName,blockInstanceId,onComplete,onReward}:Props){
  const truths=lines(config.truths,["What was your first impression of me?"]);const dares=lines(config.dares,["Send me your cutest selfie"]);
  const [rotation,setRotation]=useState(0);const [result,setResult]=useState("");const [resultType,setResultType]=useState<"TRUTH"|"DARE"|"">("");const [spinning,setSpinning]=useState(false);const [answer,setAnswer]=useState("");const [saveState,setSaveState]=useState<"idle"|"saving"|"saved"|"error">("idle");
  function spin(){if(spinning)return;setSpinning(true);setResult("");setResultType("");setAnswer("");setSaveState("idle");playSound("wheel");const truth=randomIndex(2)===0;const prompts=truth?truths:dares;const prompt=prompts[randomIndex(prompts.length)];setRotation(value=>value+1440+(truth?0:180));window.setTimeout(()=>{setSpinning(false);setResult(prompt);setResultType(truth?"TRUTH":"DARE");playSound("reveal")},1800)}
  async function finish(){
    if(resultType==="TRUTH"&&!answer.trim())return;
    setSaveState("saving");
    try{
      if(giftId&&resultType==="TRUTH"){
        const response=await fetch(`${api}/api/public/gifts/${giftId}/responses`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({blockId:blockInstanceId||"truthdare",responseType:"TRUTH",contributorName:recipientName||"Recipient",responseText:`${result} — ${answer.trim()}`,photoUrls:[]})});
        if(!response.ok)throw new Error();
      }
      setSaveState("saved");onReward?.(resultType==="TRUTH"?`Truth answer: ${answer.trim()}`:`Dare accepted: ${result}`);onComplete?.();playSound("win");
    }catch{setSaveState("error")}
  }
  return <div className="truth-dare-play"><div className="td-wheel" style={{transform:`rotate(${rotation}deg)`}}><span>TRUTH</span><span>DARE</span><i>♡</i></div><i className="td-pointer"/><button onClick={spin} disabled={spinning||Boolean(resultType)}>{spinning?"Choosing…":resultType?"Roulette complete":"Spin roulette"}</button><output>{resultType?<><b>{resultType}</b> · {result}</>:"Truth or dare? Let chance decide."}</output>{resultType==="TRUTH"&&<div className="truth-answer-box"><label>Your answer<textarea rows={3} maxLength={500} value={answer} onChange={event=>setAnswer(event.target.value)} placeholder="Type the truth…"/></label><button onClick={finish} disabled={!answer.trim()||saveState==="saving"||saveState==="saved"}>{saveState==="saving"?"Saving…":saveState==="saved"?"Saved for sender ✓":"Save answer for sender"}</button>{saveState==="error"&&<small>Couldn’t save yet. Please try again.</small>}</div>}{resultType==="DARE"&&<button className="dare-done" onClick={finish} disabled={saveState==="saved"}>{saveState==="saved"?"Dare accepted ✓":"I’ll do it →"}</button>}</div>;
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

function GrowthRing({config,giftId,recipientName,blockInstanceId,onComplete}:Props){
  const sender=parse<string[]>(config.growthSenderMemories,["The day our story began","Our funniest adventure","When this bond felt unbreakable"]).slice(0,3);
  const [answers,setAnswers]=useState(["","",""]);const [revealed,setRevealed]=useState(false);const [saving,setSaving]=useState(false);
  async function reveal(){
    if(answers.some(answer=>!answer.trim())||saving)return;
    setSaving(true);
    try{
      if(giftId)await fetch(`${api}/api/public/gifts/${giftId}/responses`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({blockId:blockInstanceId||"growthring",responseType:"GROWTH",contributorName:recipientName||"Recipient",responseText:JSON.stringify(answers),photoUrls:[]})});
    }finally{setSaving(false);setRevealed(true);playSound("win");onComplete?.()}
  }
  if(!revealed)return <div className="growth-memory-form"><span>∞</span><small>ADD YOUR SIDE OF THE STORY</small><strong>Which three moments grew this bond?</strong>{answers.map((answer,index)=><label key={index}><b>{index+1}</b><textarea rows={2} maxLength={120} value={answer} onChange={event=>setAnswers(current=>current.map((item,itemIndex)=>itemIndex===index?event.target.value:item))} placeholder={index===0?"A beginning you treasure…":index===1?"A moment that still makes you smile…":"A memory that changed your bond…"}/></label>)}<button onClick={reveal} disabled={answers.some(answer=>!answer.trim())||saving}>{saving?"Saving your memories…":"Grow our shared timeline →"}</button></div>;
  const moments=sender.flatMap((memory,index)=>[{who:"FROM THEM",text:memory},{who:"FROM YOU",text:answers[index]}]);
  return <div className="growth-timeline"><header><span>∞</span><div><small>SIX MOMENTS · ONE STORY</small><strong>Look how far you’ve grown together.</strong></div></header><div>{moments.map((moment,index)=><article key={index} style={{"--delay":`${index*.14}s`} as React.CSSProperties}><i>{index+1}</i><small>{moment.who}</small><strong>{moment.text}</strong></article>)}</div><footer>Not rings in a tree—moments still moving forward. ♡</footer></div>;
}

type BondAnalysis={title:string;subtitle:string;senderRole:string;recipientRole:string;tagline:string;genre:string};

function BondReveal({id,config,giftId,recipientName,senderName,blockInstanceId,onComplete,onReward}:Props){
  const fallback=["What small thing instantly reminds you of us?","Which moment best captures our bond?","What is our shared superpower?","What kind of adventure feels most like us?","What do we understand without words?","Choose three words for our story."];
  const questions=parse<string[]>(config.bondQuestions,fallback).slice(0,6);
  const normalized=Array.from({length:6},(_,index)=>questions[index]||fallback[index]);
  const senderAnswers=parse<string[]>(config.senderBondAnswers,[]);
  const [index,setIndex]=useState(0);const [answers,setAnswers]=useState<string[]>([]);const [value,setValue]=useState("");const [analysis,setAnalysis]=useState<BondAnalysis|null>(null);const [state,setState]=useState<"answering"|"analyzing"|"error">("answering");
  function next(){if(!value.trim())return;const nextAnswers=[...answers,value.trim()];setAnswers(nextAnswers);setValue("");if(index<normalized.length-1){setIndex(current=>current+1);playSound("tile")}else void analyze(nextAnswers)}
  async function analyze(recipientAnswers:string[]){
    setState("analyzing");
    try{
      if(giftId)await fetch(`${api}/api/public/gifts/${giftId}/responses`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({blockId:blockInstanceId||id,responseType:id==="movie"?"MOVIE_BOND":"SONG_BOND",contributorName:recipientName||"Recipient",responseText:JSON.stringify({questions:normalized,answers:recipientAnswers}),photoUrls:[]})});
      const response=await fetch(`${api}/api/ai/bond-analysis`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:id,senderName:senderName||"The sender",recipientName:recipientName||"The recipient",questions:normalized,senderAnswers,recipientAnswers,preference:id==="movie"?config.genre:config.songStyle})});
      if(!response.ok)throw new Error();
      const result=await response.json() as BondAnalysis;
      setAnalysis(result);playSound("win");onReward?.(`${id==="movie"?"Movie":"Song"} reveal: ${result.title}`);onComplete?.();
    }catch{setState("error")}
  }
  if(!analysis)return <div className={`bond-recipient-quiz mode-${id}`}><header><span>{id==="movie"?"▰":"♪"}</span><div><small>{id==="movie"?"CASTING YOUR STORY":"FINDING YOUR SOUND"}</small><strong>Answer the same questions as {senderName||"your person"}.</strong></div></header>{state==="analyzing"?<div className="bond-analyzing"><i/><strong>AI is comparing both sides of your bond…</strong><small>Finding the title, characters and story only you two could make.</small></div>:state==="error"?<div className="bond-analyzing error"><strong>The reveal paused for a moment.</strong><button onClick={()=>void analyze(answers)}>Try the analysis again</button></div>:<><div className="bond-progress">{normalized.map((_,dot)=><i key={dot} className={dot<=index?"active":""}/>)}</div><small>QUESTION {index+1} OF {normalized.length}</small><strong>{normalized[index]}</strong><textarea autoFocus rows={3} maxLength={180} value={value} onChange={event=>setValue(event.target.value)} placeholder="Your honest answer…"/><button onClick={next} disabled={!value.trim()}>{index===normalized.length-1?"Create our reveal ✦":"Next question →"}</button></>}</div>;
  const template=(config.posterTemplate||"Golden musical").toLowerCase().replaceAll(" ","-");
  return <div className={`bond-result mode-${id}`}>{id==="movie"?<div className={`movie-poster poster-${template} uploaded revealed`} style={config.posterImage?{backgroundImage:`linear-gradient(transparent 10%,rgba(30,15,24,.82)),url("${config.posterImage}")`}:undefined}><small>A MYPOOKIE. {analysis.genre.toUpperCase()}</small><strong>{analysis.title}</strong><p>{analysis.tagline}</p><b>{senderName}: {analysis.senderRole}<br/>{recipientName}: {analysis.recipientRole}</b><span>NOW PLAYING · FOREVER</span></div>:<div className="song-reveal-card"><div className="song-disc"><i/><span>♪</span></div><small>YOUR BOND SOUNDS LIKE</small><strong>{analysis.title}</strong><em>{analysis.genre}</em><p>{analysis.tagline}</p><div><span>{senderName}</span><b>{analysis.senderRole}</b><span>{recipientName}</span><b>{analysis.recipientRole}</b></div></div>}<p>{analysis.subtitle}</p></div>;
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
  return <button className={`mystery-box-play ${state}`} onClick={open}>{state==="open"&&<div className="box-prize"><span>✦</span><strong>{result}</strong><i>YOUR SURPRISE</i></div>}<div className="box-lid"><i/></div><div className="box-body"><span>{state==="open"?"✦":"♡"}</span></div><strong className="box-instruction">{state==="closed"?"Tap the box":state==="shaking"?"Something is moving…":"Surprise!"}</strong></button>;
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

function GroupBoard({config,giftId,onComplete}:Props){
  const starter=parse<BoardNote[]>(config.boardNotes,[{from:"Someone who loves you",message:"You make every room warmer."}]);
  const [received,setReceived]=useState<BoardNote[]>([]);const [index,setIndex]=useState(0);const [viewed,setViewed]=useState<number[]>([0]);
  useEffect(()=>{if(!giftId)return;fetch(`${api}/api/public/gifts/${giftId}/responses?blockId=groupboard`).then(response=>response.ok?response.json():[]).then((responses:SavedResponse[])=>setReceived(responses.map(response=>({from:response.contributorName,message:response.responseText,photos:parse<string[]>(response.photoUrls,[])})))).catch(()=>{})},[giftId]);
  const notes=[...starter,...received];const current=notes[index]||starter[0];
  function select(next:number){setIndex(next);const nextViewed=viewed.includes(next)?viewed:[...viewed,next];setViewed(nextViewed);playSound("page");if(nextViewed.length===notes.length)onComplete?.()}
  return <div className="group-message-board names-first"><header><span>♡</span><div><small>A CARD FROM EVERYONE</small><strong>{notes.length} people left something for you</strong></div></header><div className="board-names">{notes.map((note,noteIndex)=><button key={`${note.from}-${noteIndex}`} className={noteIndex===index?"active":""} onClick={()=>select(noteIndex)}><span>{note.from.slice(0,1).toUpperCase()}</span>{note.from}</button>)}</div><div className="board-reveal-card"><small>A NOTE FROM</small><strong>{current.from}</strong><p>{current.message}</p>{current.photos&&current.photos.length>0&&<div>{current.photos.map((photo,photoIndex)=><img src={photo} alt={`Memory from ${current.from} ${photoIndex+1}`} key={photoIndex}/>)}</div>}</div><footer><span>{viewed.length}/{notes.length} opened</span><small>Tap every name to complete this moment</small></footer></div>;
}
