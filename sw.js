/* Service worker do Mestre Solar: app offline + conteúdo guardado depois de usado. */
var VERSAO = "ms-2026-10-27-0812-aberturas-smart";
var APP = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon-180.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSAO + "-app").then(function (c) { return c.addAll(APP); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf("ms-") === 0 && k.indexOf(VERSAO) !== 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* áudio: guarda o mp3 INTEIRO (pedido sem Range) e responde pedidos Range com 206 feito do arquivo inteiro.
   Assim o cache nunca recebe um pedaço (206) e o áudio não para no meio, online ou offline. */
function audio(r) {
  var url = r.url.split("#")[0];
  return caches.open(VERSAO + "-conteudo").then(function (c) {
    return c.match(url).then(function (hit) {
      if (hit) return hit;
      return fetch(url, { credentials: "same-origin" }).then(function (res) {
        if (res.status === 200) c.put(url, res.clone()).catch(function () {});
        return res;
      });
    }).then(function (res) {
      var rg = r.headers.get("range");
      if (!rg || res.status !== 200) return res;
      return res.blob().then(function (bl) {
        var n = bl.size, m = /^bytes=(\d*)-(\d*)$/.exec(rg.trim()), a = 0, z = n - 1;
        if (m && m[1]) { a = +m[1]; if (m[2]) z = Math.min(+m[2], n - 1); }
        else if (m && m[2]) { a = Math.max(0, n - +m[2]); }
        if (!m || a >= n || a > z) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + n } });
        return new Response(bl.slice(a, z + 1), { status: 206, statusText: "Partial Content", headers: {
          "Content-Type": res.headers.get("Content-Type") || "audio/mpeg", "Content-Range": "bytes " + a + "-" + z + "/" + n,
          "Content-Length": String(z - a + 1), "Accept-Ranges": "bytes" } });
      });
    });
  }).catch(function () { return fetch(r); });
}
function ehConteudo(u) { return u.pathname.indexOf("/conteudo/") !== -1; }
self.addEventListener("fetch", function (e) {
  var r = e.request; if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(VERSAO + "-app").then(function (c) { c.put("./index.html", cp); }); return res; })
      .catch(function () { return caches.match("./index.html"); }));
    return;
  }
  if (ehConteudo(u) && /\.mp3$/i.test(u.pathname)) { e.respondWith(audio(r)); return; }
  if (ehConteudo(u)) {
    /* conteúdo: responde do cache na hora e atualiza em segundo plano (stale-while-revalidate) */
    e.respondWith(caches.open(VERSAO + "-conteudo").then(function (c) {
      return c.match(r).then(function (hit) {
        var rede = fetch(r).then(function (res) { if (res.status === 200) c.put(r, res.clone()).catch(function () {}); return res; });
        if (hit) { rede.catch(function () {}); return hit; }
        return rede;
      });
    }));
    return;
  }
  if (u.origin === location.origin) e.respondWith(caches.match(r).then(function (hit) { return hit || fetch(r); }));
});
