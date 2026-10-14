(function(root){"use strict";
const examples=[
["Хочу уволиться","want_quit"],["Не хочу увольняться","not_quit"],
["Хочу расстаться","want_breakup"],["Не хочу расставаться","not_breakup"],
["Хочу открыть бизнес","want_business"],["Не хочу открывать бизнес","dont_want_business"],
["Хочу ребёнка","want_child"],["Не хочу ребенка","dont_want_child"],
["Меня уволили","laid_off"],["Мне не хватает денег","money_short"],
["Хочу больше зарабатывать","income_growth"],["Боюсь сменить работу","job_change"],
["Не хватает времени","no_time"],["Родители давят на меня","parents_pressure"],
["Боюсь будущего","anxiety_future"],["Хочу переехать","move"],
["Мне одиноко","loneliness"],["Ревную партнера","jealousy"],
["Меня бьют","EMERGENCY"],["Хочу умереть","EMERGENCY"]
];
function run(){const library={contrast:window.MENTOR_CONTRAST,cases:window.MENTOR_CASES.scenarios,extra:window.MENTOR_EXTRA,more:window.MENTOR_MORE,context:window.MENTOR_CONTEXT.themes,intents:window.MENTOR_CONTEXT.intents,safety:window.MENTOR_CASES.safety,themes:window.MENTOR_THEMES,frames:window.MENTOR_FRAMES,general:window.MENTOR_QUESTIONS};return examples.map(([input,expected])=>{const result=MentorCore.prepare(input,library);const actual=result.analysis.emergency?"EMERGENCY":result.analysis.contrast?.id||result.analysis.scenario?.id||"none";return{input,expected,actual,pass:actual===expected,first:result.questions[0]?.question||""}})}
root.MentorTests={run,examples};
})(window);