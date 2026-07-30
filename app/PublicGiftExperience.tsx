"use client";

import { useEffect, useRef, useState } from "react";
import { BuilderLivePreview } from "./BuilderLivePreview";

type GiftBlock={instanceId?:string;id:string;icon:string;name:string;color:string;message:string;config?:Record<string,string>};
type PublicGift={id:string;senderName?:string;recipientName:string;theme:string;ambience:string;blocksJson:string;scheduledAt?:string|null};
type CompatibilityReport={score:number;matches:number;total:number;label:string;answers:Array<{prompt:string;senderChoice:string;recipientChoice:string;match:boolean}>};
const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";

function parseBlocks(value:string){
  try{const parsed=JSON.parse(value);return (Array.isArray(parsed)?parsed:parsed.blocks||[]) as GiftBlock[]}catch{return[]}
}

export function PublicGiftExperience({token}:{token:string}){
  const [gift,setGift]=useState<PublicGift|null>(null);const [error,setError]=useState(false);const [now,setNow]=useState(0);
  const unlockRefetched=useRef(false);
  const [step,setStep]=useState(0);const [complete,setComplete]=useState<number[]>([]);const [wins,setWins]=useState<string[]>([]);
  const [finished,setFinished]=useState(false);const [reportPin,setReportPin]=useState("");const [report,setReport]=useState<CompatibilityReport|null>(null);const [reportState,setReportState]=useState<"idle"|"loading"|"wrong"|"waiting">("idle");
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
  const reportBlock=blocks.find(item=>item.id==="thisorthat"&&item.config?.compatibilityEnabled==="true");
  async function unlockReport(){
    if(!reportBlock||!/^\d{4,6}$/.test(reportPin))return;
    setReportState("loading");
    const response=await fetch(`${api}/api/public/gifts/${gift!.id}/compatibility-report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:reportPin,blockId:reportBlock.instanceId||reportBlock.id})}).catch(()=>null);
    if(response?.ok){setReport(await response.json());setReportState("idle");return}
    setReportState(response?.status===409?"waiting":"wrong");
  }
  if(finished)return <main className={`recipient-preview public-recipient theme-${gift.theme.toLowerCase().replaceAll(" ","-")}`}><section className="gift-finale"><span>♡</span><small>EVERY MOMENT COMPLETE</small><h1>This little world is now yours.</h1><p>{wins.length?`You collected ${wins.length} surprise${wins.length===1?"":"s"} along the way.`:`Made for ${gift.recipientName}, with care.`}</p>{reportBlock&&<div className="compatibility-report-lock">{report?<><div className="report-score"><b>{report.score}%</b><div><small>YOUR COMPATIBILITY STORY</small><strong>{report.label}</strong><span>{report.matches} of {report.total} choices matched</span></div></div><div className="report-answer-list">{report.answers.map((answer,index)=><article className={answer.match?"match":""} key={index}><small>{answer.prompt}</small><div><span>Sender: <b>{answer.senderChoice}</b></span><span>Recipient: <b>{answer.recipientChoice}</b></span></div><em>{answer.match?"Same choice ♡":"A lovely difference ✦"}</em></article>)}</div></>:<><small>PRIVATE SENDER REPORT</small><h2>Unlock the compatibility report</h2><p>The sender’s checkout PIN is required. Recipient answers stay hidden without it.</p><div><input inputMode="numeric" maxLength={6} value={reportPin} onChange={event=>setReportPin(event.target.value.replace(/\D/g,"").slice(0,6))} onKeyDown={event=>event.key==="Enter"&&void unlockReport()} placeholder="Enter 4–6 digit PIN"/><button onClick={()=>void unlockReport()} disabled={reportState==="loading"||reportPin.length<4}>{reportState==="loading"?"Checking…":"View report"}</button></div>{reportState==="wrong"&&<output>That PIN is not correct.</output>}{reportState==="waiting"&&<output>The recipient needs to finish This or That first.</output>}</>}</div>}<button className="replay-gift" onClick={()=>{setFinished(false);setStep(0);setComplete([]);setWins([]);setReport(null);setReportPin("");setReportState("idle")}}>Experience the gift again</button></section></main>;
  if(!block)return <main className="public-gift-loading"><span>♡</span><h1>There’s nothing inside yet.</h1></main>;
  return <main className={`recipient-preview public-recipient theme-${gift.theme.toLowerCase().replaceAll(" ","-")}`}><div className="recipient-experience-shell"><div className="preview-count">{step+1} of {blocks.length}</div><BuilderLivePreview key={`${block.instanceId||block.id}-${step}`} block={block} name={gift.recipientName} senderName={gift.senderName||"Someone special"} theme={gift.theme} ambience={gift.ambience} giftId={gift.id} onComplete={()=>setComplete(current=>current.includes(step)?current:[...current,step])} onReward={reward=>setWins(current=>[...current,reward])}/><div className="recipient-progress-gate"><button className="primary recipient-next" disabled={!currentComplete} onClick={()=>{if(step<blocks.length-1)setStep(step+1);else setFinished(true)}}>{step<blocks.length-1?"Continue to the next moment":"Finish this experience"} <span>→</span></button><small className={currentComplete?"ready":""}>{currentComplete?"Moment complete ✓":"Complete this moment to unlock the next one"}</small></div>{wins.length>0&&<div className="public-win-strip"><span>✦</span><strong>{wins.length} surprise{wins.length===1?"":"s"} collected</strong><small>{wins[wins.length-1]}</small></div>}</div></main>;
}
