/* Conhecimento Solar — "Usar offline": baixa o app (textos e imagens, + áudios da Águia, + áudios do Jervis) para o Cache Storage.
   Cache próprio "offline-ms" (sobrevive às trocas de versão do SW). Só baixa o que mudou (hash por arquivo em offline.json).
   Pausar/retomar, tamanho antes, progresso, espaço usado, armazenamento persistente, remover. PT/EN/ES. */
!function(){"use strict";
var W=window,D=document,CN="offline-ms",KM="ms-offline",ROOT=new URL("./",D.baseURI).href;
function LG(){var l=(W.MSI&&MSI.lang)||"";if(!l)try{l=localStorage.getItem("ms-lang")||""}catch(e){}return/^(en|es)/.test(l)?l.slice(0,2):"pt"}
function tx(pt,en,es){var l=LG();return l==="en"?en:l==="es"?es:pt}
function meta(v){try{if(v===undefined)return JSON.parse(localStorage.getItem(KM)||"null")||{pacotes:[],h:{}};localStorage.setItem(KM,JSON.stringify(v))}catch(e){return{pacotes:[],h:{}}}}
function mb(n){if(!n)return"0 MB";return n>=1e9?(n/1e9).toFixed(2)+" GB":n>=1e6?(n/1e6).toFixed(1)+" MB":Math.max(1,Math.round(n/1e3))+" KB"}
function jervisOk(){return typeof W.VOZ_JERVIS_ATIVA==="undefined"||W.VOZ_JERVIS_ATIVA===true}
function confere(buf,h){if(!(W.crypto&&crypto.subtle))return Promise.resolve(true);return crypto.subtle.digest("SHA-1",buf).then(function(d){var x=Array.prototype.map.call(new Uint8Array(d),function(b){return("0"+b.toString(16)).slice(-2)}).join("");return x.slice(0,h.length)===h})}
var MAN=null,st={rodando:false,pausado:false,feito:0,total:0,bytes:0,totalB:0,erro:""};
function manifesto(){return fetch(ROOT+"offline.json",{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(m){MAN=m;return m})}
function lista(pac){var a=[];pac.forEach(function(k){var p=MAN&&MAN.pacotes[k];if(p)a=a.concat(p.arquivos)});return a}
function pendentes(pac){var h=meta().h||{};return lista(pac).filter(function(f){return h[f[0]]!==f[2]})}
/* ---------- download ---------- */
function baixar(pac){if(st.rodando)return;if(!("caches"in W)){st.erro=tx("Este navegador não permite guardar offline.","This browser can't store offline.","Este navegador no permite guardar sin conexión.");ui();return}
 st.erro="";var m=meta();m.pacotes=pac;meta(m);pedePersist();
 manifesto().then(function(){var fila=pendentes(pac);st.total=fila.length;st.feito=0;st.totalB=fila.reduce(function(s,f){return s+f[1]},0);st.bytes=0;st.rodando=true;st.pausado=false;ui();
  return caches.open(CN).then(function(c){var i=0;
   function um(){if(st.pausado||i>=fila.length)return Promise.resolve();var f=fila[i++],url=ROOT+f[0];
    function pega(t){return fetch(url+"?v="+f[2],{cache:"no-store"}).then(function(r){if(!r.ok||r.redirected||new URL(r.url).origin!==location.origin)throw new Error(r.status);return r.arrayBuffer().then(function(buf){return confere(buf,f[2]).then(function(ok){if(!ok)throw new Error("hash");return c.put(url,new Response(buf,{status:200,headers:{"Content-Type":r.headers.get("Content-Type")||"application/octet-stream"}}))})})}).catch(function(e){if(t>0)return new Promise(function(ok){setTimeout(ok,900)}).then(function(){return pega(t-1)});throw e})}
    return pega(2).then(function(){H[f[0]]=f[2];st.feito++;st.bytes+=f[1];if(st.feito%25===0)flush();ui()})
     .catch(function(e){st.erro=tx("Falhou: ","Failed: ","Falló: ")+f[0];}).then(um)}
   var H={};function flush(){var mm=meta();for(var k in H)mm.h[k]=H[k];H={};meta(mm)}return Promise.all([um(),um(),um(),um()]).then(function(){flush();if(!pendentes(pac).length){var mm=meta();mm.versao=MAN.versao;mm.quando=Date.now();meta(mm)}})})})
 .catch(function(){st.erro=tx("Sem internet para baixar agora.","No internet to download now.","Sin internet para descargar ahora.")})
 .then(function(){st.rodando=false;ui();espaco()})}
/* grava o progresso dos arquivos já baixados (também em pausa) */
function remover(){if(!confirm(tx("Remover todos os downloads offline?","Remove all offline downloads?","¿Quitar todas las descargas sin conexión?")))return;st.pausado=true;
 caches.delete(CN).then(function(){meta({pacotes:[],h:{}});st={rodando:false,pausado:false,feito:0,total:0,bytes:0,totalB:0,erro:""};ui();espaco()})}
function pedePersist(){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persisted().then(function(p){return p||navigator.storage.persist()}).then(function(p){PERS=p;ui()})}catch(e){}}
var PERS=null,EST=null;
function espaco(){try{navigator.storage.estimate().then(function(e){EST=e;ui()});navigator.storage.persisted&&navigator.storage.persisted().then(function(p){PERS=p;ui()})}catch(e){}}
/* atualização: nova versão do app → baixa só o que mudou nos pacotes escolhidos */
function atualiza(){var m=meta();if(!m.pacotes||!m.pacotes.length||!navigator.onLine||st.rodando)return;manifesto().then(function(M){if(M.versao!==m.versao&&pendentes(m.pacotes).length)baixar(m.pacotes);else if(M.versao!==m.versao){m.versao=M.versao;meta(m)}}).catch(function(){})}
/* ---------- interface (tema cinza) ---------- */
var css=".off-chip{display:inline-flex;align-items:center;gap:5px;background:#2b2d31;border:1px solid #5f6368;color:#e8eaed;border-radius:999px;padding:6px 10px;font-size:12.5px;cursor:pointer;margin-right:6px;white-space:nowrap}.off-chip.on{border-color:#9aa0a6}@media(max-width:520px){.off-chip{padding:0;width:36px;height:36px;justify-content:center;font-size:17px}.off-chip span{display:none}}.off-badge{position:fixed;left:50%;transform:translateX(-50%);bottom:170px;white-space:nowrap;z-index:9999;background:#3c4043;color:#e8eaed;border:1px solid #9aa0a6;border-radius:999px;padding:4px 12px;font-size:12px;box-shadow:0 2px 10px #0008}"+
"#f-offline .card{background:#202124;color:#e8eaed;border:1px solid #5f6368;border-radius:16px;padding:16px;max-width:460px;margin:0 auto;max-height:88vh;overflow:auto}#f-offline{position:fixed;inset:0;z-index:9998;background:#000a;display:flex;align-items:flex-end;justify-content:center;padding:10px}#f-offline[hidden]{display:none}#f-offline h2{margin:0 0 6px;font-size:18px;display:flex;justify-content:space-between;color:#e8eaed}#f-offline h2 button{background:none;border:0;color:#bdc1c6;font-size:24px;cursor:pointer}"+
"#f-offline label.op{display:flex;gap:10px;align-items:flex-start;background:#2b2d31;border:1px solid #3c4043;border-radius:12px;padding:10px;margin:6px 0;cursor:pointer}#f-offline label.op small{color:#9aa0a6;display:block}#f-offline .bt{background:#5f6368;color:#fff;border:0;border-radius:12px;padding:10px 14px;font-size:14px;cursor:pointer;margin:4px 6px 4px 0}#f-offline .bt.sec{background:#2b2d31;border:1px solid #5f6368}#f-offline .bar{height:10px;background:#3c4043;border-radius:6px;overflow:hidden;margin:10px 0 4px}#f-offline .bar i{display:block;height:100%;background:#bdc1c6;width:0}#f-offline p{color:#bdc1c6;font-size:13px;margin:6px 0}#f-offline .er{color:#f28b82}";
function el(t,a,h){var e=D.createElement(t);if(a)for(var k in a)e.setAttribute(k,a[k]);if(h!=null)e.innerHTML=h;return e}
var F,chip,badge;
function monta(){var s=el("style");s.textContent=css;D.head.appendChild(s);
 F=el("div",{id:"f-offline",hidden:"",role:"dialog","aria-modal":"true"});F.appendChild(el("div",{"class":"card"}));D.body.appendChild(F);
 F.addEventListener("click",function(e){if(e.target===F)fecha()});
 chip=el("button",{"class":"off-chip",type:"button",id:"b-offline"});chip.addEventListener("click",abre);
 var tb=D.querySelector(".topo-bts");if(tb)tb.insertBefore(chip,tb.firstChild);else{chip.style.cssText="position:fixed;right:10px;bottom:90px;z-index:50";D.body.appendChild(chip)}
 var aj=D.querySelector("#f-ajustes .linha");if(aj){var b=el("button",{"class":"botao2",type:"button",id:"aj-offline"});b.addEventListener("click",function(){var f=D.getElementById("f-ajustes");if(f)f.hidden=true;abre()});aj.appendChild(b)}
 badge=el("div",{"class":"off-badge",hidden:"","aria-live":"polite"});D.body.appendChild(badge);
 W.addEventListener("online",ui);W.addEventListener("offline",ui);
 var lg=D.querySelectorAll("[data-lang],.lang button,#lang button");setInterval(function(){if(LG()!==ui._l)ui()},1500);
 ui();espaco();manifesto().then(ui).catch(function(){});
 if(navigator.serviceWorker){navigator.serviceWorker.addEventListener("controllerchange",function(){setTimeout(atualiza,1500)})}
 setTimeout(atualiza,4000)}
function abre(){F.hidden=false;espaco();if(!MAN)manifesto().then(ui).catch(ui);ui()}
function fecha(){F.hidden=true}
function escolhidos(){var a=["base"];if(F.querySelector("#op-ag")&&F.querySelector("#op-ag").checked)a.push("aguia");if(F.querySelector("#op-jv")&&F.querySelector("#op-jv").checked)a.push("jervis");return a}
function ui(){if(!F)return;ui._l=LG();var m=meta(),tem=m.pacotes&&m.pacotes.length&&Object.keys(m.h||{}).length>0,off=!navigator.onLine;
 chip.innerHTML=(tem?"✅":"📥")+"<span>"+tx("Offline","Offline","Offline")+"</span>";chip.setAttribute("aria-label",tx("Usar offline","Use offline","Usar sin conexión"));chip.className="off-chip"+(tem?" on":"");chip.title=tx("Baixar app para usar offline","Download app to use offline","Descargar la app para usar sin conexión");
 var aj=D.getElementById("aj-offline");if(aj)aj.textContent=tx("📥 Usar offline","📥 Use offline","📥 Usar sin conexión");
 badge.hidden=!off;badge.textContent=tem?tx("📴 Offline · usando o que foi baixado","📴 Offline · using downloads","📴 Sin conexión · usando lo descargado"):tx("📴 Sem internet","📴 No internet","📴 Sin internet");
 if(F.hidden&&!st.rodando)return;
 var P=MAN&&MAN.pacotes,sz=function(k){return P&&P[k]?mb(P[k].bytes):"…"},n=function(k){return P&&P[k]?P[k].n:0};
 var sel=st.rodando?m.pacotes:null,prevAg=F.querySelector("#op-ag"),prevJv=F.querySelector("#op-jv");
 var ag=prevAg?prevAg.checked:(m.pacotes||[]).indexOf("aguia")>=0,jv=prevJv?prevJv.checked:(m.pacotes||[]).indexOf("jervis")>=0;
 var pacs=["base"].concat(ag?["aguia"]:[],jv&&jervisOk()?["jervis"]:[]);
 var falta=MAN?pendentes(pacs):[],faltaB=falta.reduce(function(s,f){return s+f[1]},0);
 var feitos=function(k){if(!P||!P[k])return 0;var h=m.h||{};return P[k].arquivos.filter(function(f){return h[f[0]]===f[2]}).length};
 var pct=st.total?Math.round(100*st.feito/st.total):(MAN&&!falta.length&&tem?100:0);
 var h='<h2><span>'+tx("📥 Usar offline","📥 Use offline","📥 Usar sin conexión")+'</span><button type="button" data-x aria-label="×">×</button></h2>'+
 '<p>'+tx("Baixe o Conhecimento Solar para abrir sem internet. Fica só neste aparelho.","Download Conhecimento Solar to open without internet. Stays on this device only.","Descarga Conhecimento Solar para abrirlo sin internet. Queda solo en este dispositivo.")+'</p>'+
 '<label class="op"><input type="checkbox" checked disabled><span><b>'+tx("Textos e imagens","Texts and images","Textos e imágenes")+'</b> · '+sz("base")+'<small>'+tx("Todas as lições, temas, tabelas e imagens","All lessons, themes, tables and images","Todas las lecciones, temas, tablas e imágenes")+' ('+feitos("base")+'/'+n("base")+')</small></span></label>'+
 '<label class="op"><input type="checkbox" id="op-ag"'+(ag?" checked":"")+'><span><b>+ '+tx("Áudios da Águia","Eagle audios","Audios del Águila")+'</b> · '+sz("aguia")+'<small>'+tx("A voz gravada das lições","The recorded voice of the lessons","La voz grabada de las lecciones")+' ('+feitos("aguia")+'/'+n("aguia")+')</small></span></label>'+
 (jervisOk()?'<label class="op"><input type="checkbox" id="op-jv"'+(jv?" checked":"")+'><span><b>+ '+tx("Áudios do Jervis","Jervis audios","Audios de Jervis")+'</b> · '+sz("jervis")+'<small>'+tx("Voz opcional, tom grave","Optional voice, deep tone","Voz opcional, tono grave")+' ('+feitos("jervis")+'/'+n("jervis")+')</small></span></label>':"")+
 '<p><b>'+tx("A baixar agora: ","To download now: ","Por descargar: ")+(MAN?mb(faltaB)+" ("+falta.length+tx(" arquivos)"," files)"," archivos)"):"…")+'</b></p>'+
 '<div class="bar"><i style="width:'+pct+'%"></i></div><p>'+(st.rodando?(st.pausado?tx("Pausando…","Pausing…","Pausando…"):tx("Baixando ","Downloading ","Descargando ")+st.feito+"/"+st.total+" · "+mb(st.bytes)+" / "+mb(st.totalB)):(tem&&!falta.length?tx("✅ Pronto para usar offline","✅ Ready to use offline","✅ Listo para usar sin conexión"):pct+"%"))+'</p>'+
 (st.erro?'<p class="er">'+st.erro+'</p>':"")+
 (st.rodando?'<button class="bt" data-a="pausa">⏸ '+tx("Pausar","Pause","Pausar")+'</button>':'<button class="bt" data-a="baixa">⬇ '+(tem&&falta.length&&st.feito?tx("Retomar","Resume","Reanudar"):tem&&falta.length?tx("Baixar / atualizar","Download / update","Descargar / actualizar"):tem?tx("Verificar atualizações","Check for updates","Buscar actualizaciones"):tx("Baixar app para usar offline","Download app to use offline","Descargar la app para usar sin conexión"))+'</button>')+
 (tem?'<button class="bt sec" data-a="rm">🗑 '+tx("Remover downloads","Remove downloads","Quitar descargas")+'</button>':"")+
 '<p>'+tx("Espaço usado pelo app: ","Space used by the app: ","Espacio usado por la app: ")+(EST?mb(EST.usage||0)+(EST.quota?" / "+mb(EST.quota)+tx(" disponíveis"," available"," disponibles"):""):"…")+'<br>'+tx("Armazenamento persistente: ","Persistent storage: ","Almacenamiento persistente: ")+(PERS===true?tx("✅ garantido","✅ granted","✅ garantizado"):PERS===false?tx("não garantido (o navegador pode apagar se faltar espaço)","not granted (the browser may clear it if space runs low)","no garantizado (el navegador puede borrarlo si falta espacio)"):"…")+'</p>'+
 '<p>'+tx("Disponível offline: ","Available offline: ","Disponible sin conexión: ")+(feitos("base")===n("base")&&n("base")?tx("todas as lições em texto","all lessons as text","todas las lecciones en texto"):tx("ainda nenhuma lição completa","no lesson complete yet","aún ninguna lección completa"))+(feitos("aguia")?", "+feitos("aguia")+tx(" falas da Águia"," Eagle clips"," audios del Águila"):"")+(feitos("jervis")?", "+feitos("jervis")+tx(" falas do Jervis"," Jervis clips"," audios de Jervis"):"")+'.'+(m.versao?" "+tx("Versão: ","Version: ","Versión: ")+m.versao:"")+'</p>'+
 '<p style="font-size:12px;color:#9aa0a6">'+tx("No iPhone/iPad, instale na tela de início para o Safari não apagar os downloads após semanas sem uso.","On iPhone/iPad, add to Home Screen so Safari doesn't clear downloads after weeks without use.","En iPhone/iPad, añade a la pantalla de inicio para que Safari no borre las descargas tras semanas sin uso.")+'</p>';
 F.firstChild.innerHTML=h;
 F.querySelector("[data-x]").onclick=fecha;
 ["op-ag","op-jv"].forEach(function(id){var c=F.querySelector("#"+id);if(c)c.onchange=ui});
 var b=F.querySelector("[data-a=baixa]");if(b)b.onclick=function(){baixar(escolhidos())};
 b=F.querySelector("[data-a=pausa]");if(b)b.onclick=function(){st.pausado=true;ui()};
 b=F.querySelector("[data-a=rm]");if(b)b.onclick=remover}
W.MSOffline={abre:abre,baixar:baixar,remover:remover,estado:function(){return{st:st,meta:meta(),versao:MAN&&MAN.versao}},atualiza:atualiza};
D.readyState==="loading"?D.addEventListener("DOMContentLoaded",monta):monta();
}();
