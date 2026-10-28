// Stickman Arena — offline kesh (service worker)
var VER = 'arena-v4';
var FILES = ['./', 'index.html', 'style.css', 'data.js', 'char.js', 'fx.js', 'game.js', 'ui.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-180.png', 'icon-maskable-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VER).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k != VER; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
// Avval keshdan beradi (internetsiz ishlaydi), fonda yangisini yuklab qo'yadi
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method != 'GET' || new URL(r.url).origin != location.origin) return;
  e.respondWith(caches.open(VER).then(function (c) {
    return c.match(r, {ignoreSearch:true}).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(function () { return hit || (r.mode == 'navigate' ? c.match('index.html') : undefined); });
      return hit || net;
    });
  }));
});
