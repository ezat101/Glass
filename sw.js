const C='eltabakha-v4';
const A=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
// install: cache each file on its own, so one missing file doesn't break the whole install
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(u).catch(()=>{})))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
// network first (always the newest version when online), cache only as offline backup
self.addEventListener('fetch',e=>{
  const rq=e.request;
  if(rq.method!=='GET'||new URL(rq.url).origin!==location.origin)return;
  e.respondWith(
    fetch(rq,{cache:'no-cache'})
      .then(r=>{
        if(r.status===200&&r.type==='basic'){const cp=r.clone();caches.open(C).then(c=>c.put(rq,cp)).catch(()=>{})}
        return r;
      })
      .catch(()=>caches.match(rq,{ignoreSearch:true}).then(m=>m||caches.match('./index.html')))
  );
});
