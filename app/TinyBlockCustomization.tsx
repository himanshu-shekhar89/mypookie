"use client";

import { useEffect, useState } from "react";
import { authHeaders } from "./authClient";

type Props = {
  id: string;
  config: Record<string,string>;
  giftId?:string;
  onConfig: (key:string,value:string)=>void;
};

type Pair = { left:string; right:string };
type PairPhoto = { id:string; image:string; caption:string };
type Milestone = { year:string; label:string };
type BoardNote = { from:string; message:string };
type SavedResponse = { id:string; contributorName:string; responseText:string; photoUrls:string; createdAt:string };
const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";

function parse<T>(value:string|undefined,fallback:T):T {
  try { return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}

async function imageToDataUrl(file:File){
  const source=URL.createObjectURL(file);
  try{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const element=new Image();element.onload=()=>resolve(element);element.onerror=reject;element.src=source});
    const scale=Math.min(1,800/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    canvas.getContext("2d")?.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL("image/jpeg",.78);
  }finally{URL.revokeObjectURL(source)}
}

function Section({title,hint,children}:{title:string;hint:string;children:React.ReactNode}){
  return <section className="dedicated-customization"><div className="dedicated-title"><strong>{title}</strong><span>{hint}</span></div>{children}</section>;
}

function Lines({label,configKey,value,max,onConfig}:{label:string;configKey:string;value:string;max:number;onConfig:Props["onConfig"]}){
  const count=value.split("\n").map(item=>item.trim()).filter(Boolean).length;
  return <label className="field">{label}<textarea rows={Math.min(max,6)} value={value} onChange={event=>onConfig(configKey,event.target.value.split("\n").slice(0,max).join("\n"))}/><small>{count}/{max}</small></label>;
}

