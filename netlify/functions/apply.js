// NML employment intake. Requires Supabase project with SQL schema installed.
const response=(statusCode,data)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},body:JSON.stringify(data)});
const str=(x,n=200)=>typeof x==='string'?x.trim().slice(0,n):'';
const allowed=['Full-time','Part-time','Per diem','Temporary'];
const emailOk=x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return response(405,{error:'Method not allowed'});
 if((event.body||'').length>40000)return response(413,{error:'Application exceeds size limit'});
 let d;try{d=JSON.parse(event.body||'{}')}catch{return response(400,{error:'Invalid application'})}
 if(d.website)return response(200,{ok:true,reference:'RECEIVED'});
 if(!str(d.firstName,80)||!str(d.lastName,80)||!emailOk(str(d.email,150))||!str(d.cellPhone,30)||!str(d.role,80)||!allowed.includes(d.employmentType)||!['Yes','No'].includes(d.workAuthorized)||!d.typedSignature||!Array.isArray(d.acknowledge)||!d.acknowledge.includes('on')||!Array.isArray(d.verifyEmployment)||!d.verifyEmployment.includes('on')||!Array.isArray(d.privacyConsent)||!d.privacyConsent.includes('on'))return response(400,{error:'Please complete all required information and acknowledgments'});
 // Exclude identity data that should never enter an initial applicant form.
 const forbidden=['ssn','socialSecurity','dateOfBirth','dob','driversLicense','driverLicense','criminalHistory'];for(const k of forbidden)if(d[k]!=null)return response(400,{error:'Sensitive identity fields are not accepted'});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return response(503,{error:'Employment applications are not yet accepting submissions. Please call NML.'});
 const clean={};for(const [k,v] of Object.entries(d)){if(k==='website')continue;if(typeof v==='string')clean[k]=str(v,1500);else if(Array.isArray(v))clean[k]=v.slice(0,40).map(x=>typeof x==='string'?str(x,200):x);else if(v&&typeof v==='object')clean[k]=v}
 const reference='NML-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,7).toUpperCase();
 try{const r=await fetch(url.replace(/\/$/,'')+'/rest/v1/nml_applications',{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({reference,first_name:str(d.firstName,80),last_name:str(d.lastName,80),email:str(d.email,150),role:str(d.role,80),employment_type:d.employmentType,application:clean,status:'Applied'})});if(!r.ok){console.error('Applicant database insert failed',r.status);return response(503,{error:'Application service temporarily unavailable'})}return response(201,{ok:true,reference})}catch(e){console.error('Applicant intake unavailable');return response(503,{error:'Application service temporarily unavailable'})}
};
