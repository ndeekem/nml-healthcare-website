// Authenticated HR read/update via Supabase Auth; access controlled by HR_ALLOWED_EMAILS.
const reply=(statusCode,data)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(data)});
exports.handler=async event=>{
 if(!['GET','PATCH'].includes(event.httpMethod))return reply(405,{error:'Method not allowed'});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,anon=process.env.SUPABASE_ANON_KEY;
 if(!url||!key||!anon)return reply(503,{error:'HR connection is not configured'});
 const jwt=(event.headers.authorization||event.headers.Authorization||'').match(/^Bearer (.+)$/i)?.[1];if(!jwt)return reply(401,{error:'HR login required'});
 const base=url.replace(/\/$/,'');let user;
 try{const r=await fetch(base+'/auth/v1/user',{headers:{apikey:anon,Authorization:'Bearer '+jwt}});if(!r.ok)return reply(401,{error:'Session invalid'});user=await r.json()}catch{return reply(503,{error:'Authentication unavailable'})}
 
if (!user.email_confirmed_at) {
  return reply(403, { error: 'Verified HR email required' });
}
const allowed = (process.env.HR_ALLOWED_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
if (!allowed.includes((user.email || '').toLowerCase())) return reply(403, { error: 'HR access not authorized' });

 const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
 try{
  if(event.httpMethod==='GET'){const r=await fetch(base+'/rest/v1/nml_applications?select=id,reference,first_name,last_name,email,role,employment_type,status,created_at,application&order=created_at.desc&limit=100',{headers});if(!r.ok)return reply(502,{error:'Unable to load applications'});return reply(200,{applications:await r.json()})}
  let d;try{d=JSON.parse(event.body||'{}')}catch{return reply(400,{error:'Invalid request'})}
  if(!/^[0-9a-f-]{36}$/i.test(d.id||'')||!['Applied','Screening','Interview','Offer','Hired','Declined'].includes(d.status))return reply(400,{error:'Invalid application update'});
  const r=await fetch(base+'/rest/v1/nml_applications?id=eq.'+encodeURIComponent(d.id),{method:'PATCH',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({status:d.status})});return r.ok?reply(200,{ok:true}):reply(502,{error:'Update failed'});
 }catch{return reply(503,{error:'HR service unavailable'})}
};
