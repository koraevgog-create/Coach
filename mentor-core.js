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


const compoundRules=[
 {id:"work_debt_family",all:[["уволиться","уйти с работы","сменить работу"],["кредит","долг","ипотек"],["семь","дет","родител"]],questions:["Как сохранить финансовую опору семьи, если решишь сменить работу?","Какие условия позволят тебе менять работу без резкого риска для близких?","Что можно подготовить до решения об увольнении?"]},
 {id:"work_debt",all:[["уволиться","уйти с работы","сменить работу"],["кредит","долг","ипотек"]],questions:["Какой финансовый запас нужен, чтобы сменить работу спокойнее?","Что можно проверить до увольнения, учитывая обязательные платежи?","Какой риск перехода для тебя сейчас самый существенный?"]},
 {id:"work_family",all:[["уволиться","уйти с работы","сменить работу"],["семья","семьи","семью","дети","детей","ребенок","родител","близк"]],questions:["Какие потребности близких важно учесть при смене работы?","Что изменится для семьи, если ты останешься или уйдёшь?","Как обсудить эту перемену с близкими без поспешных обещаний?"]},
 {id:"money_relationship",all:[["денег","деньг","зарплат","кредит","долг"],["ссор","руга","муж","жен","партнер","отношен"]],questions:["Что в денежных вопросах тревожит каждого из вас больше всего?","Какая договорённость о деньгах сейчас отсутствует?","Как обсудить финансовые трудности без взаимных обвинений?"]},
 {id:"moving_family",all:[["переезд","переех","уехать","переезж"],["семья","семьи","семью","дети","детей","ребенок","муж","жен","родител"]],questions:["Чьи потребности при переезде пока остаются неуслышанными?","Какое условие сделает перемену посильной для семьи?","Что можно выяснить вместе до решения о переезде?"]},
 {id:"work_exhaustion_money",all:[["работ","начальник"],["устал","выгор","нет сил"],["денег","кредит","долг","зарплат"]],questions:["Как снизить истощение, не потеряв важный для тебя доход?","Что можно изменить в нагрузке, пока финансовый вопрос не решён?","Какая часть ситуации требует внимания прежде всего?"]},
 {id:"love_fear",all:[["любл","отношен","партнер","парень","девушк"],["боюсь","страшно","страх","потеря"]],questions:["Что именно ты боишься потерять в этих отношениях?","Где твои опасения опираются на факты, а где на догадки?","О какой потребности тебе важно поговорить открыто?"]}
];
function compoundMatch(text){return compoundRules.find(rule=>rule.all.every(group=>group.some(k=>matches(text,k))))||null}

function analyze(raw,library){
 const text=expand(raw);
 const compound=compoundMatch(text);
 const nuance=nuanceRules.find(c=>hitKeys(text,c.keys).length>0)||null;
 const contrast=(library.contrast||[]).filter(c=>hitKeys(text,c.keys).length).sort((a,b)=>longest(b,text)-longest(a,text))[0]||null;
 const exceptions={job_change:["меня уволили","меня увольняют","сократили"],breakup:["не хочу расставаться","не хочу разводиться"],starting_business:["не хочу открывать бизнес"]};
 const cases=[...(library.cases||[]),...(library.extra||[]),...(library.more||[])].map((item,order)=>{const hits=hitKeys(text,item.keys);let score=hits.length*10+Math.max(0,...hits.map(k=>norm(k).length));if((exceptions[item.id]||[]).some(k=>matches(text,k)))score=0;return{item,score,order}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.order-b.order);
 const themes=(library.themes||[]).map(([name,keys])=>({name,score:hitKeys(text,keys.split(",")).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const intents=(library.intents||[]).map(item=>({item,score:hitKeys(text,item.keys).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const emergency=(library.safety||[]).find(item=>hitKeys(text,item.keys).length>0)||null;
 return{compound,nuance,contrast,scenario:cases[0]?.item||null,theme:cases[0]?.item.theme||themes[0]?.name||"",intents:intents.map(x=>x.item),emergency};
}
function longest(c,t){return Math.max(0,...hitKeys(t,c.keys).map(x=>norm(x).length))}
function prepare(text,library){const a=analyze(text,library),unique=new Set(),stages=[];
 const add=(arr,stage)=>{for(const q of arr||[]){if(typeof q==="string"&&q.length<=100&&!unique.has(q)){unique.add(q);stages.push({question:q,stage})}}};
 if(a.emergency){add(a.emergency.questions,"support");return{analysis:a,questions:stages}}
 if(a.compound){add(a.compound.questions,"combined");}
 if(a.nuance&&!a.contrast&&!a.compound){add(a.nuance.questions,"specific");}
 if(a.contrast){add(a.contrast.questions,"specific");add((library.intents||[]).filter(i=>i.id!=="желание").flatMap(i=>a.intents.includes(i)?i.questions:[]),"explore")}
 else{add(a.scenario?.questions,"specific");add(a.intents.flatMap(i=>i.questions).slice(0,6),"explore")}
 add(library.context?.[a.theme],"perspective");
 add((library.frames||[]).map(q=>q.replaceAll("{topic}",a.theme.toLowerCase())).filter(()=>Boolean(a.theme)).slice(0,3),"perspective");
 add((library.general||[]).slice(0,10),"reflect");
 return{analysis:a,questions:stages}
}
root.MentorCore={norm,expand,matches,analyze,prepare};
})(typeof window!=="undefined"?window:globalThis);