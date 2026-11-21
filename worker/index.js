/**
 * Gallery Baran optional image backup Worker.
 * Configure secrets:
 *   GITHUB_TOKEN
 * Configure variables:
 *   GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH, ALLOWED_ORIGIN
 *
 * Endpoints:
 *   POST   /api/upload  { name, dataUrl }
 *   GET    /api/image?path=baran/name.ext
 *   DELETE /api/delete  { path }
 *
 * The Worker keeps the GitHub token server-side. Add an access key as BARAN_API_KEY
 * secret and send it as X-Baran-Key from the client if you enable remote backup.
 */
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function cors(req,env){
 const origin=req.headers.get('Origin')||'';
 const allowed=env.ALLOWED_ORIGIN||'';
 return {'Access-Control-Allow-Origin':allowed&&origin===allowed?origin:'null','Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type,X-Baran-Key','Vary':'Origin'};
}
export default {
 async fetch(req,env){
  const url=new URL(req.url),headers=cors(req,env);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(!env.GITHUB_TOKEN||!env.GITHUB_OWNER||!env.GITHUB_REPO)return json({error:'Worker is not configured.'},500);
  if(env.ALLOWED_ORIGIN&&req.headers.get('Origin')!==env.ALLOWED_ORIGIN)return json({error:'Origin not allowed.'},403);
  if(env.BARAN_API_KEY&&req.headers.get('X-Baran-Key')!==env.BARAN_API_KEY)return json({error:'Unauthorized.'},401);
  const api='https://api.github.com/repos/'+env.GITHUB_OWNER+'/'+env.GITHUB_REPO+'/contents/';
  const branch=env.GITHUB_BRANCH||'main';
  const ghHeaders={'Authorization':'Bearer '+env.GITHUB_TOKEN,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Gallery-Baran-Backup'};
  try{
   if(url.pathname==='/api/upload'&&req.method==='POST'){
    const body=await req.json(),name=String(body.name||'').replace(/[^a-zA-Z0-9._-]/g,'_'),dataUrl=String(body.dataUrl||'');
    if(!name||!/^data:image\/(png|jpeg|webp|gif);base64,/.test(dataUrl))return json({error:'Invalid image.'},400);
    const base64=dataUrl.split(',')[1];if(base64.length>12*1024*1024)return json({error:'Image too large.'},413);
    const path='baran/'+Date.now()+'-'+name;
    const r=await fetch(api+path,{method:'PUT',headers:ghHeaders,body:JSON.stringify({message:'Upload artwork image: '+name,content:base64,branch})});
    const d=await r.json();if(!r.ok)return json({error:d.message||'GitHub upload failed.'},r.status);
    return new Response(JSON.stringify({ok:true,path,url:url.origin+'/api/image?path='+encodeURIComponent(path)}),{headers:{...headers,'Content-Type':'application/json'}});
   }
   if(url.pathname==='/api/image'&&req.method==='GET'){
    const path=url.searchParams.get('path')||'';if(!/^baran\/[a-zA-Z0-9._/-]+$/.test(path)||path.includes('..'))return new Response('Invalid path',{status:400,headers});
    const r=await fetch(api+path+'?ref='+encodeURIComponent(branch),{headers:ghHeaders});if(!r.ok)return new Response('Image not found',{status:r.status,headers});
    const d=await r.json(),raw=atob(d.content.replace(/\n/g,'')),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const ext=path.split('.').pop().toLowerCase(),mime={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif'}[ext]||'application/octet-stream';
    return new Response(bytes,{headers:{...headers,'Content-Type':mime,'Cache-Control':'private, max-age=3600'}});
   }
   if(url.pathname==='/api/delete'&&req.method==='DELETE'){
    const body=await req.json(),path=String(body.path||'');if(!/^baran\/[a-zA-Z0-9._/-]+$/.test(path)||path.includes('..'))return json({error:'Invalid path.'},400);
    const existing=await fetch(api+path+'?ref='+encodeURIComponent(branch),{headers:ghHeaders});if(!existing.ok)return json({error:'File not found.'},404);
    const file=await existing.json(),r=await fetch(api+path,{method:'DELETE',headers:ghHeaders,body:JSON.stringify({message:'Delete artwork image',sha:file.sha,branch})});
    if(!r.ok)return json({error:'Delete failed.'},r.status);return new Response(JSON.stringify({ok:true}),{headers:{...headers,'Content-Type':'application/json'}});
   }
   return json({error:'Not found.'},404);
  }catch(e){return json({error:'Worker error: '+e.message},500);}
 }
};