import assert from "node:assert/strict";

const target=process.env.TARGET_URL;
if(!target)throw new Error("Set TARGET_URL to the backend base URL before running the load smoke test.");
const total=Number(process.env.LOAD_REQUESTS||100);
const concurrency=Number(process.env.LOAD_CONCURRENCY||10);
const durations=[];
let failures=0;
let nextIndex=0;

async function worker(){
 while(true){
  const index=nextIndex++;
  if(index>=total)return;
  const started=performance.now();
  try{
   const response=await fetch(`${target.replace(/\/$/,"")}/api/health`,{signal:AbortSignal.timeout(5000)});
   if(!response.ok)failures++;
  }catch{failures++;}
  durations[index]=performance.now()-started;
 }
}

await Promise.all(Array.from({length:concurrency},worker));
const completed=durations.filter(value=>value>=0).sort((a,b)=>a-b);
const percentile=value=>completed[Math.min(completed.length-1,Math.floor(completed.length*value))]||0;
console.log(JSON.stringify({target,total,concurrency,failures,p50Ms:Math.round(percentile(.5)),p95Ms:Math.round(percentile(.95)),maxMs:Math.round(completed.at(-1)||0)},null,2));
assert.equal(failures,0,"Health requests failed");
assert.ok(percentile(.95)<2000,`p95 latency ${Math.round(percentile(.95))}ms exceeded 2000ms`);