export function TinyBlockCustomization({id,config,giftId,onConfig}:Props){
  if(id==="wouldrather"){
    const pairs=parse<Pair[]>(config.pairs,[{left:"Sunrise date",right:"Midnight drive"}]).slice(0,8);
    const update=(next:Pair[])=>onConfig("pairs",JSON.stringify(next.slice(0,8)));
    return <Section title="Would You Rather" hint="Each card has two equally tempting choices"><div className="tiny-editor-list">{pairs.map((pair,index)=><article key={index}><header><strong>Card {index+1}</strong><button disabled={pairs.length===1} onClick={()=>update(pairs.filter((_,itemIndex)=>itemIndex!==index))}>Remove</button></header><div><label className="field">This<input maxLength={40} value={pair.left} onChange={event=>update(pairs.map((item,itemIndex)=>itemIndex===index?{...item,left:event.target.value}:item))}/></label><label className="field">Or that<input maxLength={40} value={pair.right} onChange={event=>update(pairs.map((item,itemIndex)=>itemIndex===index?{...item,right:event.target.value}:item))}/></label></div></article>)}</div><button className="add-collection-item" disabled={pairs.length>=8} onClick={()=>update([...pairs,{left:"",right:""}])}>＋ Add either/or card</button></Section>;
  }
  if(id==="neverhave")return <Section title="Never Have I Ever" hint="Light confessions—nothing embarrassing unless you want it"><Lines label="Statements · one per line" configKey="statements" value={config.statements||""} max={10} onConfig={onConfig}/><label className="tiny-check"><input type="checkbox" checked={config.shareSummary!=="false"} onChange={event=>onConfig("shareSummary",String(event.target.checked))}/> Add their final picks to the result summary</label></Section>;
  if(id==="truthdare")return <Section title="Truth or Dare Roulette" hint="Truth answers are saved for the sender"><Lines label="Truth prompts" configKey="truths" value={config.truths||""} max={8} onConfig={onConfig}/><Lines label="Dare prompts" configKey="dares" value={config.dares||""} max={8} onConfig={onConfig}/><ResponseInbox giftId={giftId} blockId="truthdare" title="Saved truth answers"/></Section>;
  if(id==="tapheart")return <Section title="Tap the Heart" hint="A quick rhythm burst with a final bragging-rights score"><label className="field">Round length<select value={config.duration||"10"} onChange={event=>onConfig("duration",event.target.value)}><option>5</option><option>10</option><option>15</option></select><small>seconds</small></label><label className="field">Score heading<input maxLength={55} value={config.scoreTitle||""} onChange={event=>onConfig("scoreTitle",event.target.value)}/></label></Section>;
  if(id==="matchpair")return <MatchPairEditor config={config} onConfig={onConfig}/>;
  if(id==="countdownus")return <Section title="Countdown to Us" hint="A live counter that keeps moving every second"><label className="field">Your special date<input type="datetime-local" value={config.sinceDate||""} onChange={event=>onConfig("sinceDate",event.target.value)}/></label><label className="field">Counter label<input maxLength={60} value={config.counterLabel||""} onChange={event=>onConfig("counterLabel",event.target.value)}/></label></Section>;
  if(id==="constellation")return <Section title="Constellation Map" hint="Name one star and attach a message to it"><label className="field">Star name<input maxLength={40} value={config.starName||""} onChange={event=>onConfig("starName",event.target.value)}/></label><label className="field">Message<textarea rows={3} maxLength={120} value={config.starMessage||""} onChange={event=>onConfig("starMessage",event.target.value)}/><small>{(config.starMessage||"").length}/120</small></label><label className="field">Sky style<select value={config.skyStyle||"Midnight rose"} onChange={event=>onConfig("skyStyle",event.target.value)}><option>Midnight rose</option><option>Deep indigo</option><option>Golden dusk</option></select></label></Section>;
  if(id==="growthring")return <GrowthRingEditor config={config} onConfig={onConfig}/>;
  if(id==="movie")return <MovieEditor config={config} onConfig={onConfig}/>;
  if(id==="alwaysyou")return <Section title="The Answer Was Always You" hint="Every answer reveals the same sweet punchline"><label className="field">Question<input maxLength={85} value={config.question||""} onChange={event=>onConfig("question",event.target.value)}/></label><Lines label="Correct answers · one per line" configKey="answers" value={config.answers||""} max={4} onConfig={onConfig}/></Section>;
  if(id==="excuse")return <Section title="Excuse Generator" hint="Funny sender-written reasons to meet"><Lines label="Excuses · one per line" configKey="excuses" value={config.excuses||""} max={10} onConfig={onConfig}/></Section>;
  if(id==="roast")return <Section title="Roast Me Gently" hint="Affectionate complaints only"><Lines label="Loving roasts · one per line" configKey="roasts" value={config.roasts||""} max={10} onConfig={onConfig}/></Section>;
  if(id==="fortune")return <Section title="Fortune Cookie Break" hint="Each crack reveals one of your fortunes"><Lines label="Fortunes · one per line" configKey="fortunes" value={config.fortunes||""} max={10} onConfig={onConfig}/></Section>;
  if(id==="mysterybox")return <Section title="Mystery Box" hint="The box shakes before revealing one surprise"><Lines label="Possible surprises" configKey="surprises" value={config.surprises||""} max={8} onConfig={onConfig}/><label className="field">Reveal mode<select value={config.boxMode||"Random"} onChange={event=>onConfig("boxMode",event.target.value)}><option>Random</option><option>Always reveal the first</option></select></label></Section>;
  if(id==="playlist")return <Section title="Playlist Reveal" hint="A typed dedication appears before the link opens"><label className="field">Playlist title<input maxLength={55} value={config.playlistTitle||""} onChange={event=>onConfig("playlistTitle",event.target.value)}/></label><label className="field">Playlist link<input type="url" value={config.playlistUrl||""} onChange={event=>onConfig("playlistUrl",event.target.value)}/></label><label className="field">Dedication<textarea rows={4} maxLength={140} value={config.dedication||""} onChange={event=>onConfig("dedication",event.target.value)}/><small>{(config.dedication||"").length}/140</small></label></Section>;
  if(id==="countdowninvite")return <Section title="Countdown Invite" hint="Plan an event and collect their playful RSVP"><label className="field">Event title<input maxLength={55} value={config.eventTitle||""} onChange={event=>onConfig("eventTitle",event.target.value)}/></label><label className="field">Date and time<input type="datetime-local" value={config.eventDate||""} onChange={event=>onConfig("eventDate",event.target.value)}/></label><label className="field">What they should know<textarea rows={3} maxLength={100} value={config.inviteNote||""} onChange={event=>onConfig("inviteNote",event.target.value)}/></label></Section>;
  if(id==="groupboard")return <GroupBoardEditor config={config} giftId={giftId} onConfig={onConfig}/>;
  return null;
}

