"use client";

import { useEffect, useRef, useState } from "react";
import { authHeaders } from "./authClient";
import { TinyBlockCustomization } from "./TinyBlockCustomization";

type CustomBlock = {
  instanceId?: string;
  id: string;
  message: string;
  config?: Record<string, string>;
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function imageToDataUrl(file: File): Promise<string> {
  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = source;
    });
    const scale = Math.min(1, 1100 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .82);
  } finally {
    URL.revokeObjectURL(source);
  }
}

export function BlockCustomization({ block, giftId, onMessage, onConfig }: { block: CustomBlock; giftId?:string; onMessage: (value: string) => void; onConfig: (key: string, value: string) => void }) {
  const config = block.config || {};

  async function imageUpload(key: string, nameKey: string, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    onConfig(key, await imageToDataUrl(file));
    onConfig(nameKey, files && files.length > 1 ? `${files.length} photos selected` : file.name);
  }

  if (block.id === "letter") return <CustomizationSection title="Letter content" hint="Written inside the animated letter">
    <label className="field">Letter message<textarea rows={4} maxLength={100} value={block.message.slice(0,100)} onChange={event=>onMessage(event.target.value)} placeholder="Write a short, meaningful note…" /><small>{Math.min(block.message.length,100)}/100</small></label>
    <label className="field">Sign-off<input maxLength={40} value={config.signoff || ""} onChange={event=>onConfig("signoff",event.target.value)} placeholder="— sent with love" /></label>
    <label className="field">When the envelope opens<select value={config.animation||"Flower burst"} onChange={event=>onConfig("animation",event.target.value)}><option>Flower burst</option><option>Heart burst</option><option>Petal shower</option><option>Golden sparkles</option><option>Classic unfold</option></select><small>The message appears after the selected animation.</small></label>
  </CustomizationSection>;

  if (block.id === "voice") return <CustomizationSection title="Voice note" hint="Only the recording is delivered">
    <VoiceRecorder audioName={config.audioName} onConfig={onConfig} />
    <label className="field">Player style<select value={config.playbackStyle} onChange={event=>onConfig("playbackStyle",event.target.value)}><option>Classic waveform</option><option>Floating heart</option><option>Minimal player</option></select></label>
  </CustomizationSection>;

  if (block.id === "video") return <CustomizationSection title="Video note" hint="Record or upload a personal face-to-face message">
    <VideoRecorder videoName={config.videoName} videoUrl={config.videoUrl} onConfig={onConfig} />
    <label className="field">Camera effect<select value={config.videoEffect} onChange={event=>onConfig("videoEffect",event.target.value)}><option>Retro cam</option><option>Warm film</option><option>Black & white</option><option>Clean</option></select></label>
    <label className="field">Caption<input maxLength={70} value={config.videoCaption||""} onChange={event=>onConfig("videoCaption",event.target.value)} /></label>
  </CustomizationSection>;

  if (block.id === "flowers") return <EGiftEditor config={config} onConfig={onConfig} />;

  if (block.id === "quiz") return <QuizEditor config={config} onConfig={onConfig} />;

  if (block.id === "thisorthat") return <ThisOrThatEditor config={config} onConfig={onConfig} />;

  if (block.id === "emoji") return <CustomizationSection title="Emoji decoder" hint="Turn an inside joke or memory into a tiny riddle">
    <label className="field">Emoji clue<input maxLength={50} value={config.emojiClue||""} onChange={event=>onConfig("emojiClue",event.target.value)} /></label>
    <label className="field">Accepted answer<input maxLength={55} value={config.emojiAnswer||""} onChange={event=>onConfig("emojiAnswer",event.target.value)} /></label>
    <label className="field">Optional hint<input maxLength={70} value={config.emojiHint||""} onChange={event=>onConfig("emojiHint",event.target.value)} /></label>
  </CustomizationSection>;

  if (block.id === "heartcatch") return <CustomizationSection title="Catch the hearts" hint="A small reflex game that unlocks your prize">
    <label className="field">Hearts to catch<select value={config.target||"6"} onChange={event=>onConfig("target",event.target.value)}>{[3,4,5,6,7,8,9,10].map(value=><option key={value}>{value}</option>)}</select></label>
    <label className="field">Prize they unlock<input maxLength={70} value={config.prize||""} onChange={event=>onConfig("prize",event.target.value)} /></label>
  </CustomizationSection>;

  if (block.id === "wheel") return <WheelEditor config={config} onConfig={onConfig} />;

  if (block.id === "slots") return <SlotEditor config={config} onConfig={onConfig} />;

  if (block.id === "puzzle") return <CustomizationSection title="Photo puzzle" hint="Upload the photo they will rebuild">
    <UploadBox label="Choose puzzle photo" note={config.imageName || "JPG or PNG from your gallery"} accept="image/*" onFiles={files=>imageUpload("imageUrl","imageName",files)} />
    <label className="field">Difficulty<select value={config.difficulty} onChange={event=>onConfig("difficulty",event.target.value)}><option>3 × 3 · Sweet and simple</option><option>4 × 4 · A little challenge</option><option>5 × 5 · Puzzle lover</option></select></label>
    <label className="field">Success message<input maxLength={70} value={config.successMessage || ""} onChange={event=>onConfig("successMessage",event.target.value)} /></label>
  </CustomizationSection>;

  if (block.id === "memory") return <MemoryEditor config={config} onConfig={onConfig} />;

  if (block.id === "scratch") return <CustomizationSection title="Hidden reveal" hint="Choose exactly what appears underneath">
    <label className="field">Hidden surprise<input maxLength={65} value={config.revealText || ""} onChange={event=>onConfig("revealText",event.target.value)} /></label>
    <label className="field">Extra detail<input maxLength={50} value={config.revealDetail || ""} onChange={event=>onConfig("revealDetail",event.target.value)} /></label>
    <label className="field">Scratch coating<select value={config.coating} onChange={event=>onConfig("coating",event.target.value)}><option>Lilac shimmer</option><option>Rose gold</option><option>Silver sparkle</option></select></label>
  </CustomizationSection>;

  if (block.id === "treasure") return <TreasureEditor config={config} onConfig={onConfig} />;

  if (block.id === "calendar") return <CalendarEditor config={config} onConfig={onConfig} />;

  if (["wouldrather","neverhave","truthdare","tapheart","matchpair","countdownus","constellation","growthring","movie","song","alwaysyou","excuse","roast","fortune","mysterybox","playlist","countdowninvite","groupboard"].includes(block.id)) return <TinyBlockCustomization id={block.id} instanceId={block.instanceId} config={config} giftId={giftId} onConfig={onConfig} />;

  return <GiftCardEditor config={config} onConfig={onConfig} />;
}

