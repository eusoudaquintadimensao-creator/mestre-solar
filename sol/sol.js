/* Sol 2.0 · núcleo do Conhecimento Solar. Busca BM25 offline nas lições do app, voz gravada com legenda palavra por palavra,
   memória da conversa, Constelação do Conhecimento e Bússola do Sol. Sem servidor, sem chave, sem internet depois da 1ª visita. */
(function(){'use strict';
var D=document,W=window,LS=W.localStorage;
function $(s,r){return (r||D).querySelector(s)}function $$(s,r){return [].slice.call((r||D).querySelectorAll(s))}
function lsg(k,d){try{var v=LS.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}function lss(k,v){try{LS.setItem(k,JSON.stringify(v))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------- idioma ---------- */
var q0=new URLSearchParams(location.search);
var L=(q0.get('l')||q0.get('lang')||(function(){try{return LS.getItem('ms-lang')||''}catch(e){return''}})()||(navigator.language||'pt')).slice(0,2);if(!/^(pt|en|es)$/.test(L))L='pt';
var TX={
pt:{voltar:'App',sub:'NÚCLEO DO CONHECIMENTO SOLAR',ph:'Pergunte ao Sol…',toque:'Toque no Sol ou pergunte.',sug:'SUGESTÕES',bus:'BÚSSOLA DO SOL · PRÓXIMA ESTRELA',mem:'🧠 Memória da conversa',aviso:'Respostas tiradas só das lições do Conhecimento Solar, no seu aparelho. Sem internet, sem servidor.',
 ini:'INICIANDO NÚCLEO…',ok:function(n,v){return 'NÚCLEO ONLINE · '+n+' LIÇÕES · OFFLINE OK · VOZ: '+v},fala:'FALANDO',ouve:'OUVINDO…',
 mais:'⤵ Mais fundo',cont:'✧ Contemplar',fon:'📚 Fontes',ouvir:'🔊 Ouvir',parar:'⏹ Parar',abrir:'Abrir no app',memo:'🕯️ Abrir o memorial',
 fontes:'Fontes',naosei:'Não encontrei isso nas lições do Conhecimento Solar. Prefiro admitir a inventar. Veja os temas mais próximos.',semtema:'Ainda não falamos de nenhum tema. Faça uma pergunta primeiro.',fontesFala:'Estas são as fontes da última resposta. Confira por você mesmo.',fim:'Já te contei tudo o que a lição tem. Quer um tema vizinho?',
 hist:'Você me perguntou sobre: ',histVazio:'Ainda não temos histórico. Pergunte algo!',nome:function(n){return 'Prazer, '+n+'. Vou lembrar o seu nome neste aparelho.'},
 sauda:['Bom dia','Boa tarde','Boa noite'],saudaR:'Sistemas solares ativos. Sobre o que você quer saber hoje?',
 vozes:{sol:'Sol (Duarte, gravada)',aguia:'Águia Primordial (gravada)',aparelho:'Voz do aparelho'},vozCurta:{sol:'SOL',aguia:'ÁGUIA',aparelho:'APARELHO'},
 const:'✦ Constelação do Conhecimento',constP:function(a,t){return 'Cada lição é uma estrela. Você já acendeu '+a+' de '+t+'. Toque numa estrela para perguntar.'},
 selos:{'Comprovado':'✅ Comprovado','Tradição':'📜 Tradição','Hipótese':'🔭 Hipótese','Desconhecido':'❓ Desconhecido','Mito':'⚠️ Mito'},
 ex:['Quem foi Marguerite Porete?','O que é o efeito observador?','Quem foi Hermes Trismegisto?','O que é a Matrix?','O que tem de novo?','Quais são os temas?'],
 micNao:'O microfone por voz não está disponível neste navegador. Digite a pergunta.',imgArt:'Representação artística (não existe retrato autêntico).',imgMs:'Manuscrito de Chantilly MS 157 (domínio público).'},
en:{voltar:'App',sub:'CORE OF CONHECIMENTO SOLAR',ph:'Ask the Sun…',toque:'Tap the Sun or ask.',sug:'SUGGESTIONS',bus:'SUN COMPASS · NEXT STAR',mem:'🧠 Conversation memory',aviso:'Answers come only from Conhecimento Solar lessons, on your device. No internet, no server.',
 ini:'STARTING CORE…',ok:function(n,v){return 'CORE ONLINE · '+n+' LESSONS · OFFLINE OK · VOICE: '+v},fala:'SPEAKING',ouve:'LISTENING…',
 mais:'⤵ Go deeper',cont:'✧ Contemplate',fon:'📚 Sources',ouvir:'🔊 Listen',parar:'⏹ Stop',abrir:'Open in app',memo:'🕯️ Open the memorial',
 fontes:'Sources',naosei:'I did not find that in the Conhecimento Solar lessons. I prefer to admit it rather than invent. Here are the closest themes.',semtema:'We have not talked about any theme yet. Ask me something first.',fontesFala:'These are the sources of the last answer. Check them for yourself.',fim:'I have told you everything this lesson holds. Want a neighbouring theme?',
 hist:'You asked me about: ',histVazio:'No history yet. Ask something!',nome:function(n){return 'Nice to meet you, '+n+'. I will remember your name on this device.'},
 sauda:['Good morning','Good afternoon','Good evening'],saudaR:'Solar systems active. What would you like to know today?',
 vozes:{sol:'Sun (recorded)',aguia:'Águia Primordial (recorded, PT)',aparelho:'Device voice'},vozCurta:{sol:'SUN',aguia:'EAGLE',aparelho:'DEVICE'},
 const:'✦ Constellation of Knowledge',constP:function(a,t){return 'Every lesson is a star. You have lit '+a+' of '+t+'. Tap a star to ask.'},
 selos:{'Comprovado':'✅ Proven','Tradição':'📜 Tradition','Hipótese':'🔭 Hypothesis','Desconhecido':'❓ Unknown','Mito':'⚠️ Myth'},
 ex:['Who was Marguerite Porete?','What is the observer effect?','Who was Hermes Trismegistus?','What is the Matrix?','What is new?','What are the themes?'],
 micNao:'Voice input is not available in this browser. Type your question.',imgArt:'Artistic representation (no authentic portrait exists).',imgMs:'Chantilly manuscript MS 157 (public domain).'},
es:{voltar:'App',sub:'NÚCLEO DE CONHECIMENTO SOLAR',ph:'Pregunta al Sol…',toque:'Toca el Sol o pregunta.',sug:'SUGERENCIAS',bus:'BRÚJULA DEL SOL · PRÓXIMA ESTRELLA',mem:'🧠 Memoria de la conversación',aviso:'Respuestas sacadas solo de las lecciones de Conhecimento Solar, en tu dispositivo. Sin internet, sin servidor.',
 ini:'INICIANDO NÚCLEO…',ok:function(n,v){return 'NÚCLEO ONLINE · '+n+' LECCIONES · OFFLINE OK · VOZ: '+v},fala:'HABLANDO',ouve:'ESCUCHANDO…',
 mais:'⤵ Más profundo',cont:'✧ Contemplar',fon:'📚 Fuentes',ouvir:'🔊 Escuchar',parar:'⏹ Parar',abrir:'Abrir en la app',memo:'🕯️ Abrir el memorial',
 fontes:'Fuentes',naosei:'No encontré eso en las lecciones de Conhecimento Solar. Prefiero admitirlo antes que inventar. Mira los temas más cercanos.',semtema:'Todavía no hablamos de ningún tema. Hazme una pregunta primero.',fontesFala:'Estas son las fuentes de la última respuesta. Compruébalas tú mismo.',fim:'Ya te conté todo lo que tiene esta lección. ¿Quieres un tema vecino?',
 hist:'Me preguntaste sobre: ',histVazio:'Aún no hay historial. ¡Pregunta algo!',nome:function(n){return 'Encantado, '+n+'. Recordaré tu nombre en este dispositivo.'},
 sauda:['Buenos días','Buenas tardes','Buenas noches'],saudaR:'Sistemas solares activos. ¿Qué quieres saber hoy?',
 vozes:{sol:'Sol (grabada)',aguia:'Águia Primordial (grabada, PT)',aparelho:'Voz del dispositivo'},vozCurta:{sol:'SOL',aguia:'ÁGUILA',aparelho:'DISPOSITIVO'},
 const:'✦ Constelación del Conocimiento',constP:function(a,t){return 'Cada lección es una estrella. Ya encendiste '+a+' de '+t+'. Toca una estrella para preguntar.'},
 selos:{'Comprovado':'✅ Comprobado','Tradição':'📜 Tradición','Hipótese':'🔭 Hipótesis','Desconhecido':'❓ Desconocido','Mito':'⚠️ Mito'},
 ex:['¿Quién fue Marguerite Porete?','¿Qué es el efecto observador?','¿Quién fue Hermes Trismegisto?','¿Qué es la Matrix?','¿Qué hay de nuevo?','¿Cuáles son los temas?'],
 micNao:'La entrada por voz no está disponible en este navegador. Escribe la pregunta.',imgArt:'Representación artística (no existe retrato auténtico).',imgMs:'Manuscrito de Chantilly MS 157 (dominio público).'}};
function T(){return TX[L]}
/* ---------- memória ---------- */
var KM='ms-sol2-v1',MEM=lsg(KM,null)||{hist:[],acesas:{},voz:'sol'};if(!MEM.acesas)MEM.acesas={};if(!MEM.hist)MEM.hist=[];
function salva(){MEM.hist=MEM.hist.slice(-40);lss(KM,MEM)}
function nomePessoa(){var a=lsg('ms-sol-nome-v1',{})||{},b=lsg('jarvis-pessoa-v1',{})||{};return (a.nome||b.nome||'').trim()}
/* ---------- texto ---------- */
function nz(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
var STOP=new Set(('passa passar manda mandar dar faz fazer ver mostra mostre give show a o as os um uma uns umas de do da dos das no na nos nas em por para pra com sem que qual quais quem e ou se sao foi era eh me te lhe voce voces eu tu ele ela eles elas isso isto esse essa este esta aquilo como onde quando porque pq sobre ao aos à mais muito muita ja so tem ha ser estar fala fale diga conte explique explica saber sabe quero queria gostaria pode poderia significa existe existem seu sua meu minha the of to in on for with about is are was were be what who which how why when where do does did tell me you your i my an and or it this that from by as at can could please el la los las un una del al es fue que quien cual como donde cuando por para con sin sobre mi tu su lo le se y o eso esto ese esta dime explica puedes').split(' '));
function toks(s){return nz(s).split(' ').filter(function(w){return w&&!STOP.has(w)&&w.length>1})}
function st(w){return w.length>5?w.slice(0,5):w}
/* ---------- base ---------- */
var KB=null,IDX=null,KBL='';
function carregaKB(lg){return fetch('kb-'+lg+'.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(k){KB=k;KBL=lg;indexa();return k})}
function indexa(){var N=KB.licoes.length,df={},docs=[],tot=0;
  KB.licoes.forEach(function(e,ix){var tf={};function add(txt,w){toks(txt).forEach(function(t){var s=st(t);tf[s]=(tf[s]||0)+w})}
    add(e.t,3);add(e.p.join(' '),2.5);add(KB.grupos[e.g]||'',.8);add(e.r,1);add(e.a,.45);if(e.pa)add(e.pa,.8);
    var len=0;for(var k in tf){len+=tf[k];df[k]=(df[k]||0)+1}tot+=len;docs.push({tf:tf,len:len,fr:e.p.map(nz).filter(function(p){return p.length>3}),tn:nz(e.t)})});
  IDX={docs:docs,df:df,N:N,avg:tot/N}}
function busca(q,extra){var qt=toks(q).map(st);if(extra)qt=qt.concat(toks(extra).map(st));var qn=' '+nz(q)+' ',res=[],I=IDX,k1=1.3,b=.72;
  var uq=qt.filter(function(t,i){return qt.indexOf(t)===i});
  I.docs.forEach(function(d,ix){var s=0,hit=0;uq.forEach(function(t){var f=d.tf[t];if(!f)return;hit++;var idf=Math.log(1+(I.N-I.df[t]+.5)/(I.df[t]+.5));s+=idf*(f*(k1+1))/(f+k1*(1-b+b*d.len/I.avg))});
    if(s<=0)return;var cob=hit/Math.max(1,uq.length),fr=0;s*=.5+.5*cob;
    d.fr.forEach(function(p){if(qn.indexOf(' '+p+' ')>=0){s+=4+1.5*p.split(' ').length;fr=1}});
    if(d.tn&&qn.indexOf(' '+d.tn+' ')>=0){s+=6;fr=1}
    res.push({i:ix,s:s,cob:cob,fr:fr})});
  res.sort(function(a,b){return b.s-a.s});return res}
function intencao(q){var qn=nz(q),qw=qn.split(' ').length,best=null;
  KB.intencoes.forEach(function(it){it.p.forEach(function(p){var pn=nz(p);if(!pn)return;var pw=pn.split(' ').length,folga=/^x-(ola|obrigado)$/.test(it.i)?1:pw>1?4:2,ok=qn===pn||(qw<=pw+folga&&(' '+qn+' ').indexOf(' '+pn+' ')>=0);
    if(ok&&(!best||pn.length>best.l))best={it:it,l:pn.length}})});return best&&best.it}
/* ---------- conversa ---------- */
var ULT=null; /* {e, camada} */
var RX={
 mais:/^(e )?(mais|fale mais|me fale mais|conte mais|continue|continua|continuar|aprofund\w*|mais fundo|vai mais fundo|e depois|e entao|segue|tell me more|more|go deeper|deeper|continue|keep going|and then|mas|cuentame mas|profundiza\w*|sigue|y despues|mas profundo)[\s\?\.!]*$/,
 cont:/^(contempl\w*|reflex\w*|reflect\w*|reflexion\w*|meditar|para pensar)[\s\?\.!]*$/,
 fon:/(fonte|fontes|referencia|como (voce|vc) sabe|de onde (veio|vem)|sources?|how do you know|references?|fuentes?|como sabes)/,
 hist:/(o que (eu )?(ja )?(te )?perguntei|meu historico|nossa conversa|what did i ask|my history|que te pregunte|mi historial)/,
 nome:/(?:me chamo|meu nome e|pode me chamar de|my name is|call me|me llamo|mi nombre es)\s+([a-zà-ÿ][\wà-ÿ'-]{1,30})/i,
 pron:/\b(ele|ela|dele|dela|isso|disso|esse|essa|nisso|he|she|him|her|it|that|this|el|ella|eso|esto|ese|esa)\b/};
function pergunta(q,origem){q=String(q||'').trim();if(!q)return;if(!KB){fila=q;return}
  para();addConversa('eu',q);var qn=nz(q),r;
  var mN=q.match(RX.nome);if(mN){var n=mN[1].charAt(0).toUpperCase()+mN[1].slice(1);var o=lsg('ms-sol-nome-v1',{})||{};o.nome=n;lss('ms-sol-nome-v1',o);return responde({x:T().nome(n),voz:'aparelho'})}
  if(RX.hist.test(qn)){var ts=MEM.hist.filter(function(h){return h.t}).slice(-8).map(function(h){return h.t});return responde({x:ts.length?T().hist+ts.join(' · ')+'.':T().histVazio,voz:'aparelho',chips:ts.slice(-4).reverse()})}
  if(RX.mais.test(qn)){if(!ULT||!ULT.e)return responde({x:T().semtema,fala:T().semtema});return camada(ULT.c==='r'?'a':ULT.c==='a'?'c':'fim')}
  if(RX.cont.test(qn)&&ULT&&ULT.e)return camada('c');
  if(RX.fon.test(qn)&&toks(q).filter(function(t){return!/fonte|fuente|source|referenc|sabe|know|veio|vem/.test(t)}).length<2){if(!ULT||!ULT.e)return responde({x:T().semtema,fala:T().semtema});return mostraFontes()}
  var it=intencao(q);if(it)return responde({intent:it});
  var extra='';if(ULT&&ULT.e&&toks(q).length<=3&&RX.pron.test(qn))extra=ULT.e.t+' '+ULT.e.p.slice(0,3).join(' ');
  var gi=grupoPedido(q);if(gi>=0)return visaoGrupo(gi);
  var rs=busca(q,extra),top=rs[0];
  if(fraco(top,q)){return responde({x:T().naosei,fala:T().naosei,chips:rs.slice(0,4).map(function(x){return KB.licoes[x.i].t}),naosei:true})}
  var e=KB.licoes[top.i];ULT={e:e,c:'r'};acende(e);MEM.hist.push({q:q,i:e.i,t:e.t,ts:Date.now()});salva();
  responde({e:e,c:'r',alts:rs.slice(1,4).filter(function(x){return x.s>top.s*.45}).map(function(x){return KB.licoes[x.i].t})})}
var fila=null;
function fraco(top,q){if(!top)return true;if(top.fr)return top.s<3;var n=toks(q).length;return top.s<3.2||(n>=2&&top.cob<.6)||(n>=4&&top.cob<.7)}
function grupoPedido(q){var qn=' '+nz(q)+' ',best=-1,bl=0;KB.grupos.forEach(function(g,i){var gn=nz(g);if(gn.length>5&&qn.indexOf(' '+gn+' ')>=0&&gn.length>bl&&toks(q).length<=toks(g).length+3){best=i;bl=gn.length}});return best}
function visaoGrupo(gi){var ls=KB.licoes.filter(function(e){return e.g===gi}),g=KB.grupos[gi],n=ls.length,lit=ls.filter(function(e){return MEM.acesas[e.i]}).length;
  var x={pt:'O tema '+g+' tem '+n+' lições. Você já explorou '+lit+'. Comece por uma destas.',en:'The theme '+g+' has '+n+' lessons. You have explored '+lit+'. Start with one of these.',es:'El tema '+g+' tiene '+n+' lecciones. Ya exploraste '+lit+'. Empieza por una de estas.'}[L];
  var nao=ls.filter(function(e){return!MEM.acesas[e.i]});return responde({x:x,voz:'aparelho',chips:(nao.length?nao:ls).slice(0,8).map(function(e){return e.t})})}
function camada(c){if(c==='fim')return responde({x:T().fim,fala:T().fim,chips:vizinhos(ULT.e,4)});var e=ULT.e;if(!e[c]){c='c'}ULT.c=c;responde({e:e,c:c})}
function mostraFontes(){var e=ULT.e;responde({x:T().fontesFala,fala:T().fontesFala,fontes:e.f,e2:e})}
function vizinhos(e,n){var out=[];(e.s||[]).forEach(function(s){out.push(s)});
  var mesmo=KB.licoes.filter(function(x){return x.g===e.g&&x.i!==e.i});mesmo.sort(function(a,b){return (MEM.acesas[a.i]?1:0)-(MEM.acesas[b.i]?1:0)});
  mesmo.forEach(function(x){if(out.indexOf(x.t)<0)out.push(x.t)});return out.slice(0,n)}
function bussola(){/* próxima estrela: não acesa, no grupo mais explorado; senão uma lição aleatória do dia */
  var cont={};Object.keys(MEM.acesas).forEach(function(id){var e=porId(id);if(e)cont[e.g]=(cont[e.g]||0)+1});
  var gs=Object.keys(cont).sort(function(a,b){return cont[b]-cont[a]});
  for(var k=0;k<gs.length;k++){var c=KB.licoes.filter(function(x){return x.g==gs[k]&&!MEM.acesas[x.i]});if(c.length)return c[0]}
  var d=new Date(),seed=d.getFullYear()*400+d.getMonth()*31+d.getDate();var nao=KB.licoes.filter(function(x){return!MEM.acesas[x.i]});return (nao.length?nao:KB.licoes)[seed%(nao.length||KB.licoes.length)]}
function porId(id){for(var k=0;k<KB.licoes.length;k++)if(KB.licoes[k].i===id)return KB.licoes[k];return null}
function acende(e){if(!MEM.acesas[e.i]){MEM.acesas[e.i]=Date.now();salva()}}
/* ---------- imagens relacionadas ---------- */
var MIMG={'mp-quem':['rosto-480.webp','art'],'mp-voz':['rosto-480.webp','art'],'mp-livro':['ms-f1r.webp','ms'],'mp-baixar':['ms-f1r.webp','ms'],'mp-processo':['ms-f37v.webp','ms'],'mp-depois':['ms-f37v.webp','ms'],'mp-fogueira':['fogueira-d-480.webp','art'],'mp-memorial':['velas-480.webp','art'],'mp-reflexao':['velas-480.webp','art']};
function imagem(e){if(MIMG[e.i]){var m=MIMG[e.i];return{src:'../marguerite/img/'+m[0],cap:m[1]==='art'?T().imgArt:T().imgMs}}if(e.im&&L==='pt')return{src:e.im,cap:e.t};return null}
/* ---------- render ---------- */
var cartao=$('#cartao'),chips=$('#chips'),leg=$('#legenda');
function selos(n){return (n||[]).map(function(s){return '<span class="selo">'+esc(T().selos[s]||s)+'</span>'}).join('')}
function responde(o){var e=o.e,html='',fala='';
  if(o.intent){fala=o.intent.r;html='<p class="c-txt">'+esc(fala)+'</p>';
    if(/marguerite/.test(o.intent.i))html+='<div class="acoes"><a class="acao prim" href="../marguerite/">'+T().memo+'</a></div>';
    if(o.intent.i==='x-temas'){o.chips=KB.grupos.map(function(g){return g})}
    cartao.innerHTML='<div class="c-meta">☀ SOL</div>'+html;}
  else if(e){var c=o.c||'r';fala=e[c];var cls=c==='a'?'camada':c==='c'?'contempla':'';
    html='<div class="c-meta"><span>'+esc(KB.grupos[e.g]||'')+'</span>'+selos(e.n)+'</div><h2 class="c-tit">'+esc(e.t)+'</h2>';
    html+='<div class="c-txt"><p class="'+cls+'">'+esc(fala)+'</p></div>';
    var im=imagem(e);if(im&&c==='r')html+='<figure class="c-img"><img src="'+esc(im.src)+'" alt="'+esc(im.cap)+'" loading="lazy"><figcaption>'+esc(im.cap)+'</figcaption></figure>';
    html+='<div class="acoes">'+(c!=='c'?'<button class="acao prim" data-a="mais">'+T().mais+'</button>':'')+(c!=='c'?'<button class="acao" data-a="cont">'+T().cont+'</button>':'')+'<button class="acao" data-a="fon">'+T().fon+'</button><button class="acao" data-a="ouvir">'+T().ouvir+'</button>'+(/^mp-/.test(e.i)?'<a class="acao" href="../marguerite/">'+T().memo+'</a>':'')+'</div>';
    cartao.innerHTML=html;o.chips=o.chips||(o.alts&&o.alts.length?o.alts:[]).concat(vizinhos(e,4)).filter(function(x,i,a){return a.indexOf(x)===i}).slice(0,6)}
  else{fala=o.fala||o.x;html='<div class="c-meta">☀ SOL</div><p class="c-txt">'+esc(o.x)+'</p>';
    if(o.fontes)html+='<h2 class="c-tit">'+esc(o.e2.t)+'</h2><ol class="fontes">'+o.fontes.map(function(f){return '<li><a href="'+esc(f)+'" target="_blank" rel="noopener">'+esc(decodeURIComponent(f.replace(/^https?:\/\//,'')))+'</a></li>'}).join('')+'</ol>';
    cartao.innerHTML=html}
  cartao.hidden=false;cartao.style.animation='none';void cartao.offsetWidth;cartao.style.animation='';
  addConversa('sol',(e?e.t+' — ':'')+String(fala).slice(0,110)+(String(fala).length>110?'…':''));
  mostraChips(o.chips,o.naosei);ATUAL={txt:fala,h:o.intent?o.intent.h:(e&&o.c==='r'?e.h:null),e:e,c:o.c,voz:o.voz};
  if(o.e)lss('ms-sol2-ult',{i:e.i,c:o.c});
  fala1(fala,ATUAL.h,e,o.c,o.voz);
  if(innerWidth<980)setTimeout(function(){cartao.scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'})},120)}
var ATUAL=null;
cartao.addEventListener('click',function(ev){var b=ev.target.closest('[data-a]');if(!b)return;var a=b.dataset.a;
  if(a==='mais')camada(ULT.c==='r'?'a':'c');else if(a==='cont')camada('c');else if(a==='fon')mostraFontes();else if(a==='ouvir'&&ATUAL)fala1(ATUAL.txt,ATUAL.h,ATUAL.e,ATUAL.c,ATUAL.voz)});
function mostraChips(lst,naosei){var arr=(lst&&lst.length?lst:T().ex).slice(0,8),h='';
  arr.forEach(function(t){h+='<button class="chip" type="button">'+esc(t)+'</button>'});
  var b=KB&&bussola();if(b&&!naosei&&arr.indexOf(b.t)<0)h+='<button class="chip ouro" type="button" data-q="'+esc(b.t)+'" title="'+esc(T().bus)+'">✦ <b>'+esc(b.t)+'</b></button>';
  chips.innerHTML=h}
chips.addEventListener('click',function(ev){var c=ev.target.closest('.chip');if(c)pergunta(c.dataset.q||c.textContent)});
function addConversa(quem,t){var ol=$('#conversa'),li=D.createElement('li');li.className=quem;li.textContent=t;ol.appendChild(li);while(ol.children.length>30)ol.removeChild(ol.firstChild);ol.scrollTop=ol.scrollHeight}
/* ---------- legenda ---------- */
var WS=[];
function montaLegenda(txt){leg.classList.remove('vazia');var ws=String(txt).split(/\s+/).filter(Boolean);leg.innerHTML=ws.map(function(w,i){return '<span class="w" data-i="'+i+'">'+esc(w)+'</span>'}).join(' ');WS=[].slice.call(leg.children)}
var ultI=-1;function marca(i){if(i===ultI)return;for(var k=0;k<WS.length;k++){WS[k].classList.toggle('dito',k<=i);WS[k].classList.toggle('agora',k===i)}ultI=i;
  /* janela: no celular mostra só a frase em volta, para a legenda não crescer demais */
  var jan=innerWidth<980?26:44;if(WS.length>jan){var a=Math.max(0,Math.min(i-Math.floor(jan*.35),WS.length-jan));for(var k2=0;k2<WS.length;k2++)WS[k2].style.display=(k2>=a&&k2<a+jan)?'':'none'}}
function estimaTempos(txt,dur){var ws=String(txt).split(/\s+/).filter(Boolean),pesos=ws.map(function(w){return Math.max(2,w.replace(/[^\wÀ-ÿ]/g,'').length)+(/[.!?;:]$/.test(w)?7:/,$/.test(w)?3:0)}),tot=pesos.reduce(function(a,b){return a+b},0),t=0,out=[];
  pesos.forEach(function(p){out.push(t/tot*dur);t+=p});return out}
/* ---------- voz ---------- */
var au=new Audio();au.preload='auto';var TEMPOS={},tCarregado={},raf=0,falando=false,actx=null,anal=null,buf=null;
function voz(){var v=MEM.voz||'sol';if(v==='aguia'&&L!=='pt')v='sol';return v}
function tempos(lg){if(tCarregado[lg])return tCarregado[lg];tCarregado[lg]=fetch('voz/'+lg+'/tempos.json').then(function(r){return r.ok?r.json():{}}).then(function(j){TEMPOS[lg]=j;return j}).catch(function(){TEMPOS[lg]={};return{}});return tCarregado[lg]}
function h12(s){/* mesmo hash do gerador: sha1[:12] */return W.crypto&&crypto.subtle?crypto.subtle.digest('SHA-1',new TextEncoder().encode(s)).then(function(b){return [].map.call(new Uint8Array(b),function(x){return('0'+x.toString(16)).slice(-2)}).join('').slice(0,12)}):Promise.resolve(null)}
function analisador(){try{if(!actx){var AC=W.AudioContext||W.webkitAudioContext;if(!AC)return;actx=new AC();var src=actx.createMediaElementSource(au);anal=actx.createAnalyser();anal.fftSize=256;buf=new Uint8Array(anal.frequencyBinCount);src.connect(anal);anal.connect(actx.destination)}if(actx.state==='suspended')actx.resume()}catch(e){anal=null}}
var hud=$('#hud'),rootS=D.documentElement.style;
function nivel(v){rootS.setProperty('--nivel',v.toFixed(3))}
function estadoFala(on){falando=on;hud.classList.toggle('fala',on);status(on?T().fala:null);if(!on){nivel(0);estrelasVel=1}}
function para(){try{au.pause()}catch(e){}try{speechSynthesis.cancel()}catch(e){}cancelAnimationFrame(raf);estadoFala(false)}
function fala1(txt,h,e,c,vozForcada){para();montaLegenda(txt);ultI=-1;var v=vozForcada||voz();
  var lg=L;
  if(v==='aguia'&&e&&L==='pt'){var f=c==='a'?e.aa:c==='c'?e.ac:e.ar;if(f){return tocaArquivo('../conteudo/audio-aguia/'+f,null,txt)}}
  if(v==='aparelho')return sintese(txt);
  /* Sol: gravação com tempos exatos (palavra por palavra) */
  var ph=h?Promise.resolve(h):h12(txt);
  Promise.all([ph,tempos(lg)]).then(function(r){var hh=r[0],tm=TEMPOS[lg]||{};if(hh&&tm[hh])tocaArquivo('voz/'+lg+'/'+hh+'.mp3',tm[hh][1],txt);else sintese(txt)})}
function tocaArquivo(url,ts,txt){analisador();au.src=url;au.currentTime=0;var p=au.play();estadoFala(true);
  if(p&&p.catch)p.catch(function(){estadoFala(false);marca(-1)});
  au.onloadedmetadata=function(){if(!ts)ts=estimaTempos(txt,au.duration||10);au._ts=ts};au._ts=ts;
  au.onended=function(){marca(WS.length-1);estadoFala(false)};au.onerror=function(){sintese(txt)};
  cancelAnimationFrame(raf);(function laco(){if(au.paused&&!au.ended&&au.currentTime>0){estadoFala(false);return}var a=au._ts,t=au.currentTime+.05,i=-1;if(a){while(i+1<a.length&&a[i+1]<=t)i++;marca(i)}
    if(anal){anal.getByteFrequencyData(buf);var s=0;for(var k=2;k<40;k++)s+=buf[k];nivel(Math.min(1,s/38/150))}else nivel(.35+.25*Math.sin(Date.now()/120));estrelasVel=1+3*parseFloat(rootS.getPropertyValue('--nivel')||0);
    if(!au.ended)raf=requestAnimationFrame(laco)})()}
function vozAparelho(){var vs=speechSynthesis.getVoices(),pref={pt:/^pt(-|_)?br/i,en:/^en/i,es:/^es/i}[L],alt={pt:/^pt/i,en:/^en/i,es:/^es/i}[L];
  var c=vs.filter(function(v){return pref.test(v.lang)});if(!c.length)c=vs.filter(function(v){return alt.test(v.lang)});
  c.sort(function(a,b){function sc(v){var n=v.name.toLowerCase();return (/natural|neural|online|google|premium|enhanced/.test(n)?2:0)+(/antonio|duarte|daniel|ryan|guy|alvaro|jorge|male/.test(n)?1:0)}return sc(b)-sc(a)});return c[0]||null}
function sintese(txt){if(!('speechSynthesis' in W)){var ts=estimaTempos(txt,String(txt).length/14),t0=Date.now();estadoFala(true);(function l(){var t=(Date.now()-t0)/1000,i=-1;while(i+1<ts.length&&ts[i+1]<=t)i++;marca(i);if(i<ts.length-1&&falando)raf=requestAnimationFrame(l);else estadoFala(false)})();return}
  var u=new SpeechSynthesisUtterance(txt),vv=vozAparelho();if(vv){u.voice=vv;u.lang=vv.lang}else u.lang={pt:'pt-BR',en:'en-US',es:'es-ES'}[L];u.rate=1;u.pitch=.9;
  var pos=[],acc=0;String(txt).split(/(\s+)/).forEach(function(p){if(/\S/.test(p))pos.push(acc);acc+=p.length});
  var bound=false,t0=0,ts=estimaTempos(txt,String(txt).length/14.5);
  u.onboundary=function(ev){bound=true;var ci=ev.charIndex,i=0;while(i+1<pos.length&&pos[i+1]<=ci)i++;marca(i);nivel(.6)};
  u.onstart=function(){t0=Date.now();estadoFala(true);(function l(){if(!falando)return;if(!bound){var t=(Date.now()-t0)/1000,i=-1;while(i+1<ts.length&&ts[i+1]<=t)i++;marca(i)}nivel(.3+.3*Math.abs(Math.sin(Date.now()/110)));raf=requestAnimationFrame(l)})()};
  u.onend=u.onerror=function(){marca(WS.length-1);estadoFala(false)};
  try{speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
/* ---------- status / idioma / voz ---------- */
var stEl=$('#status');function status(tmp){if(tmp){stEl.className='status';stEl.innerHTML='<i></i><span>'+esc(tmp)+'</span>';return}
  if(!KB){stEl.className='status carrega';stEl.innerHTML='<i></i><span>'+esc(T().ini)+'</span>';return}
  stEl.className='status';stEl.innerHTML='<i></i><span>'+esc(T().ok(KB.licoes.length,T().vozCurta[voz()]))+'</span>'}
function aplicaTextos(){D.documentElement.lang={pt:'pt-BR',en:'en',es:'es'}[L];$$('[data-t]').forEach(function(el){el.textContent=T()[el.dataset.t]});
  $('#q').placeholder=T().ph;$('#rot-sug').textContent=T().sug;$('#mem-tit').textContent=T().mem;$('#aviso').textContent=T().aviso;$('#const-tit').textContent=T().const;
  if(!ATUAL){leg.textContent=T().toque;leg.classList.add('vazia')}
  $$('.pilula button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===L)});status()}
function trocaIdioma(l){if(l===L&&KB)return;L=l;try{LS.setItem('ms-lang',L)}catch(e){}para();ATUAL=null;cartao.hidden=true;aplicaTextos();KB=null;status();
  carregaKB(L).then(function(){var u=lsg('ms-sol2-ult',null);ULT=null;if(u){var e=porId(u.i);if(e)ULT={e:e,c:'r'}}status();mostraChips();if(fila){var f=fila;fila=null;pergunta(f)}}).catch(falhaKB);tempos(L)}
function falhaKB(){stEl.className='status carrega';stEl.innerHTML='<i></i><span>'+(L==='en'?'COULD NOT LOAD THE BASE. CHECK THE CONNECTION FOR THE FIRST VISIT.':L==='es'?'NO SE PUDO CARGAR LA BASE. REVISA LA CONEXIÓN EN LA PRIMERA VISITA.':'NÃO CONSEGUI CARREGAR A BASE. NA PRIMEIRA VISITA É PRECISO INTERNET.')+'</span>'}
$$('.pilula button').forEach(function(b){b.onclick=function(){trocaIdioma(b.dataset.l)}});
$('#b-voz').onclick=function(){var ordem=['sol','aguia','aparelho'];if(L!=='pt')ordem=['sol','aparelho'];var i=ordem.indexOf(voz());MEM.voz=ordem[(i+1)%ordem.length];salva();status();
  var msg=T().vozes[MEM.voz];addConversa('sol','🎙️ '+msg);this.title=msg;if(ATUAL)fala1(ATUAL.txt,ATUAL.h,ATUAL.e,ATUAL.c)};
/* ---------- toque no Sol: saudação ---------- */
var saudou=false;
hud.onclick=function(){analisador();if(falando){para();return}if(!KB)return;
  if(saudou&&ATUAL){fala1(ATUAL.txt,ATUAL.h,ATUAL.e,ATUAL.c,ATUAL.voz);return}saudou=true;
  var hr=new Date().getHours(),k=hr<12?0:hr<18?1:2,n=nomePessoa(),s=T().sauda[k];
  var txt=n?s+', '+n+'. '+T().saudaR:s+'. '+T().saudaR;
  var b=bussola();cartao.hidden=true;mostraChips(null);ATUAL={txt:txt,h:null};fala1(txt,null,null,null,n?'aparelho':null);if(b)addConversa('sol','✦ '+T().bus+': '+b.t)};
/* ---------- formulário e microfone ---------- */
$('#form').onsubmit=function(ev){ev.preventDefault();analisador();var i=$('#q');var v=i.value;i.value='';pergunta(v);if(innerWidth<760)i.blur()};
var SR=W.SpeechRecognition||W.webkitSpeechRecognition,rec=null;
$('#mic').onclick=function(){var m=this;analisador();if(!SR){responde({x:T().micNao,fala:T().micNao,voz:'aparelho'});return}
  if(rec){try{rec.stop()}catch(e){}return}para();rec=new SR();rec.lang={pt:'pt-BR',en:'en-US',es:'es-ES'}[L];rec.interimResults=true;rec.maxAlternatives=1;
  m.classList.add('on');hud.classList.add('ouve');status(T().ouve);var fim='';
  rec.onresult=function(e){var t='';for(var k=0;k<e.results.length;k++)t+=e.results[k][0].transcript;$('#q').value=t;if(e.results[e.results.length-1].isFinal)fim=t};
  rec.onend=function(){m.classList.remove('on');hud.classList.remove('ouve');rec=null;status();var t=fim||$('#q').value;$('#q').value='';if(t)pergunta(t)};
  rec.onerror=function(){};try{rec.start()}catch(e){rec=null;m.classList.remove('on');hud.classList.remove('ouve')}};
/* ---------- estrelas (universo em movimento, acelera quando o Sol fala) ---------- */
var cv=$('#estrelas'),cx=cv.getContext('2d'),SS=[],estrelasVel=1,dpr=Math.min(2,W.devicePixelRatio||1);
function tamC(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;SS=[];var n=Math.round(Math.min(160,innerWidth*innerHeight/7000));for(var k=0;k<n;k++)SS.push({x:Math.random(),y:Math.random(),z:Math.random()*.9+.1,tw:Math.random()*6.28})}
tamC();addEventListener('resize',tamC);var ultT=0,quadros=0,lento=false;
function anima(t){var dt=Math.min(50,t-(ultT||t));ultT=t;quadros++;if(D.hidden){requestAnimationFrame(anima);return}
  cx.clearRect(0,0,cv.width,cv.height);var w=cv.width,h=cv.height,cxm=w/2,cym=h*.32;
  for(var k=0;k<SS.length;k++){var s=SS[k];
    if(!RM){var vx=(s.x-.5),vy=(s.y-.32);s.x+=vx*.00018*dt*s.z*estrelasVel;s.y+=vy*.00018*dt*s.z*estrelasVel;s.tw+=dt*.004;
      if(s.x<-.05||s.x>1.05||s.y<-.05||s.y>1.05){s.x=.5+(Math.random()-.5)*.3;s.y=.32+(Math.random()-.5)*.2;s.z=Math.random()*.9+.1}}
    var a=.35+.45*Math.abs(Math.sin(s.tw))*s.z,r=(s.z*1.3+.2)*dpr;cx.fillStyle=s.z>.8?'rgba(255,226,160,'+a+')':'rgba(200,235,255,'+a+')';
    cx.fillRect(s.x*w,s.y*h,r,r);if(estrelasVel>1.6&&s.z>.6){cx.strokeStyle='rgba(255,215,140,'+(a*.35)+')';cx.lineWidth=r*.6;cx.beginPath();cx.moveTo(s.x*w,s.y*h);cx.lineTo(s.x*w-(s.x*w-cxm)*.04*estrelasVel,s.y*h-(s.y*h-cym)*.04*estrelasVel);cx.stroke()}}
  requestAnimationFrame(anima)}
requestAnimationFrame(anima);
/* ---------- Constelação do Conhecimento ---------- */
var cdlg=$('#const'),cc=$('#const-c'),cctx=cc.getContext('2d'),PTS=[],dica=$('#const-dica');
function hashN(s){var h=2166136261;for(var k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)}return (h>>>0)/4294967295}
function desenhaConst(){var r=cc.getBoundingClientRect(),w=r.width,h=r.height;cc.width=w*dpr;cc.height=h*dpr;cctx.setTransform(dpr,0,0,dpr,0,0);cctx.clearRect(0,0,w,h);PTS=[];
  var G=KB.grupos.length,cxm=w/2,cym=h/2,RX=w*.36,RY=h*.40,acesas=0,ret=h>w*1.15;
  var COL=3,ROW=Math.ceil(G/COL),cw=w/COL,ch=(h-10)/ROW;
  KB.grupos.forEach(function(g,gi){var ang=gi/G*6.283-1.57,k2=gi%2?.74:1,gx=ret?cw*(gi%COL+.5):cxm+Math.cos(ang)*RX*k2,gy=ret?ch*(Math.floor(gi/COL)+.42):cym+Math.sin(ang)*RY*k2;
    var ls=KB.licoes.filter(function(e){return e.g===gi}),rr=ret?Math.min(cw,ch)*.3*Math.min(1.25,.55+ls.length/40):Math.min(w,h)*.07*Math.min(1.6,.6+ls.length/30),prev=null,lit=0;
    ls.forEach(function(e,k){var a2=hashN(e.i)*6.283,d=Math.sqrt(hashN(e.i+'r'))*rr,x=gx+Math.cos(a2)*d,y=gy+Math.sin(a2)*d,on=!!MEM.acesas[e.i];if(on){lit++;acesas++}
      if(prev&&k%2===1){cctx.strokeStyle=on?'rgba(241,199,91,.45)':'rgba(120,170,220,.12)';cctx.lineWidth=.7;cctx.beginPath();cctx.moveTo(prev.x,prev.y);cctx.lineTo(x,y);cctx.stroke()}
      PTS.push({x:x,y:y,e:e,on:on});prev={x:x,y:y}});
    cctx.font='600 10.5px system-ui,sans-serif';cctx.textAlign='center';cctx.fillStyle=lit?'rgba(255,222,138,.95)':'rgba(169,190,210,.7)';
    var mx=ret?18:28,nome=g.length>mx?g.slice(0,mx-2).replace(/[\s,:]+$/,'')+'…':g;cctx.font=(ret?'600 9.5px':'600 11px')+' system-ui,sans-serif';cctx.fillText(nome+(lit?' · '+lit+'/'+ls.length:''),gx,gy+rr+12)});
  PTS.forEach(function(p){var r0=p.on?2.6:1.4;if(p.on){var gr=cctx.createRadialGradient(p.x,p.y,0,p.x,p.y,10);gr.addColorStop(0,'rgba(255,214,120,.9)');gr.addColorStop(1,'rgba(255,214,120,0)');cctx.fillStyle=gr;cctx.beginPath();cctx.arc(p.x,p.y,10,0,6.283);cctx.fill()}
    cctx.fillStyle=p.on?'#fff2c2':'rgba(170,210,255,.75)';cctx.beginPath();cctx.arc(p.x,p.y,r0,0,6.283);cctx.fill()});
  /* o Sol no centro */
  if(!ret){var gs=cctx.createRadialGradient(cxm,cym,0,cxm,cym,28);gs.addColorStop(0,'#fff6cf');gs.addColorStop(.35,'#ffc84a');gs.addColorStop(1,'rgba(255,140,30,0)');cctx.fillStyle=gs;cctx.beginPath();cctx.arc(cxm,cym,28,0,6.283);cctx.fill()}
  $('#const-p').textContent=T().constP(acesas,KB.licoes.length);$('#const-barra').style.width=(100*acesas/KB.licoes.length).toFixed(1)+'%'}
function pontoEm(ev){var r=cc.getBoundingClientRect(),x=ev.clientX-r.left,y=ev.clientY-r.top,best=null,bd=22*22;PTS.forEach(function(p){var d=(p.x-x)*(p.x-x)+(p.y-y)*(p.y-y);if(d<bd){bd=d;best=p}});return best}
$('#b-const').onclick=function(){if(!KB)return;cdlg.hidden=false;requestAnimationFrame(desenhaConst)};
$('#const-x').onclick=function(){cdlg.hidden=true;dica.hidden=true};
addEventListener('keydown',function(e){if(e.key==='Escape'&&!cdlg.hidden){cdlg.hidden=true}});
cc.addEventListener('pointermove',function(ev){var p=pontoEm(ev);if(!p){dica.hidden=true;return}dica.hidden=false;dica.textContent=(p.on?'★ ':'☆ ')+p.e.t;dica.style.left=ev.clientX+'px';dica.style.top=ev.clientY+'px'});
cc.addEventListener('click',function(ev){var p=pontoEm(ev);if(!p)return;cdlg.hidden=true;dica.hidden=true;pergunta(p.e.t)});
addEventListener('resize',function(){if(!cdlg.hidden)desenhaConst()});
/* ---------- início ---------- */
aplicaTextos();mostraChips(null);
var ultimo=lsg('ms-sol2-ult',null);
carregaKB(L).then(function(){if(ultimo){var e=porId(ultimo.i);if(e)ULT={e:e,c:'r'}}status();mostraChips(null);
  var q=q0.get('q');if(q)pergunta(q);else if(fila){var f=fila;fila=null;pergunta(f)}}).catch(falhaKB);
tempos(L);
if('serviceWorker' in navigator)navigator.serviceWorker.register('../sw.js').catch(function(){});
W.__SOL={pergunta:pergunta,busca:function(q){var r=busca(q);return r.slice(0,3).map(function(x){return{t:KB.licoes[x.i].t,i:KB.licoes[x.i].i,s:+x.s.toFixed(2)}})},
  responde:function(q){var it=intencao(q);if(it)return{id:it.i,x:it.r};var gi=grupoPedido(q);if(gi>=0)return{id:'grupo',t:KB.grupos[gi],x:KB.grupos[gi]};var r=busca(q);if(fraco(r[0],q))return{id:'naosei',x:T().naosei,alt:r.slice(0,3).map(function(x){return KB.licoes[x.i].t})};var e=KB.licoes[r[0].i];return{id:e.i,t:e.t,x:e.r,s:r[0].s}},
  pronto:function(){return!!KB&&KBL===L},lang:function(){return L},trocaIdioma:trocaIdioma,estado:function(){return{falando:falando,ult:ULT&&ULT.e&&ULT.e.i,camada:ULT&&ULT.c,acesas:Object.keys(MEM.acesas).length,voz:voz(),src:au.src,t:au.currentTime,ultI:ultI,nw:WS.length}}};
})();
