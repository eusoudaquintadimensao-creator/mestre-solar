/* Contador anônimo do Conhecimento Solar.
   Guarda SÓ totais agregados (números). Nunca lê nem grava IP, user agent, cookie, nome ou qualquer dado pessoal.
   - visitas: +1 por sessão do navegador (o app decide com sessionStorage)
   - online: WebSockets abertos (hibernação + timeout) + "batidas" HTTP de quem não tem WebSocket (token aleatório que expira em 70 s)
   - instalacoes: +1 por aparelho (o app decide com localStorage)
   - downloads: +1 por clique em Baixar do podcast
   - estrelas: +1 / -1 (o aparelho lembra a própria estrela), nunca abaixo de 0
   Backup diário (cron) grava uma foto dos totais; GET /totais e GET /backups exportam. */
import { DurableObject } from "cloudflare:workers";

const TIPOS = ["visitas", "instalacoes", "downloads", "estrelas"];
const LIMITE_MIN = { visitas: 6000, instalacoes: 600, downloads: 3000, estrelas: 600 }; // teto global por minuto (anti-abuso)
const PING_MS = 25000, TIMEOUT_MS = 75000, BATIDA_MS = 70000, ALARME_MS = 30000;
const MAX_SOCKETS = 20000, MAX_MSG_MIN = 20, MAX_CORPO = 200;

