// اسم الكاش بيتاخد من رقم النسخة اللي في index.html (sw.js?v=..)، فمش محتاج تعدّل الملف ده مع كل تحديث
const C='eltabakha-v'+(new URL(self.location.href).searchParams.get('v')||'0');
const A=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const q=e.request;
  if(q.method!=='GET'||new URL(q.url).origin!==location.origin)return;
  const net=fetch(q).then(r=>{if(r&&r.status===200){const cp=r.clone();caches.open(C).then(c=>c.put(q,cp)).catch(()=>{})}return r});
  net.catch(()=>{});
  const slow=new Promise((_,rej)=>setTimeout(()=>rej(new Error('slow')),4000));
  e.respondWith(Promise.race([net,slow]).catch(()=>caches.match(q,{ignoreSearch:true}).then(m=>m||(q.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
