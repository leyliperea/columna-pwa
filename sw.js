const CACHE='columna-v9';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./assets/icon-96.png','./assets/icon-128.png','./assets/icon-192.png','./assets/icon-256.png','./assets/icon-512.png','./assets/icon-maskable-512.png','./assets/store-preview.png','./widgets/column-template.json','./widgets/column-data.json','./widgets/widget-preview.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method==='GET')event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match('./index.html'))))});

async function widgetPayload(dataUrl='./widgets/column-data.json',templateUrl='./widgets/column-template.json'){
  const [template,data]=await Promise.all([fetch(templateUrl).then(r=>r.text()),fetch(dataUrl).then(r=>r.text())]);
  return {template,data};
}

if('widgets' in self){
  self.addEventListener('widgetinstall',event=>event.waitUntil((async()=>{const payload=await widgetPayload(event.widget.definition.data,event.widget.definition.msAcTemplate);await self.widgets.updateByTag(event.widget.definition.tag,payload)})()));
  self.addEventListener('widgetresume',event=>event.waitUntil((async()=>{const payload=await widgetPayload(event.widget.definition.data,event.widget.definition.msAcTemplate);await self.widgets.updateByTag(event.widget.definition.tag,payload)})()));
  self.addEventListener('widgetclick',event=>{if(event.action==='open-calculator')event.waitUntil(clients.openWindow('./index.html'))});
  self.addEventListener('message',event=>{if(event.data?.type==='UPDATE_WIDGET'){event.waitUntil((async()=>{const template=await fetch('./widgets/column-template.json').then(r=>r.text());await self.widgets.updateByTag('columna-resumen',{template,data:JSON.stringify(event.data.data)})})())}});
}
