"use client";
import { useState } from "react";

const steps=[
 {label:"Begin with aarti",title:"Circle the light",hint:"Tap the thali to begin the blessing."},
 {label:"Add the tilak",title:"A little wish for protection",hint:"The roli and rice carry your warmest wishes."},
 {label:"Tie the rakhi",title:"Pull the thread gently",hint:"Tap to tie the rakhi around their wrist."},
 {label:"Send shagun",title:"Seal it with something sweet",hint:"Laddoos, kaju katli and a little shagun."},
];
export default function RakhiRitual(){
 const [step,setStep]=useState(0);const [complete,setComplete]=useState(false);
 function advance(){if(step===steps.length-1){setComplete(true);return}setStep(current=>current+1)}
 return <section className={`rb-interactive step-${step} ${complete?"complete":""}`} aria-labelledby="ritual-title"><div className="rb-interactive-copy"><span className="rb-kicker">AN INTERACTIVE RAKHI MOMENT</span><h2 id="ritual-title">Let them experience the ritual, <em>tap by tap.</em></h2><p>Build a festive reveal that moves from aarti to tilak, the rakhi knot, sweets and shagun.</p><div className="rb-step-list">{steps.map((item,index)=><button key={item.label} className={index===step?"active":index<step||complete?"done":""} onClick={()=>{setComplete(false);setStep(index)}}><b>{index<step||complete?"✓":index+1}</b><span>{item.label}</span></button>)}</div></div><div className="rb-interactive-stage"><div className="rb-ritual-sparkles" aria-hidden="true">{Array.from({length:14},(_,index)=><i key={index}>✦</i>)}</div>{step<2?<img className="rb-generated-thali" src="/celebrations/generated/festival-thali-sweets-shagun.webp" alt="Aarti thali, sweets and shagun for the Rakhi ritual"/>:<img className="rb-generated-hands" src="/celebrations/generated/rakhi-tying.webp" alt="Hands tying a red and gold rakhi"/>}<div className="rb-ritual-card"><small>{complete?"RITUAL COMPLETE":`STEP ${step+1} OF ${steps.length}`}</small><strong>{complete?"A promise, tied with love.":steps[step].title}</strong><p>{complete?"Your sibling can now continue into their letters, memories and games.":steps[step].hint}</p><button onClick={complete?()=>{setStep(0);setComplete(false)}:advance}>{complete?"Replay ritual ↻":step===2?"Tie the rakhi →":step===3?"Complete the ritual →":"Continue →"}</button></div></div></section>
}
