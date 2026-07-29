"use client";

import { useEffect, useRef, useState } from "react";

type CustomBlock = {
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

export function BlockCustomization({ block, onMessage, onConfig }: { block: CustomBlock; onMessage: (value: string) => void; onConfig: (key: string, value: string) => void }) {
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
    <label className="field">Opening animation<select value={config.animation} onChange={event=>onConfig("animation",event.target.value)}><option>Lift and unfold</option><option>Wax seal pop</option><option>Soft fade</option></select></label>
  </CustomizationSection>;

  if (block.id === "voice") return <CustomizationSection title="Voice note" hint="Only the recording is delivered">
    <VoiceRecorder audioName={config.audioName} onConfig={onConfig} />
    <label className="field">Player style<select value={config.playbackStyle} onChange={event=>onConfig("playbackStyle",event.target.value)}><option>Classic waveform</option><option>Floating heart</option><option>Minimal player</option></select></label>
  </CustomizationSection>;

  if (block.id === "flowers") return <EGiftEditor config={config} onConfig={onConfig} />;

  if (block.id === "quiz") return <QuizEditor config={config} onConfig={onConfig} />;

  if (block.id === "wheel") return <WheelEditor config={config} onConfig={onConfig} />;

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

  if (block.id === "calendar") return <CustomizationSection title="Unlock calendar" hint="Decide its length and first daily moment">
    <label className="field">Number of days<select value={config.days} onChange={event=>onConfig("days",event.target.value)}><option>7</option><option>14</option><option>30</option></select></label>
    <label className="field">Unlock schedule<select value={config.unlockRule} onChange={event=>onConfig("unlockRule",event.target.value)}><option>One per day</option><option>Recipient can open anytime</option><option>Sender chooses dates</option></select></label>
    <label className="field">Day one message<textarea rows={3} maxLength={90} value={config.firstNote || ""} onChange={event=>onConfig("firstNote",event.target.value)} /><small>{(config.firstNote || "").length}/90</small></label>
  </CustomizationSection>;

  return <GiftCardEditor config={config} onConfig={onConfig} />;
}

type QuizQuestion = { id: string; question: string; options: { text: string; image: string }[]; correctIndex: number; interaction: "floating" | "normal" };
type MemoryItem = { id: string; image: string; caption: string };
type TreasureClue = { clue: string; hint: string; answer: string };

function safeParse<T>(value: string | undefined, fallback: T): T {
  try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}

function EGiftEditor({ config, onConfig }: { config: Record<string,string>; onConfig: (key:string,value:string)=>void }) {
  const effects = [["Flower shower","🌸"],["Fireworks","🎆"],["Birthday party","🎂"],["Christmas magic","🎄"],["Hearts","💗"],["Snowfall","❄️"]];
  return <CustomizationSection title="E-gift spectacle" hint="Fill their screen with a celebration">
    <div className="effect-picker">{effects.map(([label,icon])=><button key={label} className={config.effect===label?"active":""} onClick={()=>onConfig("effect",label)}><i>{icon}</i><span>{label}</span></button>)}</div>
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
      const response=await fetch(`${api}/api/ai/quiz-suggestions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({relationship:"two people who care deeply about each other",tone:"playful, romantic and sweet"})});
      if(!response.ok) throw new Error();
      const data=await response.json();
      const generated:QuizQuestion[]=(data.questions||[]).map((item:{question?:string;options?:string[];correctIndex?:number;interaction?:string},index:number)=>({id:`ai-${Date.now()}-${index}`,question:item.question||"A lovely question",options:(item.options||[]).slice(0,4).map(text=>({text,image:""})),correctIndex:Math.min(Math.max(item.correctIndex||0,0),3),interaction:item.interaction==="normal"?"normal":"floating"}));
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

  return <CustomizationSection title="Playful quiz" hint="Up to 7 questions · 4 options each">
    <div className="quiz-editor-toolbar"><span>{questions.length}/7 questions</span><button onClick={askAi} disabled={aiState==="loading" || questions.length>=7}>{aiState==="loading"?"Dreaming up questions…":"✦ Ask AI"}</button></div>
    {aiState==="error"&&<div className="ai-error">AI is taking a little break. Try again in a moment.</div>}
    <div className="question-editor-list">{questions.map((question,qIndex)=><article key={question.id}>
      <header><strong>Question {qIndex+1}</strong><button onClick={()=>update(questions.filter((_,index)=>index!==qIndex))} disabled={questions.length===1}>Remove</button></header>
      <label className="field">Question<input maxLength={100} value={question.question} onChange={event=>patchQuestion(qIndex,{question:event.target.value})}/></label>
      <div className="option-editor-list">{question.options.map((option,oIndex)=><div className="option-editor" key={oIndex}>
        <button className={question.correctIndex===oIndex?"correct":""} onClick={()=>patchQuestion(qIndex,{correctIndex:oIndex})} title="Mark as desired answer">{question.correctIndex===oIndex?"✓":"○"}</button>
        {option.image?<img src={option.image} alt="Option"/>:<label title="Add image">＋<input type="file" accept="image/*" onChange={event=>optionImage(qIndex,oIndex,event.target.files)}/></label>}
        <input maxLength={55} value={option.text} onChange={event=>{const options=question.options.map((item,index)=>index===oIndex?{...item,text:event.target.value}:item);patchQuestion(qIndex,{options})}} placeholder={`Option ${oIndex+1}`}/>
      </div>)}</div>
      <label className="field">This question’s interaction<select value={question.interaction} onChange={event=>patchQuestion(qIndex,{interaction:event.target.value as "floating"|"normal"})}><option value="floating">Wrong answers run away</option><option value="normal">Normal answers + score</option></select></label>
    </article>)}</div>
    <button className="add-collection-item" disabled={questions.length>=7} onClick={()=>update([...questions,{id:`q-${Date.now()}`,question:"",options:Array.from({length:4},()=>({text:"",image:""})),correctIndex:0,interaction:"normal"}])}>＋ Add another question</button>
  </CustomizationSection>;
}

function WheelEditor({ config, onConfig }: { config: Record<string,string>; onConfig:(key:string,value:string)=>void }) {
  const prizeCount=(config.prizes||"").split("\n").filter(Boolean).length;
  return <CustomizationSection title="Spin wheel rules" hint="Up to 5 options and 6 planned spins">
    <label className="field">Wheel options<textarea rows={5} value={config.prizes||""} onChange={event=>onConfig("prizes",event.target.value.split("\n").slice(0,5).join("\n"))}/><small>{prizeCount}/5</small></label>
    <label className="field">Number of spins<select value={config.spins} onChange={event=>onConfig("spins",event.target.value)}>{[1,2,3,4,5,6].map(value=><option key={value}>{value}</option>)}</select></label>
    <label className="field">Results<select value={config.resultMode} onChange={event=>onConfig("resultMode",event.target.value)}><option>Random</option><option>Plan every spin</option></select></label>
    {config.resultMode==="Plan every spin"&&<label className="field">Result of each spin<textarea rows={5} value={config.plannedResults||""} onChange={event=>onConfig("plannedResults",event.target.value.split("\n").slice(0,Number(config.spins)||1).join("\n"))} placeholder="One exact wheel option per spin"/><small>{(config.plannedResults||"").split("\n").filter(Boolean).length}/{config.spins}</small></label>}
    <label className="field">Reveal animation<select value={config.revealAnimation} onChange={event=>onConfig("revealAnimation",event.target.value)}><option>Confetti burst</option><option>Petal shower</option><option>Golden glow</option></select></label>
  </CustomizationSection>;
}

function MemoryEditor({ config, onConfig }: { config: Record<string,string>; onConfig:(key:string,value:string)=>void }) {
  const items=safeParse<MemoryItem[]>(config.memoryItems,[]);
  async function add(files:FileList|null){if(!files)return;const added=await Promise.all(Array.from(files).slice(0,12).map(async(file,index)=>({id:`memory-${Date.now()}-${index}`,image:await imageToDataUrl(file),caption:file.name.replace(/\.[^.]+$/,"")})));onConfig("memoryItems",JSON.stringify([...items,...added].slice(0,20)))}
  function caption(index:number,value:string){onConfig("memoryItems",JSON.stringify(items.map((item,i)=>i===index?{...item,caption:value}:item)))}
  return <CustomizationSection title="Memory book" hint="A cover followed by page-turning photo memories">
    <div className="memory-cover-note"><img src="/mypookie-letter-photo.png" alt="Default memory book cover"/><div><strong>Default cover</strong><span>This always opens the memory lane.</span></div></div>
    <UploadBox label="Add memory photos" note="Select several photos at once" accept="image/*" multiple onFiles={add}/>
    <div className="memory-item-editor">{items.map((item,index)=><article key={item.id}><img src={item.image} alt="Uploaded memory"/><label>Caption {index+1}<input maxLength={65} value={item.caption} onChange={event=>caption(index,event.target.value)}/></label><button onClick={()=>onConfig("memoryItems",JSON.stringify(items.filter((_,i)=>i!==index)))}>×</button></article>)}</div>
    {items.length===0&&<div className="collection-empty">Your uploaded pages will appear here.</div>}
  </CustomizationSection>;
}

function TreasureEditor({ config, onConfig }: { config: Record<string,string>; onConfig:(key:string,value:string)=>void }) {
  const clues=safeParse<TreasureClue[]>(config.treasureClues,[{clue:"",hint:"",answer:""}]);
  const patch=(index:number,key:keyof TreasureClue,value:string)=>onConfig("treasureClues",JSON.stringify(clues.map((item,i)=>i===index?{...item,[key]:value}:item)));
  return <CustomizationSection title="Treasure hunt" hint="Each clue has an answer and optional hint">
    <div className="treasure-editor-list">{clues.map((item,index)=><article key={index}><header><strong>Clue {index+1}</strong><button disabled={clues.length===1} onClick={()=>onConfig("treasureClues",JSON.stringify(clues.filter((_,i)=>i!==index)))}>Remove</button></header><label className="field">Clue<input maxLength={100} value={item.clue} onChange={event=>patch(index,"clue",event.target.value)}/></label><label className="field">Hint<input maxLength={80} value={item.hint} onChange={event=>patch(index,"hint",event.target.value)}/></label><label className="field">Accepted answer<input maxLength={45} value={item.answer} onChange={event=>patch(index,"answer",event.target.value)}/></label></article>)}</div>
    <button className="add-collection-item" disabled={clues.length>=7} onClick={()=>onConfig("treasureClues",JSON.stringify([...clues,{clue:"",hint:"",answer:""}]))}>＋ Add clue</button>
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
