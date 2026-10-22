// General callback requests only. Do not collect clinical information or PHI.
const interests = new Set(['General inquiry','Personal Care Assistance','Companionship / Private Duty Care','Respite / Live-In Care','Other home-care services']);
const clean = (value,max) => typeof value === 'string' ? value.trim().slice(0,max) : '';
const response=(statusCode,body)=>({statusCode,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(body)});
exports.handler=async(event)=>{
 if(event.httpMethod!=='POST')return response(405,{error:'Method not allowed.'});
 if((event.body||'').length>4000)return response(413,{error:'Request too large.'});
 let data;try{data=JSON.parse(event.body||'{}')}catch{return response(400,{error:'Invalid request.'})}
 if(data.website)return response(200,{ok:true});
 const name=clean(data.name,100),email=clean(data.email,150),phone=clean(data.phone,30),interest=clean(data.interest,80);
 if(!name||name.length<2||!email||!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email)||!interests.has(interest)||data.consent!==true)return response(400,{error:'Please check your information and consent.'});
 if(phone&&!/^[0-9+().\-\s]{7,30}$/.test(phone))return response(400,{error:'Please enter a valid phone number.'});
 const apiKey=process.env.RESEND_API_KEY,from=process.env.FROM_EMAIL,to=process.env.TO_EMAIL;
 if(!apiKey||!from||!to)return response(503,{error:'Contact service is not configured yet.'});
 const message=['New general website inquiry','Name: '+name,'Email: '+email,'Phone: '+(phone||'Not provided'),'Service interest: '+interest,'','No clinical details were requested.'].join('\n');
 try{
  const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:'NML Website Callback Request',text:message})});
  if(!result.ok){console.error('Email provider rejected request:',result.status);return response(502,{error:'We could not send your request. Please call our office.'})}
  return response(200,{ok:true});
 }catch(error){console.error('Email service unavailable');return response(502,{error:'Service temporarily unavailable. Please call our office.'})}
};
