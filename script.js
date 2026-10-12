(()=>{"use strict";
const $=id=>document.getElementById(id),input=$("request"),answer=$("answer"),q=$("question"),area=$("area"),number=$("number");
let questions=[],index=0,current="",saved=[];
try{saved=JSON.parse(localStorage.getItem("mentorFavorites")||"[]")}catch{}
saved=Array.isArray(saved)?saved.filter(x=>typeof x==="string"&&x.length<=100):[];
const norm=s=>s.toLowerCase().replace(/ё/g,"е").replace(/[^а-яa-z0-9\s]/g," ").replace(/\s+/g," ").trim();
const matched=(text,key)=>{const q=norm(key);return q.includes(" ")?text.includes(q):text.split(" ").some(w=>w.startsWith(q))};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function detect(text){const n=norm(text);return MENTOR_THEMES.map(t=>({name:t[0],score:t[1].split(",").reduce((a,k)=>a+(matched(n,k)?1:0),0)})).sort((a,b)=>b.score-a.score).filter(t=>t.score>0).slice(0,2)}
function detectIntents(text){const n=norm(text);return MENTOR_CONTEXT.intents.map(i=>({item:i,score:i.keys.reduce((a,k)=>a+(matched(n,k)?1:0),0)})).sort((a,b)=>b.score-a.score).filter(i=>i.score>0).slice(0,2).map(i=>i.item)}
function prepare(){const text=input.value.trim();if(!text){input.focus();return}
const themes=detect(text),intents=detectIntents(text);
area.textContent=(themes.length?themes.map(x=>x.name).join(" · "):"Открытый вопрос").toUpperCase();
const topic=themes.length?themes[0].name.toLowerCase():text.slice(0,32);
const contextual=themes.flatMap(x=>MENTOR_CONTEXT.themes[x.name]||[]);
const intentQs=intents.flatMap(i=>i.questions);
const frames=MENTOR_FRAMES.map(f=>f.replaceAll("{topic}",topic));
const baseline=MENTOR_QUESTIONS;
questions=[...new Set([...shuffle(contextual),...shuffle(intentQs),...shuffle(frames),...shuffle(baseline)].filter(x=>x.length<=100))];
index=0;show()}
function show(){if(!questions.length)return;if(index>=questions.length){questions=shuffle(questions);index=0}current=questions[index++];q.textContent=current;number.textContent=String(index).padStart(2,"0");answer.classList.remove("hidden");$("save").textContent=saved.includes(current)?"★ Сохранено":"☆ Сохранить";answer.scrollIntoView({behavior:"smooth",block:"center"})}
function render(){const box=$("favorites");box.replaceChildren();if(!saved.length){const el=document.createElement("p");el.textContent="Пока здесь тихо. Сохрани вопрос, который откликнется.";box.append(el);return}saved.slice().reverse().forEach(s=>{const el=document.createElement("div");el.className="fav";el.textContent=s;box.append(el)})}
function store(){try{localStorage.setItem("mentorFavorites",JSON.stringify(saved))}catch{}}
input.addEventListener("input",()=>{$("count").textContent=input.value.length});
$("ask").addEventListener("click",prepare);$("next").addEventListener("click",show);
$("save").addEventListener("click",()=>{if(!current)return;saved=saved.includes(current)?saved.filter(s=>s!==current):[...saved,current];store();render();$("save").textContent=saved.includes(current)?"★ Сохранено":"☆ Сохранить"});
$("copy").addEventListener("click",()=>{if(!current)return;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(current).catch(()=>{});else{const t=document.createElement("textarea");t.value=current;document.body.append(t);t.select();document.execCommand("copy");t.remove()}});
$("clear").addEventListener("click",()=>{saved=[];store();render()});
document.querySelectorAll("[data-example]").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.example;input.dispatchEvent(new Event("input"));prepare()}));
MENTOR_THEMES.forEach(t=>{const b=document.createElement("button");b.textContent=t[0];b.addEventListener("click",()=>{input.value="Хочу разобраться: "+t[0].toLowerCase();input.dispatchEvent(new Event("input"));prepare()});$("categories").append(b)});
render();})();