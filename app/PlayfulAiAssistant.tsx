"use client";

import { useState } from "react";
import { authHeaders } from "./authClient";

type AiItem={prompt?:string;options?:string[]};
type Props={id:string;relationship:string;config:Record<string,string>;onConfig:(key:string,value:string)=>void};

const api=process.env.NEXT_PUBLIC_API_URL||"https://backend-production-22bd.up.railway.app";
const supported=new Set(["quiz","thisorthat","emoji","wouldrather","neverhave","truthdare","wheel","slots","scratch","treasure","alwaysyou","excuse","roast","fortune","mysterybox","movie","song"]);

function lines(items:AiItem[],fallback:string){return items.map(item=>item.prompt?.trim()).filter(Boolean).join("\n")||fallback}

export function PlayfulAiAssistant({id,relationship,config,onConfig}:Props){
  const [state,setState]=useState<"idle"|"loading"|"done"|"error">("idle");
  if(!supported.has(id))return null;

  function apply(items:AiItem[]){
    if(id==="quiz"){
      onConfig("quizQuestions",JSON.stringify(items.slice(0,7).map((item,index)=>({id:`ai-${Date.now()}-${index}`,question:item.prompt||"A playful question",options:(item.options||["Yes","Maybe"]).slice(0,4).map(text=>({text,image:""})),correctIndex:0,interaction:"floating"}))));
    }else if(id==="thisorthat"){
      onConfig("thisOrThatRounds",JSON.stringify(items.slice(0,8).map(item=>({prompt:item.prompt||"Choose one",left:item.options?.[0]||"This",right:item.options?.[1]||"That"}))));
    }else if(id==="wouldrather"){
      onConfig("pairs",JSON.stringify(items.slice(0,8).map(item=>({left:item.options?.[0]||item.prompt||"This",right:item.options?.[1]||"That"}))));
    }else if(id==="neverhave")onConfig("statements",lines(items,config.statements||""));
    else if(id==="truthdare"){
      onConfig("truths",lines(items.slice(0,3),config.truths||""));
      onConfig("dares",lines(items.slice(3,6),config.dares||""));
    }else if(id==="wheel"||id==="slots")onConfig("prizes",lines(items,config.prizes||""));
    else if(id==="scratch"){onConfig("revealText",items[0]?.prompt||config.revealText||"A lovely surprise");onConfig("revealDetail",items[0]?.options?.[0]||config.revealDetail||"Made just for you");}
    else if(id==="treasure")onConfig("treasureClues",JSON.stringify(items.slice(0,7).map(item=>({clue:item.prompt||"Find the next memory",hint:item.options?.[0]||"Think of a shared moment",answer:item.options?.[1]||"love",photo:"",caption:""}))));
    else if(id==="alwaysyou"){onConfig("question",items[0]?.prompt||config.question||"Who makes every day better?");onConfig("answers",(items[0]?.options||["You","Still you","Always you","Obviously you"]).slice(0,4).join("\n"));}
    else if(id==="excuse")onConfig("excuses",lines(items,config.excuses||""));
    else if(id==="roast")onConfig("roasts",lines(items,config.roasts||""));
    else if(id==="fortune")onConfig("fortunes",lines(items,config.fortunes||""));
    else if(id==="mysterybox")onConfig("surprises",lines(items,config.surprises||""));
    else if(id==="emoji"){onConfig("emojiClue",items[0]?.prompt||config.emojiClue||"♡ + ✨");onConfig("emojiAnswer",items[0]?.options?.[0]||config.emojiAnswer||"our story");onConfig("emojiHint",items[0]?.options?.[1]||config.emojiHint||"Think of us.");}
    else if(id==="movie"||id==="song")onConfig("bondQuestions",JSON.stringify(items.slice(0,6).map(item=>item.prompt||"What makes your bond special?")));
  }

  async function generate(){
    setState("loading");
    try{
      const response=await fetch(`${api}/api/ai/playful-prompts`,{method:"POST",headers:{"Content-Type":"application/json",...(await authHeaders())},body:JSON.stringify({gameType:id,relationship,tone:"warm, clever, playful and personal"})});
      if(!response.ok)throw new Error();
      const data=await response.json() as {items?:AiItem[]};
      if(!data.items?.length)throw new Error();
      apply(data.items);
      setState("done");
      window.setTimeout(()=>setState("idle"),2200);
    }catch{setState("error")}
  }

  return <section className="playful-ai-assistant"><span>✦</span><div><strong>Need fresh ideas?</strong><small>Groq AI creates six editable prompts for this exact activity.</small></div><button disabled={state==="loading"} onClick={()=>void generate()}>{state==="loading"?"Dreaming up ideas…":state==="done"?"Added — make them yours ✓":state==="error"?"Try AI again":"Ask AI for ideas"}</button></section>;
}
