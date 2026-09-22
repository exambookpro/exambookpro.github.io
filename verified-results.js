(function(){
  'use strict';
  window.ExamBookVerifiedResults={
    async submit:function(testId,answers,timeUsedSeconds){
      if(!window.supabase||!window.supabase.createClient) throw new Error('Supabase client not loaded');
      const client=window.ExamBookVerifiedResults._client||(window.ExamBookVerifiedResults._client=window.supabase.createClient(
        'https://abgigsjhdvsqehgdhbym.supabase.co',
        'sb_publishable_GGcJmjwLXRrYsX8-sYph_g_Gt-0riU_'
      ));
      const {data,error}=await client.functions.invoke('submit-verified-result',{
        body:{test_id:Number(testId),answers:answers||{},time_used_seconds:Number(timeUsedSeconds)||0}
      });
      if(error) throw error;
      if(!data||!data.ok) throw new Error((data&&data.error)||'Verified result submission failed');
      return data.result;
    }
  };
})();