function MatchPairEditor({config,onConfig}:{config:Record<string,string>;onConfig:Props["onConfig"]}){
  const photos=parse<PairPhoto[]>(config.pairPhotos,[]);
  async function add(files:FileList|null){
    if(!files)return;
    const added=await Promise.all(Array.from(files).slice(0,6-photos.length).map(async(file,index)=>({id:`pair-${Date.now()}-${index}`,image:await imageToDataUrl(file),caption:file.name.replace(/\.[^.]+$/,"")})));
    onConfig("pairPhotos",JSON.stringify([...photos,...added].slice(0,6)));
  }
  return <Section title="Match the Pair" hint="Upload 2–6 photos; the game creates two cards from each"><label className="upload dedicated-upload">▥<strong>Add your photos</strong><span>{photos.length}/6 memories ready</span><input type="file" accept="image/*" multiple onChange={event=>add(event.target.files)}/></label><div className="pair-photo-editor">{photos.map((photo,index)=><article key={photo.id}><img src={photo.image} alt="Pair memory"/><input maxLength={35} value={photo.caption} onChange={event=>onConfig("pairPhotos",JSON.stringify(photos.map((item,itemIndex)=>itemIndex===index?{...item,caption:event.target.value}:item)))}/><button onClick={()=>onConfig("pairPhotos",JSON.stringify(photos.filter((_,itemIndex)=>itemIndex!==index)))}>×</button></article>)}</div>{photos.length<2&&<p className="tiny-editor-note">Add at least two photos to make a playable deck.</p>}</Section>;
}

function GrowthRingEditor({config,onConfig}:{config:Record<string,string>;onConfig:Props["onConfig"]}){
  const milestones=parse<Milestone[]>(config.milestones,[{year:"2024",label:"We met"}]).slice(0,7);
  const update=(next:Milestone[])=>onConfig("milestones",JSON.stringify(next.slice(0,7)));
  return <Section title="Growth Ring" hint="Every milestone becomes another ring"><div className="milestone-editor">{milestones.map((item,index)=><article key={index}><input aria-label="Year" maxLength={12} value={item.year} onChange={event=>update(milestones.map((milestone,itemIndex)=>itemIndex===index?{...milestone,year:event.target.value}:milestone))}/><input aria-label="Milestone" maxLength={55} value={item.label} onChange={event=>update(milestones.map((milestone,itemIndex)=>itemIndex===index?{...milestone,label:event.target.value}:milestone))}/><button disabled={milestones.length===1} onClick={()=>update(milestones.filter((_,itemIndex)=>itemIndex!==index))}>×</button></article>)}</div><button className="add-collection-item" disabled={milestones.length>=7} onClick={()=>update([...milestones,{year:"",label:""}])}>＋ Add milestone</button></Section>;
}

function MovieEditor({config,onConfig}:{config:Record<string,string>;onConfig:Props["onConfig"]}){
  const templates=["Golden musical","Rainy romance","Road-trip ensemble","Vintage Bollywood","Spacebound love","Indie polaroid"];
  async function poster(files:FileList|null){const file=files?.[0];if(file)onConfig("posterImage",await imageToDataUrl(file))}
  return <Section title="If We Were a Movie" hint="Upload a poster or choose an original popular-cinema-style template"><label className="movie-poster-upload">{config.posterImage?<img src={config.posterImage} alt="Uploaded movie poster"/>:<span>▰</span>}<strong>{config.posterImage?"Change your poster":"Upload your own poster"}<small>Portrait JPG or PNG works best</small></strong><input type="file" accept="image/*" onChange={event=>poster(event.target.files)}/></label>{config.posterImage&&<button className="remove-poster-image" onClick={()=>onConfig("posterImage","")}>Remove uploaded poster</button>}<div className="poster-template-picker">{templates.map((template,index)=><button key={template} className={`${config.posterTemplate===template?"active":""} poster-sample-${index}`} onClick={()=>onConfig("posterTemplate",template)}><i/><strong>{template}</strong><span>Original template</span></button>)}</div><label className="field">Genre<select value={config.genre||"Romantic comedy"} onChange={event=>onConfig("genre",event.target.value)}><option>Romantic comedy</option><option>Coming-of-age</option><option>Adventure</option><option>Indie romance</option><option>Epic friendship</option></select></label><label className="field">Movie title<input maxLength={45} value={config.movieTitle||""} onChange={event=>onConfig("movieTitle",event.target.value)}/></label><label className="field">Tagline<textarea rows={3} maxLength={110} value={config.tagline||""} onChange={event=>onConfig("tagline",event.target.value)}/><small>{(config.tagline||"").length}/110</small></label><label className="field">Starring<input maxLength={55} value={config.starring||""} onChange={event=>onConfig("starring",event.target.value)}/></label></Section>;
}

