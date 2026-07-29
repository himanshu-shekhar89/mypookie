"use client";

import { useState } from "react";

type CheckoutBlock={id:string;icon:string;name:string;price:number;color:string};

export function CheckoutPage({blocks,name,occasion,subtotal,revealAt,onRevealAt,onBack,onPlaceOrder}:{blocks:CheckoutBlock[];name:string;occasion:string;subtotal:number;revealAt:string;onRevealAt:(value:string)=>void;onBack:()=>void;onPlaceOrder:(coupon:string)=>Promise<string|null>}){
  const [coupon,setCoupon]=useState("");const [applied,setApplied]=useState("");const [couponMessage,setCouponMessage]=useState("");const [processing,setProcessing]=useState(false);const [shareLink,setShareLink]=useState("");
  const [scheduleMode,setScheduleMode]=useState(revealAt?"Schedule reveal":"Reveal immediately");
  const normalized=applied.toUpperCase();
  const discount=normalized==="POOKIE10"?Math.round(subtotal*.1):normalized==="FIRSTGIFT"?Math.min(Math.round(subtotal*.15),150):normalized==="LOVE50"?Math.min(50,subtotal):0;
  const total=Math.max(0,subtotal-discount);

  function applyCoupon(){
    const code=coupon.trim().toUpperCase();
    if(["POOKIE10","FIRSTGIFT","LOVE50"].includes(code)){setApplied(code);setCouponMessage(`${code} applied — you saved ₹${code==="POOKIE10"?Math.round(subtotal*.1):code==="FIRSTGIFT"?Math.min(Math.round(subtotal*.15),150):Math.min(50,subtotal)}.`)}
    else{setApplied("");setCouponMessage("That coupon isn’t active. Try POOKIE10.")}
  }

  async function place(){
    if(scheduleMode==="Schedule reveal"&&!revealAt)return;
    setProcessing(true);
    const link=await onPlaceOrder(applied);
    setProcessing(false);
    if(link)setShareLink(link);
  }

  if(shareLink)return <main className="checkout-page"><section className="checkout-success"><span>♡</span><small>YOUR GIFT IS READY</small><h1>A little world for {name}.</h1><p>{revealAt?`It stays locked until ${new Intl.DateTimeFormat([], {dateStyle:"long",timeStyle:"short"}).format(new Date(revealAt))}.`:"They can open it as soon as you share the link."}</p><label>Private recipient link<div><input readOnly value={shareLink}/><button onClick={()=>navigator.clipboard.writeText(shareLink)}>Copy link</button></div></label><a href={shareLink} target="_blank" rel="noreferrer">Open recipient experience ↗</a></section></main>;

  return <main className="checkout-page"><header className="checkout-header"><button className="brand"><span className="brand-heart">♥</span> mypookie.</button><button onClick={onBack}>← Back to editor</button></header><div className="checkout-layout"><section className="checkout-main"><small>FINAL STEP</small><h1>When should {name}’s gift come alive?</h1><p>Choose the reveal moment, apply a coupon and review every experience before creating the private link.</p><div className="reveal-choice"><button className={scheduleMode==="Reveal immediately"?"active":""} onClick={()=>{setScheduleMode("Reveal immediately");onRevealAt("")}}><span>✦</span><strong>Reveal immediately</strong><small>The link opens the gift right away.</small></button><button className={scheduleMode==="Schedule reveal"?"active":""} onClick={()=>setScheduleMode("Schedule reveal")}><span>◷</span><strong>Schedule reveal</strong><small>Show only their name and countdown until then.</small></button></div>{scheduleMode==="Schedule reveal"&&<label className="checkout-field">Reveal date and time<input type="datetime-local" value={revealAt} min={new Date().toISOString().slice(0,16)} onChange={event=>onRevealAt(event.target.value)}/><small>Uses your current timezone.</small></label>}<div className="checkout-review"><header><strong>{blocks.length} moments for {name}</strong><span>{occasion}</span></header>{blocks.map((block,index)=><article key={block.id}><i className={block.color}>{block.icon}</i><div><small>MOMENT {index+1}</small><strong>{block.name}</strong></div><b>₹{block.price}</b></article>)}</div></section><aside className="order-summary"><small>ORDER SUMMARY</small><h2>Your interactive gift</h2><div className="summary-line"><span>{blocks.length} customized moments</span><strong>₹{subtotal}</strong></div><div className="coupon-box"><label>Coupon code<div><input value={coupon} onChange={event=>setCoupon(event.target.value.toUpperCase())} onKeyDown={event=>event.key==="Enter"&&applyCoupon()} placeholder="POOKIE10"/><button onClick={applyCoupon}>Apply</button></div></label>{couponMessage&&<p className={applied?"success":""}>{couponMessage}</p>}</div>{discount>0&&<div className="summary-line discount"><span>Coupon discount</span><strong>−₹{discount}</strong></div>}<div className="summary-total"><span>Total</span><strong>₹{total}</strong></div><button className="place-order" disabled={processing||!blocks.length||(scheduleMode==="Schedule reveal"&&!revealAt)} onClick={place}>{processing?"Creating your private gift…":"Create gift & private link →"}</button><p className="checkout-security">Secure demo checkout · No payment information is collected yet.</p></aside></div></main>;
}
