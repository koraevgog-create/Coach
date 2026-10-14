(()=>{"use strict";
const $=id=>document.getElementById(id),input=$("request"),answer=$("answer"),q=$("question"),area=$("area"),number=$("number");
let queue=[],index=0,current="",saved=[];try{saved=JSON.parse(localStorage.getItem("mentorFavorites")||"[]")}catch{}saved=Array.isArray(saved)?saved.filter(s=>typeof s==="string"&&s.length<=100):[];
const library={contrast:window.MENTOR_CONTRAST||[],cases:MENTOR_CASES.scenarios,extra:window.MENTOR_EXTRA||[],implicit:window.MENTOR_IMPLICIT||[],more:window.MENTOR_MORE||[],context:MENTOR_CONTEXT.themes,intents:MENTOR_CONTEXT.intents,safety:MENTOR_CASES.safety,themes:MENTOR_THEMES,frames:MENTOR_FRAMES,general:MENTOR_QUESTIONS};
function prepare(){const raw=input.value.trim();if(!raw){input.focus();return}const outcome=MentorCore.prepare(raw,library);area.textContent=(outcome.analysis.emergency?"ВАЖНОЕ":outcome.analysis.theme||"ВОПРОС НАСТАВНИКА").toUpperCase();queue=outcome.questions.map(x=>x.question);index=0;show()}
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