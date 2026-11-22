// Klusjes-Oorlog: netwerk-eerst voor de huidige versie, cache voor offlinegebruik.
const CACHE='klusjes-oorlog-v0717-alpha';
const ASSETS=['./','./index.html','./favicon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest','./version.json','./avatars/level-1.webp','./avatars/level-2.webp','./avatars/level-3.webp','./avatars/level-4.webp','./avatars/level-5.webp','./avatars/level-6.webp','./avatars/level-7.webp','./avatars/level-8.webp','./avatars/level-9.webp','./avatars/level-10.webp'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k.startsWith('klusjes-oorlog-') && k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  // Supabase en externe scripts lopen rechtstreeks via het netwerk.
  // Versiecontrole moet nooit afhankelijk zijn van een offline cache.
  if(url.pathname.endsWith('/version.json')){
    event.respondWith(fetch(request,{cache:'no-store'}));
    return;
  }
  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',copy)));}
      return response;
    }).catch(async()=>await caches.match('./index.html')||Response.error()));
    return;
  }
  event.respondWith(fetch(request).catch(()=>caches.match(request)));
});
