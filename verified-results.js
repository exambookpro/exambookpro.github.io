(function(){
  'use strict';
  const SUPABASE_URL='https://abgigsjhdvsqehgdhbym.supabase.co';
  const SUPABASE_KEY='sb_publishable_GGcJmjwLXRrYsX8-sYph_g_Gt-0riU_';
  window.ExamBookVerifiedResults={
    async submit:function(testId,answers,timeUsedSeconds){
      if(!window.supabase||!window.supabase.createClient) throw new Error('Supabase client not loaded');
      const client=window.ExamBookVerifiedResults._client||(window.ExamBookVerifiedResults._client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY));
      let {data,error}=await client.auth.getSession();
      if(error) throw new Error('Login session check failed: '+(error.message||error));
      if(!data||!data.session){
        const refreshed=await client.auth.refreshSession();
        if(refreshed.error||!refreshed.data||!refreshed.data.session) throw new Error('Login session missing or expired');
        data=refreshed.data;
      }
      const token=data.session.access_token;
      const response=await fetch(SUPABASE_URL+'/functions/v1/submit-verified-result',{
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+token},
        body:JSON.stringify({test_id:Number(testId),answers:answers||{},time_used_seconds:Number(timeUsedSeconds)||0})
      });
      let payload=null;
      try{payload=await response.json()}catch(e){}
      if(!response.ok||!payload||!payload.ok||!payload.result){
        const msg=(payload&&payload.error)||('HTTP '+response.status+' while saving result');
        throw new Error(msg);
      }
      return Object.assign({},payload.result,{review:Array.isArray(payload.review)?payload.review:[],section_performance:Array.isArray(payload.section_performance)?payload.section_performance:[],scoring:payload.scoring||{marks_per_correct:1,negative_per_wrong:0,max_score:payload.result.total_questions}});
    }
  };
})();