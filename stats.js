(function(){'use strict';
var SUPABASE_URL='https://abgigsjhdvsqehgdhbym.supabase.co';
var SUPABASE_KEY='sb_publishable_GGcJmjwLXRrYsX8-sYph_g_Gt-0riU_';
var done=false, sbPromise=null;
function loadSupabase(){
  if(window.supabase) return Promise.resolve(window.supabase);
  if(sbPromise) return sbPromise;
  sbPromise=new Promise(function(resolve,reject){
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload=function(){resolve(window.supabase)};
    s.onerror=reject;
    document.head.appendChild(s);
  });
  return sbPromise;
}
function escText(x){return String(x||'').replace(/\s+/g,' ').trim()}
function firstMatch(text,patterns){
  for(var i=0;i<patterns.length;i++){var m=text.match(patterns[i]);if(m)return m}
  return null;
}
function parseResult(){
  var text=escText(document.body.innerText||'');
  var scoreM=firstMatch(text,[
    /(?:Score|स्कोर|Marks|अंक)\s*[:：]?\s*(-?\d+(?:\.\d+)?)\s*(?:\/\s*(\d+))?/i,
    /(-?\d+(?:\.\d+)?)\s*\/\s*(\d+)/
  ]);
  if(!scoreM)return null;
  var total=scoreM[2]?Number(scoreM[2]):0;
  var score=Number(scoreM[1]);
  if(!total)return null;
  function n(patterns){var m=firstMatch(text,patterns);return m?Number(m[1]):null}
  var attempted=n([/(?:Attempted|प्रयास|Attempt)\s*[:：]?\s*(\d+)/i]);
  var correct=n([/(?:Correct|सही)\s*[:：]?\s*(\d+)/i]);
  var wrong=n([/(?:Wrong|गलत)\s*[:：]?\s*(\d+)/i]);
  var skipped=n([/(?:Skipped|Unattempted|छोड़े|अनुत्तरित|Not Answered)\s*[:：]?\s*(\d+)/i]);
  var accuracy=n([/(?:Accuracy|सटीकता|Correct %)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*%?/i]);
  if(attempted===null && correct!==null && wrong!==null)attempted=correct+wrong;
  if(skipped===null && attempted!==null)skipped=Math.max(0,total-attempted);
  if(accuracy===null && attempted!==null && attempted>0)accuracy=Number(((correct!==null?correct/attempted:score/total)*100).toFixed(2));
  return {score:score,total:total,attempted:attempted,correct:correct,wrong:wrong,skipped:skipped,accuracy:accuracy};
}
function hashTitle(title){
  var h=2166136261>>>0;
  for(var i=0;i<title.length;i++){h^=title.charCodeAt(i);h=Math.imul(h,16777619)}
  return (h>>>0);
}
function saveLocal(r){
  try{
    var s=JSON.parse(localStorage.getItem('examStats')||'{}');
    s.attempted=(s.attempted||0)+1;
    s.totalScore=(s.totalScore||0)+r.score;
    s.bestScore=Math.max(s.bestScore||0,r.score);
    s.history=Array.isArray(s.history)?s.history:[];
    s.history.unshift({title:document.title,date:new Date().toISOString(),score:r.score,total:r.total,accuracy:r.accuracy});
    s.history=s.history.slice(0,50);
    localStorage.setItem('examStats',JSON.stringify(s));
  }catch(e){}
}
async function saveCloud(r){
  try{
    var sup=await loadSupabase();
    var client=sup.createClient(SUPABASE_URL,SUPABASE_KEY);
    var session=(await client.auth.getSession()).data.session;
    if(!session)return false;
    var title=document.title||'ExamBook Pro Test';
    var row={
      user_id:session.user.id,
      test_id:hashTitle(title),
      test_title:title,
      score:r.score,
      total_questions:r.total,
      attempted:r.attempted,
      correct:r.correct,
      wrong:r.wrong,
      skipped:r.skipped,
      accuracy:r.accuracy
    };
    var out=await client.from('test_results').insert(row);
    return !out.error;
  }catch(e){return false}
}
function saveResult(attempt){
  if(done)return;
  attempt=attempt||0;
  var r=parseResult();
  if(!r){if(attempt<10)setTimeout(function(){saveResult(attempt+1)},300);return}
  done=true;
  saveLocal(r);
  saveCloud(r);
}
function watch(){
  var els=document.querySelectorAll('button,input[type=button],input[type=submit]');
  els.forEach(function(el){
    var t=(el.innerText||el.value||'').toLowerCase();
    if(/submit|जमा|समाप्त|finish|result/.test(t) && !el.dataset.statsBound){
      el.dataset.statsBound='1';
      el.addEventListener('click',function(){setTimeout(saveResult,700)});
    }
  });
}
watch();
new MutationObserver(watch).observe(document.documentElement,{subtree:true,childList:true});
})();