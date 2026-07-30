"use client";

import { useEffect, useRef, useState } from "react";
import { authHeaders } from "./authClient";
import { playSound } from "./soundFx";

export type AccountProfile={
  email:string;
  displayName:string;
  photoURL:string;
};

type OrderHistoryItem={
  id:string;
  giftId:string;
  title:string;
  recipientName:string;
  amountPaise:number;
  currency:string;
  couponCode:string|null;
  status:string;
  createdAt:string;
  shareToken:string|null;
};

export type SavedDraft={
  id:string;
  title:string;
  senderName:string;
  recipientName:string;
  recipientType:string;
  occasion:string;
  theme:string;
  ambience:string;
  blocksJson:string;
  status:string;
  scheduledAt:string|null;
  updatedAt:string;
};

export function AccountMenu({
  signedIn,
  profile,
  compact=false,
  isAdmin=false,
  onSignIn,
  onLogout,
  onCreate,
  onAdmin,
  onOpenDraft,
}:{
  signedIn:boolean;
  profile:AccountProfile|null;
  compact?:boolean;
  isAdmin?:boolean;
  onSignIn:()=>void;
  onLogout:()=>Promise<void>;
  onCreate:()=>void;
  onAdmin:()=>void;
  onOpenDraft:(draft:SavedDraft)=>void;
}){
  const [open,setOpen]=useState(false);
  const [panel,setPanel]=useState<"account"|"orders"|"drafts">("account");
  const [orders,setOrders]=useState<OrderHistoryItem[]>([]);
  const [drafts,setDrafts]=useState<SavedDraft[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const root=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    function close(event:PointerEvent){
      if(root.current&&!root.current.contains(event.target as Node)){setOpen(false);setPanel("account")}
    }
    function escape(event:KeyboardEvent){
      if(event.key==="Escape"){setOpen(false);setPanel("account")}
    }
    document.addEventListener("pointerdown",close);
    document.addEventListener("keydown",escape);
    return()=>{document.removeEventListener("pointerdown",close);document.removeEventListener("keydown",escape)};
  },[]);

  async function toggle(){
    playSound("tile");
    if(!signedIn){onSignIn();return}
    setOpen(value=>!value);
    setPanel("account");
  }

  async function loadOrders(){
    playSound("reveal");
    setPanel("orders");
    setLoading(true);
    setError("");
    try{
      const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
      const response=await fetch(`${api}/api/orders`,{headers:await authHeaders()});
      if(!response.ok)throw new Error();
      setOrders(await response.json() as OrderHistoryItem[]);
    }catch{
      setError("We couldn’t load your orders. Please try again.");
    }finally{
      setLoading(false);
    }
  }

  async function loadDrafts(){
    playSound("reveal");
    setPanel("drafts");
    setLoading(true);
    setError("");
    try{
      const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
      const response=await fetch(`${api}/api/gifts`,{headers:await authHeaders()});
      if(!response.ok)throw new Error();
      const gifts=await response.json() as SavedDraft[];
      setDrafts(gifts.filter(gift=>gift.status==="DRAFT"));
    }catch{
      setError("We couldn’t load your drafts. Please try again.");
    }finally{
      setLoading(false);
    }
  }

  const label=profile?.displayName||profile?.email.split("@")[0]||"Profile";
  const initial=label.charAt(0).toUpperCase()||"♡";

  return <div className={`account-menu ${compact?"compact":""}`} ref={root}>
    <button className={compact?"avatar account-trigger":"signin account-trigger"} onClick={()=>void toggle()} aria-haspopup="menu" aria-expanded={open}>
      {profile?.photoURL?<img src={profile.photoURL} alt=""/>:<b>{signedIn?initial:"♡"}</b>}
      {!compact&&<><span>{signedIn?label:"Hop in"}</span><i>{signedIn?"⌄":"→"}</i></>}
    </button>
    {open&&<section className={`account-popover ${panel!=="account"?"show-orders":""}`} role="menu">
      <header>
        {profile?.photoURL?<img src={profile.photoURL} alt=""/>:<b>{initial}</b>}
        <span><strong>{profile?.displayName||"Your mypookie. account"}</strong><small>{profile?.email}</small></span>
        <button onClick={()=>{setOpen(false);setPanel("account")}} aria-label="Close account menu">×</button>
      </header>
      {panel==="account"?<div className="account-actions">
        <button onClick={()=>void loadDrafts()}><i>✎</i><span><strong>Saved drafts</strong><small>Continue gifts you haven’t published</small></span><b>→</b></button>
        <button onClick={()=>void loadOrders()}><i>⌁</i><span><strong>Order history</strong><small>Receipts and published gifts</small></span><b>→</b></button>
        <button onClick={()=>{setOpen(false);onCreate()}}><i>＋</i><span><strong>Create a new gift</strong><small>Start another little world</small></span><b>→</b></button>
        {isAdmin&&<button onClick={()=>{setOpen(false);onAdmin()}}><i>⚙</i><span><strong>Admin console</strong><small>Manage orders, coupons and pricing</small></span><b>→</b></button>}
        <button className="account-logout" onClick={()=>{playSound("page");void onLogout().then(()=>setOpen(false))}}><i>↗</i><span><strong>Log out</strong><small>Sign out of this device</small></span></button>
      </div>:panel==="orders"?<div className="order-history">
        <button className="order-back" onClick={()=>setPanel("account")}>← Account</button>
        <div className="order-history-title"><small>YOUR PURCHASES</small><strong>Order history</strong></div>
        {loading&&<div className="order-state">Loading your gifts…</div>}
        {error&&<div className="order-state error">{error}<button onClick={()=>void loadOrders()}>Try again</button></div>}
        {!loading&&!error&&orders.length===0&&<div className="order-state"><span>♡</span><strong>No orders yet</strong><small>Your completed checkouts will appear here.</small></div>}
        {!loading&&!error&&orders.map(order=><article className="order-row" key={order.id}>
          <i>{order.status.startsWith("PAID")?"✓":"◷"}</i>
          <div><small>{new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} · {order.status.replaceAll("_"," ")}</small><strong>{order.title}</strong><span>For {order.recipientName} · #{order.id.slice(0,8).toUpperCase()}</span></div>
          <b>₹{(order.amountPaise/100).toLocaleString("en-IN")}</b>
          {order.shareToken&&<a href={`/?gift=${order.shareToken}`}>Open gift ↗</a>}
        </article>)}
      </div>:<div className="order-history draft-history">
        <button className="order-back" onClick={()=>setPanel("account")}>← Account</button>
        <div className="order-history-title"><small>KEEP CREATING</small><strong>Saved drafts</strong></div>
        {loading&&<div className="order-state">Loading your drafts…</div>}
        {error&&<div className="order-state error">{error}<button onClick={()=>void loadDrafts()}>Try again</button></div>}
        {!loading&&!error&&drafts.length===0&&<div className="order-state"><span>✎</span><strong>No saved drafts</strong><small>Use “Save draft” in the editor and it will appear here.</small></div>}
        {!loading&&!error&&drafts.map(draft=><button className="draft-row" key={draft.id} onClick={()=>{setOpen(false);setPanel("account");onOpenDraft(draft)}}>
          <i>✎</i><span><small>UPDATED {new Date(draft.updatedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</small><strong>{draft.title}</strong><b>For {draft.recipientName} · {draft.occasion}</b></span><em>Continue →</em>
        </button>)}
      </div>}
    </section>}
  </div>;
}
