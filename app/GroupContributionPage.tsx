"use client";

import { useEffect, useState } from "react";
import { playSound } from "./soundFx";

const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";

async function photoData(file:File){
  const source=URL.createObjectURL(file);
  try{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const element=new Image();element.onload=()=>resolve(element);element.onerror=reject;element.src=source});
    const scale=Math.min(1,700/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    canvas.getContext("2d")?.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL("image/jpeg",.65);
  }finally{URL.revokeObjectURL(source)}
}

export function GroupContributionPage({inviteToken}:{inviteToken:string}){
  const [name,setName]=useState("");const [message,setMessage]=useState("");const [photos,setPhotos]=useState<string[]>([]);
  const [state,setState]=useState<"claiming"|"idle"|"sending"|"sent"|"error"|"expired">("claiming");
  const [recipient,setRecipient]=useState("someone special");const [occasion,setOccasion]=useState("");
  const [claimToken,setClaimToken]=useState("");
  useEffect(()=>{
    const storageKey=`mypookie-contribution-${inviteToken}`;
    const saved=window.sessionStorage.getItem(storageKey)||"";
    fetch(`${api}/api/public/contributions/${inviteToken}/claim`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({claimToken:saved||null})})
      .then(async response=>{if(response.status===410)throw new Error("expired");if(!response.ok)throw new Error("error");return response.json()})
      .then(context=>{setRecipient(context.recipientName);setOccasion(context.occasion);setClaimToken(context.claimToken);window.sessionStorage.setItem(storageKey,context.claimToken);setState("idle")})
      .catch(error=>setState(error.message==="expired"?"expired":"error"));
  },[inviteToken]);
  async function add(files:FileList|null){if(!files)return;const remaining=3-photos.length;const additions=await Promise.all(Array.from(files).slice(0,remaining).map(photoData));setPhotos(current=>[...current,...additions].slice(0,3))}
  async function send(){
    if(!name.trim()||!message.trim())return;
    setState("sending");
    try{
      const response=await fetch(`${api}/api/public/contributions/${inviteToken}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({claimToken,contributorName:name.trim(),responseText:message.trim(),photoUrls:photos})});
      if(response.status===410){setState("expired");return}
      if(!response.ok)throw new Error();
      window.sessionStorage.removeItem(`mypookie-contribution-${inviteToken}`);
      setState("sent");playSound("win");
    }catch{setState("error")}
  }
  if(state==="claiming")return <main className="contribution-loading">♡</main>;
  if(state==="expired")return <main className="contribution-page"><section className="contribution-card sent expired"><span>⌁</span><small>ONE-TIME LINK CLOSED</small><h1>This invitation has expired.</h1><p>Contribution links work once and close immediately after a message is sent. Ask the gift sender for a fresh link if you still need one.</p></section></main>;
  if(state==="error"&&!claimToken)return <main className="contribution-page"><section className="contribution-card sent expired"><span>♡</span><small>LINK UNAVAILABLE</small><h1>We couldn’t open this invitation.</h1><p>Please check your connection or ask the sender for a fresh one-time link.</p></section></main>;
  if(state==="sent")return <main className="contribution-page"><section className="contribution-card sent"><span>♡</span><small>MESSAGE DELIVERED</small><h1>You’re part of their surprise.</h1><p>Your note is safely tucked into the group card for them to discover.</p></section></main>;
  return <main className="contribution-page"><section className="contribution-card"><button className="brand"><span className="brand-heart">♥</span> mypookie.</button><div className="one-time-notice"><span>1</span><div><strong>One-time private invitation</strong><small>This link is locked to this browser and closes as soon as you send.</small></div></div><div className="contribution-recipient"><small>YOU’RE WRITING A MESSAGE FOR</small><strong>{recipient}</strong>{occasion&&<span>{occasion}</span>}</div><h1>Say something {recipient} will keep.</h1><p>Your name appears as a sealed card. {recipient} will tap it to reveal your message and photos.</p><label>Your name<input maxLength={80} value={name} onChange={event=>setName(event.target.value)} placeholder={`How ${recipient} knows you`}/></label><label>Your message for {recipient}<textarea rows={5} maxLength={500} value={message} onChange={event=>setMessage(event.target.value)} placeholder={`Write ${recipient} a memory, wish, joke or little note…`}/><b>{message.length}/500</b></label><label className="contribution-upload">＋<strong>Attach photos</strong><span>Optional · up to 3</span><input type="file" accept="image/*" multiple onChange={event=>add(event.target.files)}/></label>{photos.length>0&&<div className="contribution-photos">{photos.map((photo,index)=><button key={index} onClick={()=>setPhotos(current=>current.filter((_,itemIndex)=>itemIndex!==index))}><img src={photo} alt={`Attachment ${index+1}`}/><span>×</span></button>)}</div>}<button className="contribution-send" disabled={!name.trim()||!message.trim()||state==="sending"} onClick={send}>{state==="sending"?"Sending your note…":`Send it to ${recipient} →`}</button>{state==="error"&&<output>That didn’t send yet. Please try once more.</output>}<em>Only the gift sender and {recipient} will see your contribution.</em></section></main>;
}
