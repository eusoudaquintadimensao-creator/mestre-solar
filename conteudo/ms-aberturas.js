/*! MSAberturas — seleção inteligente offline das 100 aberturas Jervis */
(function (W, D) {
  "use strict";
  var KEY = "ms-aberturas-v1";
  var DATA = null;
  var loading = null;
  var LAST_N = 15;
  var TOP_K = 5;
  var lastReason = null;

  function load(cb) {
    if (DATA) { if (cb) cb(DATA); return Promise.resolve(DATA); }
    if (loading) return loading.then(function (d) { if (cb) cb(d); return d; });
    var base = "conteudo/";
    try {
      if (W.MestreSolar && W.MestreSolar.conteudo) base = W.MestreSolar.conteudo().base || base;
    } catch (e) {}
    if (base.slice(-1) !== "/") base += "/";
    loading = fetch(base + "aberturas-100.json")
      .then(function (r) { return r.json(); })
      .then(function (j) {
        DATA = j;
        W.MSAberturas._ready = true;
        loading = null;
        if (cb) cb(j);
        return j;
      })
      .catch(function () { loading = null; if (cb) cb(null); return null; });
    return loading;
  }

  function st() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  function nowParts() {
    var d = new Date();
    var h = d.getHours();
    var slot = "tarde";
    if (h >= 5 && h < 8) slot = "madrugada"; // early morning
    else if (h >= 8 && h < 12) slot = "manha";
    else if (h >= 12 && h < 18) slot = "tarde";
    else if (h >= 18 && h < 23) slot = "noite";
    else slot = "madrugada_tarde"; // after 23h or before 5
    return { h: h, slot: slot, dow: d.getDay(), dayKey: d.toISOString().slice(0, 10) };
  }

  function daysBetween(a, b) {
    if (!a || !b) return 999;
    var t0 = Date.parse(a + "T12:00:00");
    var t1 = Date.parse(b + "T12:00:00");
    if (!isFinite(t0) || !isFinite(t1)) return 999;
    return Math.round((t1 - t0) / 86400000);
  }

  function cfgObj() {
    try { if (W.SOL && W.SOL.cfg) return W.SOL.cfg() || {}; } catch (e) {}
    try { return JSON.parse(localStorage.getItem("ms-sol-v1") || "{}") || {}; } catch (e) { return {}; }
  }

  function gatherContext(s) {
    var np = nowParts();
    var c = cfgObj();
    var lastDay = s.lastDay || "";
    var gap = daysBetween(lastDay, np.dayKey);
    var streak = s.streak || 0;
    if (lastDay === np.dayKey) {
      /* same day */
    } else if (gap === 1) streak = (s.streak || 0) + 1;
    else if (gap > 1) streak = 1;
    else if (!lastDay) streak = 1;

    var tapsSession = s.tapsSession || 0;
    var lastTapAt = s.lastTapAt || 0;
    var secSince = lastTapAt ? (Date.now() - lastTapAt) / 1000 : 9999;
    var rapid = tapsSession >= 1 && secSince < 12;

    return {
      slot: np.slot,
      h: np.h,
      dow: np.dow,
      dayKey: np.dayKey,
      visitas: s.visitas || 0,
      gapDays: gap,
      streak: streak,
      tapsSession: tapsSession,
      secSince: secSince,
      rapid: rapid,
      ultimoTema: c.ultimoTema || s.ultimoTema || "",
      hasTrail: !!(c.ultimoTema || s.ultimoTema),
      blockedRecently: !!(s.blockedAt && Date.now() - s.blockedAt < 10 * 60 * 1000),
      investigouRecently: !!(s.investAt && Date.now() - s.investAt < 30 * 60 * 1000),
      potenciaRecently: !!(s.potAt && Date.now() - s.potAt < 20 * 60 * 1000),
      history: s.history || [],
      sessionPlayed: s.sessionPlayed || [],
      lastCats: s.lastCats || []
    };
  }

  function desiredMoods(ctx) {
    var m = [];
    if (ctx.visitas <= 0) return ["acolher", "expandir"];
    if (ctx.visitas >= 1 && ctx.visitas <= 4) return ["acolher", "expandir", "energizar"];

    if (ctx.blockedRecently) m.push("acalmar", "foco");
    if (ctx.gapDays >= 5) m.push("acolher", "retorno");
    if (ctx.streak >= 3) m.push("celebrar", "energizar");
    if (ctx.investigouRecently) m.push("investigar", "questionar", "expandir");
    if (ctx.potenciaRecently) m.push("foco", "energizar");
    if (ctx.hasTrail) m.push("retorno", "expandir");

    if (ctx.rapid) {
      if (ctx.tapsSession >= 4) m.push("acalmar", "silenciar");
      else m.push("energizar", "foco");
    }

    if (ctx.slot === "madrugada" || ctx.slot === "madrugada_tarde") m.push("acalmar", "silenciar", "acolher");
    else if (ctx.slot === "manha") m.push("energizar", "expandir");
    else if (ctx.slot === "tarde") m.push("foco", "expandir", "questionar");
    else if (ctx.slot === "noite") m.push("acalmar", "silenciar", "expandir");

    if (!m.length) m.push("expandir", "energizar");
    /* unique */
    var seen = {}, out = [];
    for (var i = 0; i < m.length; i++) if (!seen[m[i]]) { seen[m[i]] = 1; out.push(m[i]); }
    return out;
  }

  function hardExclude(it, ctx) {
    if (ctx.sessionPlayed.indexOf(it.id) >= 0) return "session";
    var hist = ctx.history || [];
    for (var i = 0; i < Math.min(LAST_N, hist.length); i++) {
      if (hist[i] === it.id) return "recent";
    }
    var cond = it.condicoes || {};
    if (cond.visita === "primeira" && ctx.visitas > 0) return "visita";
    if (cond.visita === "2-5" && !(ctx.visitas >= 1 && ctx.visitas <= 4)) return "visita";
    if (cond.visita === "primeira" && ctx.visitas === 0) return null; // allow
    if (cond.trilha && !ctx.hasTrail) return "trilha";
    return null;
  }

  function firstAccessPool(data, ctx) {
    var want = ctx.visitas <= 0 ? "primeira" : (ctx.visitas <= 4 ? "2-5" : null);
    if (!want) return null;
    return data.itens.filter(function (it) {
      return (it.condicoes || {}).visita === want && ctx.sessionPlayed.indexOf(it.id) < 0;
    });
  }

  function scoreItem(it, ctx, wantMoods) {
    var moods = it.moods || [];
    var fit = 0;
    var reasons = [];
    for (var i = 0; i < wantMoods.length; i++) {
      if (moods.indexOf(wantMoods[i]) >= 0) {
        fit += 3.2 - i * 0.25;
        reasons.push("mood:" + wantMoods[i]);
      }
    }
    var cond = it.condicoes || {};
    if (cond.periodo) {
      var map = { manha: "manha", tarde: "tarde", noite: "noite" };
      var slotMap = { madrugada: "manha", manha: "manha", tarde: "tarde", noite: "noite", madrugada_tarde: "noite" };
      if (cond.periodo === slotMap[ctx.slot]) { fit += 1.5; reasons.push("periodo"); }
      else fit -= 0.8;
    }
    if (ctx.rapid) {
      if (it.curta) { fit += 1.8; reasons.push("curta"); }
      if (ctx.tapsSession >= 4 && (moods.indexOf("acalmar") >= 0 || moods.indexOf("silenciar") >= 0)) {
        fit += 2.2; reasons.push("respire");
      }
    }
    if (ctx.blockedRecently && moods.indexOf("acalmar") >= 0) { fit += 2.5; reasons.push("pos-bloqueio"); }
    if (ctx.gapDays >= 5 && (moods.indexOf("acolher") >= 0 || moods.indexOf("retorno") >= 0)) {
      fit += 2.4; reasons.push("ausencia");
    }
    if (ctx.streak >= 3 && moods.indexOf("celebrar") >= 0) { fit += 2.0; reasons.push("streak"); }
    if (ctx.hasTrail && moods.indexOf("retorno") >= 0) { fit += 1.6; reasons.push("trilha"); }
    if (ctx.investigouRecently && moods.indexOf("investigar") >= 0) { fit += 1.8; reasons.push("invest"); }

    /* freshness: never played or long ago */
    var hist = ctx.history || [];
    var lastIdx = hist.indexOf(it.id);
    var freshness;
    if (lastIdx < 0) { freshness = 4.5; reasons.push("inedita"); }
    else { freshness = Math.min(4.0, lastIdx / 8); reasons.push("idade:" + lastIdx); }

    /* diversity penalty vs last 2 categories */
    var divPen = 0;
    var cat = it.categoria;
    for (var j = 0; j < Math.min(2, (ctx.lastCats || []).length); j++) {
      if (ctx.lastCats[j] === cat) { divPen += 2.2 - j; reasons.push("div-" + cat); }
    }

    var total = fit + freshness - divPen;
    return { total: total, fit: fit, freshness: freshness, divPen: divPen, reasons: reasons };
  }

  function weightedPick(scored) {
    var top = scored.slice(0, TOP_K);
    var weights = [];
    var sum = 0;
    for (var i = 0; i < top.length; i++) {
      var w = Math.max(0.05, top[i].score.total);
      w = Math.pow(w, 1.35);
      weights.push(w); sum += w;
    }
    var r = Math.random() * sum;
    for (var j = 0; j < top.length; j++) {
      r -= weights[j];
      if (r <= 0) return top[j];
    }
    return top[0];
  }

  function pickSync(opts) {
    opts = opts || {};
    if (!DATA || !DATA.itens) return null;
    var s = st();
    var ctx = gatherContext(s);
    var want = desiredMoods(ctx);
    var pool = firstAccessPool(DATA, ctx);
    var candidates = pool && pool.length ? pool : DATA.itens;
    var scored = [];
    for (var i = 0; i < candidates.length; i++) {
      var it = candidates[i];
      var ex = hardExclude(it, ctx);
      if (ex) continue;
      var sc = scoreItem(it, ctx, want);
      scored.push({ item: it, score: sc });
    }
    if (!scored.length) {
      /* soften: allow outside LAST_N but still exclude session */
      for (var k = 0; k < DATA.itens.length; k++) {
        var it2 = DATA.itens[k];
        if (ctx.sessionPlayed.indexOf(it2.id) >= 0) continue;
        var sc2 = scoreItem(it2, ctx, want);
        scored.push({ item: it2, score: sc2 });
      }
    }
    scored.sort(function (a, b) { return b.score.total - a.score.total; });
    if (!scored.length) return null;
    var chosen = opts.deterministic ? scored[0] : weightedPick(scored);
    var itc = chosen.item;

    /* commit state */
    s.visitas = (s.visitas || 0) + 1;
    s.lastId = itc.id;
    s.lastDay = ctx.dayKey;
    s.streak = ctx.streak;
    s.tapsSession = (s.tapsSession || 0) + 1;
    s.lastTapAt = Date.now();
    s.sessionPlayed = (s.sessionPlayed || []).concat([itc.id]);
    s.history = [itc.id].concat(s.history || []).slice(0, 200);
    s.lastCats = [itc.categoria].concat(s.lastCats || []).slice(0, 8);
    if (ctx.ultimoTema) s.ultimoTema = ctx.ultimoTema;
    save(s);

    lastReason = {
      id: itc.id,
      categoria: itc.categoria,
      moods: itc.moods,
      texto: itc.texto,
      wantMoods: want,
      score: chosen.score,
      context: {
        slot: ctx.slot,
        visitas: ctx.visitas,
        gapDays: ctx.gapDays,
        streak: ctx.streak,
        rapid: ctx.rapid,
        tapsSession: s.tapsSession,
        blockedRecently: ctx.blockedRecently,
        hasTrail: ctx.hasTrail
      },
      top: scored.slice(0, 5).map(function (x) {
        return { id: x.item.id, total: +x.score.total.toFixed(2), cat: x.item.categoria };
      })
    };
    try {
      W.dispatchEvent(new CustomEvent("ms:abertura", { detail: lastReason }));
    } catch (e) {}
    updateDebug(lastReason);
    return itc;
  }

  function pick(cb, opts) {
    load(function (data) {
      if (!data) return cb(null);
      cb(pickSync(opts));
    });
  }

  function markBlocked() {
    var s = st(); s.blockedAt = Date.now(); save(s);
  }
  function markInvest() {
    var s = st(); s.investAt = Date.now(); save(s);
  }
  function markPotencia() {
    var s = st(); s.potAt = Date.now(); save(s);
  }
  function resetSession() {
    var s = st();
    s.tapsSession = 0;
    s.sessionPlayed = [];
    s.lastTapAt = 0;
    save(s);
  }

  function updateDebug(reason) {
    var el = D.getElementById("ms-ab-debug");
    if (!el || !reason) return;
    el.textContent = JSON.stringify(reason, null, 2);
  }

  function ensureDebug() {
    try {
      if (!/[?&]debug=aberturas\b/.test(location.search)) return;
      if (D.getElementById("ms-ab-debug")) return;
      var pre = D.createElement("pre");
      pre.id = "ms-ab-debug";
      pre.setAttribute("aria-live", "polite");
      pre.style.cssText = "position:fixed;right:8px;bottom:8px;z-index:9999;max-width:min(92vw,420px);max-height:45vh;overflow:auto;background:rgba(0,0,0,.88);color:#ffe9b0;font:11px/1.35 ui-monospace,monospace;padding:10px;border:1px solid rgba(232,184,74,.45);border-radius:10px;white-space:pre-wrap";
      pre.textContent = "MSAberturas debug — toque no Sol";
      D.body.appendChild(pre);
    } catch (e) {}
  }

  /* expose */
  W.MSAberturas = {
    load: load,
    pick: pick,
    pickSync: pickSync,
    markBlocked: markBlocked,
    markInvest: markInvest,
    markPotencia: markPotencia,
    resetSession: resetSession,
    lastReason: function () { return lastReason; },
    _st: st,
    _ready: false,
    _testGather: gatherContext,
    _testDesired: desiredMoods,
    _testScore: scoreItem,
    _testHard: hardExclude
  };

  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", ensureDebug);
  else ensureDebug();
  W.addEventListener("pageshow", function () { /* keep session across bfcache */ });
})(window, document);
