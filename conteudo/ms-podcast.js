/* Podcast Sol Nascente: player com Baixar e Compartilhar (Web Share API com arquivo/link; senão WhatsApp e copiar link). */
(function () {
  var EP = [{ n: 1, titulo: "O mapa do despertar", sub: "Despertar da Matrix: o mapa", arq: "conteudo/podcast/ep01.mp4", poster: "conteudo/podcast/ep01.jpg", nome: "Sol-Nascente-ep01-O-mapa-do-despertar.mp4" }];
  function $(i) { return document.getElementById(i); }
  function link() { return new URL("./#podcast", location.href).href; }
  function msg(t) { var s = $("pod-msg"); if (s) { s.textContent = t; clearTimeout(msg.t); msg.t = setTimeout(function () { s.textContent = ""; }, 4000); } }
  function copiar(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt).then(function () { msg("Link copiado."); }, function () { prompt("Copie o link:", txt); });
    prompt("Copie o link:", txt);
  }
  function compartilhar(ep) {
    var texto = "Sol Nascente, o podcast do Mestre Solar. Episódio " + ep.n + ": " + ep.titulo;
    var dados = { title: "Sol Nascente — ep. " + ep.n, text: texto, url: link() };
    if (!navigator.share) { $("pod-alt").hidden = false; return; }
    msg("Preparando o vídeo…");
    fetch(ep.arq).then(function (r) { return r.blob(); }).then(function (b) {
      var f = new File([b], ep.nome, { type: "video/mp4" });
      if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: dados.title, text: texto + " " + dados.url });
      return navigator.share(dados);
    }).catch(function (e) {
      if (e && e.name === "AbortError") return;
      return navigator.share(dados).catch(function (e2) { if (!e2 || e2.name !== "AbortError") $("pod-alt").hidden = false; });
    }).then(function () { msg(""); });
  }
  function montar() {
    var c = $("pod-corpo"); if (!c || c.dataset.ok) return; c.dataset.ok = "1";
    EP.forEach(function (ep) {
      var d = document.createElement("div"); d.className = "pod-ep";
      d.innerHTML = '<video controls playsinline preload="metadata"></video><h3></h3><p class="pod-sub"></p>' +
        '<div class="pod-bt"><a class="pod-b" download>⬇️ Baixar</a><button type="button" class="pod-b">📤 Compartilhar</button></div>' +
        '<div id="pod-alt" hidden><a class="pod-b" target="_blank" rel="noopener">WhatsApp</a><button type="button" class="pod-b">🔗 Copiar link</button></div><p id="pod-msg" role="status"></p>';
      var v = d.querySelector("video"); v.src = ep.arq; v.poster = ep.poster;
      d.querySelector("h3").textContent = "Episódio " + ep.n + ": " + ep.titulo;
      d.querySelector(".pod-sub").textContent = "Lição: " + ep.sub + " • com Aurora e Caio";
      var a = d.querySelector(".pod-bt a"); a.href = ep.arq; a.setAttribute("download", ep.nome);
      d.querySelector(".pod-bt button").addEventListener("click", function () { compartilhar(ep); });
      var w = d.querySelector("#pod-alt a"); w.href = "https://wa.me/?text=" + encodeURIComponent("Sol Nascente, ep. " + ep.n + ": " + ep.titulo + " " + link());
      d.querySelector("#pod-alt button").addEventListener("click", function () { copiar(link()); });
      c.appendChild(d);
    });
  }
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest('[data-folha="f-podcast"]'); if (b) montar(); }, true);
  function hash() { if (location.hash === "#podcast") { montar(); var b = document.querySelector('[data-folha="f-podcast"]'); if (b) b.click(); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hash); else hash();
})();