export class Contador extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS totais (chave TEXT PRIMARY KEY, valor INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS meta (chave TEXT PRIMARY KEY, valor TEXT);
      CREATE TABLE IF NOT EXISTS backups (dia TEXT PRIMARY KEY, criado INTEGER NOT NULL, json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS batidas (tok TEXT PRIMARY KEY, ate INTEGER NOT NULL);`);
    for (const t of TIPOS) this.sql.exec("INSERT OR IGNORE INTO totais (chave, valor) VALUES (?, 0)", t);
    this.sql.exec("INSERT OR IGNORE INTO meta (chave, valor) VALUES ('desde', ?)", String(Date.now()));
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("p", "o")); // ping/pong sem acordar o objeto
    this.janela = { ini: 0, n: {} };
    this.avisoPendente = null;
  }

  meta(k) { const r = this.sql.exec("SELECT valor FROM meta WHERE chave = ?", k).toArray(); return r.length ? r[0].valor : null; }

  vivos() {
    const agora = Date.now(); let n = 0;
    for (const ws of this.ctx.getWebSockets()) {
      if (ws.readyState !== 1) continue; // fechando/fechado não conta
      const ar = this.ctx.getWebSocketAutoResponseTimestamp(ws);
      const ult = Math.max((ws.deserializeAttachment() || {}).t || 0, ar ? +ar : 0);
      if (agora - ult <= TIMEOUT_MS) n++;
    }
    return n;
  }

  online() {
    const b = this.sql.exec("SELECT COUNT(*) AS n FROM batidas WHERE ate > ?", Date.now()).one().n;
    return this.vivos() + b;
  }

  totais() {
    const o = {};
    for (const r of this.sql.exec("SELECT chave, valor FROM totais")) o[r.chave] = Math.max(0, r.valor | 0);
    o.online = this.online();
    o.desde = Number(this.meta("desde"));
    o.ultimoBackup = this.meta("ultimoBackup");
    o.agora = Date.now();
    return o;
  }

  tetoOk(tipo) {
    const m = Math.floor(Date.now() / 60000);
    if (this.janela.ini !== m) this.janela = { ini: m, n: {} };
    const n = (this.janela.n[tipo] || 0) + 1;
    if (n > LIMITE_MIN[tipo]) return false;
    this.janela.n[tipo] = n; return true;
  }

  inc(tipo, delta) {
    if (!TIPOS.includes(tipo)) return { erro: "tipo" };
    delta = delta < 0 ? -1 : 1;                       // nunca mais que 1 por pedido
    if (delta < 0 && tipo !== "estrelas") return { erro: "delta" };
    if (!this.tetoOk(tipo)) return { erro: "limite", ...this.totais() };
    this.sql.exec("UPDATE totais SET valor = MAX(0, valor + ?) WHERE chave = ?", delta, tipo); // nunca abaixo de 0
    this.avisar();
    return this.totais();
  }

  bater(tok, sair) {
    if (!/^[a-z0-9]{8,32}$/.test(tok || "")) return { erro: "tok" };
    if (sair) this.sql.exec("DELETE FROM batidas WHERE tok = ?", tok);
    else {
      const novo = !this.sql.exec("SELECT 1 FROM batidas WHERE tok = ? AND ate > ?", tok, Date.now()).toArray().length;
      if (novo && this.online() >= MAX_SOCKETS) return { erro: "cheio", ...this.totais() };
      this.sql.exec("INSERT OR REPLACE INTO batidas (tok, ate) VALUES (?, ?)", tok, Date.now() + BATIDA_MS);
      if (novo) this.avisar();
    }
    this.garantirAlarme();
    return this.totais();
  }

  backup() {
    const t = this.totais(); delete t.ultimoBackup;
    const dia = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); // dia em Brasília
    this.sql.exec("INSERT OR REPLACE INTO backups (dia, criado, json) VALUES (?, ?, ?)", dia, Date.now(), JSON.stringify(t));
    this.sql.exec("DELETE FROM backups WHERE dia NOT IN (SELECT dia FROM backups ORDER BY dia DESC LIMIT 800)");
    this.sql.exec("INSERT OR REPLACE INTO meta (chave, valor) VALUES ('ultimoBackup', ?)", dia);
    return { dia, ...t };
  }

  zerar() { // só via /admin/zerar com o segredo ADMIN_TOKEN (para limpar contagens de teste)
    for (const t of TIPOS) this.sql.exec("UPDATE totais SET valor = 0 WHERE chave = ?", t);
    this.sql.exec("DELETE FROM backups"); this.sql.exec("DELETE FROM batidas");
    this.sql.exec("INSERT OR REPLACE INTO meta (chave, valor) VALUES ('desde', ?)", String(Date.now()));
    this.sql.exec("DELETE FROM meta WHERE chave = 'ultimoBackup'");
    this.avisar();
    return this.totais();
  }

  backups(n) {
    n = Math.min(800, Math.max(1, n | 0 || 60));
    return this.sql.exec("SELECT dia, json FROM backups ORDER BY dia DESC LIMIT ?", n).toArray().map(r => ({ dia: r.dia, ...JSON.parse(r.json) }));
  }

  /* avisa todos os WebSockets (agrupado em 1 s) */
  avisar() {
    if (this.avisoPendente) return;
    this.avisoPendente = setTimeout(() => {
      this.avisoPendente = null;
      const msg = JSON.stringify(this.totais());
      for (const ws of this.ctx.getWebSockets()) { try { ws.send(msg); } catch (e) {} }
    }, 1000);
  }

  async garantirAlarme() { if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(Date.now() + ALARME_MS); }

  async alarm() {
    const agora = Date.now(); let mudou = false;
    for (const ws of this.ctx.getWebSockets()) {
      const ar = this.ctx.getWebSocketAutoResponseTimestamp(ws);
      const ult = Math.max((ws.deserializeAttachment() || {}).t || 0, ar ? +ar : 0);
      if (agora - ult > TIMEOUT_MS) { try { ws.close(4000, "timeout"); } catch (e) {} mudou = true; }
    }
    const antes = this.sql.exec("SELECT COUNT(*) AS n FROM batidas").one().n;
    this.sql.exec("DELETE FROM batidas WHERE ate <= ?", agora);
    if (this.sql.exec("SELECT COUNT(*) AS n FROM batidas").one().n !== antes) mudou = true;
    if (mudou) this.avisar();
    if (this.ctx.getWebSockets().length || this.sql.exec("SELECT COUNT(*) AS n FROM batidas").one().n) await this.ctx.storage.setAlarm(Date.now() + ALARME_MS);
  }

  async fetch(req) { // só para o upgrade de WebSocket
    if (this.ctx.getWebSockets().length >= MAX_SOCKETS) return new Response("cheio", { status: 503 });
    const par = new WebSocketPair();
    this.ctx.acceptWebSocket(par[1]);
    par[1].serializeAttachment({ t: Date.now(), m: Math.floor(Date.now() / 60000), n: 0 });
    await this.garantirAlarme();
    try { par[1].send(JSON.stringify(this.totais())); } catch (e) {}
    this.avisar();
    return new Response(null, { status: 101, webSocket: par[0] });
  }

  async webSocketMessage(ws, msg) {
    const a = ws.deserializeAttachment() || {}; const m = Math.floor(Date.now() / 60000);
    if (a.m !== m) { a.m = m; a.n = 0; }
    a.n++; a.t = Date.now(); ws.serializeAttachment(a);
    if (a.n > MAX_MSG_MIN || typeof msg !== "string" || msg.length > 8) { try { ws.close(1008, "limite"); } catch (e) {} this.avisar(); return; }
    if (msg === "p") { try { ws.send("o"); } catch (e) {} return; }
    if (msg === "t") { try { ws.send(JSON.stringify(this.totais())); } catch (e) {} }
  }
  async webSocketClose(ws) { try { ws.close(1000, "tchau"); } catch (e) {} this.avisar(); }
  async webSocketError(ws) { this.avisar(); }
}

async function igual(a, b) { // comparação em tempo constante (via hash)
  const e = new TextEncoder(), h = async x => new Uint8Array(await crypto.subtle.digest("SHA-256", e.encode(x)));
  const x = await h(a), y = await h(b); let d = 0; for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i]; return d === 0;
}

function origens(env) { return String(env.ORIGENS || "").split(",").map(s => s.trim()).filter(Boolean); }

function resp(corpo, status, origem) {
  const h = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" };
  if (origem) { h["access-control-allow-origin"] = origem; h["vary"] = "Origin"; }
  return new Response(corpo == null ? null : JSON.stringify(corpo), { status: status || 200, headers: h });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origem = req.headers.get("Origin");
    const permitida = origem && origens(env).includes(origem) ? origem : null;
    if (url.pathname === "/admin/zerar") { // sem origem de navegador; exige o segredo (Worker secret), senão não existe
      const seg = String(env.ADMIN_TOKEN || ""), dado = String(req.headers.get("x-admin") || "");
      if (req.method !== "POST" || origem || seg.length < 32 || !(await igual(seg, dado))) return resp({ erro: "rota" }, 404);
      return resp(await env.CONTADOR.get(env.CONTADOR.idFromName("global")).zerar(), 200);
    }
    if (origem && !permitida) return resp({ erro: "origem" }, 403);
    const stub = env.CONTADOR.get(env.CONTADOR.idFromName("global"));
    const p = url.pathname.replace(/\/+$/, "") || "/";

    if (req.method === "OPTIONS") {
      if (!permitida) return resp(null, 403);
      return new Response(null, { status: 204, headers: { "access-control-allow-origin": permitida, "access-control-allow-methods": "GET, POST", "access-control-allow-headers": "content-type", "access-control-max-age": "86400", "vary": "Origin" } });
    }

    if (p === "/ws") {
      if (req.headers.get("Upgrade") !== "websocket") return resp({ erro: "upgrade" }, 426, permitida);
      if (!permitida) return resp({ erro: "origem" }, 403); // WebSocket só do app
      return stub.fetch(new Request("https://do/ws", { headers: { Upgrade: "websocket" } })); // repassa sem nenhum cabeçalho do visitante
    }

    if (req.method === "GET" && (p === "/totais" || p === "/")) return resp(await stub.totais(), 200, permitida);
    if (req.method === "GET" && p === "/backups") return resp(await stub.backups(Number(url.searchParams.get("n")) || 60), 200, permitida);

    if (req.method === "POST") {
      if (!permitida) return resp({ erro: "origem" }, 403); // só o app soma
      const len = Number(req.headers.get("content-length") || 0);
      if (len > MAX_CORPO) return resp({ erro: "grande" }, 413, permitida);
      let corpo = {};
      try { const t = await req.text(); if (t.length > MAX_CORPO) return resp({ erro: "grande" }, 413, permitida); corpo = t ? JSON.parse(t) : {}; } catch (e) { corpo = {}; }
      if (p === "/visita") return resp(await stub.inc("visitas", 1), 200, permitida);
      if (p === "/instalacao") return resp(await stub.inc("instalacoes", 1), 200, permitida);
      if (p === "/download") return resp(await stub.inc("downloads", 1), 200, permitida);
      if (p === "/estrela") return resp(await stub.inc("estrelas", Number(corpo.d) < 0 ? -1 : 1), 200, permitida);
      if (p === "/presenca") return resp(await stub.bater(String(corpo.tok || ""), !!corpo.sair), 200, permitida);
    }
    return resp({ erro: "rota" }, 404, permitida);
  },

  async scheduled(ev, env, ctx) {
    const stub = env.CONTADOR.get(env.CONTADOR.idFromName("global"));
    ctx.waitUntil(stub.backup());
  },
};
