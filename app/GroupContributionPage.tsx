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

export function GroupContributionPage({giftId}:{giftId:string}){
  const [name,setName]=useState("");const [message,setMessage]=useState("");const [photos,setPhotos]=useState<string[]>([]);
  const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle");
  const [recipient,setRecipient]=useState("someone special");const [occasion,setOccasion]=useState("");
  useEffect(()=>{fetch(`${api}/api/public/gifts/${giftId}/responses/context`).then(response=>response.ok?response.json():null).then(context=>{if(context){setRecipient(context.recipientName);setOccasion(context.occasion)}}).catch(()=>{})},[giftId]);
  async function add(files:FileList|null){if(!files)return;const remaining=3-photos.length;const additions=await Promise.all(Array.from(files).slice(0,remaining).map(photoData));setPhotos(current=>[...current,...additions].slice(0,3))}
  async function send(){
    if(!name.trim()||!message.trim())return;
    setState("sending");
    try{
      const response=await fetch(`${api}/api/public/gifts/${giftId}/responses`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({blockId:"groupboard",responseType:"GROUP_MESSAGE",contributorName:name.trim(),responseText:message.trim(),photoUrls:photos})});
      if(!response.ok)throw new Error();
      setState("sent");playSound("win");
    }catch{setState("error")}
  }
  if(state==="sent")return <main className="contribution-page"><section className="contribution-card sent"><span>♡</span><small>MESSAGE DELIVERED</small><h1>You’re part of their surprise.</h1><p>Your note is safely tucked into the group card for them to discover.</p></section></main>;
  return <main className="contribution-page"><section className="contribution-card"><button className="brand"><span className="brand-heart">♥</span> mypookie.</button><div className="contribution-recipient"><small>YOU’RE WRITING A MESSAGE FOR</small><strong>{recipient}</strong>{occasion&&<span>{occasion}</span>}</div><h1>Say something {recipient} will keep.</h1><p>Your name appears as a sealed card. {recipient} will tap it to reveal your message and photos.</p><label>Your name<input maxLength={80} value={name} onChange={event=>setName(event.target.value)} placeholder={`How ${recipient} knows you`}/></label><label>Your message for {recipient}<textarea rows={5} maxLength={500} value={message} onChange={event=>setMessage(event.target.value)} placeholder={`Write ${recipient} a memory, wish, joke or little note…`}/><b>{message.length}/500</b></label><label className="contribution-upload">＋<strong>Attach photos</strong><span>Optional · up to 3</span><input type="file" accept="image/*" multiple onChange={event=>add(event.target.files)}/></label>{photos.length>0&&<div className="contribution-photos">{photos.map((photo,index)=><button key={index} onClick={()=>setPhotos(current=>current.filter((_,itemIndex)=>itemIndex!==index))}><img src={photo} alt={`Attachment ${index+1}`}/><span>×</span></button>)}</div>}<button className="contribution-send" disabled={!name.trim()||!message.trim()||state==="sending"} onClick={send}>{state==="sending"?"Sending your note…":`Send it to ${recipient} →`}</button>{state==="error"&&<output>That didn’t send yet. Please try once more.</output>}<em>Only the gift sender and {recipient} will see your contribution.</em></section></main>;
}