type QuizQuestion = { id: string; question: string; options: { text: string; image: string }[]; correctIndex: number; interaction: "floating" | "normal" };
type MemoryItem = { id: string; image: string; caption: string; note?:string; arrow?:string; animation?:string };
type TreasureClue = { clue: string; hint: string; answer: string; photo?: string; caption?: string };

function safeParse<T>(value: string | undefined, fallback: T): T {
  try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}

function EGiftEditor({ config, onConfig }: { config: Record<string,string>; onConfig: (key:string,value:string)=>void }) {
  const effects = ["Rose garden","Golden fireworks","Birthday glow","Winter lights","Floating hearts","Starlight"];
  return <CustomizationSection title="Celebration scene" hint="Choose an elegant full-screen atmosphere">
    <div className="effect-picker">{effects.map((label,index)=><button key={label} className={config.effect===label?"active":""} onClick={()=>onConfig("effect",label)}><i className={`effect-swatch swatch-${index}`}><b/><b/><b/></i><span>{label}</span></button>)}</div>
    <label className="field">When it appears<select value={config.timing} onChange={event=>onConfig("timing",event.target.value)}><option>Entire show</option><option>After winning or interacting</option><option>At the end</option><option>Only on this block</option></select></label>
    <label className="field">Animation intensity<select value={config.intensity} onChange={event=>onConfig("intensity",event.target.value)}><option>Gentle</option><option>Lush</option><option>Spectacular</option></select></label>
    <label className="field">Celebration note<input maxLength={70} value={config.effectNote||""} onChange={event=>onConfig("effectNote",event.target.value)} /></label>
  </CustomizationSection>;
}

