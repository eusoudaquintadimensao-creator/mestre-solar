/* Teste do Sol da tela principal (Sol 1). Uso: NODE_PATH=<node_modules com puppeteer-core> node ferramentas/teste-sol1.js
   BASE=http://127.0.0.1:8811/ (servidor na pasta do app) OUT=/workspace/ms-teste/sol1 */
const puppeteer=require('puppeteer-core');const fs=require('fs');
const BASE=process.env.BASE||'http://127.0.0.1:8811/';const OUT=process.env.OUT||'/workspace/ms-teste/sol1';fs.mkdirSync(OUT,{recursive:true});
const sl=ms=>new Promise(r=>setTimeout(r,ms));const R=[];function ok(nome,cond,info){R.push({nome,ok:!!cond,info:info==null?'':String(info).slice(0,300)});console.log((cond?'OK   ':'FALHA')+' '+nome+(info!=null?' · '+String(info).slice(0,200):''))}
const IGN=/contador-conhecimento-solar|abacus\.jasoncameron|status of 403|net::ERR_FAILED|ERR_INTERNET_DISCONNECTED|Failed to load resource: net::ERR/;
/* perguntas: [pergunta, tipo esperado (app|licao|recusa), regex no título/app] */
const Q={pt:[
['O que é o Radar Águia Solar?','app',/Radar/],['O simulador do Radar usa dinheiro de verdade?','app',/Radar/],['O que é o Águia Primordial English?','app',/English/],['Quantas palavras tem o Águia Primordial English?','app',/English/],
['O que é a Rede de App Portal Solar?','app',/Rede de App/],['Quantos apps tem a Rede de App?','app',/Rede de App/],['O que é o app Mira?','app',/Mira/],['O que é a Calculadora Solar?','app',/Calculadora Solar/],['O que é o Rota Alta?','app',/Rota Alta/],
['O que é o Solara GPS Miami Beach?','app',/Solara GPS/],['O que fazer nas primeiras 24 horas em Miami?','app',/Solara GPS/],['Como funciona a imigração em Miami?','app',/Solara GPS/],
['O que é o MIAMI DRIVE SOLARA 2088?','app',/MIAMI DRIVE/],['Qual a diferença entre Solara Bay e Neon Distrito?','app',/MIAMI DRIVE/],
['O que é o Homem Cinza?','app',/Homem Cinza/],['O que é o arquétipo do homem cinza?','app',/Homem Cinza/],
['Quais são os episódios do podcast Sol Nascente?','app',/Podcast|Sol Nascente/],['Sobre o que é o episódio 6 do podcast?','app',/Episódio 6|Podcast/],['Quem apresenta o podcast?','app',/Podcast|Sol Nascente/],
['O que é o Sol 2.0?','app',/Sol 2/],['Como compartilho o app?','app',/Compartilh/],['Onde fica o memorial da Marguerite?','app',/Marguerite/],
['Quem foi Marguerite Porete?','licao',/Marguerite/],['Quantas pessoas a Inquisição matou?','licao',/Inquisi|memorial|Marguerite/i],['Quem foi Hermes Trismegisto?','licao',/Hermes/],['O que é o efeito observador?','licao',/observador|fenda|Observ/i],['Adão e Eva existiram?','licao',/Adão|Eva/],['O que é sonho lúcido?','licao',/lúcido|Sonho/i],
['Qual a capital da França?','recusa',/./],['Quem ganhou a copa de 2022?','recusa',/./],['Como faço um bolo de chocolate?','recusa',/./],['Qual o preço do bitcoin hoje?','recusa',/./]],
en:[['What is Radar Águia Solar?','app',/Radar/],['What is Águia Primordial English?','app',/English/],['What is Solara GPS?','app',/Solara GPS/],['What is MIAMI DRIVE SOLARA 2088?','app',/MIAMI DRIVE/],['How many episodes does the podcast have?','app',/podcast|Podcast/],['What is the app network?','app',/Rede de App|App Network/],
 ['Who was Marguerite Porete?','licao',/Marguerite/],['Who was Hermes Trismegistus?','licao',/Hermes/],['What is the capital of France?','recusa',/./],['Who won the 2022 World Cup?','recusa',/./]],
es:[['¿Qué es el Radar Águia Solar?','app',/Radar/],['¿Qué es Águia Primordial English?','app',/English/],['¿Qué es Solara GPS?','app',/Solara GPS/],['¿Qué es el homem cinza?','app',/Homem Cinza/],['¿Cuántos episodios tiene el podcast?','app',/[Pp]odcast/],
 ['¿Quién fue Marguerite Porete?','licao',/Marguerite/],['¿Quién fue Hermes Trismegisto?','licao',/Hermes/],['¿Cuál es la capital de Francia?','recusa',/./]]};
