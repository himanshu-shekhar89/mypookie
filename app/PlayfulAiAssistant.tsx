"use client";

import { useState } from "react";
import { authHeaders } from "./authClient";

type AiItem={prompt?:string;options?:string[]};
type Props={id:string;relationship:string;config:Record<string,string>;onConfig:(key:string,value:string)=>void};

const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
const supported=new Set(["quiz","thisorthat","emoji","wouldrather","neverhave","truthdare","wheel","slots","scratch","treasure","alwaysyou","excuse","roast","fortune","mysterybox"]);
const tones=["Romantic","Funny","Deep","Flirty","Sexy (18+ · non-explicit)","Wholesome"];

function lines(items:AiItem[],fallback:string){return items.map(item=>item.prompt?.trim()).filter(Boolean).join("\n")||fallback}

export function PlayfulAiAssistant({id,relationship,config,onConfig}:Props){
  const [state,setState]=useState<"idle"|"loading"|"done"|"error">("idle");
  const [tone,setTone]=useState("Romantic");
  const [count,setCount]=useState(id==="fortune"?10:6);
  if(!supported.has(id))return null;

  function apply(items:AiItem[]){
    if(id==="quiz"){
      onConfig("quizQuestions",JSON.stringify(items.slice(0,7).map((item,index)=>({id:`ai-${Date.now()}-${index}`,question:item.prompt||"A playful question",options:(item.options||["Yes","Maybe"]).slice(0,4).map(text=>({text,image:""})),correctIndex:0,interaction:"floating"}))));
    }else if(id==="thisorthat"){
      onConfig("thisOrThatRounds",JSON.stringify(items.slice(0,8).map(item=>({prompt:item.prompt||"Choose one",left:item.options?.[0]||"This",right:item.options?.[1]||"That"}))));
    }else if(id==="wouldrather"){
      onConfig("pairs",JSON.stringify(items.slice(0,8).map(item=>({left:item.options?.[0]||item.prompt||"This",right:item.options?.[1]||"That"}))));
    }else if(id==="neverhave"){
      const statements=items.map(item=>item.prompt?.trim()).filter((value):value is string=>Boolean(value)).slice(0,10);
      onConfig("statements",statements.join("\n"));
      onConfig("neverHaveCards",JSON.stringify(statements.map((statement,index)=>({id:`never-ai-${Date.now()}-${index}`,statement,senderPick:"",haventReaction:"",haveReaction:""}))));
    }
    else if(id==="truthdare"){
      const middle=Math.ceil(items.length/2);
      onConfig("truths",lines(items.slice(0,middle),config.truths||""));
      onConfig("dares",lines(items.slice(middle),config.dares||""));
    }else if(id==="wheel"||id==="slots")onConfig("prizes",lines(items,config.prizes||""));
    else if(id==="scratch"){onConfig("revealText",items[0]?.prompt||config.revealText||"A lovely surprise");onConfig("revealDetail",items[0]?.options?.[0]||config.revealDetail||"Made just for you");}
    else if(id==="treasure")onConfig("treasureClues",JSON.stringify(items.slice(0,7).map(item=>({clue:item.prompt||"Find the next memory",hint:item.options?.[0]||"Think of a shared moment",answer:item.options?.[1]||"love",photo:"",caption:""}))));
    else if(id==="alwaysyou"){
      const generated=items.slice(0,7).map((item,index)=>({id:`always-ai-${Date.now()}-${index}`,question:item.prompt||"Who makes every day better?",answers:(item.options?.length?item.options:["You","Still you","Always you","Obviously you"]).slice(0,4)}));
      onConfig("alwaysYouQuestions",JSON.stringify(generated));
      if(generated[0]){onConfig("question",generated[0].question);onConfig("answers",generated[0].answers.join("\n"))}
    }
    else if(id==="excuse"){
      const rounds=items.slice(0,6).map((item,index)=>({id:`excuse-ai-${Date.now()}-${index}`,situation:item.prompt||"We need a playful excuse to meet right now.",senderExcuse:item.options?.[0]||"There is an emergency hug shortage."}));
      onConfig("excuseRounds",JSON.stringify(rounds));
      onConfig("excuses",rounds.map(round=>round.senderExcuse).join("\n"));
    }
    else if(id==="roast")onConfig("roasts",lines(items,config.roasts||""));
    else if(id==="fortune")onConfig("fortunes",lines(items,config.fortunes||""));
    else if(id==="mysterybox")onConfig("surprises",lines(items,config.surprises||""));
    else if(id==="emoji"){onConfig("emojiClue",items[0]?.prompt||config.emojiClue||"♡ + ✨");onConfig("emojiAnswer",items[0]?.options?.[0]||config.emojiAnswer||"our story");onConfig("emojiHint",items[0]?.options?.[1]||config.emojiHint||"Think of us.");}
  }

  async function generate(){
    setState("loading");
    try{
      const response=await fetch(`${api}/api/ai/playful-prompts`,{method:"POST",headers:{"Content-Type":"application/json",...(await authHeaders())},body:JSON.stringify({gameType:id,relationship,tone,count})});
      if(!response.ok)throw new Error();
      const data=await response.json() as {items?:AiItem[]};
      if(!data.items?.length)throw new Error();
      apply(data.items);
      setState("done");
      window.setTimeout(()=>setState("idle"),2200);
    }catch{setState("error")}
  }

  const fortune=id==="fortune";
  return <section className="playful-ai-assistant expanded"><span>✦</span><div className="ai-assistant-copy"><strong>{fortune?"Need fresh fortunes?":"Need fresh ideas?"}</strong><small>{fortune?"AI writes feel-good fortune statements—never questions. One will be picked at random.":"Choose a mood and AI will create editable ideas for this activity."}</small><div className="ai-generation-options"><label>Style<select value={tone} onChange={event=>setTone(event.target.value)}>{tones.map(item=><option key={item}>{item}</option>)}</select></label><label>Number<input type="number" min="2" max="12" value={count} onChange={event=>setCount(Math.min(12,Math.max(2,Number(event.target.value)||2)))}/></label></div></div><button disabled={state==="loading"} onClick={()=>void generate()}>{state==="loading"?"Dreaming up ideas…":state==="done"?"Added — make them yours ✓":state==="error"?"Try AI again":fortune?"Generate fortunes":"Ask AI for ideas"}</button></section>;
}