function QuizEditor({ config, onConfig }: { config: Record<string,string>; onConfig: (key:string,value:string)=>void }) {
  const fallback: QuizQuestion[] = [{id:"q1",question:"Where did we first meet?",options:[{text:"At our favourite café",image:""},{text:"At a party",image:""},{text:"Online",image:""},{text:"I forgot",image:""}],correctIndex:0,interaction:"floating"}];
  const questions = safeParse<QuizQuestion[]>(config.quizQuestions,fallback).slice(0,7);
  const [aiState,setAiState] = useState<"idle"|"loading"|"error">("idle");
  const update = (next: QuizQuestion[]) => onConfig("quizQuestions",JSON.stringify(next.slice(0,7)));
  const patchQuestion = (index:number, patch:Partial<QuizQuestion>) => update(questions.map((item,i)=>i===index?{...item,...patch}:item));

  async function askAi() {
    setAiState("loading");
    try {
      const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
      const response=await fetch(`${api}/api/ai/quiz-suggestions`,{method:"POST",headers:{"Content-Type":"application/json",...(await authHeaders())},body:JSON.stringify({relationship:"two people who care deeply about each other",tone:"playful, romantic and sweet"})});
      if(!response.ok) throw new Error();
      const data=await response.json();
      const generated:QuizQuestion[]=(data.questions||[]).map((item:{question?:string;options?:string[];correctIndex?:number;interaction?:string},index:number)=>{
        const options=(item.options||[]).slice(0,4).map(text=>({text,image:""}));
        while(options.length<2)options.push({text:"Another lovely answer",image:""});
        return {id:`ai-${Date.now()}-${index}`,question:item.question||"A lovely question",options,correctIndex:Math.min(Math.max(item.correctIndex||0,0),options.length-1),interaction:item.interaction==="normal"?"normal":"floating"};
      });
      update([...questions,...generated].slice(0,7));
      setAiState("idle");
    } catch { setAiState("error"); }
  }

  async function optionImage(questionIndex:number,optionIndex:number,files:FileList|null){
    const file=files?.[0];if(!file)return;
    const image=await imageToDataUrl(file);
    const options=questions[questionIndex].options.map((option,index)=>index===optionIndex?{...option,image}:option);
    patchQuestion(questionIndex,{options});
  }

  function removeOption(questionIndex:number,optionIndex:number){
    const question=questions[questionIndex];
    if(question.options.length<=2)return;
    const options=question.options.filter((_,index)=>index!==optionIndex);
    const correctIndex=question.correctIndex===optionIndex?0:question.correctIndex>optionIndex?question.correctIndex-1:question.correctIndex;
    patchQuestion(questionIndex,{options,correctIndex});
  }

  return <CustomizationSection title="Playful quiz" hint="Up to 7 questions · 2 to 4 options each">
    <div className="quiz-editor-toolbar"><span>{questions.length}/7 questions</span><button onClick={askAi} disabled={aiState==="loading" || questions.length>=7}>{aiState==="loading"?"Dreaming up questions…":"✦ Ask AI"}</button></div>
    {aiState==="error"&&<div className="ai-error">AI is taking a little break. Try again in a moment.</div>}
    <div className="question-editor-list">{questions.map((question,qIndex)=><article key={question.id}>
      <header><strong>Question {qIndex+1}</strong><button onClick={()=>update(questions.filter((_,index)=>index!==qIndex))} disabled={questions.length===1}>Remove</button></header>
      <label className="field">Question<input maxLength={100} value={question.question} onChange={event=>patchQuestion(qIndex,{question:event.target.value})}/></label>
      <div className="option-editor-list">{question.options.map((option,oIndex)=><div className="option-editor" key={oIndex}>
        <button className={question.correctIndex===oIndex?"correct":""} onClick={()=>patchQuestion(qIndex,{correctIndex:oIndex})} title="Mark as desired answer">{question.correctIndex===oIndex?"✓":"○"}</button>
        {option.image?<img src={option.image} alt="Option"/>:<label title="Add image">＋<input type="file" accept="image/*" onChange={event=>optionImage(qIndex,oIndex,event.target.files)}/></label>}
        <input maxLength={55} value={option.text} onChange={event=>{const options=question.options.map((item,index)=>index===oIndex?{...item,text:event.target.value}:item);patchQuestion(qIndex,{options})}} placeholder={`Option ${oIndex+1}`}/>
        <button className="remove-option" onClick={()=>removeOption(qIndex,oIndex)} disabled={question.options.length<=2} title="Remove this option">×</button>
      </div>)}</div>
      <button className="add-option" disabled={question.options.length>=4} onClick={()=>patchQuestion(qIndex,{options:[...question.options,{text:"",image:""}]})}>＋ Add option <span>{question.options.length}/4</span></button>
      <label className="field">This question’s interaction<select value={question.interaction} onChange={event=>patchQuestion(qIndex,{interaction:event.target.value as "floating"|"normal"})}><option value="floating">Wrong answers run away</option><option value="normal">Normal answers + score</option></select></label>
    </article>)}</div>
    <button className="add-collection-item" disabled={questions.length>=7} onClick={()=>update([...questions,{id:`q-${Date.now()}`,question:"",options:Array.from({length:4},()=>({text:"",image:""})),correctIndex:0,interaction:"normal"}])}>＋ Add another question</button>
  </CustomizationSection>;
}