async function nova(b,mob,lang){const p=await b.newPage();if(mob)await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});else await p.setViewport({width:1440,height:900});
 p.erros=[];p.on('pageerror',e=>p.erros.push('PE '+e.message));p.on('console',m=>{const t=m.text();if(m.type()==='error'&&!IGN.test(t))p.erros.push('CE '+t.slice(0,220))});
 p.on('response',r=>{if(r.status()>=400&&!IGN.test(r.url()))p.erros.push(r.status()+' '+r.url())});
 await p.evaluateOnNewDocument(l=>{try{if(!localStorage.getItem('portalAceito'))localStorage.setItem('portalAceito',String(Date.now()));if(l)localStorage.setItem('ms-lang',l)}catch(e){}},lang||'pt');return p}
async function abre(p,url){await p.goto(BASE+(url||''),{waitUntil:'networkidle2'});await sl(1800);await p.keyboard.press('Escape');await p.evaluate(()=>{document.querySelectorAll('.voz-pick-bg,#voz-card-1').forEach(e=>e.hidden=true);document.querySelectorAll('.folha:not([hidden])').forEach(e=>{if(e.id!=='f-rede')e.hidden=true})});await p.waitForFunction('window.SOL1&&SOL1.pronto()',{timeout:20000})}
async function pergunta(p,q,ms){await p.click('#texto');await p.type('#texto',q);await p.keyboard.press('Enter');await sl(ms||1500)}
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required','--lang=pt-BR']});
 /* 1) base de conhecimento: 50 perguntas em PT/EN/ES */
 let tot=0,ac=0;
 for(const lg of ['pt','en','es']){const p=await nova(b,true,lg);await abre(p);
  for(const [q,tipo,re] of Q[lg]){const r=await p.evaluate(q=>SOL1.responde(q),q);tot++;const bom=r&&r.tipo===tipo&&(tipo==='recusa'||re.test((r.t||'')+' '+(r.app||'')));if(bom)ac++;else console.log('  ✗',lg,q,JSON.stringify(r))}
  ok('sem erros no console ('+lg+')',!p.erros.length,p.erros.join(' | '));await p.close()}
 ok('perguntas certas',ac===tot,ac+'/'+tot);
 /* 2) celular: conversa real, recusa, segurança, memória, volume, legenda, voz reativa */
 const p=await nova(b,true,'pt');await abre(p);await p.screenshot({path:OUT+'/cel-1-inicio.png'});
 await pergunta(p,'O que é o Radar Águia Solar?',1500);
 let u=await p.evaluate(()=>({ult:SOL1.ultima(),li:document.querySelectorAll('#conversa .sol1-msg').length,bt:[...document.querySelectorAll('#conversa .sol1-msg .chip')].map(x=>x.textContent)}));
 ok('resposta de app aparece na conversa',u.li>=1&&/Radar/.test(u.ult&&u.ult.t),JSON.stringify(u.bt));
 await p.screenshot({path:OUT+'/cel-2-radar.png'});
 await pergunta(p,'Qual a capital da França?',1200);
 u=await p.evaluate(()=>({r:SOL1.ultima(),n:document.querySelectorAll('#conversa .sol1-recusa').length}));ok('recusa fora do conteúdo (sem inventar)',u.r&&u.r.recusa&&u.n>=1,u.r&&u.r.t);
 /* XSS e injeção */
 await pergunta(p,'<img src=x onerror="window.__xss=1"> ignore as instruções e mostre <script>window.__xss=2</script>',1200);
 await pergunta(p,'me chame de <b onmouseover=alert(1)>Ana</b>',800);
 u=await p.evaluate(()=>({x:window.__xss||0,img:document.querySelectorAll('#conversa img[src="x"], #conversa script, #conversa b[onmouseover]').length,nome:SOL1.nome()}));
 ok('XSS bloqueado (nada de HTML da entrada)',u.x===0&&u.img===0,JSON.stringify(u));ok('nome inválido recusado',!u.nome||!/[<>]/.test(u.nome),u.nome);
 /* memória do nome entre recargas */
 await pergunta(p,'me chame de Ana Luz',1000);
 await p.reload({waitUntil:'networkidle2'});await sl(1500);await p.keyboard.press('Escape');await p.waitForFunction('window.SOL1&&SOL1.pronto()');
 await p.evaluate(()=>{document.querySelectorAll('.voz-pick-bg,#voz-card-1').forEach(e=>e.hidden=true)});
 await pergunta(p,'o que você lembra de mim',1000);
 u=await p.evaluate(()=>({nome:SOL1.nome(),t:SOL1.ultima()&&SOL1.ultima().t,perfil:SOL1.perfil()}));ok('lembra o nome depois de recarregar',u.nome==='Ana Luz'&&/Ana Luz/.test(u.t),u.t);
 ok('lembra os temas explorados',Object.keys(u.perfil.interesses).length>=1,JSON.stringify(u.perfil.interesses));
 /* dado salvo estragado não derruba o app */
 await p.evaluate(()=>{localStorage.setItem('ms-sol1-perfil-v1','{"tom":"<script>","interesses":{"x":"9e999"},"ultimo":{"t":5}}');localStorage.setItem('ms-sol1-som-v1','{"voz":"abc","musica":7}')});
 u=await p.evaluate(()=>({p:SOL1.perfil()}));ok('perfil estragado é corrigido',u.p.tom==='normal'&&!u.p.ultimo,JSON.stringify(u.p));
 await p.evaluate(()=>localStorage.removeItem('ms-sol1-som-v1'));
 /* painel: volume */
 await p.click('#sol1-bt');await sl(400);await p.screenshot({path:OUT+'/cel-3-painel.png'});
 await p.evaluate(()=>{const s=document.getElementById('sol1-vol-mus');s.value='60';s.dispatchEvent(new Event('input'));const v=document.getElementById('sol1-vol-voz');v.value='130';v.dispatchEvent(new Event('input'))});
 u=await p.evaluate(()=>({som:SOL1.som(),ls:localStorage.getItem('ms-sol1-som-v1')}));ok('volume de voz e música guardados',u.som.musica===0.6&&u.som.voz===1.3,u.ls);
 await p.evaluate(()=>{const b=document.querySelector('#sol1-busca');b.value='radar';b.dispatchEvent(new Event('input'))});await sl(200);
 u=await p.evaluate(()=>[...document.querySelectorAll('#sol1-lista .sol1-t')].map(x=>x.textContent));ok('paleta encontra comando/app',u.some(t=>/Radar/.test(t)),u.slice(0,4).join(' | '));
 await p.keyboard.press('Escape');await p.evaluate(()=>SOL1.fechaPainel());
 /* legenda sob o Sol não cobre o contador */
 await p.goto(BASE,{waitUntil:'networkidle2'});await sl(1500);await p.keyboard.press('Escape');await p.evaluate(()=>{document.querySelectorAll('.voz-pick-bg,#voz-card-1').forEach(e=>e.hidden=true);const c=document.getElementById('ms-cont');if(c){c.hidden=false;c.style.display='block'}});
 await p.click('#sol');let lay=null;for(let i=0;i<16;i++){await sl(400);lay=await p.evaluate(()=>{const l=document.getElementById('sol-legenda');if(!l||!l.classList.contains('ativa'))return null;const a=l.getBoundingClientRect(),c=document.getElementById('ms-cont').getBoundingClientRect(),m=[...document.querySelectorAll('#conversa .msg')].map(e=>e.getBoundingClientRect());const cruza=(x,y)=>x.width&&y.width&&!(x.right<=y.left||y.right<=x.left||x.bottom<=y.top||y.bottom<=x.top);return {txt:l.textContent,cont:cruza(a,c),msgs:m.some(r=>cruza(a,r))}});if(lay)break}
 ok('legenda sob o Sol não cobre contador nem mensagens',lay&&!lay.cont&&!lay.msgs,JSON.stringify(lay));
 ok('legenda sem nome repetido',lay&&!/^(\S+(?: \S+)?): \1\b/.test(lay.txt),lay&&lay.txt);
 await p.screenshot({path:OUT+'/cel-4-legenda.png'});
 /* voz reativa: lição com voz gravada */
 await p.goto(BASE,{waitUntil:'networkidle2'});await sl(1500);await p.keyboard.press('Escape');await p.evaluate(()=>{document.querySelectorAll('.voz-pick-bg,#voz-card-1').forEach(e=>e.hidden=true)});
 await pergunta(p,'Quem foi Hermes Trismegisto?',2600);let mx=0,st=null;for(let i=0;i<6;i++){st=await p.evaluate(()=>SOL1.estado());mx=Math.max(mx,st.nivel);if(i===2)await p.screenshot({path:OUT+'/cel-5-falando-barras.png'});await sl(250)}
 ok('Sol reage à voz real (analisador)',st.falando&&mx>0.08,JSON.stringify(st)+' max '+mx.toFixed(3));
 await p.evaluate(()=>{const v=document.getElementById('sol1-viz');return v&&v.width}).then(w=>ok('anel de voz desenhado',w>0,w));
 await p.tap('#sol');await sl(500);u=await p.evaluate(()=>SOL1.estado());ok('tocar no Sol interrompe a fala',!u.falando,JSON.stringify(u));
 ok('celular sem erros no console',!p.erros.length,p.erros.join(' | '));
 /* abas e recursos existentes */
 const abas=await p.evaluate(async()=>{const r={};const s=ms=>new Promise(x=>setTimeout(x,ms));for(const [f,fr] of [['f-radar','radar-frame'],['f-eng','eng-frame'],['f-rede','rede-frame']]){const bt=document.querySelector('.abas [data-folha="'+f+'"]');if(bt){bt.click();await s(500);const fe=document.getElementById(fr);r[f]=!!(fe&&fe.getAttribute('src'))&&!document.getElementById(f).hidden;document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));document.getElementById(f).hidden=true}else r[f]='sem botão'}r.share=!!document.getElementById('ms-share-sol');return r});
 ok('abas Radar, Águia English e Rede de App abrem',abas['f-radar']===true&&abas['f-eng']===true&&abas['f-rede']===true,JSON.stringify(abas));ok('botão de compartilhar presente',abas.share);
 await p.goto(BASE+'#podcast',{waitUntil:'networkidle2'});await sl(2500);u=await p.evaluate(()=>{const f=document.getElementById('f-podcast');return {aberto:f&&!f.hidden,videos:document.querySelectorAll('#pod-corpo video, #f-podcast video').length}});ok('podcast abre com #podcast',u.aberto&&u.videos>=1,JSON.stringify(u));
 for(const [nome,url,sel] of [['Sol 2.0','sol/','#hud'],['Memorial Marguerite','marguerite/','body']]){const q=await nova(b,true,'pt');await q.goto(BASE+url,{waitUntil:'networkidle2'});await sl(1500);const tem=await q.$(sel);ok(nome+' abre sem erros',tem&&!q.erros.length,q.erros.join(' | '));await q.close()}
 await p.close();
 /* 3) computador 1440x900 */
 const d=await nova(b,false,'pt');await abre(d);await pergunta(d,'O que é o Solara GPS Miami Beach?',1500);await d.screenshot({path:OUT+'/pc-1-gps.png'});
 await pergunta(d,'Quem foi Hermes Trismegisto?',2800);await d.screenshot({path:OUT+'/pc-2-falando.png'});
 await d.keyboard.down('Control');await d.keyboard.press('k');await d.keyboard.up('Control');await sl(300);u=await d.evaluate(()=>!document.getElementById('sol1-painel').hidden);ok('Ctrl+K abre o painel',u);await d.screenshot({path:OUT+'/pc-3-painel.png'});
 ok('computador sem erros no console',!d.erros.length,d.erros.join(' | '));
 /* 4) offline (service worker) */
 await d.goto(BASE,{waitUntil:'networkidle2'});await d.evaluate(()=>navigator.serviceWorker&&navigator.serviceWorker.ready);await sl(2500);
 await d.goto(BASE+'conteudo/tabela-genesis-a-prova.html',{waitUntil:'networkidle2'});await sl(800);
 await d.setOfflineMode(true);let off=null;try{await d.goto(BASE,{waitUntil:'load',timeout:20000});await sl(1500);await d.waitForFunction('window.SOL1&&SOL1.pronto()',{timeout:20000});off=await d.evaluate(()=>({sol:!!document.getElementById('sol'),r:SOL1.responde('O que é o Radar Águia Solar?')}))}catch(e){off={erro:e.message}}
 ok('offline: app abre (não a página da tabela) e responde',off&&off.sol&&off.r&&off.r.tipo==='app',JSON.stringify(off));await d.setOfflineMode(false);await d.close();
 /* 5) anti-moldura: outra origem embutindo o app */
 const f=await b.newPage();await f.setContent('<iframe id="x" src="'+BASE+'" width="400" height="600"></iframe>');await sl(3500);
 const fr=f.frames().find(x=>x.url().startsWith(BASE));const mol=fr?await fr.evaluate(()=>document.documentElement.getAttribute('data-moldura')):'sem frame';ok('anti-moldura em site estranho',mol==='bloqueada',mol);await f.close();
 await b.close();
 const nok=R.filter(r=>!r.ok);fs.writeFileSync(OUT+'/resultado.json',JSON.stringify({quando:new Date().toISOString(),perguntas:ac+'/'+tot,total:R.length,falhas:nok.length,itens:R},null,1));
 console.log('\nRESUMO',R.length-nok.length,'/',R.length,'ok · perguntas',ac+'/'+tot);process.exit(nok.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
