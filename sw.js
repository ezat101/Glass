/* رقم النسخة بييجي من التطبيق نفسه (sw.js?v=APP_VER)، فكل تحديث بيعمل كاش جديد ويمسح القديم */
const V = new URL(self.location.href).searchParams.get('v') || '0';
const C = 'eltabakha-v' + V;
const A = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './vodafone.svg', './instapay.png'];
const NAV_TIMEOUT = 4000; // لو النت بطيء أكتر من كده افتح النسخة المحفوظة على طول

self.addEventListener('install', e => {
  // كل ملف لوحده: لو ملف واحد ناقص (زي أيقونة) التثبيت ميفشلش كله
  e.waitUntil(caches.open(C).then(c => Promise.all(A.map(u =>
    fetch(u, { cache: 'reload' }).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {})
  ))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x.startsWith('eltabakha-') && x !== C).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isNav = req.mode === 'navigate';
  const fromCache = () => caches.match(req).then(m => m || (isNav ? caches.match('./index.html') : undefined));

  e.respondWith(new Promise(resolve => {
    let done = false;
    const finish = r => { if (!done && r) { done = true; resolve(r); } };

    const net = fetch(req).then(r => {
      // بنحفظ الردود السليمة بس، عشان صفحة خطأ ما تتحفظش مكان النسخة الكويسة
      if (r && r.ok && r.type === 'basic') { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)); }
      return r;
    });

    const timer = isNav ? setTimeout(() => { fromCache().then(finish); }, NAV_TIMEOUT) : null;

    net.then(r => { clearTimeout(timer); finish(r); })
      .catch(() => {
        clearTimeout(timer);
        fromCache().then(m => finish(m || Response.error()));
      });
  }));
});