type ThisOrThatRound = { prompt:string; left:string; right:string };

function ThisOrThatEditor({config,onConfig}:{config:Record<string,string>;onConfig:(key:string,value:string)=>void}){
  const rounds=safeParse<ThisOrThatRound[]>(config.thisOrThatRounds,[{prompt:"Our perfect evening",left:"Movie night",right:"Long drive"}]).slice(0,7);
  const update=(next:ThisOrThatRound[])=>onConfig("thisOrThatRounds",JSON.stringify(next.slice(0,7)));
  const patch=(index:number,key:keyof ThisOrThatRound,value:string)=>update(rounds.map((round,roundIndex)=>roundIndex===index?{...round,[key]:value}:round));
  return <CustomizationSection title="This or that" hint="Up to 7 quick, playful choices">
    <div className="choice-round-editor">{rounds.map((round,index)=><article key={index}><header><strong>Choice {index+1}</strong><button disabled={rounds.length===1} onClick={()=>update(rounds.filter((_,roundIndex)=>roundIndex!==index))}>Remove</button></header><label className="field">Prompt<input maxLength={65} value={round.prompt} onChange={event=>patch(index,"prompt",event.target.value)}/></label><div><label className="field">Left choice<input maxLength={35} value={round.left} onChange={event=>patch(index,"left",event.target.value)}/></label><label className="field">Right choice<input maxLength={35} value={round.right} onChange={event=>patch(index,"right",event.target.value)}/></label></div></article>)}</div>
    <button className="add-collection-item" disabled={rounds.length>=7} onClick={()=>update([...rounds,{prompt:"",left:"",right:""}])}>＋ Add another choice</button>
  </CustomizationSection>;
}

function WheelEditor({ config, onConfig }: { config: Record<string,string>; onConfig:(key:string,value:string)=>void }) {
  const prizes=(config.prizes||"").split("\n").map(item=>item.trim()).filter(Boolean).slice(0,5);
  const prizeCount=prizes.length;
  const spinCount=Math.min(Number(config.spins)||1,6);
  const planned=(config.plannedResults||"").split("\n");
  function setPlannedResult(index:number,value:string){
    const next=Array.from({length:spinCount},(_,spinIndex)=>planned[spinIndex]||prizes[0]||"");
    next[index]=value;
    onConfig("plannedResults",next.join("\n"));
  }
  return <CustomizationSection title="Spin wheel rules" hint="Up to 5 options and 6 planned spins">
    <label className="field">Wheel options<textarea rows={5} value={config.prizes||""} onChange={event=>onConfig("prizes",event.target.value.split("\n").slice(0,5).join("\n"))}/><small>{prizeCount}/5</small></label>
    <label className="field">Number of spins<select value={config.spins} onChange={event=>onConfig("spins",event.target.value)}>{[1,2,3,4,5,6].map(value=><option key={value}>{value}</option>)}</select></label>
    <label className="field">Results<select value={config.resultMode} onChange={event=>onConfig("resultMode",event.target.value)}><option>Random</option><option>Plan every spin</option></select></label>
    {config.resultMode==="Plan every spin"&&<div className="planned-spin-results"><strong>Select each outcome</strong>{Array.from({length:spinCount},(_,index)=><label key={index}>Spin {index+1}<select value={prizes.includes(planned[index])?planned[index]:""} onChange={event=>setPlannedResult(index,event.target.value)} disabled={!prizes.length}><option value="" disabled>Choose a wheel option</option>{prizes.map(prize=><option key={prize}>{prize}</option>)}</select></label>)}</div>}
    <label className="field">Reveal animation<select value={config.revealAnimation} onChange={event=>onConfig("revealAnimation",event.target.value)}><option>Confetti burst</option><option>Petal shower</option><option>Golden glow</option></select></label>
  </CustomizationSection>;
}

