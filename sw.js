/* Service worker do Mestre Solar: app offline + conteúdo guardado depois de usado. */
var VERSAO = "ms-2026-10-26-instalar";
var APP = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon-180.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSAO + "-app").then(function (c) { return c.addAll(APP); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf("ms-") === 0 && k.indexOf(VERSAO) !== 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function ehConteudo(u) { return u.pathname.indexOf("/conteudo/") !== -1; }
self.addEventListener("fetch", function (e) {
  var r = e.request; if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(VERSAO + "-app").then(function (c) { c.put("./index.html", cp); }); return res; })
      .catch(function () { return caches.match("./index.html"); }));
    return;
  }
  if (ehConteudo(u)) {
    /* conteúdo: responde do cache na hora e atualiza em segundo plano (stale-while-revalidate) */
    e.respondWith(caches.open(VERSAO + "-conteudo").then(function (c) {
      return c.match(r).then(function (hit) {
        var rede = fetch(r).then(function (res) { if (res.ok) c.put(r, res.clone()); return res; });
        if (hit) { rede.catch(function () {}); return hit; }
        return rede;
      });
    }));
    return;
  }
  if (u.origin === location.origin) e.respondWith(caches.match(r).then(function (hit) { return hit || fetch(r); }));
});
