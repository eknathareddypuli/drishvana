const V = 'drishvana-v5';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== CDN && k !== 'transformers-cache').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Network-first so updates arrive, cache fallback so it works offline.
const CDN = 'drishvana-cdn';
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  // AI engine files from jsdelivr: cache-first so captions and voices keep working offline after the first use.
  if (r.method === 'GET' && u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.open(CDN).then(c => c.match(r).then(m => m || fetch(r).then(res => { if (res && res.ok && res.type !== 'opaque') c.put(r, res.clone()); return res; }))));
    return;
  }
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(ch => ch.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});
