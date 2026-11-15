(function(){
'use strict';
var D=document,B=D.body,LS=window.localStorage,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||D).querySelector(s)}function $$(s,r){return [].slice.call((r||D).querySelectorAll(s))}
function ls(k,v){try{if(v===undefined)return LS.getItem(k);LS.setItem(k,v)}catch(e){return null}}
/* ---------- idioma ---------- */
var q=new URLSearchParams(location.search),L=q.get('lang')||ls('mp-lang')||(/^en/.test(ls('ms-lang')||'')?'en':0)||((navigator.language||'pt').slice(0,2)==='en'?'en':'pt');
function setL(l){L=l==='en'?'en':'pt';B.classList.toggle('l-en',L==='en');B.classList.toggle('l-pt',L==='pt');D.documentElement.lang=L==='en'?'en':'pt-BR';
  $$('.idioma button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===L)});ls('mp-lang',L);parar();atualizaVelas()}
$$('.idioma button').forEach(function(b){b.onclick=function(){setL(b.dataset.l)}});
/* ---------- palavras ---------- */
$$('.falado').forEach(function(p){var ws=p.textContent.split(/\s+/).filter(Boolean);p.innerHTML=ws.map(function(w,i){return '<span class="w" data-i="'+i+'">'+w.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</span>'}).join(' ')});
/* ---------- áudio ---------- */
var ORDEM=['quem','livro','processo','fogueira','depois','monologo','memorial','reflexao'];
var au=new Audio();au.preload='none';var atual=null,seq=false,tempos=null,raf=0,ultimo=-1,sintese=false;
var player=$('#player'),pbt=$('#p-bt'),ptit=$('#p-tit'),pprog=$('#p-prog');
function bloco(id){return $('.narra[data-id="'+id+'"]')}
function titulo(id){var b=bloco(id),s=b&&b.closest('section'),h=s&&s.querySelector('h2 .'+L);return h?h.textContent:id}
function texto(id){return $('.falado.'+L,bloco(id))}
function marca(i){var p=texto(atual);if(!p||i===ultimo)return;var ws=p.children;
  for(var k=0;k<ws.length;k++){ws[k].classList.toggle('dito',k<=i);ws[k].classList.toggle('agora',k===i)}
  ultimo=i;var w=ws[i];if(w){var r=w.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight-110)w.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'})}}
function limpa(){$$('.narra.ativa').forEach(function(n){n.classList.remove('ativa')});$$('.w.dito,.w.agora').forEach(function(w){w.classList.remove('dito','agora')});$$('.tocando').forEach(function(b){b.classList.remove('tocando')})}
function laco(){if(!tempos||au.paused)return;var t=au.currentTime+.06,a=tempos.t,i=0;while(i+1<a.length&&a[i+1]<=t)i++;if(t>=a[0])marca(i);pprog.style.width=(100*au.currentTime/(au.duration||tempos.d||1))+'%';raf=requestAnimationFrame(laco)}
function estado(on){pbt.classList.toggle('tocando',on);$('#b-tudo').classList.toggle('tocando',on&&seq);var b=atual&&$('.b-ouvir[data-id="'+atual+'"]');$$('.b-ouvir').forEach(function(x){x.classList.toggle('tocando',on&&x===b)});pbt.setAttribute('aria-label',on?'Pausar':'Continuar')}
function tocar(id,emSeq){parar(true);seq=!!emSeq;atual=id;ultimo=-1;limpa();var n=bloco(id);n.classList.add('ativa');player.hidden=false;ptit.textContent=titulo(id);pprog.style.width='0';
  var base='voz/'+L+'/'+id;tempos=null;sintese=false;
  fetch(base+'.json').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){tempos=j}).catch(function(){}).then(function(){
    if(atual!==id)return;au.src=base+'.mp3';au.play().then(function(){estado(true);laco()}).catch(function(){falarSintese(id)})})}
function falarSintese(id){if(!('speechSynthesis' in window))return;sintese=true;var p=texto(id),ws=[].map.call(p.children,function(w){return w.textContent}),pos=[],c=0;
  ws.forEach(function(w){pos.push(c);c+=w.length+1});var u=new SpeechSynthesisUtterance(ws.join(' '));u.lang=L==='en'?'en-US':'pt-BR';u.rate=.95;
  var vs=speechSynthesis.getVoices().filter(function(v){return v.lang.replace('_','-').toLowerCase().indexOf(u.lang.toLowerCase())===0});var f=vs.filter(function(v){return /female|mulher|luciana|francisca|samantha|aria|jenny|google/i.test(v.name)})[0]||vs[0];if(f)u.voice=f;
  u.onboundary=function(e){var i=0;while(i+1<pos.length&&pos[i+1]<=e.charIndex)i++;marca(i)};u.onend=fim;speechSynthesis.cancel();speechSynthesis.speak(u);estado(true)}
function fim(){var id=atual;estado(false);if(tempos)marca(tempos.t.length-1);if(seq){var k=ORDEM.indexOf(id);if(k>=0&&k<ORDEM.length-1){setTimeout(function(){if(seq&&atual===id)tocar(ORDEM[k+1],true)},700);return}}seq=false;$('#b-tudo').classList.remove('tocando')}
function parar(manter){cancelAnimationFrame(raf);try{au.pause()}catch(e){}if('speechSynthesis' in window)speechSynthesis.cancel();if(!manter){seq=false;atual=null;limpa();player.hidden=true}estado(false)}
au.addEventListener('ended',fim);au.addEventListener('error',function(){if(atual&&!sintese)falarSintese(atual)});
au.addEventListener('play',function(){estado(true);laco()});au.addEventListener('pause',function(){estado(false)});
$$('.b-ouvir').forEach(function(b){b.onclick=function(){if(atual===b.dataset.id&&!au.paused){au.pause();return}if(atual===b.dataset.id&&au.src&&au.currentTime>0&&!sintese){au.play();return}tocar(b.dataset.id,false)}});
$('#b-tudo').onclick=function(){if(seq&&atual){if(au.paused)au.play();else au.pause();return}tocar(ORDEM[0],true)};
pbt.onclick=function(){if(sintese){if(speechSynthesis.paused){speechSynthesis.resume();estado(true)}else{speechSynthesis.pause();estado(false)}return}if(au.paused)au.play();else au.pause()};
$('#p-x').onclick=function(){parar()};
// duração nos botões (lazy: só o json pequeno, quando a seção aparece)
function dur(id){var b=$('.b-ouvir[data-id="'+id+'"] .tempo');fetch('voz/'+L+'/'+id+'.json').then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&b){var s=Math.round(j.d);b.textContent=Math.floor(s/60)+':'+('0'+s%60).slice(-2)}}).catch(function(){})}
/* ---------- revelação, nav, parallax ---------- */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vista');io.unobserve(e.target);var b=e.target.querySelector&&e.target.querySelector('.b-ouvir');if(b)dur(b.dataset.id)}})},{rootMargin:'0px 0px -8% 0px'});
$$('.revela').forEach(function(el){io.observe(el)});
var nav=$$('.mini a'),secs=nav.map(function(a){return $(a.getAttribute('href'))});
var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var k=secs.indexOf(e.target);nav.forEach(function(a,j){a.classList.toggle('on',j===k)})}})},{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(function(s){if(s)io2.observe(s)});
var himg=$('.heroi-img'),vbg=$('.vigilia-bg'),vig=$('.vigilia'),tk=false;
function px(){tk=false;var y=scrollY;if(y<innerHeight*1.2)himg.style.transform='translate3d(0,'+(y*.35)+'px,0)';var r=vig.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)vbg.style.transform='translate3d(0,'+((r.top-innerHeight/2)*-.12)+'px,0)'}
if(!RM)addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(px)}},{passive:true});
/* ---------- brasas (canvas leve) ---------- */
var cv=$('#brasas'),cx=cv.getContext('2d'),P=[],W,H,DPR=Math.min(devicePixelRatio||1,1.5),vivo=true;
function tam(){W=cv.width=innerWidth*DPR;H=cv.height=innerHeight*DPR}tam();addEventListener('resize',tam);
var N=RM?0:(innerWidth<700?34:70);
function nova(p,ini){p=p||{};p.x=Math.random()*W;p.y=ini?Math.random()*H:H+20*DPR;p.r=(Math.random()*1.8+.6)*DPR;p.v=(Math.random()*.35+.15)*DPR;p.o=Math.random()*Math.PI*2;p.c=Math.random()<.14;p.a=Math.random()*.5+.35;return p}
for(var i=0;i<N;i++)P.push(nova(null,true));
function anima(t){if(!vivo)return;cx.clearRect(0,0,W,H);for(var i=0;i<P.length;i++){var p=P[i];p.y-=p.v;p.x+=Math.sin(t/1800+p.o)*.25*DPR;var al=p.a*Math.min(1,p.y/(H*.25));if(p.y<-10)nova(p);
  cx.beginPath();cx.fillStyle=p.c?'rgba(41,240,255,'+al*.8+')':'rgba(255,'+(140+(p.o*12|0)%70)+',60,'+al+')';cx.shadowBlur=8*DPR;cx.shadowColor=p.c?'#29f0ff':'#ff8a3d';cx.arc(p.x,p.y,p.r,0,7);cx.fill()}requestAnimationFrame(anima)}
