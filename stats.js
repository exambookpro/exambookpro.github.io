(function(){'use strict';
function saveResult(){
  try{
    var s=JSON.parse(localStorage.getItem('examStats')||'{}');
    s.attempted=(s.attempted||0)+1;
    var text=document.body.innerText||'';
    var m=text.match(/(?:Score|स्कोर|Marks|अंक)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+))?/i);
    if(m){var score=Number(m[1]);s.totalScore=(s.totalScore||0)+score;s.bestScore=Math.max(s.bestScore||0,score)}
    s.history=Array.isArray(s.history)?s.history:[];
    s.history.unshift({title:document.title,date:new Date().toISOString(),score:m?Number(m[1]):0});
    s.history=s.history.slice(0,50);
    localStorage.setItem('examStats',JSON.stringify(s));
  }catch(e){}
}
var done=false;
function watch(){
  if(done)return;
  var els=document.querySelectorAll('button,input[type=button],input[type=submit]');
  els.forEach(function(el){
    var t=(el.innerText||el.value||'').toLowerCase();
    if(/submit|जमा|समाप्त|finish|result/.test(t) && !el.dataset.statsBound){
      el.dataset.statsBound='1';el.addEventListener('click',function(){setTimeout(function(){if(!done){done=true;saveResult()}},700)});
    }
  });
}
watch();new MutationObserver(watch).observe(document.documentElement,{subtree:true,childList:true});
})();
