/*! SOL1 — o Sol da tela principal do Conhecimento Solar.
 * Base unificada offline (lições + apps embutidos), memória pessoal só no aparelho, visual reativo à voz (Web Audio),
 * volume de voz e música, painel/paleta de comandos, segurar o Sol para falar (push-to-talk) e interromper a fala.
 * Segurança: nenhum texto de entrada ou da base vai para innerHTML (tudo textContent); dados salvos validados. ES5. */
(function (W, D) {
  "use strict";
  if (W.SOL1) return;
  var LS = null; try { LS = W.localStorage; } catch (e) {}
  var KP = "ms-sol1-perfil-v1", KV = "ms-sol1-som-v1", KQ = "ms-sol1-visual-v1";
  var RM = false; try { RM = W.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  function lsg(k) { try { var v = LS && LS.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function lss(k, v) { try { LS && LS.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function lg() { var l = (W.MSI && MSI.lang) || "pt"; return /^(pt|en|es)$/.test(l) ? l : "pt"; }
  function tx(pt, en, es) { var l = lg(); return l === "en" ? en : l === "es" ? es : pt; }
  function el(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function MS() { return W.MestreSolar; }
  function clamp(v, a, b) { v = Number(v); if (!isFinite(v)) v = a; return Math.max(a, Math.min(b, v)); }

  /* ---------------- texto e busca (BM25, mesmo núcleo do Sol 2.0) ---------------- */
  function nz(s) { s = String(s || "").toLowerCase(); try { s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {} return s.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }
  var STOP = {}; ("passa passar manda mandar dar faz fazer ver mostra mostre give show a o as os um uma uns umas de do da dos das no na nos nas em por para pra com sem que qual quais quem e ou se sao foi era eh me te lhe voce voces vc eu tu ele ela eles elas isso isto esse essa este esta aquilo como onde quando porque pq sobre ao aos mais muito muita ja so tem ha ser estar fala fale diga conte explique explica saber sabe quero queria gostaria pode poderia significa existe existem seu sua meu minha the of to in on for with about is are was were be what who which how why when where do does did tell me you your i my an and or it this that from by as at can could please el la los las un una del al es fue quien cual donde por con sin mi su lo le y eso esto ese dime puedes app aplicativo aplicacion").split(" ").forEach(function (w) { STOP[w] = 1; });
  function toks(s) { return nz(s).split(" ").filter(function (w) { return w && !STOP[w] && w.length > 1; }); }
  function st(w) { return w.length > 5 ? w.slice(0, 5) : w; }
  var KB = null, IDX = null, KBL = "", carregando = null;
  function carrega(l) {
    l = l || lg(); if (KB && KBL === l) return Promise.resolve(KB);
    if (carregando && carregando.l === l) return carregando.p;
    var p = fetch("conteudo/sol1/kb-" + l + ".json", { credentials: "same-origin" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (k) { if (!k || !k.licoes || !k.apps) throw new Error("kb"); KB = k; KBL = l; indexa(); carregando = null; return k; })
      .catch(function (e) { carregando = null; throw e; });
    carregando = { l: l, p: p }; return p;
  }
  function indexa() {
    var docs = [], df = {}, tot = 0;
    function doc(o, campos) { var tf = {}; campos.forEach(function (c) { toks(c[0]).forEach(function (t) { var s = st(t); tf[s] = (tf[s] || 0) + c[1]; }); });
      var len = 0; for (var k in tf) { len += tf[k]; df[k] = (df[k] || 0) + 1; } tot += len;
      o.tf = tf; o.len = len; docs.push(o); }
    KB.licoes.forEach(function (e, ix) { doc({ k: "l", ix: ix, fr: (e.p || []).map(nz).filter(function (p) { return p.length > 3; }), tn: nz(e.t) },
      [[e.t, 3], [(e.p || []).join(" "), 2.5], [KB.grupos[e.g] || "", 0.8], [e.r, 1], [e.a || "", 0.45]]); });
    KB.apps.forEach(function (e, ix) { var tn = nz(e.t); doc({ k: "a", ix: ix, fr: (e.p || []).map(nz).filter(function (p) { return p.length > 3; }), tn: /·/.test(e.t) ? "" : tn, cur: !/·/.test(e.t) && !!(e.p && e.p.length) },
      [[e.t, 2.2], [(e.p || []).join(" "), 2.5], [e.app, 1.6], [e.r, 1]]); });
    IDX = { docs: docs, df: df, N: docs.length, avg: tot / docs.length };
  }
  function busca(q, extra) {
    var qt = toks(q).map(st), qn = " " + nz(q) + " ", res = [], I = IDX, k1 = 1.3, b = 0.72, PW = {};
    qt.forEach(function (t) { PW[t] = 1; }); if (extra) toks(extra).map(st).forEach(function (t) { if (!PW[t]) PW[t] = 0.35; });
    var uq = qt.filter(function (t, i) { return qt.indexOf(t) === i; }), todos = Object.keys(PW);
    I.docs.forEach(function (d) {
      var s = 0, hit = 0; todos.forEach(function (t) { var f = d.tf[t]; if (!f) return; if (PW[t] === 1) hit++; var idf = Math.log(1 + (I.N - I.df[t] + 0.5) / (I.df[t] + 0.5)); s += PW[t] * idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * d.len / I.avg)); });
      if (s <= 0) return; var cob = hit / Math.max(1, uq.length), fr = 0; s *= 0.5 + 0.5 * cob;
      d.fr.forEach(function (p) { if (qn.indexOf(" " + p + " ") >= 0) { s += 4 + 1.5 * p.split(" ").length; fr = 1; } });
      if (d.tn && d.tn.length > 3 && qn.indexOf(" " + d.tn + " ") >= 0) { s += 6; fr = 1; }
      if (d.cur) s *= 1.12;
      res.push({ d: d, s: s, cob: cob, fr: fr });
    });
    res.sort(function (a, b) { return b.s - a.s; }); return res;
  }
  function fraco(top, q) { if (!top) return true; if (top.fr) return top.s < 3; var n = toks(q).length; return top.s < 3.4 || (n >= 2 && top.cob < 0.6) || (n >= 4 && top.cob < 0.7); }
  function docDe(r) { return r.d.k === "l" ? KB.licoes[r.d.ix] : KB.apps[r.d.ix]; }

  /* ---------------- memória pessoal (só no aparelho) ---------------- */
  var NOME_OK = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' .-]{0,29}$/;
  function limpaNome(n) { n = String(n || "").replace(/[\u0000-\u001f<>{}\[\]\\\/@#$%^&*=+|~`"]/g, "").replace(/\s+/g, " ").trim().slice(0, 30); n = n.replace(/[.!?,;:]+$/, ""); if (!NOME_OK.test(n)) return ""; return n.split(" ").map(function (w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : w; }).join(" "); }
  function perfil() {
    var p = lsg(KP); if (!p || typeof p !== "object" || Array.isArray(p)) p = {};
    var o = { v: 1, tom: /^(direto|acolhedor|normal)$/.test(p.tom) ? p.tom : "normal", interesses: {}, ultimo: null, n: clamp(p.n || 0, 0, 1e6) };
    if (p.interesses && typeof p.interesses === "object") Object.keys(p.interesses).slice(0, 60).forEach(function (k) { if (typeof k === "string" && k.length < 90) o.interesses[k] = clamp(p.interesses[k], 0, 1e5); });
    if (p.ultimo && typeof p.ultimo === "object" && typeof p.ultimo.t === "string") o.ultimo = { t: p.ultimo.t.slice(0, 120), app: String(p.ultimo.app || "").slice(0, 60), ts: clamp(p.ultimo.ts, 0, 9e15) };
    return o;
  }
  function salvaPerfil(o) { lss(KP, o); }
  function nome() { var a = lsg("ms-sol-nome-v1") || {}, b = lsg("jarvis-pessoa-v1") || {}; var n = (a && typeof a.nome === "string" && a.nome) || (b && typeof b.nome === "string" && b.nome) || ""; return limpaNome(n); }
  function gravaNome(n) { n = limpaNome(n); if (!n) return ""; var a = lsg("ms-sol-nome-v1"); if (!a || typeof a !== "object") a = {}; a.nome = n; lss("ms-sol-nome-v1", a);
    var b = lsg("jarvis-pessoa-v1"); if (!b || typeof b !== "object") b = {}; b.nome = n; lss("jarvis-pessoa-v1", b); return n; }
  function esquece() { try { LS.removeItem(KP); } catch (e) {} var a = lsg("ms-sol-nome-v1"); if (a && typeof a === "object") { delete a.nome; lss("ms-sol-nome-v1", a); } var b = lsg("jarvis-pessoa-v1"); if (b && typeof b === "object") { delete b.nome; lss("jarvis-pessoa-v1", b); } }
  function anota(titulo, area) { var p = perfil(); p.n++; if (area) p.interesses[area] = (p.interesses[area] || 0) + 1; p.ultimo = { t: String(titulo || "").slice(0, 120), app: String(area || "").slice(0, 60), ts: Date.now() }; salvaPerfil(p); }
  function favoritos(n) { var p = perfil(); return Object.keys(p.interesses).sort(function (a, b) { return p.interesses[b] - p.interesses[a]; }).slice(0, n || 3); }
  /* usa o nome com naturalidade: no máximo 1 a cada 3 respostas, nunca se o texto já tem o nome */
  var usoNome = 0;
  function personaliza(t) { var n = nome(); usoNome++; if (!n || usoNome % 3 !== 1 || nz(t).indexOf(nz(n)) >= 0) return t; return n.split(" ")[0] + ", " + t.charAt(0).toLowerCase() + t.slice(1); }

  /* ---------------- conversa: o que o Sol 1 trata ---------------- */
  var PASSA = /^(?:ajuda|comandos|menu|temas|mitos|fontes?|qual a fonte|legenda|sobre|aviso|briefing|ouvir|pausar|continuar|proxima|parar|me guie|medit|quebrar a matrix|caminho|sou (?:catolic|evangelic|espirit|ateu|agnostic|umband|budist|judeu|muculman)|bom dia|boa tarde|boa noite|ensinamento do dia|pergunta do dia|uma frase|feliz aniversario|abr[ei]\w*|open|abrir|wikipedia|pesquis|traduz)|(?:clima|previsao|tempo em|noticia|news|weather|forecast|hoje na historia|today in history|que horas|horas sao|quanto (?:e|da|eh)|calcul|o que significa|significado d|e verdade que|is it true|es verdad que|me chamo|meu nome e|my name is|me llamo|moro em|gosto de|prefiro tom|caixa de pandora|crimes da igreja|contradic|atrocidad)/;
  var PERG = /\?|^(?:quem|o que|oque|qual|quais|como|onde|quando|por que|porque|pra que|para que|quanto|quantos|quantas|existe|e verdade|explique|explica|me fale|fale sobre|conte|what|who|how|where|when|why|which|is|are|does|do|can|tell me|explain|que|quien|cual|cuales|como|donde|cuando|por que|cuanto|cuantos|explica|hablame)\b/;
  var RX = {
    chama: /^(?:me chame de|pode me chamar de|quero ser chamad[oa] de|me chama de|call me|you can call me|llamame|puedes llamarme)\s+(.{1,40})$/,
    chamaO: /^\s*(?:me chame de|pode me chamar de|quero ser chamad[oa] de|me chama de|call me|you can call me|ll[aá]mame|puedes llamarme)\s+(.{1,40}?)\s*[.!]?\s*$/i,
    perfil: /^(?:o que voce (?:sabe|lembra) (?:sobre|de) mim|meu perfil|minha memoria|what do you (?:know|remember) about me|my profile|que sabes de mi|que recuerdas de mi|mi perfil)\s*$/,
    esquece: /^(?:esquec\w* (?:tudo sobre mim|meu perfil|meu nome|de mim|meus dados)|apag\w* (?:meu perfil|minha memoria|meus dados)|forget (?:me|my name|my data|my profile)|olvida\w* (?:mi nombre|mis datos|mi perfil)|olvidame)\s*$/,
    tom: /(?:tom|seja|fale (?:de forma|de um jeito|comigo de forma)?|be|se)\s*(direto|direta|objetivo|objetiva|acolhedor|acolhedora|carinhoso|carinhosa|normal|direct|warm|calido|calida)\b/,
    painel: /^(?:painel|painel do sol|paleta|comandos do sol|volume|ajustar volume|volume da musica|volume da voz|command palette|panel|sun panel)\s*$/
  };
  var pular = 0;
  function trata(texto) {
    try {
      if (pular) { pular = 0; return false; }
      var q = String(texto || "").trim(); if (!q || q.length > 400) return false;
      var qn = nz(q);
      if (RX.chama.test(qn)) { var mo = q.match(RX.chamaO), n = gravaNome(mo ? mo[1] : ""); return diz(n ? tx("Combinado, vou te chamar de " + n + ". Fica guardado só neste aparelho.", "Deal, I will call you " + n + ". It stays only on this device.", "Hecho, te llamaré " + n + ". Queda guardado solo en este dispositivo.") : tx("Não consegui entender esse nome. Use só letras, até 30.", "I could not read that name. Use letters only, up to 30.", "No entendí ese nombre. Usa solo letras, hasta 30."), null, [[tx("Meu perfil", "My profile", "Mi perfil"), function () { abrePainel("perfil"); }]]); }
      if (RX.perfil.test(qn)) return diz(resumoPerfil(), null, [[tx("Editar perfil", "Edit profile", "Editar perfil"), function () { abrePainel("perfil"); }]]);
      if (RX.esquece.test(qn)) { esquece(); return diz(tx("Pronto. Apaguei o seu nome, o tom e os temas que eu lembrava. Nada disso saiu do seu aparelho.", "Done. I erased your name, tone and the topics I remembered. None of it ever left your device.", "Listo. Borré tu nombre, el tono y los temas que recordaba. Nada salió de tu dispositivo.")); }
      var mt = qn.match(RX.tom); if (mt && /tom|seja|fale|be |se /.test(qn) && qn.split(" ").length <= 7) { var p = perfil(); p.tom = /diret|objetiv|direct/.test(mt[1]) ? "direto" : /acolhed|carinh|warm|calid/.test(mt[1]) ? "acolhedor" : "normal"; salvaPerfil(p); return false; /* o Sol antigo também guarda e responde */ }
      if (RX.painel.test(qn)) { abrePainel(/volume/.test(qn) ? "som" : ""); return true; }
      if (PASSA.test(qn)) return false;
      if (!KB || KBL !== lg()) { carrega().catch(function () {}); return false; }
      var rs = busca(q), top = rs[0];
      if (!fraco(top, q)) {
        var e = docDe(top);
        if (top.d.k === "a") { respondeApp(e, q, rs); return true; }
        var id = W.MSX && MSX.id ? MSX.id(e.t) : null;
        if (id && MS() && MS().abrirPorId) { anota(e.t, KB.grupos[e.g]); estado("pensando"); MS().abrirPorId(id); return true; }
        return false;
      }
      /* fraco: se não parece pergunta, ou se uma IA no aparelho foi ligada pelo usuário, deixa o caminho antigo */
      if (!PERG.test(qn)) return false;
      try { if (W.IASOL && IASOL.camada && IASOL.camada() !== "c") return false; } catch (e2) {}
      try { var h = MS() && MS().buscar && MS().buscar(q, 1); if (h && h[0] && h[0].score >= 50) return false; } catch (e3) {}
      recusa(q, rs); return true;
    } catch (err) { return false; }
  }
  function resumoPerfil() {
    var n = nome(), p = perfil(), f = favoritos(3), tom = { direto: tx("direto", "direct", "directo"), acolhedor: tx("acolhedor", "warm", "cálido"), normal: tx("normal", "normal", "normal") }[p.tom];
    var s = n ? tx("Você pediu para ser chamado de " + n + ". ", "You asked to be called " + n + ". ", "Pediste que te llame " + n + ". ") : tx("Ainda não sei como você quer ser chamado. Diga: me chame de, e o seu nome. ", "I do not know what to call you yet. Say: call me, and your name. ", "Aún no sé cómo llamarte. Di: llámame, y tu nombre. ");
    s += tx("Tom: " + tom + ". ", "Tone: " + tom + ". ", "Tono: " + tom + ". ");
    if (f.length) s += tx("Temas que você mais explora: " + f.join(", ") + ". ", "Topics you explore most: " + f.join(", ") + ". ", "Temas que más exploras: " + f.join(", ") + ". ");
    if (p.ultimo) s += tx("Paramos em: " + p.ultimo.t + ". ", "We stopped at: " + p.ultimo.t + ". ", "Paramos en: " + p.ultimo.t + ". ");
    return s + tx("Tudo fica só neste aparelho.", "Everything stays on this device only.", "Todo queda solo en este dispositivo.");
  }
  function frasesDe(t) { return String(t).replace(/([.!?])\s+/g, "$1\u0001").split("\u0001").filter(function (x) { return x.length > 2; }); }
  function respondeApp(e, q, rs) {
    var texto = e.r;
    if (!e.c) { /* trecho longo: as frases que mais respondem à pergunta, na ordem original */
      var qt = toks(q).map(st), fs = frasesDe(texto), sc = fs.map(function (f, i) { var ft = toks(f).map(st), s = 0; qt.forEach(function (t) { if (ft.indexOf(t) >= 0) s++; }); return { i: i, s: s - i * 0.01 }; });
      var esc = sc.slice().sort(function (a, b) { return b.s - a.s; }).slice(0, 3).sort(function (a, b) { return a.i - b.i; }).map(function (x) { return fs[x.i]; });
      texto = esc.join(" ") || fs.slice(0, 3).join(" ");
      texto = tx("No " + e.app + ": ", "From " + e.app + ": ", "En " + e.app + ": ") + texto;
    }
    if (e.lg === "pt" && lg() !== "pt") texto = tx("", "(This part of the app is in Portuguese.) ", "(Esta parte de la app está en portugués.) ") + texto;
    anota(e.t.replace(/ · \d+$/, ""), e.app);
    var botoes = [];
    if (e.tab) botoes.push([tx("Abrir " + e.app, "Open " + e.app, "Abrir " + e.app), function () { abreAba(e.tab); }]);
    var links = e.u && /^https:\/\//.test(e.u) ? [{ url: e.u, texto: "↗ " + tx("Abrir em nova aba", "Open in a new tab", "Abrir en nueva pestaña") }] : [];
    var rel = []; rs.slice(1, 8).forEach(function (r) { var d = docDe(r); var t = d.t.replace(/ · \d+$/, ""); if (r.s > rs[0].s * 0.5 && rel.indexOf(t) < 0 && t !== e.t.replace(/ · \d+$/, "") && rel.length < 3) rel.push(t); });
    rel.forEach(function (t) { botoes.push([t, function () { envia(t); }]); });
    diz(personaliza(texto), links, botoes, e.app);
  }
  function recusa(q, rs) {
    var perto = []; rs.slice(0, 6).forEach(function (r) { var t = docDe(r).t.replace(/ · \d+$/, ""); if (perto.indexOf(t) < 0 && perto.length < 3) perto.push(t); });
    var t = tx("Isso não está no conteúdo do Conhecimento Solar nem dos apps que estão dentro dele, então não vou inventar.", "That is not in the content of Conhecimento Solar or of the apps inside it, so I will not make it up.", "Eso no está en el contenido de Conhecimento Solar ni de las apps que tiene dentro, así que no voy a inventarlo.");
    if (perto.length) t += " " + tx("O mais próximo que eu tenho:", "The closest I have:", "Lo más cercano que tengo:") + " " + perto.join("; ") + ".";
    var bt = perto.map(function (x) { return [x, function () { envia(x); }]; });
    bt.push(["🌐 " + tx("Buscar na Wikipédia (internet)", "Search Wikipedia (internet)", "Buscar en Wikipedia (internet)"), function () { pular = 1; envia(q); }]);
    diz(t, null, bt, null, true);
  }
  function envia(t) { try { if (MS() && MS().enviar) MS().enviar(t); } catch (e) {} }
  function abreAba(tab) {
    var f = { "#rede": "f-rede", "#radar": "f-radar", "#aguia-english": "f-eng", "#podcast": "f-podcast" }[tab];
    var b = f && D.querySelector('.abas [data-folha="' + f + '"]');
    if (b) { b.click(); return; }
    try { location.hash = tab; W.dispatchEvent(new HashChangeEvent("hashchange")); } catch (e) { location.hash = tab; }
  }
  /* mostra a resposta na conversa (texto puro) e fala com a voz do app */
  var ULTIMA = null;
  function diz(t, links, botoes, area, recusou) {
    var m = MS(); if (!m || !m.render) return false;
    var li = null; try { li = m.render(t, links || []); } catch (e) {}
    if (li && li.nodeType === 1) {
      li.classList.add("sol1-msg"); if (recusou) li.classList.add("sol1-recusa");
      if (botoes && botoes.length) { var c = el("div", "chips sol1-chips"); botoes.forEach(function (b) { var x = el("button", "chip", b[0]); x.type = "button"; x.addEventListener("click", b[1]); c.appendChild(x); }); li.appendChild(c); }
    }
    ULTIMA = { t: t, area: area || "", recusa: !!recusou, ts: Date.now() };
    estado("pensando"); try { m.falar(t); } catch (e) {}
    return true;
  }

  /* ---------------- som: volume da voz e da música, abaixar a música quando o Sol fala ---------------- */
  var SOM = (function () { var s = lsg(KV) || {}; return { voz: clamp(s.voz == null ? 1 : s.voz, 0, 1.5), musica: clamp(s.musica == null ? 1 : s.musica, 0, 1), duck: s.duck !== false }; })();
  function salvaSom() { lss(KV, SOM); aplicaVolumes(); }
  var ctx = null, anal = null, buf = null, ganhoVoz = null, ROT = (typeof WeakMap === "function") ? new WeakMap() : null, VIVOS = [];
  function ehMusica(a) { var s = String(a.currentSrc || a.src || ""); return /intro-(rock|epica)|musica|trilha|ambiente|\/music\//i.test(s) || a.dataset && a.dataset.sol1 === "musica"; }
  function ehVoz(a) { if (!a || a.tagName !== "AUDIO") return false; return !ehMusica(a); }
  function mesmaOrigem(a) { try { return new URL(a.currentSrc || a.src, location.href).origin === location.origin; } catch (e) { return false; } }
  function garanteCtx() { try { if (!ctx) { var AC = W.AudioContext || W.webkitAudioContext; if (!AC) return null; ctx = new AC(); anal = ctx.createAnalyser(); anal.fftSize = 256; anal.smoothingTimeConstant = 0.72; buf = new Uint8Array(anal.frequencyBinCount); ganhoVoz = ctx.createGain(); ganhoVoz.connect(anal); anal.connect(ctx.destination); } if (ctx.state === "suspended") ctx.resume().catch(function () {}); } catch (e) { ctx = null; } return ctx; }
  ["pointerdown", "keydown", "touchend"].forEach(function (ev) { D.addEventListener(ev, function () { garanteCtx(); }, { capture: true, passive: true }); });
  function roteia(a) { /* liga o áudio da voz ao analisador (barras reais). Só mesma origem e só com o contexto rodando: senão o som sumiria. */
    if (!ROT || ROT.has(a) || !mesmaOrigem(a)) return false; var c = garanteCtx(); if (!c || c.state !== "running") return false;
    try { var src = c.createMediaElementSource(a); src.connect(ganhoVoz); ROT.set(a, src); a.volume = 1; return true; } catch (e) { ROT.set(a, null); return false; }
  }
  function aplicaVolume(a) { try { if (ehMusica(a)) { a.volume = clamp(SOM.musica * (SOM.duck && falandoAgora() ? 0.35 : 1), 0, 1); } else if (ROT && ROT.get(a)) { a.volume = 1; } else { a.volume = clamp(SOM.voz, 0, 1); } } catch (e) {} }
  function aplicaVolumes() { if (ganhoVoz) ganhoVoz.gain.value = SOM.voz; VIVOS = VIVOS.filter(function (a) { return a && !a.ended; }); VIVOS.forEach(aplicaVolume); }
  var playOrig = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    try { if (this.tagName === "AUDIO") { if (VIVOS.indexOf(this) < 0) VIVOS.push(this); if (ehVoz(this)) { roteia(this); vozAtiva(this); } aplicaVolume(this); } } catch (e) {}
    return playOrig.apply(this, arguments);
  };
  var vozEl = null;
  function vozAtiva(a) { vozEl = a; if (!a.__sol1) { a.__sol1 = 1; a.addEventListener("playing", function () { estado("falando"); aplicaVolumes(); }); ["pause", "ended", "error"].forEach(function (ev) { a.addEventListener(ev, function () { setTimeout(function () { if (!falandoAgora()) { estado("pronto"); aplicaVolumes(); } }, 120); }); }); } }
  /* voz do aparelho: volume e nível simulado pelas fronteiras de palavra */
  var tts = { on: false, pulso: 0 };
  try { if (W.speechSynthesis && speechSynthesis.speak) { var spk = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = function (u) { try { u.volume = clamp(SOM.voz, 0, 1); u.addEventListener("start", function () { tts.on = true; estado("falando"); aplicaVolumes(); }); u.addEventListener("boundary", function () { tts.pulso = 1; }); var fim = function () { tts.on = false; setTimeout(function () { if (!falandoAgora()) { estado("pronto"); aplicaVolumes(); } }, 120); }; u.addEventListener("end", fim); u.addEventListener("error", fim); } catch (e) {} return spk(u); }; } } catch (e) {}
  function falandoAgora() { return tts.on || !!(vozEl && !vozEl.paused && !vozEl.ended) || D.body.classList.contains("falando"); }
  /* o Sol antigo pedia o próprio analisador para cada áudio: agora todos passam pelo mesmo (um só por elemento) */
  (function liga() { if (W.SOL && W.SOL.cmd) { W.SOL.ligaAnalyser = function (a) { try { if (a && a.tagName === "AUDIO") { roteia(a); vozAtiva(a); aplicaVolume(a); } } catch (e) {} }; } else setTimeout(liga, 400); })();

  /* ---------------- estado (pronto / ouvindo / pensando / falando) ---------------- */
  var EST = "pronto", rotEst = null;
  var NOMES_EST = { pronto: ["PRONTO", "READY", "LISTO"], ouvindo: ["OUVINDO", "LISTENING", "ESCUCHANDO"], pensando: ["PENSANDO", "THINKING", "PENSANDO"], falando: ["FALANDO", "SPEAKING", "HABLANDO"] };
  function estado(s) { if (s === "pensando" && EST === "falando") return; EST = s; D.documentElement.setAttribute("data-sol1", s); if (rotEst) { var n = NOMES_EST[s] || NOMES_EST.pronto; rotEst.textContent = n[lg() === "en" ? 1 : lg() === "es" ? 2 : 0]; }
    if (s === "pensando") setTimeout(function () { if (EST === "pensando" && !falandoAgora()) estado("pronto"); }, 4000); }

  /* ---------------- visual: anel de voz, barras radiais, HUD e partículas (canvas) ---------------- */
  var cv = null, cx = null, sol = null, raf = 0, nivel = 0, vis = true, QUAL = 2, fpsT = 0, fpsN = 0, baixo = 0, PART = [], tw = 0, dpr = 1;
  var Q = lsg(KQ) || {}; var modoQ = /^(auto|alta|leve)$/.test(Q.modo) ? Q.modo : "auto";
  function montaVisual() {
    sol = D.getElementById("sol"); var palco = sol && sol.parentNode; if (!palco || D.getElementById("sol1-viz")) return;
    cv = el("canvas", "sol1-viz"); cv.id = "sol1-viz"; cv.setAttribute("aria-hidden", "true"); palco.insertBefore(cv, sol);
    rotEst = el("span", "sol1-estado"); rotEst.id = "sol1-estado"; rotEst.setAttribute("aria-hidden", "true"); palco.appendChild(rotEst); estado(EST);
    var bt = el("button", "sol1-bt", "☰"); bt.type = "button"; bt.id = "sol1-bt"; bt.setAttribute("aria-label", tx("Painel do Sol: volume, perfil e comandos", "Sun panel: volume, profile and commands", "Panel del Sol: volumen, perfil y comandos")); bt.title = "Ctrl+K"; bt.addEventListener("click", function () { abrePainel(""); }); palco.appendChild(bt);
    cx = cv.getContext("2d"); tamanho(); W.addEventListener("resize", tamanho);
    if ("ResizeObserver" in W) { var rt = 0; new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(tamanho, 60); }).observe(sol); } else setInterval(tamanho, 1500);
    if ("IntersectionObserver" in W) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) laco(); }).observe(sol);
    D.addEventListener("visibilitychange", function () { if (!D.hidden) laco(); });
    QUAL = modoQ === "leve" ? 0 : modoQ === "alta" ? 2 : (RM ? 0 : ((navigator.hardwareConcurrency || 4) <= 4 ? 1 : 2));
    pushToTalk(); laco();
  }
  function tamanho() { if (!cv || !sol) return; var r = sol.getBoundingClientRect(), s = Math.round(Math.max(r.width, 60) * 2.1); dpr = Math.min(QUAL >= 2 ? 2 : 1.5, W.devicePixelRatio || 1); cv.width = s * dpr; cv.height = s * dpr; cv.style.width = s + "px"; cv.style.height = s + "px";
    cv.style.left = (sol.offsetLeft + sol.offsetWidth / 2 - s / 2) + "px"; cv.style.top = (sol.offsetTop + sol.offsetHeight / 2 - s / 2) + "px";
    if (rotEst) { rotEst.style.left = (sol.offsetLeft + sol.offsetWidth + 14) + "px"; rotEst.style.top = (sol.offsetTop + sol.offsetHeight / 2 - 5) + "px"; }
    PART = []; var n = QUAL === 2 ? 46 : QUAL === 1 ? 20 : 0; for (var i = 0; i < n; i++) PART.push({ a: Math.random() * 6.283, r: 0.56 + Math.random() * 0.4, v: (0.0007 + Math.random() * 0.0022) * (Math.random() < 0.5 ? -1 : 1), z: 0.4 + Math.random() * 1.2 }); }
  var BIN = null;
  function mede() { /* nível 0..1 e bandas para as barras */
    var alvo = 0, n = QUAL === 2 ? 72 : QUAL === 1 ? 48 : 32; if (!BIN || BIN.length !== n) BIN = new Float32Array(n);
    var real = anal && vozEl && !vozEl.paused && ROT && ROT.get(vozEl);
    if (real) { anal.getByteFrequencyData(buf); var s = 0; for (var k = 2; k < 48; k++) s += buf[k]; alvo = Math.min(1, s / 46 / 150);
      for (var i = 0; i < n; i++) { var m = i < n / 2 ? i : n - 1 - i, bi = 2 + Math.floor(m / (n / 2) * 60); BIN[i] = BIN[i] * 0.55 + (buf[bi] / 255) * 0.45; } }
    else if (falandoAgora()) { tts.pulso *= 0.9; var t = Date.now() / 1000; alvo = 0.32 + 0.22 * Math.abs(Math.sin(t * 7.3)) * (0.6 + 0.4 * Math.sin(t * 2.1)) + tts.pulso * 0.25;
      for (var j = 0; j < n; j++) { var x = Math.abs(Math.sin(j * 0.61 + t * 5.2)) * Math.abs(Math.cos(j * 0.23 - t * 3.1)); BIN[j] = BIN[j] * 0.6 + x * alvo * 0.4 * 1.6; } }
    else { for (var z = 0; z < n; z++) BIN[z] *= 0.86; }
    nivel = nivel * 0.8 + alvo * 0.2; return n;
  }
  function laco() {
    cancelAnimationFrame(raf); if (!cx || !vis || D.hidden) return;
    var ult = 0;
    (function q(ts) {
      if (!vis || D.hidden) return; raf = requestAnimationFrame(q);
      var ativo = EST !== "pronto" || falandoAgora() || nivel > 0.02, min = ativo ? (QUAL === 0 ? 33 : 0) : (QUAL === 2 ? 33 : 66);
      if (ts - ult < min) return; var dt = ts - ult; ult = ts;
      if (modoQ === "auto" && ativo && dt < 500) { fpsT += dt; fpsN++; if (fpsT > 2500) { var f = 1000 / (fpsT / fpsN); if (f < 38 && QUAL > 0) { baixo++; if (baixo >= 2) { QUAL--; baixo = 0; tamanho(); } } else baixo = 0; fpsT = 0; fpsN = 0; W.__sol1fps = Math.round(f); } }
      desenha(ts);
    })(performance.now());
  }
  function desenha(ts) {
    var n = mede(), W2 = cv.width, H = cv.height, c = W2 / 2, R = W2 / 2.1 / 2; cx.clearRect(0, 0, W2, H);
    var fal = falandoAgora(), ouv = EST === "ouvindo" || D.body.classList.contains("ouvindo"), pens = EST === "pensando";
    var cor = ouv ? "120,220,255" : "255,206,110", rot = RM ? 0 : ts / 1000;
    if (sol) { sol.style.setProperty("--sol1-n", nivel.toFixed(3)); }
    /* halo da coroa */
    var g = cx.createRadialGradient(c, c, R * 0.9, c, c, R * (1.5 + nivel * 0.35)); g.addColorStop(0, "rgba(255,190,80," + (0.16 + nivel * 0.42) + ")"); g.addColorStop(1, "rgba(255,140,40,0)"); cx.fillStyle = g; cx.beginPath(); cx.arc(c, c, R * 1.9, 0, 6.283); cx.fill();
    /* anéis HUD */
    cx.lineWidth = 1 * dpr; cx.strokeStyle = "rgba(" + cor + ",0.22)"; cx.beginPath(); cx.arc(c, c, R * 1.13, 0, 6.283); cx.stroke();
    if (QUAL > 0) { cx.save(); cx.translate(c, c); cx.rotate(rot * 0.12); cx.strokeStyle = "rgba(" + cor + ",0.38)"; cx.lineWidth = 1.6 * dpr; for (var a = 0; a < 3; a++) { cx.beginPath(); cx.arc(0, 0, R * 1.62, a * 2.094, a * 2.094 + 1.1); cx.stroke(); } cx.rotate(-rot * 0.3); cx.strokeStyle = "rgba(" + cor + ",0.18)"; for (var t2 = 0; t2 < 60; t2++) { var aa = t2 * 0.1047, l = t2 % 5 ? 0.03 : 0.07; cx.beginPath(); cx.moveTo(Math.cos(aa) * R * 1.7, Math.sin(aa) * R * 1.7); cx.lineTo(Math.cos(aa) * R * (1.7 + l), Math.sin(aa) * R * (1.7 + l)); cx.stroke(); } cx.restore(); }
    if (pens && !RM) { cx.save(); cx.translate(c, c); cx.rotate(rot * 2.4); cx.strokeStyle = "rgba(160,220,255,.75)"; cx.lineWidth = 2.4 * dpr; cx.beginPath(); cx.arc(0, 0, R * 1.2, 0, 1.4); cx.stroke(); cx.restore(); }
    /* barras radiais da voz + anel equalizador */
    if (fal || nivel > 0.02 || ouv) {
      cx.save(); cx.translate(c, c); var base = R * 1.16, maxL = R * 0.6;
      for (var i = 0; i < n; i++) { var v = ouv && !fal ? 0.15 + 0.12 * Math.abs(Math.sin(ts / 300 + i * 0.4)) : BIN[i], ang = i / n * 6.283 - 1.5708, L = 2 * dpr + v * maxL;
        cx.strokeStyle = "rgba(" + cor + "," + (0.35 + v * 0.65).toFixed(2) + ")"; cx.lineWidth = (QUAL === 2 ? 2.4 : 3) * dpr; cx.lineCap = "round";
        cx.beginPath(); cx.moveTo(Math.cos(ang) * base, Math.sin(ang) * base); cx.lineTo(Math.cos(ang) * (base + L), Math.sin(ang) * (base + L)); cx.stroke(); }
      cx.beginPath(); for (var k = 0; k <= n; k++) { var kk = k % n, an = kk / n * 6.283 - 1.5708, rr = base - 3 * dpr - BIN[kk] * R * 0.08; var px = Math.cos(an) * rr, py = Math.sin(an) * rr; if (k) cx.lineTo(px, py); else cx.moveTo(px, py); }
      cx.closePath(); cx.strokeStyle = "rgba(255,240,200," + (0.25 + nivel * 0.6).toFixed(2) + ")"; cx.lineWidth = 1.4 * dpr; cx.shadowColor = "rgba(255,190,80,.9)"; cx.shadowBlur = QUAL === 2 ? 12 * dpr : 0; cx.stroke(); cx.restore();
    }
    /* partículas em órbita */
    if (PART.length && !RM) { cx.fillStyle = "rgba(255,220,150,.8)"; PART.forEach(function (p) { p.a += p.v * (1 + nivel * 5); var rr = R * (1.2 + p.r) , x = c + Math.cos(p.a) * rr, y = c + Math.sin(p.a) * rr * 0.96; cx.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(p.a * 3)); cx.beginPath(); cx.arc(x, y, p.z * dpr * (1 + nivel), 0, 6.283); cx.fill(); }); cx.globalAlpha = 1; }
  }
  /* segurar o Sol = falar (push-to-talk); tocar no Sol enquanto ele fala = interromper */
  var SR = W.SpeechRecognition || W.webkitSpeechRecognition;
  function pushToTalk() {
    if (!sol) return; var t = 0, rec = null, segurou = false, txt = "";
    sol.addEventListener("pointerdown", function (ev) {
      if (falandoAgora()) { try { MS().parar(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} estado("pronto"); segurou = true; return; }
      segurou = false; clearTimeout(t); if (!SR) return;
      t = setTimeout(function () { segurou = true; txt = ""; try { rec = new SR(); rec.lang = { pt: "pt-BR", en: "en-US", es: "es-ES" }[lg()]; rec.interimResults = true; rec.continuous = true;
        rec.onresult = function (e) { var s = ""; for (var k = 0; k < e.results.length; k++) s += e.results[k][0].transcript; txt = s; var i = D.getElementById("texto"); if (i) i.value = s; };
        rec.onerror = function () { estado("pronto"); }; rec.onend = function () { estado("pronto"); var i = D.getElementById("texto"); if (i) i.value = ""; if (txt.trim()) envia(txt.trim()); rec = null; };
        rec.start(); estado("ouvindo"); if (navigator.vibrate) navigator.vibrate(18); } catch (e) { rec = null; } }, 450);
    });
    function solta() { clearTimeout(t); if (rec) { try { rec.stop(); } catch (e) {} } }
    sol.addEventListener("pointerup", solta); sol.addEventListener("pointercancel", solta); sol.addEventListener("pointerleave", solta);
    sol.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    sol.addEventListener("click", function (ev) { if (segurou) { ev.stopImmediatePropagation(); ev.preventDefault(); segurou = false; } }, true);
    D.addEventListener("keydown", function (e) { if (e.key === "Escape" && falandoAgora()) { try { MS().parar(); } catch (x) {} try { speechSynthesis.cancel(); } catch (x) {} } });
  }

  /* ---------------- painel: comandos (paleta), som, perfil, visual ---------------- */
  var PAINEL = null;
  function comandos() {
    return [
      ["☀️", tx("Temas", "Themes", "Temas"), function () { envia("temas"); }],
      ["🌐", tx("Rede de App Portal Solar", "Portal Solar App Network", "Red de Apps Portal Solar"), function () { abreAba("#rede"); }],
      ["🦅", "Radar Águia Solar", function () { abreAba("#radar"); }],
      ["📖", "Águia Primordial English", function () { abreAba("#aguia-english"); }],
      ["🎙️", tx("Podcast Sol Nascente", "Sol Nascente podcast", "Podcast Sol Nascente"), function () { abreAba("#podcast"); }],
      ["🕯️", tx("Memorial Marguerite Porete", "Marguerite Porete memorial", "Memorial Marguerite Porete"), function () { location.href = "marguerite/"; }],
      ["✦", tx("Sol 2.0 · IA offline", "Sol 2.0 · offline AI", "Sol 2.0 · IA offline"), function () { location.href = "sol/"; }],
      ["▶", tx("Ouvir tudo", "Listen to everything", "Escuchar todo"), function () { envia(tx("ouvir tudo", "ouvir tudo", "ouvir tudo")); }],
      ["⏯", tx("Continuar de onde parei", "Continue where I stopped", "Continuar donde paré"), function () { envia("continuar de onde parei"); }],
      ["👤", tx("O que você lembra de mim", "What do you remember about me", "Qué recuerdas de mí"), function () { trata(tx("meu perfil", "my profile", "mi perfil")); }],
      ["⏹", tx("Parar a voz", "Stop the voice", "Parar la voz"), function () { try { MS().parar(); } catch (e) {} }],
      ["❔", tx("Ajuda e comandos", "Help and commands", "Ayuda y comandos"), function () { envia("ajuda"); }]
    ];
  }
  function abrePainel(secao) {
    if (!PAINEL) montaPainel(); PAINEL.hidden = false; D.body.classList.add("sol1-painel-on"); preenchePerfil(); listaCmd("");
    var alvo = secao && PAINEL.querySelector('[data-sec="' + secao + '"]'); setTimeout(function () { if (alvo) alvo.scrollIntoView({ block: "start" }); var i = PAINEL.querySelector("#sol1-busca"); if (i && !secao && !(W.matchMedia && matchMedia("(pointer:coarse)").matches)) i.focus(); }, 30);
    carrega().catch(function () {});
  }
  function fechaPainel() { if (PAINEL) { PAINEL.hidden = true; D.body.classList.remove("sol1-painel-on"); } }
  function montaPainel() {
    PAINEL = el("div", "sol1-painel"); PAINEL.id = "sol1-painel"; PAINEL.hidden = true; PAINEL.setAttribute("role", "dialog"); PAINEL.setAttribute("aria-modal", "true"); PAINEL.setAttribute("aria-label", tx("Painel do Sol", "Sun panel", "Panel del Sol"));
    var cx2 = el("div", "sol1-caixa"); PAINEL.appendChild(cx2);
    var topo = el("div", "sol1-topo"); topo.appendChild(el("h2", null, tx("☀ Painel do Sol", "☀ Sun panel", "☀ Panel del Sol"))); var x = el("button", "sol1-x", "✕"); x.type = "button"; x.setAttribute("aria-label", tx("Fechar", "Close", "Cerrar")); x.addEventListener("click", fechaPainel); topo.appendChild(x); cx2.appendChild(topo);
    var bu = el("input", "sol1-campo"); bu.id = "sol1-busca"; bu.type = "search"; bu.maxLength = 120; bu.setAttribute("autocomplete", "off"); bu.placeholder = tx("Buscar comando, lição ou app…", "Search a command, lesson or app…", "Buscar comando, lección o app…"); bu.setAttribute("aria-label", bu.placeholder); cx2.appendChild(bu);
    var atal = el("div", "chips sol1-chips sol1-atalhos"); [["som", tx("🔊 Volume", "🔊 Volume", "🔊 Volumen")], ["perfil", tx("👤 Perfil", "👤 Profile", "👤 Perfil")], ["visual", tx("✨ Visual", "✨ Visuals", "✨ Visual")]].forEach(function (a) { var b = el("button", "chip", a[1]); b.type = "button"; b.addEventListener("click", function () { var s2 = PAINEL.querySelector('[data-sec="' + a[0] + '"]'); if (s2) s2.scrollIntoView({ block: "start", behavior: RM ? "auto" : "smooth" }); }); atal.appendChild(b); }); cx2.appendChild(atal);
    var ul = el("ul", "sol1-lista"); ul.id = "sol1-lista"; ul.setAttribute("role", "listbox"); cx2.appendChild(ul);
    bu.addEventListener("input", function () { listaCmd(bu.value); });
    bu.addEventListener("keydown", function (e) { if (e.key === "Enter") { var f = ul.querySelector("button"); if (f) f.click(); } });
    /* som */
    var s1 = el("section", "sol1-sec"); s1.setAttribute("data-sec", "som"); s1.appendChild(el("h3", null, tx("🔊 Som", "🔊 Sound", "🔊 Sonido")));
    function faixa(rot, id, val, max, fn) { var l = el("label", "sol1-faixa"); var sp = el("span", null, rot); var r = el("input"); r.type = "range"; r.id = id; r.min = "0"; r.max = String(max); r.step = "5"; r.value = String(Math.round(val * 100)); var o = el("output", null, r.value + "%"); r.addEventListener("input", function () { o.textContent = r.value + "%"; fn(clamp(r.value / 100, 0, max / 100)); }); l.appendChild(sp); l.appendChild(r); l.appendChild(o); return l; }
    s1.appendChild(faixa(tx("Voz do Sol", "Sun voice", "Voz del Sol"), "sol1-vol-voz", SOM.voz, 150, function (v) { SOM.voz = v; salvaSom(); }));
    s1.appendChild(faixa(tx("Música", "Music", "Música"), "sol1-vol-mus", SOM.musica, 100, function (v) { SOM.musica = v; salvaSom(); }));
    var dk = el("label", "chk sol1-chk"); var dkc = el("input"); dkc.type = "checkbox"; dkc.id = "sol1-duck"; dkc.checked = SOM.duck; dkc.addEventListener("change", function () { SOM.duck = dkc.checked; salvaSom(); }); dk.appendChild(dkc); dk.appendChild(D.createTextNode(" " + tx("Abaixar a música quando o Sol fala", "Lower the music while the Sun speaks", "Bajar la música cuando habla el Sol"))); s1.appendChild(dk);
    var tst = el("button", "chip", tx("▶ Testar a voz", "▶ Test the voice", "▶ Probar la voz")); tst.type = "button"; tst.addEventListener("click", function () { try { MS().falar(tx("Volume ajustado. É assim que eu falo agora.", "Volume set. This is how I sound now.", "Volumen ajustado. Así hablo ahora.")); } catch (e) {} }); s1.appendChild(tst);
    s1.appendChild(el("p", "sol1-nota", tx("Acima de 100% a voz gravada ganha reforço digital. A música de entrada (Rock ou Épica) é escolhida em ⚙️ Ajustes.", "Above 100% the recorded voice gets a digital boost. The intro music (Rock or Epic) is chosen in ⚙️ Settings.", "Por encima de 100% la voz grabada recibe refuerzo digital. La música de entrada se elige en ⚙️ Ajustes.")));
    cx2.appendChild(s1);
    /* perfil */
    var s2 = el("section", "sol1-sec"); s2.setAttribute("data-sec", "perfil"); s2.appendChild(el("h3", null, tx("👤 Como o Sol fala com você", "👤 How the Sun talks to you", "👤 Cómo te habla el Sol")));
    var ln = el("label", "sol1-rot", tx("Como você quer ser chamado", "What should I call you", "Cómo quieres que te llame")); ln.htmlFor = "sol1-nome"; s2.appendChild(ln);
    var fn = el("div", "sol1-linha"); var inN = el("input", "sol1-campo"); inN.id = "sol1-nome"; inN.maxLength = 30; inN.setAttribute("autocomplete", "nickname"); var bn = el("button", "chip", tx("Salvar", "Save", "Guardar")); bn.type = "button";
    bn.addEventListener("click", function () { var n = gravaNome(inN.value); msgPerfil(n ? tx("Guardado: " + n, "Saved: " + n, "Guardado: " + n) : tx("Use só letras (até 30).", "Letters only (up to 30).", "Solo letras (hasta 30).")); }); fn.appendChild(inN); fn.appendChild(bn); s2.appendChild(fn);
    var lt = el("label", "sol1-rot", tx("Tom", "Tone", "Tono")); lt.htmlFor = "sol1-tom"; s2.appendChild(lt);
    var sel = el("select", "sol1-campo"); sel.id = "sol1-tom"; [["normal", tx("Normal", "Normal", "Normal")], ["direto", tx("Direto", "Direct", "Directo")], ["acolhedor", tx("Acolhedor", "Warm", "Cálido")]].forEach(function (o) { var op = el("option", null, o[1]); op.value = o[0]; sel.appendChild(op); });
    sel.addEventListener("change", function () { var p = perfil(); p.tom = sel.value; salvaPerfil(p); msgPerfil(tx("Tom guardado.", "Tone saved.", "Tono guardado.")); }); s2.appendChild(sel);
    var res = el("p", "sol1-nota"); res.id = "sol1-perfil-res"; s2.appendChild(res);
    var sug = el("div", "chips sol1-chips"); sug.id = "sol1-sugestoes"; s2.appendChild(sug);
    var fg = el("button", "chip sol1-perigo", tx("Esquecer tudo sobre mim", "Forget everything about me", "Olvidar todo sobre mí")); fg.type = "button"; fg.addEventListener("click", function () { esquece(); preenchePerfil(); msgPerfil(tx("Apagado deste aparelho.", "Erased from this device.", "Borrado de este dispositivo.")); }); s2.appendChild(fg);
    var mp = el("p", "sol1-nota"); mp.id = "sol1-perfil-msg"; mp.setAttribute("aria-live", "polite"); s2.appendChild(mp);
    cx2.appendChild(s2);
    /* visual */
    var s3 = el("section", "sol1-sec"); s3.setAttribute("data-sec", "visual"); s3.appendChild(el("h3", null, tx("✨ Visual", "✨ Visuals", "✨ Visual")));
    var sq = el("select", "sol1-campo"); sq.id = "sol1-qual"; sq.setAttribute("aria-label", tx("Qualidade do visual", "Visual quality", "Calidad visual")); [["auto", tx("Automático (pelo desempenho)", "Automatic (by performance)", "Automático (por rendimiento)")], ["alta", tx("Alta", "High", "Alta")], ["leve", tx("Leve (economiza bateria)", "Light (saves battery)", "Ligero (ahorra batería)")]].forEach(function (o) { var op = el("option", null, o[1]); op.value = o[0]; sq.appendChild(op); }); sq.value = modoQ;
    sq.addEventListener("change", function () { modoQ = sq.value; lss(KQ, { modo: modoQ }); QUAL = modoQ === "leve" ? 0 : modoQ === "alta" ? 2 : (RM ? 0 : 2); tamanho(); laco(); }); s3.appendChild(sq);
    s3.appendChild(el("p", "sol1-nota", tx("Segure o Sol para falar. Toque no Sol (ou Esc) para interromper a fala. Ctrl+K abre este painel. A frase de despertar fica em ⚙️ Ajustes.", "Hold the Sun to talk. Tap the Sun (or Esc) to interrupt. Ctrl+K opens this panel. The wake phrase is in ⚙️ Settings.", "Mantén pulsado el Sol para hablar. Toca el Sol (o Esc) para interrumpir. Ctrl+K abre este panel. La frase de activación está en ⚙️ Ajustes.")));
    cx2.appendChild(s3);
    PAINEL.addEventListener("click", function (e) { if (e.target === PAINEL) fechaPainel(); });
    PAINEL.addEventListener("keydown", function (e) { if (e.key === "Escape") fechaPainel(); });
    D.body.appendChild(PAINEL);
  }
  function msgPerfil(t) { var m = D.getElementById("sol1-perfil-msg"); if (m) m.textContent = t; preenchePerfil(); }
  function preenchePerfil() {
    var n = D.getElementById("sol1-nome"); if (n && D.activeElement !== n) n.value = nome(); var s = D.getElementById("sol1-tom"); if (s) s.value = perfil().tom;
    var r = D.getElementById("sol1-perfil-res"); if (r) r.textContent = resumoPerfil();
    var sg = D.getElementById("sol1-sugestoes"); if (sg) { sg.textContent = ""; sugestoes().forEach(function (t) { var b = el("button", "chip", "✦ " + t); b.type = "button"; b.addEventListener("click", function () { fechaPainel(); envia(t); }); sg.appendChild(b); }); }
  }
  function sugestoes() { /* proativas: continua o último tema e propõe algo ainda não visto do tema favorito */
    var out = [], p = perfil(); if (p.ultimo && p.ultimo.t) out.push(p.ultimo.t);
    if (KB) { var f = favoritos(1)[0], gi = KB.grupos.indexOf(f); if (gi >= 0) { var c = KB.licoes.filter(function (e) { return e.g === gi && e.t !== (p.ultimo && p.ultimo.t); }); if (c.length) out.push(c[(p.n * 7) % c.length].t); } }
    if (out.length < 3) out.push(tx("O que é o Radar Águia Solar?", "What is Radar Águia Solar?", "¿Qué es el Radar Águia Solar?"));
    return out.slice(0, 3);
  }
  function listaCmd(q) {
    var ul = D.getElementById("sol1-lista"); if (!ul) return; ul.textContent = ""; var qn = nz(q), itens = [];
    comandos().forEach(function (c) { if (!qn || nz(c[1]).indexOf(qn) >= 0) itens.push({ ic: c[0], t: c[1], f: c[2] }); });
    if (qn.length >= 3 && KB) { busca(q).slice(0, 6).forEach(function (r) { var d = docDe(r), t = d.t.replace(/ · \d+$/, ""); if (itens.some(function (x) { return x.t === t; })) return; itens.push({ ic: r.d.k === "a" ? "◈" : "✧", t: t, sub: r.d.k === "a" ? d.app : KB.grupos[d.g], f: function () { envia(r.d.k === "a" ? d.t.replace(/ · \d+$/, "") : t); } }); }); }
    if (qn && !itens.length) itens.push({ ic: "➤", t: tx("Perguntar: ", "Ask: ", "Preguntar: ") + q.slice(0, 80), f: function () { envia(q); } });
    itens.slice(0, 14).forEach(function (it) { var li = el("li"); var b = el("button", "sol1-item"); b.type = "button"; b.appendChild(el("span", "sol1-ic", it.ic)); var tt = el("span", "sol1-t", it.t); b.appendChild(tt); if (it.sub) b.appendChild(el("small", null, it.sub)); b.addEventListener("click", function () { fechaPainel(); it.f(); }); li.appendChild(b); ul.appendChild(li); });
  }
  D.addEventListener("keydown", function (e) { if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); if (PAINEL && !PAINEL.hidden) fechaPainel(); else abrePainel(""); } });

  /* ---------------- início ---------------- */
  function inicio() {
    montaVisual();
    var pre = function () { carrega().catch(function () {}); };
    if ("requestIdleCallback" in W) requestIdleCallback(pre, { timeout: 6000 }); else setTimeout(pre, 2500);
    W.addEventListener("ms:lang", function () { KB = null; pre(); });
    var lAnt = lg(); setInterval(function () { if (lg() !== lAnt) { lAnt = lg(); KB = null; pre(); } }, 3000);
  }
  W.SOL1 = { trata: trata, carrega: carrega, pronto: function () { return !!KB && KBL === lg(); }, busca: function (q) { return KB ? busca(q).slice(0, 5).map(function (r) { var d = docDe(r); return { k: r.d.k, t: d.t, app: d.app || KB.grupos[d.g], s: +r.s.toFixed(2), fraco: false }; }) : []; },
    responde: function (q) { /* para testes: o que o Sol 1 faria, sem falar */ if (!KB) return null; var rs = busca(q), top = rs[0]; if (fraco(top, q)) return { tipo: PERG.test(nz(q)) ? "recusa" : "passa", perto: rs.slice(0, 3).map(function (r) { return docDe(r).t; }) }; var d = docDe(top); return { tipo: top.d.k === "a" ? "app" : "licao", t: d.t, app: d.app || KB.grupos[d.g], s: +top.s.toFixed(2), msx: top.d.k === "l" && W.MSX && MSX.id ? MSX.id(d.t) : null }; },
    perfil: perfil, nome: nome, gravaNome: gravaNome, esquece: esquece, som: function () { return { voz: SOM.voz, musica: SOM.musica, duck: SOM.duck, ctx: ctx ? ctx.state : null }; }, estado: function () { return { est: EST, nivel: +nivel.toFixed(3), qual: QUAL, falando: falandoAgora(), fps: W.__sol1fps || null }; },
    painel: abrePainel, fechaPainel: fechaPainel, ultima: function () { return ULTIMA; }, _passa: PASSA };
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", inicio); else inicio();
})(window, document);
