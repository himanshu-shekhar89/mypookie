"use client";

import { useEffect, useRef, useState } from "react";
import { BuilderLivePreview } from "./BuilderLivePreview";

type GiftBlock={instanceId?:string;id:string;icon:string;name:string;color:string;message:string;config?:Record<string,string>};
type PublicGift={id:string;senderName?:string;recipientName:string;theme:string;ambience:string;blocksJson:string;scheduledAt?:string|null};
const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";

function parseBlocks(value:string){
  try{const parsed=JSON.parse(value);return (Array.isArray(parsed)?parsed:parsed.blocks||[]) as GiftBlock[]}catch{return[]}
}

export function PublicGiftExperience({token}:{token:string}){
  const [gift,setGift]=useState<PublicGift|null>(null);const [error,setError]=useState(false);const [now,setNow]=useState(0);
  const unlockRefetched=useRef(false);
  const [step,setStep]=useState(0);const [complete,setComplete]=useState<number[]>([]);const [wins,setWins]=useState<string[]>([]);
  useEffect(()=>{fetch(`${api}/api/public/gifts/${token}`).then(response=>{if(!response.ok)throw new Error();return response.json()}).then(setGift).catch(()=>setError(true))},[token]);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),250);return()=>window.clearInterval(timer)},[]);
  useEffect(()=>{
    if(!gift?.scheduledAt||unlockRefetched.current||new Date(gift.scheduledAt).getTime()>now)return;
    unlockRefetched.current=true;
    fetch(`${api}/api/public/gifts/${token}`).then(response=>response.ok?response.json():Promise.reject()).then(setGift).catch(()=>{unlockRefetched.current=false});
  },[gift,now,token]);
  if(error)return <main className="public-gift-loading"><span>♡</span><h1>This gift link isn’t ready.</h1><p>Ask the sender to publish it again.</p></main>;
  if(!gift)return <main className="public-gift-loading"><span>♡</span><p>Preparing something beautiful…</p></main>;
  const reveal=gift.scheduledAt?new Date(gift.scheduledAt).getTime():0;
  if(reveal>now){
    const difference=reveal-now;const days=Math.floor(difference/86400000);const hours=Math.floor(difference/3600000)%24;const minutes=Math.floor(difference/60000)%60;const seconds=Math.floor(difference/1000)%60;
    return <main className="scheduled-gift-lock"><section><span>♡</span><small>A SURPRISE IS WAITING FOR</small><h1>{gift.recipientName}</h1><p>This little world opens in</p><div><b>{days}<i>days</i></b><b>{String(hours).padStart(2,"0")}<i>hours</i></b><b>{String(minutes).padStart(2,"0")}<i>minutes</i></b><b>{String(seconds).padStart(2,"0")}<i>seconds</i></b></div></section></main>;
  }
  const blocks=parseBlocks(gift.blocksJson);const block=blocks[step];const currentComplete=complete.includes(step);
  if(!block)return <main className="public-gift-loading"><span>♡</span><h1>There’s nothing inside yet.</h1></main>;
  return <main className={`recipient-preview public-recipient theme-${gift.theme.toLowerCase().replaceAll(" ","-")}`}><div className="recipient-experience-shell"><div className="preview-count">{step+1} of {blocks.length}</div><BuilderLivePreview key={`${block.instanceId||block.id}-${step}`} block={block} name={gift.recipientName} senderName={gift.senderName||"Someone special"} theme={gift.theme} ambience={gift.ambience} giftId={gift.id} onComplete={()=>setComplete(current=>current.includes(step)?current:[...current,step])} onReward={reward=>setWins(current=>[...current,reward])}/><div className="recipient-progress-gate"><button className="primary recipient-next" disabled={!currentComplete} onClick={()=>{if(step<blocks.length-1)setStep(step+1);else{setStep(0);setComplete([]);setWins([])}}}>{step<blocks.length-1?"Continue to the next moment":"Experience it again"} <span>→</span></button><small className={currentComplete?"ready":""}>{currentComplete?"Moment complete ✓":"Complete this moment to unlock the next one"}</small></div>{wins.length>0&&<div className="public-win-strip"><span>✦</span><strong>{wins.length} surprise{wins.length===1?"":"s"} collected</strong><small>{wins[wins.length-1]}</small></div>}</div></main>;
}