if(N)requestAnimationFrame(anima);
D.addEventListener('visibilitychange',function(){vivo=!D.hidden;if(vivo&&N)requestAnimationFrame(anima)});
/* ---------- velas ---------- */
var FR={pt:['Por Marguerite, que pensou livre.','Por todas as mulheres chamadas de bruxas.','Pelos livros queimados e pelos que ainda serão escritos.','Por quem foi calado por perguntar.','Pela liberdade de consciência, de todos.','Pelos que morreram sem que ninguém soubesse o nome.'],
 en:['For Marguerite, who thought freely.','For every woman called a witch.','For the burned books, and the ones still to be written.','For those silenced for asking.','For freedom of conscience, for everyone.','For those who died with no one knowing their name.']};
function nv(){return +(ls('mp-velas')||0)}
function atualizaVelas(){var n=nv();$('#n-velas').textContent=n.toLocaleString(L==='en'?'en':'pt-BR');$$('.contador .pt')[0].textContent=n===1?'vela acesa por você':'velas acesas por você';$$('.contador .en')[0].textContent=n===1?'candle lit by you':'candles lit by you';$('#vela-obj').classList.toggle('acesa',n>0)}
$('#b-vela').onclick=function(){var n=nv()+1;ls('mp-velas',n);ls('mp-vela-ultima',new Date().toISOString());var v=$('#vela-obj');v.classList.remove('acesa');void v.offsetWidth;v.classList.add('acesa');atualizaVelas();var f=FR[L];$('#frase-vela').textContent=f[(n-1)%f.length];
  for(var i=0;i<14&&!RM;i++){var p=nova({},false);var r=v.getBoundingClientRect();p.x=(r.left+r.width/2+(Math.random()-.5)*40)*DPR;p.y=(r.top+20)*DPR;p.v*=3;p.a=1;P.push(p)}if(P.length>N+80)P.splice(N,P.length-N-80)};
