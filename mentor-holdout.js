(function(root){"use strict";
const holdout=[
 ["В офисе к вечеру выжат, а утром уже без сил","overwork"],
 ["На счета всё уходит, а до конца месяца пусто","financial_pressure"],
 ["Мы с женой живем вместе но почти молчим","relationship_disconnection"],
 ["Нужно решить, но страшно ошибиться","decision_pressure"],
 ["Вокруг знакомые люди, а поговорить не с кем","social_isolation"],
 ["Доход нормальный, а после оплаты расходов пусто","financial_pressure"]
];
function run(){const library={contrast:root.MENTOR_CONTRAST,cases:root.MENTOR_CASES.scenarios,extra:root.MENTOR_EXTRA,more:root.MENTOR_MORE,implicit:root.MENTOR_IMPLICIT,context:root.MENTOR_CONTEXT.themes,intents:root.MENTOR_CONTEXT.intents,safety:root.MENTOR_CASES.safety,themes:root.MENTOR_THEMES,frames:root.MENTOR_FRAMES,general:root.MENTOR_QUESTIONS};return holdout.map(([input,expected])=>{const result=root.MentorCore.prepare(input,library);return{input,expected,actual:result.analysis.semantic?.id||"none",first:result.questions[0]?.question||"",pass:result.analysis.semantic?.id===expected&&result.questions[0]?.stage==="semantic"}})}
root.MentorHoldout={run,holdout};
})(window);