function ResponseInbox({giftId,blockId,title}:{giftId?:string;blockId:string;title:string}){
  const [responses,setResponses]=useState<SavedResponse[]>([]);const [loading,setLoading]=useState(false);
  async function load(){if(!giftId)return;setLoading(true);try{const response=await fetch(`${api}/api/public/gifts/${giftId}/responses?blockId=${blockId}`);if(response.ok)setResponses(await response.json())}finally{setLoading(false)}}
  useEffect(()=>{if(!giftId)return;const controller=new AbortController();fetch(`${api}/api/public/gifts/${giftId}/responses?blockId=${blockId}`,{signal:controller.signal}).then(response=>response.ok?response.json():[]).then(setResponses).catch(()=>{});return()=>controller.abort()},[giftId,blockId]);
  if(!giftId)return <div className="response-inbox empty"><strong>{title}</strong><span>Save the draft first to start collecting responses.</span></div>;
  return <div className="response-inbox"><header><strong>{title}</strong><button onClick={load}>{loading?"Checking…":"Refresh"}</button></header>{responses.length===0?<p>No responses yet. They’ll appear here after someone submits.</p>:responses.map(response=><article key={response.id}><small>{response.contributorName}</small><strong>{response.responseText}</strong></article>)}</div>;
}

function GroupBoardEditor({config,giftId,onConfig}:{config:Record<string,string>;giftId?:string;onConfig:Props["onConfig"]}){
  const notes=parse<BoardNote[]>(config.boardNotes,[{from:"Someone who loves you",message:"You make every room warmer."}]).slice(0,12);
  const update=(next:BoardNote[])=>onConfig("boardNotes",JSON.stringify(next.slice(0,12)));
  const [link,setLink]=useState("");const [copied,setCopied]=useState(false);const [creating,setCreating]=useState(false);const [inviteError,setInviteError]=useState("");
  async function createInvite(){
    if(!giftId)return;
    setCreating(true);setInviteError("");
    try{
      const response=await fetch(`${api}/api/gifts/${giftId}/contribution-invites`,{method:"POST",headers:await authHeaders()});
      if(!response.ok)throw new Error();
      const invite=await response.json();
      setLink(`${window.location.origin}/?contribute=${invite.token}`);
      setCopied(false);
    }catch{setInviteError("Couldn’t create the link. Save the draft and try again.")}
    finally{setCreating(false)}
  }
  return <Section title="Group Message Board" hint="Create a fresh, single-use invitation for every person">{giftId?<div className="contributor-link single-use"><small>ONE PERSON · ONE MESSAGE · ONE OPEN</small>{link?<><div><input readOnly value={link}/><button onClick={async()=>{await navigator.clipboard.writeText(link);setCopied(true);window.setTimeout(()=>setCopied(false),1600)}}>{copied?"Copied ✓":"Copy link"}</button></div><button className="fresh-invite" onClick={createInvite} disabled={creating}>{creating?"Creating…":"＋ Create another person’s link"}</button></>:<button className="create-invite" onClick={createInvite} disabled={creating}>{creating?"Creating secure link…":"Create one-time contribution link →"}</button>}<p>Send this link to only one person. The first browser claims it, and submission closes it immediately.</p>{inviteError&&<output>{inviteError}</output>}</div>:<div className="response-inbox empty"><strong>One-time contribution links</strong><span>Save the draft first, then create a separate private link for each person.</span></div>}<ResponseInbox giftId={giftId} blockId="groupboard" title="Messages received"/><details className="manual-board-notes"><summary>Add starter messages yourself</summary><div className="board-note-editor">{notes.map((note,index)=><article key={index}><header><strong>Note {index+1}</strong><button disabled={notes.length===1} onClick={()=>update(notes.filter((_,itemIndex)=>itemIndex!==index))}>Remove</button></header><label className="field">From<input maxLength={35} value={note.from} onChange={event=>update(notes.map((item,itemIndex)=>itemIndex===index?{...item,from:event.target.value}:item))}/></label><label className="field">Message<textarea rows={3} maxLength={100} value={note.message} onChange={event=>update(notes.map((item,itemIndex)=>itemIndex===index?{...item,message:event.target.value}:item))}/><small>{note.message.length}/100</small></label></article>)}</div><button className="add-collection-item" disabled={notes.length>=12} onClick={()=>update([...notes,{from:"",message:""}])}>＋ Add a starter message</button></details></Section>;
}
