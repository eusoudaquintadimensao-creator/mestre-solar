const puppeteer=require('puppeteer-core');const fs=require('fs');
const BASE=process.env.BASE||'http://127.0.0.1:8811/';const OUT=process.env.OUT||'/workspace/ms-teste/sol';fs.mkdirSync(OUT,{recursive:true});
const sl=ms=>new Promise(r=>setTimeout(r,ms));
const Q={pt:[
['Quem foi Marguerite Porete?',/mp-quem/],['Quem foi a mulher que sorriu na fogueira?',/mp-fogueira/],['Onde baixo o livro da Marguerite Porete?',/mp-baixar/],['Quantas pessoas a Inquisição matou?',/mp-memorial/],
['O que é o Espelho das Almas Simples?',/mp-livro/],['Quem foi o inquisidor da Marguerite?',/mp-processo/],['Quem descobriu que o livro era dela?',/mp-depois/],['Se Marguerite pudesse falar, o que diria?',/mp-voz/],
['Quem foi Hermes Trismegisto?',/Hermes/],['O que é o efeito observador?',/observador|Observador|dupla fenda/i],['O que é a Matrix?',/Matrix/],['Adão e Eva existiram?',/Adão|Eva/],
['Quem criou o Deus da Bíblia?',/Deus|Javé|Yahweh|El/],['O que é o princípio do mentalismo?',/Mental/],['O que é sonho lúcido?',/lúcido|Sonho/i],['Quem foi Pitágoras?',/Pitágoras/],
['Quem é você?',/x-quem-sou/],['O que é o Radar Águia Solar?',/x-radar-aguia/],['O que tem de novo?',/x-novo/],['Funciona sem internet?',/x-offline/],['O que significa o selo comprovado?',/x-selos/],
['Qual a capital da França?',/naosei/],['Quem ganhou a copa de 2022?',/naosei/],['Me passa uma receita de bolo',/naosei/],['oi, quem foi Hermes?',/Hermes/],['O que é a caixa de Pandora?',/Pandora/]],
en:[['Who was Marguerite Porete?',/mp-quem/],['How many people did the Inquisition kill?',/mp-memorial/],['Where can I download the book?',/mp-baixar/],['Who was Hermes Trismegistus?',/Hermes/],['Who are you?',/x-quem-sou/],['What is Radar Águia Solar?',/x-radar-aguia/],['What is the capital of France?',/naosei/]],
es:[['¿Quién fue Marguerite Porete?',/mp-quem/],['¿Cuántas personas mató la Inquisición?',/mp-memorial/],['¿Quién fue Hermes Trismegisto?',/Hermes/],['¿Quién eres?',/x-quem-sou/],['¿Qué es el Radar Águia Solar?',/x-radar-aguia/],['¿Cuál es la capital de Francia?',/naosei/]]};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const erros=[];p.on('pageerror',e=>erros.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')erros.push('CE '+m.text().slice(0,160))});p.on('response',r=>{if(r.status()>=400)erros.push(r.status()+' '+r.url())});
await p.goto(BASE+'sol/?l=pt',{waitUntil:'networkidle0'});await p.waitForFunction('window.__SOL&&__SOL.pronto()',{timeout:20000});
const res=[];
for(const lg of ['pt','en','es']){await p.evaluate(l=>__SOL.trocaIdioma(l),lg);await p.waitForFunction(l=>__SOL.pronto()&&__SOL.lang()===l,{timeout:15000},lg);
 for(const [q,re] of Q[lg]){const r=await p.evaluate(q=>__SOL.responde(q),q);const ok=re.test((r.id||'')+' '+(r.t||'')+' '+r.x);res.push({lg,q,ok,id:r.id,t:r.t,s:r.s,alt:r.alt})}}
const ac=res.filter(r=>r.ok).length;console.log('ACERTOS',ac,'/',res.length);res.filter(r=>!r.ok).forEach(r=>console.log('FALHA',JSON.stringify(r)));
await p.evaluate(()=>__SOL.trocaIdioma('pt'));await p.waitForFunction(()=>__SOL.pronto()&&__SOL.lang()==='pt');
await p.screenshot({path:OUT+'/cel-1-inicio.png'});
// conversa real com voz
await p.click('#hud');await sl(2500);await p.screenshot({path:OUT+'/cel-2-saudacao.png'});
await p.type('#q','Quem foi Marguerite Porete?');await p.keyboard.press('Enter');await sl(6000);
const e1=await p.evaluate(()=>__SOL.estado());console.log('estado',JSON.stringify(e1));
await p.screenshot({path:OUT+'/cel-3-marguerite.png'});
await p.type('#q','fale mais');await p.keyboard.press('Enter');await sl(3000);const e2=await p.evaluate(()=>__SOL.estado());console.log('mais',JSON.stringify(e2));
await p.type('#q','qual a fonte?');await p.keyboard.press('Enter');await sl(1500);await p.screenshot({path:OUT+'/cel-4-fontes.png'});
await p.type('#q','e ela foi queimada?');await p.keyboard.press('Enter');await sl(2000);const e3=await p.evaluate(()=>__SOL.estado());console.log('pron',JSON.stringify(e3));
await p.type('#q','me chamo Ana');await p.keyboard.press('Enter');await sl(800);const nm=await p.evaluate(()=>localStorage.getItem('ms-sol-nome-v1'));console.log('nome',nm);
await p.click('#b-const');await sl(800);await p.screenshot({path:OUT+'/cel-5-constelacao.png'});await p.click('#const-x');
// desktop
await p.setViewport({width:1440,height:900});await p.goto(BASE+'sol/?q=O%20que%20%C3%A9%20o%20efeito%20observador%3F',{waitUntil:'networkidle0'});await sl(4000);await p.screenshot({path:OUT+'/pc-1-resposta.png'});
// offline
await p.setOfflineMode(true);let off;try{await p.reload({waitUntil:'load',timeout:20000});await p.waitForFunction('window.__SOL&&__SOL.pronto()',{timeout:20000});off=await p.evaluate(()=>__SOL.responde('Quem foi Marguerite Porete?').id)}catch(e){off='ERRO '+e.message}
console.log('offline',off);await p.setOfflineMode(false);
console.log('erros',JSON.stringify(erros));await b.close()})();
