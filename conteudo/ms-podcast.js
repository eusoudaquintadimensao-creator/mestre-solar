/* Podcast Sol Nascente: player com Baixar e Compartilhar (Web Share API com arquivo/link; senão WhatsApp e copiar link). */
(function () {
  var EP = [{ n: 1, titulo: "O mapa do despertar", sub: "Despertar da Matrix: o mapa", arq: "conteudo/podcast/ep01.mp4", poster: "conteudo/podcast/ep01.jpg", nome: "Sol-Nascente-ep01-O-mapa-do-despertar.mp4" },
    { n: 3, titulo: "Você não é a voz na sua cabeça", sub: "Eu observador e descentramento", arq: "conteudo/podcast/ep03.mp4", poster: "conteudo/podcast/ep03.jpg", nome: "Sol-Nascente-ep03-Voce-nao-e-a-voz-na-sua-cabeca.mp4", vertical: true },
    { n: 5, titulo: "A mente que a Matrix não programa", sub: "Mente soberana: perceber a isca, conferir a fonte e o filtro das 3 perguntas", arq: "conteudo/podcast/ep05.mp4", poster: "conteudo/podcast/ep05.jpg", nome: "Sol-Nascente-ep05-A-mente-que-a-Matrix-nao-programa.mp4", vertical: true },
    { n: 4, titulo: "Quem viu a Terra do espaço voltou diferente", sub: "Assombro e o efeito visão geral: a caminhada do assombro", arq: "conteudo/podcast/ep04.mp4", poster: "conteudo/podcast/ep04.jpg", nome: "Sol-Nascente-ep04-Quem-viu-a-Terra-do-espaco.mp4", vertical: true },
    { n: 2, titulo: "A Matrix da religião", sub: "Matriz religiosa: culpa, medo, raiva e ganância", arq: "conteudo/podcast/ep02.mp4", poster: "conteudo/podcast/ep02.jpg", nome: "Sol-Nascente-ep02-A-Matrix-da-religiao.mp4", vertical: true }];
  EP.sort(function (a, b) { return b.n - a.n; }); /* mais novo primeiro */
  function $(i) { return document.getElementById(i); }
  function link() { return new URL("./#podcast", location.href).href; }
  function msg(t, ep) { var s = ep && ep._msg; if (s) { s.textContent = t; clearTimeout(msg.t); msg.t = setTimeout(function () { s.textContent = ""; }, 4000); } }
  function copiar(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt).then(function () { msg("Link copiado.", copiar.ep); }, function () { prompt("Copie o link:", txt); });
    prompt("Copie o link:", txt);
  }
  function compartilhar(ep) {
    var texto = "Sol Nascente, o podcast do Conhecimento Solar. Episódio " + ep.n + ": " + ep.titulo;
    var dados = { title: "Sol Nascente — ep. " + ep.n, text: texto, url: link() };
    if (!navigator.share) { ep._alt.hidden = false; return; }
    msg("Preparando o vídeo…", ep);
    fetch(ep.arq).then(function (r) { return r.blob(); }).then(function (b) {
      var f = new File([b], ep.nome, { type: "video/mp4" });
      if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: dados.title, text: texto + " " + dados.url });
      return navigator.share(dados);
    }).catch(function (e) {
      if (e && e.name === "AbortError") return;
      return navigator.share(dados).catch(function (e2) { if (!e2 || e2.name !== "AbortError") ep._alt.hidden = false; });
    }).then(function () { msg("", ep); });
  }
  function montar() {
    var c = $("pod-corpo"); if (!c || c.dataset.ok) return; c.dataset.ok = "1";
    EP.forEach(function (ep) {
      var d = document.createElement("div"); d.className = "pod-ep";
      d.innerHTML = '<video controls playsinline preload="metadata"></video><h3></h3><p class="pod-sub"></p>' +
        '<div class="pod-bt"><a class="pod-b" download>⬇️ Baixar</a><button type="button" class="pod-b">📤 Compartilhar</button></div>' +
        '<div class="pod-alt" hidden><a class="pod-b" target="_blank" rel="noopener">WhatsApp</a><button type="button" class="pod-b">🔗 Copiar link</button></div><p class="pod-msg" role="status"></p>';
      var v = d.querySelector("video"); v.src = ep.arq; v.poster = ep.poster;
      d.querySelector("h3").textContent = "Episódio " + ep.n + ": " + ep.titulo;
      d.querySelector(".pod-sub").textContent = "Lição: " + ep.sub + " • com Aurora e Caio";
      var a = d.querySelector(".pod-bt a"); a.href = ep.arq; a.setAttribute("download", ep.nome);
      d.querySelector(".pod-bt button").addEventListener("click", function () { compartilhar(ep); });
      ep._alt = d.querySelector(".pod-alt"); ep._msg = d.querySelector(".pod-msg"); if (ep.vertical) v.className = "pod-vert";
      var w = d.querySelector(".pod-alt a"); w.href = "https://wa.me/?text=" + encodeURIComponent("Sol Nascente, ep. " + ep.n + ": " + ep.titulo + " " + link());
      d.querySelector(".pod-alt button").addEventListener("click", function () { copiar.ep = ep; copiar(link()); });
      c.appendChild(d);
    });
  }
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest('[data-folha="f-podcast"]'); if (b) montar(); }, true);
  function hash() { if (location.hash === "#podcast") { montar(); var b = document.querySelector('[data-folha="f-podcast"]'); if (b) b.click(); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hash); else hash();
  /* Link #podcast na 1ª visita: depois do portal o app abre "Qual é o seu caminho?" por cima do podcast; quando essa folha fecha, volta ao podcast (uma vez). */
  function voltar() {
    var c = $("f-caminho"); if (!c || location.hash !== "#podcast" || !window.MutationObserver) return;
    var viu = false, ob = new MutationObserver(function () {
      if (!c.hidden) { viu = true; return; }
      if (viu) { ob.disconnect(); setTimeout(function () { var f = $("f-podcast"); if (f && f.hidden) hash(); }, 50); }
    });
    ob.observe(c, { attributes: true, attributeFilter: ["hidden"] });
    setTimeout(function () { ob.disconnect(); }, 600000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", voltar); else voltar();
})();
