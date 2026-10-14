(function(root){
"use strict";
const norm=s=>String(s||"").toLowerCase().replace(/ё/g,"е").replace(/[^а-яa-z0-9\s]/g," ").replace(/\s+/g," ").trim();
const tokens=s=>norm(s).split(" ").filter(Boolean);
const matches=(text,key)=>{const t=norm(text),k=norm(key);if(!k)return false;if(k.includes(" "))return (" "+t+" ").includes(" "+k+" ")||t.startsWith(k+" ")||t===k;return tokens(t).some(w=>w===k||(k.length>=4&&w.startsWith(k)))};
const hitKeys=(text,keys)=>keys.filter(k=>matches(text,k));
function analyze(raw,library){
 const text=norm(raw);
 const contrast=(library.contrast||[]).filter(c=>hitKeys(text,c.keys).length).sort((a,b)=>longest(b,text)-longest(a,text))[0]||null;
 const exceptions={job_change:["меня уволили","меня увольняют","сократили"],breakup:["не хочу расставаться","не хочу разводиться"],starting_business:["не хочу открывать бизнес"]};
 const cases=[...(library.cases||[]),...(library.extra||[]),...(library.more||[])].map((item,order)=>{const hits=hitKeys(text,item.keys);let score=hits.length*10+Math.max(0,...hits.map(k=>norm(k).length));if((exceptions[item.id]||[]).some(k=>matches(text,k)))score=0;return{item,score,order}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.order-b.order);
 const themes=(library.themes||[]).map(([name,keys])=>({name,score:hitKeys(text,keys.split(",")).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const intents=(library.intents||[]).map(item=>({item,score:hitKeys(text,item.keys).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const emergency=(library.safety||[]).find(item=>hitKeys(text,item.keys).length>0)||null;
 return{contrast,scenario:cases[0]?.item||null,theme:cases[0]?.item.theme||themes[0]?.name||"",intents:intents.map(x=>x.item),emergency};
}
function longest(c,t){return Math.max(0,...hitKeys(t,c.keys).map(x=>norm(x).length))}
function prepare(text,library){const a=analyze(text,library),unique=new Set(),stages=[];
 const add=(arr,stage)=>{for(const q of arr||[]){if(typeof q==="string"&&q.length<=100&&!unique.has(q)){unique.add(q);stages.push({question:q,stage})}}};
 if(a.emergency){add(a.emergency.questions,"support");return{analysis:a,questions:stages}}
 if(a.contrast){add(a.contrast.questions,"specific");add((library.intents||[]).filter(i=>i.id!=="желание").flatMap(i=>a.intents.includes(i)?i.questions:[]),"explore")}
 else{add(a.scenario?.questions,"specific");add(a.intents.flatMap(i=>i.questions).slice(0,6),"explore")}
 add(library.context?.[a.theme],"perspective");
 add((library.frames||[]).map(q=>q.replaceAll("{topic}",a.theme.toLowerCase())).filter(()=>Boolean(a.theme)).slice(0,3),"perspective");
 add((library.general||[]).slice(0,10),"reflect");
 return{analysis:a,questions:stages}
}
root.MentorCore={norm,matches,analyze,prepare};
})(typeof window!=="undefined"?window:globalThis);