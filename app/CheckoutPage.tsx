"use client";

import { useState } from "react";

type CheckoutBlock={id:string;icon:string;name:string;price:number;color:string};
export type PaymentOrder={localOrderId:string;providerOrderId:string;amountPaise:number;currency:string;keyId:string;demoMode:boolean};
export type RazorpayResult={razorpay_order_id:string;razorpay_payment_id:string;razorpay_signature:string};
type RazorpayInstance={open:()=>void;on:(event:string,handler:(response:{error?:{description?:string}})=>void)=>void};

declare global {
  interface Window { Razorpay?:new(options:Record<string,unknown>)=>RazorpayInstance }
}

function loadRazorpay(){
  return new Promise<boolean>(resolve=>{
    if(window.Razorpay){resolve(true);return}
    const existing=document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if(existing){existing.addEventListener("load",()=>resolve(true),{once:true});existing.addEventListener("error",()=>resolve(false),{once:true});return}
    const script=document.createElement("script");
    script.src="https://checkout.razorpay.com/v1/checkout.js";
    script.onload=()=>resolve(true);
    script.onerror=()=>resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutPage({blocks,name,occasion,subtotal,revealAt,onRevealAt,onBack,onCreateOrder,onVerifyPayment,onDemoComplete}:{blocks:CheckoutBlock[];name:string;occasion:string;subtotal:number;revealAt:string;onRevealAt:(value:string)=>void;onBack:()=>void;onCreateOrder:(coupon:string)=>Promise<PaymentOrder|null>;onVerifyPayment:(orderId:string,result:RazorpayResult)=>Promise<string|null>;onDemoComplete:(orderId:string)=>Promise<string|null>}){
  const [coupon,setCoupon]=useState("");const [applied,setApplied]=useState("");const [couponMessage,setCouponMessage]=useState("");const [processing,setProcessing]=useState(false);const [shareLink,setShareLink]=useState("");const [paymentError,setPaymentError]=useState("");
  const [pendingOrder,setPendingOrder]=useState<PaymentOrder|null>(null);
  const [scheduleMode,setScheduleMode]=useState(revealAt?"Schedule reveal":"Reveal immediately");
  const normalized=applied.toUpperCase();
  const discount=normalized==="POOKIE10"?Math.round(subtotal*.1):normalized==="FIRSTGIFT"?Math.min(Math.round(subtotal*.15),150):normalized==="LOVE50"?Math.min(50,subtotal):0;
  const total=Math.max(0,subtotal-discount);

  function applyCoupon(){
    const code=coupon.trim().toUpperCase();
    if(["POOKIE10","FIRSTGIFT","LOVE50"].includes(code)){setApplied(code);setCouponMessage(`${code} applied — you saved ₹${code==="POOKIE10"?Math.round(subtotal*.1):code==="FIRSTGIFT"?Math.min(Math.round(subtotal*.15),150):Math.min(50,subtotal)}.`)}
    else{setApplied("");setCouponMessage("That coupon isn’t active. Try POOKIE10.")}
  }

  async function verify(order:PaymentOrder,result:RazorpayResult){
    setProcessing(true);setPaymentError("");
    const link=await onVerifyPayment(order.localOrderId,result);
    setProcessing(false);
    if(link)setShareLink(link);else setPaymentError("We couldn’t verify that payment. No gift was published or charged twice.");
  }

  async function pay(){
    if(scheduleMode==="Schedule reveal"&&!revealAt)return;
    setProcessing(true);setPaymentError("");
    const order=await onCreateOrder(applied);
    if(!order){setProcessing(false);setPaymentError("We couldn’t prepare checkout. Please try again.");return}
    setPendingOrder(order);
    if(order.demoMode){setProcessing(false);return}
    const ready=await loadRazorpay();
    if(!ready||!window.Razorpay){setProcessing(false);setPaymentError("Secure checkout could not load. Please check your connection and try again.");return}
    const checkout=new window.Razorpay({
      key:order.keyId,
      amount:order.amountPaise,
      currency:order.currency,
      name:"mypookie.",
      description:`${occasion} gift for ${name}`,
      order_id:order.providerOrderId,
      theme:{color:"#9c3157"},
      retry:{enabled:true},
      modal:{ondismiss:()=>{setProcessing(false);setPaymentError("Payment was not completed. Your gift remains safely saved as a draft.")}},
      handler:(result:RazorpayResult)=>void verify(order,result),
      notes:{recipient:name,occasion}
    });
    checkout.on("payment.failed",response=>{setProcessing(false);setPaymentError(response.error?.description||"Payment failed. Please try another method.")});
    checkout.open();
  }

  async function completeDemo(){
    if(!pendingOrder)return;
    setProcessing(true);setPaymentError("");
    const link=await onDemoComplete(pendingOrder.localOrderId);
    setProcessing(false);
    if(link)setShareLink(link);else setPaymentError("The test checkout could not be completed.");
  }

  if(shareLink)return <main className="checkout-page"><section className="checkout-success"><span>♡</span><small>PAYMENT COMPLETE · YOUR GIFT IS READY</small><h1>A little world for {name}.</h1><p>{revealAt?`It stays locked until ${new Intl.DateTimeFormat([], {dateStyle:"long",timeStyle:"short"}).format(new Date(revealAt))}.`:"They can open it as soon as you share the link."}</p><label>Private recipient link<div><input readOnly value={shareLink}/><button onClick={()=>navigator.clipboard.writeText(shareLink)}>Copy link</button></div></label><a href={shareLink} target="_blank" rel="noreferrer">Open recipient experience ↗</a></section></main>;

  return <main className="checkout-page"><header className="checkout-header"><button className="brand"><span className="brand-heart">♥</span> mypookie.</button><button onClick={onBack}>← Back to editor</button></header><div className="checkout-layout"><section className="checkout-main"><small>CHECKOUT</small><h1>Choose when {name} can open it.</h1><p>Set the reveal moment, apply a coupon, then continue directly to secure Razorpay payment.</p><div className="reveal-choice"><button className={scheduleMode==="Reveal immediately"?"active":""} onClick={()=>{setScheduleMode("Reveal immediately");onRevealAt("")}}><span>✦</span><strong>Reveal immediately</strong><small>The private link opens the gift right away.</small></button><button className={scheduleMode==="Schedule reveal"?"active":""} onClick={()=>setScheduleMode("Schedule reveal")}><span>◷</span><strong>Schedule reveal</strong><small>Show only their name and countdown until then.</small></button></div>{scheduleMode==="Schedule reveal"&&<label className="checkout-field">Reveal date and time<input type="datetime-local" value={revealAt} onChange={event=>onRevealAt(event.target.value)}/><small>Uses your current timezone.</small></label>}<div className="checkout-review"><header><strong>{blocks.length} moments for {name}</strong><span>{occasion}</span></header>{blocks.map((block,index)=><article key={block.id}><i className={block.color}>{block.icon}</i><div><small>MOMENT {index+1}</small><strong>{block.name}</strong></div><b>₹{block.price}</b></article>)}</div></section><aside className="order-summary"><small>SECURE PAYMENT</small><h2>Your interactive gift</h2><div className="summary-line"><span>{blocks.length} customized moments</span><strong>₹{subtotal}</strong></div><div className="coupon-box"><label>Coupon code<div><input value={coupon} onChange={event=>setCoupon(event.target.value.toUpperCase())} onKeyDown={event=>event.key==="Enter"&&applyCoupon()} placeholder="POOKIE10"/><button onClick={applyCoupon}>Apply</button></div></label>{couponMessage&&<p className={applied?"success":""}>{couponMessage}</p>}</div>{discount>0&&<div className="summary-line discount"><span>Coupon discount</span><strong>−₹{discount}</strong></div>}<div className="summary-total"><span>Total payable</span><strong>₹{total}</strong></div>{pendingOrder?.demoMode?<div className="demo-payment"><span>R</span><strong>Razorpay-ready test checkout</strong><p>Your integration is complete. Add the Razorpay keys to switch this button to the real secure payment window.</p><button className="place-order" disabled={processing} onClick={completeDemo}>{processing?"Completing test payment…":total===0?"Complete free checkout →":"Complete test payment →"}</button></div>:<button className="place-order" disabled={processing||!blocks.length||(scheduleMode==="Schedule reveal"&&!revealAt)} onClick={pay}>{processing?"Opening secure payment…":total===0?"Complete free checkout →":`Pay ₹${total} securely →`}</button>}{paymentError&&<output className="payment-error">{paymentError}</output>}<div className="razorpay-trust"><b>R</b><span><strong>Secured by Razorpay</strong><small>UPI · Cards · Netbanking · Wallets</small></span></div><p className="checkout-security">Your gift is published only after server-side payment verification.</p></aside></div></main>;
}