$('#b-guardar').onclick=function(){var b=this,ls2=[];ORDEM.forEach(function(id){ls2.push('voz/'+L+'/'+id+'.mp3','voz/'+L+'/'+id+'.json')});ls2.push('livro/le-mirouer-des-simples-ames-chantilly-wikisource.epub');var n=0;
  b.textContent=(L==='en'?'Saving… ':'Guardando… ')+'0/'+ls2.length;
  Promise.all(ls2.map(function(u){return fetch(u).then(function(r){if(r.ok&&'caches' in window)return caches.keys().then(function(k){return caches.open('offline-ms').then(function(c){return c.put(new URL(u,location.href).href,r)})})}).catch(function(){}).then(function(){n++;b.textContent=(L==='en'?'Saving… ':'Guardando… ')+n+'/'+ls2.length})})).then(function(){b.textContent=L==='en'?'✓ Narration saved on this device':'✓ Narração guardada neste aparelho'})};
setL(L);
if('serviceWorker' in navigator)navigator.serviceWorker.register('../sw.js').catch(function(){});
window.MP={tocar:tocar,parar:parar,setL:setL,estado:function(){return {atual:atual,seq:seq,paused:au.paused,t:au.currentTime,ultimo:ultimo,tempos:!!tempos,sintese:sintese}}};
})();
