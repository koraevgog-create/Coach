(()=>{"use strict";
const $=id=>document.getElementById(id),input=$("request"),answer=$("answer"),q=$("question"),area=$("area"),number=$("number");
let queue=[],index=0,current="",saved=[];try{saved=JSON.parse(localStorage.getItem("mentorFavorites")||"[]")}catch{}saved=Array.isArray(saved)?saved.filter(s=>typeof s==="string"&&s.length<=100):[];
const normalize=s=>String(s).toLowerCase().replace(/ё/g,"е").replace(/[^а-яa-z0-9\s]/g," ").replace(/\s+/g," ").trim();
const match=(s,k)=>{const key=normalize(k);if(key.includes(" "))return (" "+s+" ").includes(" "+key+" ")||s.includes(key+" ");return s.split(" ").some(w=>w===key||(key.length>=4&&w.startsWith(key)))};
const count=(text,keys)=>keys.reduce((n,k)=>n+(match(text,k)?1:0),0);
const unique=xs=>[...new Set(xs.filter(x=>typeof x==="string"&&x.length<=100))];
function rank(text){const themes=MENTOR_THEMES.map(t=>({name:t[0],score:count(text,t[1].split(","))})).filter(x=>x.score).sort((a,b)=>b.score-a.score);const intents=MENTOR_CONTEXT.intents.map(i=>({item:i,score:count(text,i.keys)})).filter(x=>x.score).sort((a,b)=>b.score-a.score);const scenarios=[...MENTOR_CASES.scenarios,...(window.MENTOR_EXTRA||[])].map(c=>({item:c,score:count(text,c.keys)*10+Math.max(0,...c.keys.filter(k=>match(text,k)).map(k=>normalize(k).length))})).filter(x=>x.score).sort((a,b)=>b.score-a.score);return{themes,intents,scenarios}}
function prepare(){const text=input.value.trim();if(!text){input.focus();return}const n=normalize(text),r=rank(n);const crisis=MENTOR_CASES.safety.find(c=>count(n,c.keys)>0);const specific=r.scenarios[0]?.item;const themeName=specific?.theme||r.themes[0]?.name||"";const intent=r.intents[0]?.item;area.textContent=(crisis?"ВАЖНОЕ":themeName||"ВОПРОС НАСТАВНИКА").toUpperCase();
const specificQs=specific?specific.questions:[];const contextual=themeName?(MENTOR_CONTEXT.themes[themeName]||[]):[];const intentQs=intent?intent.questions:[];const backup=MENTOR_QUESTIONS;const promptContext=themeName.toLowerCase();
const dynamic=promptContext?MENTOR_FRAMES.map(f=>f.replaceAll("{topic}",promptContext)):[];
queue=unique([...(crisis?crisis.questions:[]),...specificQs,...intentQs,...contextual,...dynamic,...backup]);if(crisis)queue=unique(crisis.questions);index=0;show()}
function show(){if(!queue.length)return;if(index>=queue.length)index=0;current=queue[index++];q.textContent=current;number.textContent=String(index).padStart(2,"0");answer.classList.remove("hidden");$("save").textContent=saved.includes(current)?"★ Сохранено":"☆ Сохранить";answer.scrollIntoView({behavior:"smooth",block:"center"})}
function render(){const box=$("favorites");box.replaceChildren();if(!saved.length){const e=document.createElement("p");e.textContent="Пока пусто. Сохрани вопрос, который откликнется.";box.append(e);return}saved.slice().reverse().forEach(s=>{const e=document.createElement("div");e.className="fav";e.textContent=s;box.append(e)})}
function store(){try{localStorage.setItem("mentorFavorites",JSON.stringify(saved))}catch{}}
input.addEventListener("input",()=>{$("count").textContent=input.value.length});
$("ask").addEventListener("click",prepare);$("next").addEventListener("click",show);
$("save").addEventListener("click",()=>{if(!current)return;saved=saved.includes(current)?saved.filter(s=>s!==current):[...saved,current];store();render();$("save").textContent=saved.includes(current)?"★ Сохранено":"☆ Сохранить"});
$("copy").addEventListener("click",()=>{if(!current)return;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(current).catch(()=>{});else{const t=document.createElement("textarea");t.value=current;document.body.append(t);t.select();document.execCommand("copy");t.remove()}});
$("clear").addEventListener("click",()=>{saved=[];store();render()});
document.querySelectorAll("[data-example]").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.example;input.dispatchEvent(new Event("input"));prepare()}));
MENTOR_THEMES.forEach(t=>{const b=document.createElement("button");b.textContent=t[0];b.addEventListener("click",()=>{input.value="Хочу разобраться: "+t[0].toLowerCase();input.dispatchEvent(new Event("input"));prepare()});$("categories").append(b)});render();
})();