function SlotEditor({ config, onConfig }: { config: Record<string,string>; onConfig:(key:string,value:string)=>void }) {
  const prizes=(config.prizes||"").split("\n").map(item=>item.trim()).filter(Boolean).slice(0,5);
  const pullCount=Math.min(Number(config.pulls)||1,6);
  const planned=(config.plannedResults||"").split("\n");
  function setPlanned(index:number,value:string){
    const next=Array.from({length:pullCount},(_,pullIndex)=>planned[pullIndex]||"");
    next[index]=value;
    onConfig("plannedResults",next.join("\n"));
  }
  return <CustomizationSection title="Slot machine" hint="They pull the lever to line up a prize">
    <label className="field">Possible prizes<textarea rows={5} value={config.prizes||""} onChange={event=>onConfig("prizes",event.target.value.split("\n").slice(0,5).join("\n"))}/><small>{prizes.length}/5</small></label>
    <label className="field">Number of lever pulls<select value={config.pulls} onChange={event=>onConfig("pulls",event.target.value)}>{[1,2,3,4,5,6].map(value=><option key={value}>{value}</option>)}</select></label>
    <label className="field">Prize outcomes<select value={config.resultMode} onChange={event=>onConfig("resultMode",event.target.value)}><option>Random</option><option>Plan every pull</option></select></label>
    {config.resultMode==="Plan every pull"&&<div className="planned-spin-results"><strong>Select each outcome</strong>{Array.from({length:pullCount},(_,index)=><label key={index}>Pull {index+1}<select value={prizes.includes(planned[index])?planned[index]:""} onChange={event=>setPlanned(index,event.target.value)}><option value="" disabled>Choose a prize</option>{prizes.map(prize=><option key={prize}>{prize}</option>)}</select></label>)}</div>}
    <label className="field">Winning animation<select value={config.revealAnimation} onChange={event=>onConfig("revealAnimation",event.target.value)}><option>Sparkle shower</option><option>Confetti pop</option><option>Golden glow</option></select></label>
  </CustomizationSection>;
}

function CalendarEditor({config,onConfig}:{config:Record<string,string>;onConfig:(key:string,value:string)=>void}){
  const days=Math.min(Number(config.days)||7,30);
  const defaults=["A reason I adore you","A favourite memory","A tiny promise","A photo that makes me smile","Your song of the day","A little challenge","Your final surprise"];
  const stored=safeParse<string[]>(config.calendarNotes,defaults);
  const notes=Array.from({length:days},(_,index)=>stored[index]||`A little surprise for day ${index+1}`);
  function setDays(value:string){
    const count=Number(value);
    onConfig("days",value);
    onConfig("calendarNotes",JSON.stringify(Array.from({length:count},(_,index)=>stored[index]||`A little surprise for day ${index+1}`)));
  }
  function setNote(index:number,value:string){onConfig("calendarNotes",JSON.stringify(notes.map((note,noteIndex)=>noteIndex===index?value:note)))}
  return <CustomizationSection title="Unlock calendar" hint="A series of little gifts revealed over several days">
    <div className="calendar-explainer"><span>1</span><p>You write one short surprise for every day.</p><span>2</span><p>The recipient opens the available numbered door.</p><span>3</span><p>A new door unlocks each day—or you can make them all available.</p></div>
    <label className="field">Number of days<select value={config.days} onChange={event=>setDays(event.target.value)}><option>7</option><option>14</option><option>30</option></select></label>
    <label className="field">Unlock schedule<select value={config.unlockRule} onChange={event=>onConfig("unlockRule",event.target.value)}><option>One per day</option><option>Recipient can open anytime</option></select></label>
    {config.unlockRule==="One per day"&&<label className="field">First day<input type="date" value={config.startDate||""} onChange={event=>onConfig("startDate",event.target.value)}/></label>}
    <div className="calendar-note-list"><strong>What each door reveals</strong>{notes.map((note,index)=><label key={index}><span>Day {index+1}</span><input maxLength={80} value={note} onChange={event=>setNote(index,event.target.value)}/></label>)}</div>
  </CustomizationSection>;
}

