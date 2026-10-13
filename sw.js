/* Caderneta de Fauna – funciona sem internet; atualiza sozinho quando há sinal.
   Não mexe em localStorage nem IndexedDB: os registros ficam intactos. */
const V="fauna-2.4";
const ARQ=["./","index.html","jszip.min.js","icon.png","manifest.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(ARQ.map(a=>c.add(new Request(a,{cache:"reload"})).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith("fauna-")).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin!==location.origin&&!/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const rede=fetch(r).then(resp=>{if(resp&&resp.ok)c.put(r,resp.clone());return resp;}).catch(()=>null);
    if(hit){e.waitUntil(rede);return hit;}   // abre na hora do cache; atualiza em segundo plano
    return (await rede)||new Response("Sem internet e arquivo ainda não guardado.",{status:503});
  }));
});
