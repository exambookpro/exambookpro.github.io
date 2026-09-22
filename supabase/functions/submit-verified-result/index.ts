import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return new Response(JSON.stringify({error:"POST required"}),{status:405,headers:{...cors,"Content-Type":"application/json"}});
 try{
  const ah=req.headers.get("Authorization")||"";if(!ah.startsWith("Bearer "))throw new Error("Authentication required");
  const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const uc=createClient(url,anon,{global:{headers:{Authorization:ah}}}),{data:{user},error:ue}=await uc.auth.getUser();if(ue||!user)throw new Error("Invalid session");
  const admin=createClient(url,service),body=await req.json(),testId=Number(body.test_id),answers=body.answers&&typeof body.answers==="object"?body.answers:{};
  const timeUsed=Number.isFinite(Number(body.time_used_seconds))?Math.max(0,Math.min(86400,Number(body.time_used_seconds))):null;
  if(!Number.isInteger(testId)||testId<=0)throw new Error("Invalid test_id");
  const {data:test,error:te}=await admin.from("tests").select("id,title,duration_minutes").eq("id",testId).single();if(te||!test)throw new Error("Test not found");
  const {data:questions,error:qe}=await admin.from("questions").select("id,question,question_hi,question_en,option_a,option_a_hi,option_a_en,option_b,option_b_hi,option_b_en,option_c,option_c_hi,option_c_en,option_d,option_d_hi,option_d_en,correct_answer,explanation,explanation_hi,explanation_en").eq("test_id",testId).order("id");
  if(qe)throw new Error("Could not load test questions");if(!questions?.length)throw new Error("This test has no questions");
  const validIds=new Set(questions.map(q=>String(q.id)));let correct=0,attempted=0;
  for(const [qid,value] of Object.entries(answers)){if(!validIds.has(String(qid)))continue;const a=Number(value);if(!Number.isInteger(a)||a<0||a>3)continue;attempted++;const q=questions.find(x=>String(x.id)===String(qid));if(q&&a===Number(q.correct_answer))correct++}
  const total=questions.length,wrong=attempted-correct,skipped=total-attempted,accuracy=attempted?Number(((correct/attempted)*100).toFixed(2)):0;
  const review=questions.map(q=>{const selected=validIds.has(String(q.id))&&answers[q.id]!==undefined?Number(answers[q.id]):null;return{id:q.id,question:q.question,question_hi:q.question_hi,question_en:q.question_en,selected,correct_answer:q.correct_answer,explanation:q.explanation,explanation_hi:q.explanation_hi,explanation_en:q.explanation_en}});
  const {data:result,error:ie}=await admin.from("test_results").insert({user_id:user.id,test_id:test.id,test_title:test.title,score:correct,total_questions:total,attempted,correct,wrong,skipped,accuracy,time_used_seconds:timeUsed}).select("id,score,total_questions,attempted,correct,wrong,skipped,accuracy,time_used_seconds,created_at").single();if(ie)throw new Error("Could not save result");
  return new Response(JSON.stringify({ok:true,result,review}),{status:200,headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({ok:false,error:e instanceof Error?e.message:"Request failed"}),{status:400,headers:{...cors,"Content-Type":"application/json"}})}
});