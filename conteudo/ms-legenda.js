/*! MSLegenda — karaoke-style read-along for Mestre Solar (Jervis/Águia/TTS). */
(function (W, D) {
  "use strict";
  var STATE = {
    on: true,
    gen: 0,
    words: [],
    spans: [],
    sentSpans: [],
    root: null,
    audio: null,
    raf: 0,
    userScroll: false,
    lastSent: -1,
    timings: null,
    timingsLoading: false,
    origHTML: null,
    restore: null
  };

  var PAUSE = { ",": 0.25, ";": 0.30, ":": 0.28, ".": 0.50, "!": 0.52, "?": 0.55, "…": 0.55, "—": 0.35, "–": 0.30 };

  function cfgOn() {
    try {
      if (W.SOL && typeof W.SOL.cfg === "function") {
        var c = W.SOL.cfg();
        if (c && c.legendaAcompanha === false) return false;
        if (c && c.legendaAcompanha === true) return true;
      }
    } catch (e) {}
    try {
      var t = localStorage.getItem("ms-sol-v1");
      if (t) {
        var o = JSON.parse(t);
        if (o && o.legendaAcompanha === false) return false;
      }
    } catch (e) {}
    var el = D.getElementById("sol-legenda-acomp");
    if (el) return !!el.checked;
    return STATE.on !== false;
  }

  function reduceMotion() {
    try {
      return W.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function syllWeight(w) {
    var s = w.toLowerCase(); try{s=s.normalize("NFD").replace(/[̀-ͯ]/g,"")}catch(e){}
    var m = s.match(/[aeiouyáéíóúâêôãõàèùäëïöü]+/gi);
    var syl = m ? m.length : 1;
    return Math.max(1, syl) * 1.15 + Math.max(1, w.replace(/[^0-9A-Za-zÀ-ÿ]/g, "").length) * 0.35;
  }

  function tokenize(text) {
    var t = String(text || "").replace(/\s+/g, " ").trim();
    if (!t) return [];
    var parts = t.split(/(\s+)/);
    var words = [];
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i] || /^\s+$/.test(parts[i])) continue;
      words.push(parts[i]);
    }
    return words;
  }

  function buildSchedule(words, dur, lead, trail) {
    lead = Math.max(0, lead || 0.05);
    trail = Math.max(0, trail || 0.35);
    var active = Math.max(0.2, (dur || 1) - lead - trail);
    var units = [];
    var totalW = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var weight = syllWeight(w);
      var pause = 0;
      var last = w.slice(-1);
      if (PAUSE[last] != null) pause = PAUSE[last];
      else if (/[,.;:!?…]$/.test(w)) {
        var ch = w.match(/[,.;:!?…]/);
        if (ch && PAUSE[ch[0]] != null) pause = PAUSE[ch[0]];
      }
      units.push({ i: i, w: w, weight: weight, pause: pause });
      totalW += weight;
    }
    var pauseSum = units.reduce(function (a, u) { return a + u.pause; }, 0);
    var speakBudget = Math.max(0.15, active - Math.min(pauseSum, active * 0.45));
    var t = lead;
    var out = [];
    for (var j = 0; j < units.length; j++) {
      var u = units[j];
      var span = speakBudget * (u.weight / (totalW || 1));
      var t0 = t;
      var t1 = t + span;
      out.push({ i: u.i, t0: t0, t1: t1, sent: 0 });
      t = t1 + u.pause * Math.min(1, (active * 0.45) / (pauseSum || 1));
    }
    /* assign sentence ids */
    var sid = 0;
    for (var k = 0; k < out.length; k++) {
      out[k].sent = sid;
      if (/[.!?…]["”»)\]]*$/.test(words[k])) sid++;
    }
    return out;
  }

  function loadTimings(cb) {
    if (STATE.timings) return cb(STATE.timings);
    if (STATE.timingsLoading) return;
    STATE.timingsLoading = true;
    var base = (W.MestreSolar && W.MestreSolar.conteudo && W.MestreSolar.conteudo().base) || "conteudo/";
    if (base.slice(-1) !== "/") base += "/";
    fetch(base + "audio-sigma/timings.json", { cache: "force-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        STATE.timings = (j && j.files) || {};
        STATE.timingsLoading = false;
        cb(STATE.timings);
      })
      .catch(function () {
        STATE.timings = {};
        STATE.timingsLoading = false;
        cb(STATE.timings);
      });
  }

  function fileMeta(src) {
    try {
      var name = String(src || "").split("?")[0].split("/").pop();
      var m = (STATE.timings && STATE.timings[name]) || null;
      return m || { lead: 0.05, trail: 0.35 };
    } catch (e) {
      return { lead: 0.05, trail: 0.35 };
    }
  }

  function findRoot(text) {
    var want = String(text || "").replace(/\s+/g, " ").trim();
    if (!want) return null;
    var nodes = D.querySelectorAll("li.msg.mestre, #sol-legenda, .msg.mestre, [data-sol-falado]");
    var best = null, bestScore = 0;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var attr = el.getAttribute("data-sol-falado") || "";
      var tx = (attr || el.textContent || "").replace(/\s+/g, " ").trim();
      if (!tx) continue;
      if (tx === want) return el.querySelector(".ms-leg-root") || pickTextHost(el);
      if (tx.indexOf(want.slice(0, Math.min(40, want.length))) >= 0 || want.indexOf(tx.slice(0, Math.min(40, tx.length))) >= 0) {
        var score = Math.min(tx.length, want.length);
        if (score > bestScore) {
          bestScore = score;
          best = el;
        }
      }
    }
    return best ? (best.querySelector(".ms-leg-root") || pickTextHost(best)) : null;
  }

  function pickTextHost(el) {
    /* Prefer the main text span, not seals/actions */
    var spans = el.querySelectorAll(":scope > span");
    for (var i = 0; i < spans.length; i++) {
      if (!spans[i].classList.contains("selo") && (spans[i].textContent || "").length > 8) return spans[i];
    }
    var kids = el.childNodes;
    for (var j = 0; j < kids.length; j++) {
      if (kids[j].nodeType === 1 && kids[j].tagName === "SPAN" && !kids[j].classList.contains("selo")) return kids[j];
    }
    return el;
  }

  function wrap(root, words) {
    if (!root) return { spans: [], sentSpans: [], restore: null };
    var orig = root.innerHTML;
    var html = "";
    var sentOpen = true;
    html += '<span class="ms-leg-root">';
    html += '<span class="ms-s" data-s="0">';
    var sid = 0;
    var spans = [];
    for (var i = 0; i < words.length; i++) {
      if (i) html += " ";
      html += '<span class="ms-w" data-i="' + i + '">' + escapeHtml(words[i]) + "</span>";
      if (/[.!?…]["”»)\]]*$/.test(words[i]) && i < words.length - 1) {
        html += "</span><span class=\"ms-s\" data-s=\"" + (++sid) + "\">";
      }
    }
    html += "</span></span>";
    root.innerHTML = html;
    var wspans = root.querySelectorAll(".ms-w");
    var sspans = root.querySelectorAll(".ms-s");
    return {
      spans: wspans,
      sentSpans: sspans,
      restore: function () {
        try {
          root.innerHTML = orig;
        } catch (e) {}
      }
    };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clearActive() {
    if (!STATE.spans) return;
    for (var i = 0; i < STATE.spans.length; i++) STATE.spans[i].classList.remove("ms-w-on");
    for (var j = 0; j < STATE.sentSpans.length; j++) STATE.sentSpans[j].classList.remove("ms-s-on");
  }

  function highlight(idx) {
    if (!STATE.sched || idx < 0 || idx >= STATE.sched.length) return;
    var item = STATE.sched[idx];
    clearActive();
    var sp = STATE.spans[item.i];
    if (sp) sp.classList.add("ms-w-on");
    var ss = STATE.sentSpans[item.sent];
    if (ss) ss.classList.add("ms-s-on");
    if (item.sent !== STATE.lastSent) {
      STATE.lastSent = item.sent;
      STATE.userScroll = false;
      if (ss && !STATE.userScroll && !reduceMotion()) {
        try {
          ss.scrollIntoView({ block: "nearest", behavior: "smooth", inline: "nearest" });
        } catch (e) {
          try {
            ss.scrollIntoView(false);
          } catch (e2) {}
        }
      }
    }
  }

  function idxAt(t) {
    var s = STATE.sched;
    if (!s || !s.length) return -1;
    if (t < s[0].t0) return 0;
    for (var i = 0; i < s.length; i++) {
      if (t >= s[i].t0 && t < s[i].t1 + 0.01) return i;
      if (i < s.length - 1 && t >= s[i].t1 && t < s[i + 1].t0) return i;
    }
    return s.length - 1;
  }

  function bindScrollGuard() {
    function onScroll() {
      STATE.userScroll = true;
    }
    W.addEventListener("wheel", onScroll, { passive: true });
    W.addEventListener("touchmove", onScroll, { passive: true });
    STATE._scrollGuards = onScroll;
  }

  function stopInternal() {
    STATE.gen++;
    if (STATE.raf) {
      cancelAnimationFrame(STATE.raf);
      STATE.raf = 0;
    }
    if (STATE.audio) {
      try {
        STATE.audio.removeEventListener("timeupdate", STATE._onTime);
      } catch (e) {}
    }
    STATE.audio = null;
    clearActive();
    if (STATE.restore) {
      try {
        STATE.restore();
      } catch (e) {}
      STATE.restore = null;
    }
    STATE.spans = [];
    STATE.sentSpans = [];
    STATE.sched = null;
    STATE.root = null;
    STATE.lastSent = -1;
  }

  function prepare(text) {
    var words = tokenize(text);
    var root = findRoot(text);
    if (!root) {
      /* fallback: sol-legenda */
      root = D.getElementById("sol-legenda");
    }
    var wrapped = wrap(root, words);
    STATE.words = words;
    STATE.spans = wrapped.spans;
    STATE.sentSpans = wrapped.sentSpans;
    STATE.restore = wrapped.restore;
    STATE.root = root;
    return words;
  }

  function startAudio(audio, text) {
    if (!cfgOn() || !audio) return;
    stopInternal();
    var gen = STATE.gen;
    loadTimings(function () {
      if (gen !== STATE.gen) return;
      var words = prepare(text);
      if (!words.length) return;
      var meta = fileMeta(audio.src || audio.currentSrc);
      function go() {
        if (gen !== STATE.gen) return;
        var dur = audio.duration;
        if (!isFinite(dur) || dur <= 0) dur = meta.dur || Math.max(2, words.length * 0.35);
        STATE.sched = buildSchedule(words, dur, meta.lead, meta.trail);
        STATE.audio = audio;
        STATE._onTime = function () {
          if (gen !== STATE.gen) return;
          highlight(idxAt(audio.currentTime || 0));
        };
        audio.addEventListener("timeupdate", STATE._onTime);
        function tick() {
          if (gen !== STATE.gen) return;
          if (audio.paused && !audio.ended) {
            /* paused — keep position */
          } else {
            highlight(idxAt(audio.currentTime || 0));
          }
          if (!audio.ended) STATE.raf = requestAnimationFrame(tick);
        }
        STATE.raf = requestAnimationFrame(tick);
        bindScrollGuard();
      }
      if (audio.readyState >= 1 && isFinite(audio.duration)) go();
      else audio.addEventListener("loadedmetadata", go, { once: true });
    });
  }

  function startTTS(utterance, text) {
    if (!cfgOn() || !utterance) return;
    stopInternal();
    var gen = STATE.gen;
    var words = prepare(text);
    if (!words.length) return;
    /* provisional schedule from rate; refine with boundary */
    var rate = utterance.rate || 1;
    var approx = Math.max(1.2, words.length * 0.38 / rate);
    STATE.sched = buildSchedule(words, approx, 0.05, 0.2);
    var charToWord = [];
    var pos = 0;
    for (var i = 0; i < words.length; i++) {
      if (i) pos += 1; /* space */
      for (var c = 0; c < words[i].length; c++) charToWord[pos + c] = i;
      pos += words[i].length;
    }
    var usedBoundary = false;
    utterance.addEventListener("boundary", function (ev) {
      if (gen !== STATE.gen) return;
      if (ev.name && ev.name !== "word") return;
      usedBoundary = true;
      var ci = ev.charIndex | 0;
      var wi = charToWord[ci];
      if (wi == null) {
        /* find nearest */
        for (var d = 0; d < 8; d++) {
          if (charToWord[ci - d] != null) {
            wi = charToWord[ci - d];
            break;
          }
          if (charToWord[ci + d] != null) {
            wi = charToWord[ci + d];
            break;
          }
        }
      }
      if (wi != null) {
        /* map word index into sched highlight */
        for (var s = 0; s < STATE.sched.length; s++) {
          if (STATE.sched[s].i === wi) {
            highlight(s);
            break;
          }
        }
      }
    });
    var t0 = Date.now();
    function tick() {
      if (gen !== STATE.gen) return;
      if (!usedBoundary) {
        var t = (Date.now() - t0) / 1000;
        highlight(idxAt(t));
      }
      STATE.raf = requestAnimationFrame(tick);
    }
    utterance.addEventListener("start", function () {
      if (gen !== STATE.gen) return;
      t0 = Date.now();
      STATE.raf = requestAnimationFrame(tick);
      bindScrollGuard();
    });
    utterance.addEventListener("end", function () {
      if (gen !== STATE.gen) return;
      stopInternal();
    });
    utterance.addEventListener("error", function () {
      if (gen !== STATE.gen) return;
      stopInternal();
    });
  }

  function onStop() {
    stopInternal();
  }

  W.MSLegenda = {
    startAudio: startAudio,
    startTTS: startTTS,
    stop: onStop,
    setEnabled: function (v) {
      STATE.on = !!v;
    },
    enabled: cfgOn,
    _state: STATE
  };
})(window, document);
