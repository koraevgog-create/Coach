(function(root){
"use strict";
const norm=s=>String(s||"").toLowerCase().replace(/ё/g,"е").replace(/[^а-яa-z0-9\s]/g," ").replace(/\s+/g," ").trim();
const tokens=s=>norm(s).split(" ").filter(Boolean);
const matches=(text,key)=>{const t=norm(text),k=norm(key);if(!k)return false;if(k.includes(" "))return (" "+t+" ").includes(" "+k+" ")||t.startsWith(k+" ")||t===k;return tokens(t).some(w=>w===k||(k.length>=4&&w.startsWith(k)))};
const hitKeys=(text,keys)=>keys.filter(k=>matches(text,k));

// Natural-language aliases are matched on full words; original input stays unchanged.
const colloquial=[
 [/работа (?:вроде |то )?(?:норм|нормальная|хорошая) но /g,"работа норм но "],
 [/неохота/g,"не хочется"],[/зп/g,"зарплаты"],
 [/денег кот наплакал/g,"мало денег"],[/бабок нет/g,"денег нет"],
 [/не вывожу/g,"нет сил"],[/сил больше нет/g,"нет сил"],
 [/постоянно откладываю/g,"откладываю"],
 [/(?<![а-я])боюс(?![а-я])/g,"боюсь"],[/уволится/g,"уволиться"],[/расстатся/g,"расстаться"],
 [/зарплату задержуют/g,"зарплату задерживают"]
];
function expand(text){let x=norm(text);for(const [re,to] of colloquial)x=x.replace(re,to);return x.replace(/не хочу расстаться/g,"не хочу расставаться")}
const nuanceRules=[
 {id:"work_ambivalence",keys:["работа норм но","работа хорошая но","не хочу идти на работу","работа вроде норм","каждое утро не хочу на работу"],questions:["Что в этой работе устраивает тебя, а что постепенно истощает?","В какой момент дня нежелание идти на работу становится сильнее?","Какую перемену можно попробовать без немедленного увольнения?"]},
 {id:"conflicted_feelings",keys:["и хочу и боюсь","хочу но страшно","хочу но боюсь","не знаю радоваться или","одновременно хочу и не хочу"],questions:["Какие две потребности сейчас спорят внутри тебя?","Что привлекает тебя в перемене, а что хочется сохранить?","Какой небольшой шаг позволил бы проверить свои чувства?"]},
 {id:"vague_distress",keys:["меня все достало","все достало","не понимаю что делать","я запутался","ничего не понимаю","все сложно"],questions:["Что из происходящего давит на тебя сильнее всего прямо сейчас?","Если выбрать одну проблему, с какой стоит начать?","Какая часть ситуации уже ясна тебе без дополнительных ответов?"]},
 {id:"unsure_mistake",keys:["кажется я ошибся","походу я ошибся","наверно зря","зря я это сделал"],questions:["По каким признакам ты считаешь это ошибкой?","Что ты знал в момент своего решения?","Что ещё можно изменить в последствиях выбора?"]}
];

function analyze(raw,library){
 const text=expand(raw);
 const nuance=nuanceRules.find(c=>hitKeys(text,c.keys).length>0)||null;
 const contrast=(library.contrast||[]).filter(c=>hitKeys(text,c.keys).length).sort((a,b)=>longest(b,text)-longest(a,text))[0]||null;
 const exceptions={job_change:["меня уволили","меня увольняют","сократили"],breakup:["не хочу расставаться","не хочу разводиться"],starting_business:["не хочу открывать бизнес"]};
 const cases=[...(library.cases||[]),...(library.extra||[]),...(library.more||[])].map((item,order)=>{const hits=hitKeys(text,item.keys);let score=hits.length*10+Math.max(0,...hits.map(k=>norm(k).length));if((exceptions[item.id]||[]).some(k=>matches(text,k)))score=0;return{item,score,order}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.order-b.order);
 const themes=(library.themes||[]).map(([name,keys])=>({name,score:hitKeys(text,keys.split(",")).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const intents=(library.intents||[]).map(item=>({item,score:hitKeys(text,item.keys).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const emergency=(library.safety||[]).find(item=>hitKeys(text,item.keys).length>0)||null;
 return{nuance,contrast,scenario:cases[0]?.item||null,theme:cases[0]?.item.theme||themes[0]?.name||"",intents:intents.map(x=>x.item),emergency};
}
function longest(c,t){return Math.max(0,...hitKeys(t,c.keys).map(x=>norm(x).length))}
function prepare(text,library){const a=analyze(text,library),unique=new Set(),stages=[];
 const add=(arr,stage)=>{for(const q of arr||[]){if(typeof q==="string"&&q.length<=100&&!unique.has(q)){unique.add(q);stages.push({question:q,stage})}}};
 if(a.emergency){add(a.emergency.questions,"support");return{analysis:a,questions:stages}}
 if(a.nuance&&!a.contrast){add(a.nuance.questions,"specific");}
 if(a.contrast){add(a.contrast.questions,"specific");add((library.intents||[]).filter(i=>i.id!=="желание").flatMap(i=>a.intents.includes(i)?i.questions:[]),"explore")}
 else{add(a.scenario?.questions,"specific");add(a.intents.flatMap(i=>i.questions).slice(0,6),"explore")}
 add(library.context?.[a.theme],"perspective");
 add((library.frames||[]).map(q=>q.replaceAll("{topic}",a.theme.toLowerCase())).filter(()=>Boolean(a.theme)).slice(0,3),"perspective");
 add((library.general||[]).slice(0,10),"reflect");
 return{analysis:a,questions:stages}
}
root.MentorCore={norm,expand,matches,analyze,prepare};
})(typeof window!=="undefined"?window:globalThis);