function MemoryEditor({ config, onConfig }: { config: Record<string,string>; onConfig:(key:string,value:string)=>void }) {
  const items=safeParse<MemoryItem[]>(config.memoryItems,[]);
  async function add(files:FileList|null){if(!files)return;const added=await Promise.all(Array.from(files).slice(0,12).map(async(file,index)=>({id:`memory-${Date.now()}-${index}`,image:await imageToDataUrl(file),caption:file.name.replace(/\.[^.]+$/,""),note:"",arrow:"Curve right",animation:"Polaroid pop"})));onConfig("memoryItems",JSON.stringify([...items,...added].slice(0,20)))}
  async function cover(files:FileList|null){const file=files?.[0];if(file)onConfig("coverImage",await imageToDataUrl(file))}
  function patch(index:number,key:keyof MemoryItem,value:string){onConfig("memoryItems",JSON.stringify(items.map((item,i)=>i===index?{...item,[key]:value}:item)))}
  return <CustomizationSection title="Scrapbook album" hint="Design every page with photos, words, arrows and motion">
    <div className="memory-cover-note"><img src={config.coverImage||"/mypookie-letter-photo.png"} alt="Memory book cover"/><div><strong>Your cover</strong><span>Shown first when the memory lane opens.</span></div></div>
    <UploadBox label="Customize cover photo" note="The complete photo will stay visible" accept="image/*" onFiles={cover}/>
    <label className="field">Cover caption<input maxLength={65} value={config.coverCaption||"Our little book of us"} onChange={event=>onConfig("coverCaption",event.target.value)}/></label>
    <label className="field">Album style<select value={config.albumStyle||"Blush scrapbook"} onChange={event=>onConfig("albumStyle",event.target.value)}><option>Blush scrapbook</option><option>Retro travel album</option><option>Midnight love story</option><option>Playful sticker book</option></select></label>
    <UploadBox label="Add memory photos" note="Select several photos at once" accept="image/*" multiple onFiles={add}/>
    <div className="memory-item-editor scrapbook-editor">{items.map((item,index)=><article key={item.id}><img src={item.image} alt="Uploaded memory"/><div className="scrapbook-page-fields"><label>Photo caption<input maxLength={65} value={item.caption} onChange={event=>patch(index,"caption",event.target.value)}/></label><label>Handwritten text<textarea rows={2} maxLength={100} value={item.note||""} onChange={event=>patch(index,"note",event.target.value)} placeholder="Add a date, joke or tiny memory…"/></label><div><label>Curved arrow<select value={item.arrow||"Curve right"} onChange={event=>patch(index,"arrow",event.target.value)}><option>Curve right</option><option>Curve left</option><option>Loop around</option><option>None</option></select></label><label>Page animation<select value={item.animation||"Polaroid pop"} onChange={event=>patch(index,"animation",event.target.value)}><option>Polaroid pop</option><option>Soft zoom</option><option>Film slide</option><option>Sparkle reveal</option></select></label></div></div><button onClick={()=>onConfig("memoryItems",JSON.stringify(items.filter((_,i)=>i!==index)))}>×</button></article>)}</div>
    {items.length===0&&<div className="collection-empty">Your uploaded pages will appear here.</div>}
  </CustomizationSection>;
}

function TreasureEditor({ config, onConfig }: { config: Record<string,string>; onConfig:(key:string,value:string)=>void }) {
  const clues=safeParse<TreasureClue[]>(config.treasureClues,[{clue:"",hint:"",answer:"",photo:"",caption:""}]);
  const patch=(index:number,key:keyof TreasureClue,value:string)=>onConfig("treasureClues",JSON.stringify(clues.map((item,i)=>i===index?{...item,[key]:value}:item)));
  async function cluePhoto(index:number,files:FileList|null){const file=files?.[0];if(file)patch(index,"photo",await imageToDataUrl(file))}
  return <CustomizationSection title="Treasure hunt" hint="Each clue has an answer and optional hint">
    <div className="treasure-editor-list">{clues.map((item,index)=><article key={index}><header><strong>Clue {index+1}</strong><button disabled={clues.length===1} onClick={()=>onConfig("treasureClues",JSON.stringify(clues.filter((_,i)=>i!==index)))}>Remove</button></header>
      <label className="clue-photo-upload">{item.photo?<img src={item.photo} alt={`Clue ${index+1}`}/>:<span>＋</span>}<strong>{item.photo?"Change optional photo":"Add optional photo"}<small>{item.photo?"This visual clue will be shown.":"Skip this if the clue only needs text."}</small></strong><input type="file" accept="image/*" onChange={event=>cluePhoto(index,event.target.files)}/></label>
      {item.photo&&<button className="remove-clue-photo" onClick={()=>patch(index,"photo","")}>Remove photo</button>}
      <label className="field">Photo caption<input maxLength={65} value={item.caption||""} onChange={event=>patch(index,"caption",event.target.value)}/></label>
      <label className="field">Clue<input maxLength={100} value={item.clue} onChange={event=>patch(index,"clue",event.target.value)}/></label><label className="field">Hint<input maxLength={80} value={item.hint} onChange={event=>patch(index,"hint",event.target.value)}/></label><label className="field">Accepted answer<input maxLength={45} value={item.answer} onChange={event=>patch(index,"answer",event.target.value)}/></label></article>)}</div>
    <button className="add-collection-item" disabled={clues.length>=7} onClick={()=>onConfig("treasureClues",JSON.stringify([...clues,{clue:"",hint:"",answer:"",photo:"",caption:""}]))}>＋ Add clue</button>
    <label className="field">Final reward<input maxLength={70} value={config.finalSurprise||""} onChange={event=>onConfig("finalSurprise",event.target.value)}/></label>
  </CustomizationSection>;
}

