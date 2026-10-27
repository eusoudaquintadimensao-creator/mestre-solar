/*! MSAberturas — rodízio de 100 aberturas Jervis no Sol */
(function (W, D) {
  "use strict";
  var KEY = "ms-aberturas-v1";
  var DATA = null;
  var loading = null;

  function load(cb) {
    if (DATA) return cb(DATA);
    if (loading) return loading.then(cb);
    var base = "conteudo/";
    try {
      if (W.MestreSolar && W.MestreSolar.conteudo) base = W.MestreSolar.conteudo().base || base;
    } catch (e) {}
    if (base.slice(-1) !== "/") base += "/";
    loading = fetch(base + "aberturas-100.json")
      .then(function (r) { return r.json(); })
      .then(function (j) { DATA = j; W.MSAberturas._ready = true; loading = null; cb(j); return j; })
      .catch(function () { loading = null; cb(null); });
  }

  function st() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  function periodo() {
    var h = new Date().getHours();
    if (h >= 5 && h < 12) return "manha";
    if (h >= 12 && h < 18) return "tarde";
    if (h >= 18 || h < 5) return "noite";
    return "tarde";
  }

  function hasTrail() {
    try {
      var c = W.SOL && W.SOL.cfg && W.SOL.cfg();
      if (c && c.ultimoTema) return true;
    } catch (e) {}
    try {
      var raw = localStorage.getItem("ms-sol-v1");
      if (raw) {
        var o = JSON.parse(raw);
        if (o && o.ultimoTema) return true;
      }
    } catch (e) {}
    return false;
  }

  function visitaCount(s) {
    return s.visitas || 0;
  }

  function shuffle(arr, avoidFirst) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    if (avoidFirst && a.length > 1 && a[0] === avoidFirst) {
      var k = 1 + Math.floor(Math.random() * (a.length - 1));
      var u = a[0]; a[0] = a[k]; a[k] = u;
    }
    return a;
  }

  function catOf(data, id) {
    for (var i = 0; i < data.itens.length; i++) if (data.itens[i].id === id) return data.itens[i].categoria;
    return "";
  }

  function rebuildDeck(data, s) {
    var ids = [];
    for (var i = 0; i < data.itens.length; i++) {
      var it = data.itens[i];
      var cond = it.condicoes || {};
      if (cond.visita === "primeira" || cond.visita === "2-5") continue; // handled separately
      if (cond.trilha && !hasTrail()) continue;
      // period preference: include all non-period + matching period heavier via later pick
      ids.push(it.id);
    }
    s.deck = shuffle(ids, s.lastId);
    s.deckPos = 0;
    save(s);
  }

  function pickSpecial(data, s) {
    var v = visitaCount(s);
    var want = null;
    if (v <= 0) want = "primeira";
    else if (v >= 1 && v <= 4) want = "2-5";
    if (!want) return null;
    var pool = data.itens.filter(function (it) {
      return (it.condicoes || {}).visita === want;
    });
    if (!pool.length) return null;
    var used = s.usedSpecial || {};
    var fresh = pool.filter(function (it) { return !used[it.id]; });
    if (!fresh.length) { fresh = pool; used = {}; }
    var it = fresh[Math.floor(Math.random() * fresh.length)];
    used[it.id] = 1;
    s.usedSpecial = used;
    return it;
  }

  function nextFromDeck(data, s) {
    if (!s.deck || !s.deck.length || s.deckPos >= s.deck.length) rebuildDeck(data, s);
    var per = periodo();
    // try to prefer matching period / balance calm-silence every ~4 draws
    var preferCalm = (s.drawCount || 0) % 4 === 3;
    var start = s.deckPos;
    for (var n = 0; n < s.deck.length; n++) {
      var idx = (start + n) % s.deck.length;
      var id = s.deck[idx];
      var cat = catOf(data, id);
      var it = null;
      for (var i = 0; i < data.itens.length; i++) if (data.itens[i].id === id) { it = data.itens[i]; break; }
      if (!it) continue;
      var cond = it.condicoes || {};
      if (cond.trilha && !hasTrail()) continue;
      if (preferCalm && (cat === "calma" || cat === "silêncio")) {
        s.deckPos = idx + 1; return it;
      }
      if (!preferCalm && cond.periodo && cond.periodo !== per && n < s.deck.length - 1) continue;
      if (!preferCalm && (cat === per || cat === "manhã" && per === "manha" || cat === "tarde" && per === "tarde" || cat === "noite" && per === "noite")) {
        s.deckPos = idx + 1; return it;
      }
      // accept after a full pass preference fail
      if (n >= Math.min(8, s.deck.length - 1)) {
        s.deckPos = idx + 1; return it;
      }
    }
    var id2 = s.deck[s.deckPos++];
    for (var j = 0; j < data.itens.length; j++) if (data.itens[j].id === id2) return data.itens[j];
    return data.itens[0];
  }

  function pickSync() {
    if (!DATA) return null;
    var s = st();
    var special = pickSpecial(DATA, s);
    var it = special || nextFromDeck(DATA, s);
    s.visitas = (s.visitas || 0) + 1;
    s.lastId = it.id;
    s.drawCount = (s.drawCount || 0) + 1;
    save(s);
    return it;
  }

  function pick(cb) {
    load(function (data) {
      if (!data || !data.itens || !data.itens.length) return cb(null);
      cb(pickSync());
    });
  }

  W.MSAberturas = { load: load, pick: pick, pickSync: pickSync, periodo: periodo, _st: st };
})(window, document);
