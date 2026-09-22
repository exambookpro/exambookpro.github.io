(function(){
  'use strict';
  window.ExamBookVerifiedResults={
    async submit:function(testId,answers,timeUsedSeconds){
      if(!window.supabase||!window.supabase.createClient) throw new Error('Supabase client not loaded');
      const client=window.ExamBookVerifiedResults._client||(window.ExamBookVerifiedResults._client=window.supabase.createClient(
        'https://abgigsjhdvsqehgdhbym.supabase.co',
        'sb_publishable_GGcJmjwLXRrYsX8-sYph_g_Gt-0riU_'
      ));
      const {data:sessionData,error:sessionError}=await client.auth.getSession();
      if(sessionError||!sessionData||!sessionData.session||!sessionData.session.access_token) throw new Error('Login session missing or expired');
      const {data,error}=await client.functions.invoke('submit-verified-result',{
        body:{test_id:Number(testId),answers:answers||{},time_used_seconds:Number(timeUsedSeconds)||0},
        headers:{Authorization:'Bearer '+sessionData.session.access_token}
      });
      if(error) throw error;
      if(!data||!data.ok||!data.result) throw new Error((data&&data.error)||'Verified result submission failed');
      return Object.assign({},data.result,{review:Array.isArray(data.review)?data.review:[],section_performance:Array.isArray(data.section_performance)?data.section_performance:[],scoring:data.scoring||{marks_per_correct:1,negative_per_wrong:0,max_score:data.result.total_questions}});
    }
  };
})();