function GiftCardEditor({ config, onConfig }: { config: Record<string,string>; onConfig:(key:string,value:string)=>void }) {
  async function downloadPdf(){
    const {jsPDF}=await import("jspdf");
    const doc=new jsPDF({orientation:"landscape",unit:"mm",format:"a5"});
    doc.setFillColor(255,246,249);doc.rect(0,0,210,148,"F");
    doc.setFillColor(43,27,46);doc.roundedRect(18,20,174,108,8,8,"F");
    doc.setTextColor(255,111,145);doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text("mypookie.",30,38);
    doc.setTextColor(255,255,255);doc.setFontSize(24);doc.text(config.brand||"A gift for you",30,61);
    if(config.showValue!=="false"){doc.setTextColor(255,184,107);doc.setFontSize(18);doc.text(config.value||"A special treat",30,79)}
    if(config.showCode!=="false"){doc.setTextColor(255,255,255);doc.setFontSize(13);doc.text(`Code: ${config.code||"POOKIE-LOVE-24"}`,30,96)}
    if(config.showNote!=="false"){doc.setTextColor(225,216,229);doc.setFontSize(10);doc.text(doc.splitTextToSize(config.giftMessage||"Choose something that makes you smile.",145),30,111)}
    doc.save("mypookie-gift-card.pdf");
  }
  return <CustomizationSection title="Gift card experience" hint="Choose the reveal, content and downloadable card">
    <label className="field">Reveal interaction<select value={config.interaction} onChange={event=>onConfig("interaction",event.target.value)}><option>Flip to reveal</option><option>Scratchable card</option><option>Blur to unblur</option></select></label>
    <label className="field">Brand or gift name<input maxLength={40} value={config.brand||""} onChange={event=>onConfig("brand",event.target.value)}/></label>
    <label className="field">Code or redemption link<input maxLength={80} value={config.code||""} onChange={event=>onConfig("code",event.target.value)}/></label>
    <label className="field">Value<input maxLength={20} value={config.value||""} onChange={event=>onConfig("value",event.target.value)}/></label>
    <label className="field">Personal note<textarea rows={3} maxLength={120} value={config.giftMessage||""} onChange={event=>onConfig("giftMessage",event.target.value)}/><small>{(config.giftMessage||"").length}/120</small></label>
    <div className="card-info-toggles">{[["showCode","Show code"],["showValue","Show value"],["showNote","Show note"]].map(([key,label])=><label key={key}><input type="checkbox" checked={config[key]!=="false"} onChange={event=>onConfig(key,String(event.target.checked))}/>{label}</label>)}</div>
    <button className="download-card" onClick={downloadPdf}>↓ Download beautiful gift-card PDF</button>
  </CustomizationSection>;
}

function CustomizationSection({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return <section className="dedicated-customization"><div className="dedicated-title"><strong>{title}</strong><span>{hint}</span></div>{children}</section>;
}

function UploadBox({ label, note, accept, multiple, onFiles }: { label: string; note: string; accept: string; multiple?: boolean; onFiles: (files: FileList | null) => void }) {
  return <label className="upload dedicated-upload">▧<strong>{label}</strong><span>{note}</span><input type="file" accept={accept} multiple={multiple} onChange={event=>onFiles(event.target.files)} /></label>;
}

function VoiceRecorder({ audioName, onConfig }: { audioName?: string; onConfig: (key: string, value: string) => void }) {
  const [status, setStatus] = useState<"idle"|"recording"|"ready"|"error">("idle");
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
    recorder.current?.stream.getTracks().forEach(track=>track.stop());
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.ondataavailable = event => event.data.size && chunks.current.push(event.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType || "audio/webm" });
        onConfig("audioUrl", await blobToDataUrl(blob));
        onConfig("audioName", `Recorded voice note · ${seconds || 1}s`);
        stream.getTracks().forEach(track=>track.stop());
        setStatus("ready");
      };
      recorder.current = mediaRecorder;
      mediaRecorder.start();
      setSeconds(0);
      setStatus("recording");
      timer.current = window.setInterval(()=>setSeconds(value=>value+1),1000);
    } catch {
      setStatus("error");
    }
  }

  function stop() {
    recorder.current?.stop();
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  }

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    onConfig("audioUrl", await blobToDataUrl(file));
    onConfig("audioName", file.name);
    setStatus("ready");
  }

  return <div className="voice-recorder">
    {status==="recording"?<button className="record recording" onClick={stop}>■ Stop recording <span>{seconds}s recorded</span></button>:<button className="record" onClick={start}>● Record voice note <span>{audioName || "Tap to allow microphone access"}</span></button>}
    <label className="audio-upload">or upload audio<input type="file" accept="audio/*" onChange={event=>upload(event.target.files)} /></label>
    {status==="error"&&<p>Microphone permission was not available. Upload an audio file instead.</p>}
  </div>;
}

function VideoRecorder({videoName,videoUrl,onConfig}:{videoName?:string;videoUrl?:string;onConfig:(key:string,value:string)=>void}){
  const [status,setStatus]=useState<"idle"|"recording"|"ready"|"error">("idle");
  const [seconds,setSeconds]=useState(0);
  const recorder=useRef<MediaRecorder|null>(null);
  const chunks=useRef<Blob[]>([]);
  const timer=useRef<number|null>(null);

  useEffect(()=>()=>{if(timer.current)window.clearInterval(timer.current);recorder.current?.stream.getTracks().forEach(track=>track.stop())},[]);

  function stop(){
    if(recorder.current?.state==="recording")recorder.current.stop();
    if(timer.current)window.clearInterval(timer.current);
    timer.current=null;
  }

  async function start(){
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:true});
      const mediaRecorder=new MediaRecorder(stream);
      chunks.current=[];
      mediaRecorder.ondataavailable=event=>event.data.size&&chunks.current.push(event.data);
      mediaRecorder.onstop=async()=>{
        const blob=new Blob(chunks.current,{type:mediaRecorder.mimeType||"video/webm"});
        onConfig("videoUrl",await blobToDataUrl(blob));
        onConfig("videoName",`Recorded video note · ${seconds||1}s`);
        stream.getTracks().forEach(track=>track.stop());
        setStatus("ready");
      };
      recorder.current=mediaRecorder;
      mediaRecorder.start();
      setSeconds(0);
      setStatus("recording");
      timer.current=window.setInterval(()=>setSeconds(value=>{if(value>=29)window.setTimeout(stop,0);return value+1}),1000);
    }catch{setStatus("error")}
  }

  async function upload(files:FileList|null){
    const file=files?.[0];if(!file)return;
    if(file.size>30*1024*1024){setStatus("error");return}
    onConfig("videoUrl",await blobToDataUrl(file));
    onConfig("videoName",file.name);
    setStatus("ready");
  }

  return <div className="video-recorder">
    {videoUrl&&<video className="video-preview-mini" src={videoUrl} controls playsInline/>}
    {status==="recording"?<button className="record recording" onClick={stop}>■ Stop video <span>{seconds}s · maximum 30 seconds</span></button>:<button className="record" onClick={start}>● Record video note <span>{videoName||"Camera + microphone · up to 30 seconds"}</span></button>}
    <label className="audio-upload">or upload a video<input type="file" accept="video/*" onChange={event=>upload(event.target.files)}/></label>
    {status==="error"&&<p>Camera access failed or the video is over 30 MB. Try a smaller upload.</p>}
  </div>;
}
