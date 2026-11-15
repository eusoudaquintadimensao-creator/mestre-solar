/* Compartilhar o Conhecimento Solar: toque = Web Share (ou folha); segurar ~600 ms = copiar o link. */
!function(){"use strict";
var URL_APP="https://eusoudaquintadimensao-creator.github.io/mestre-solar/";
var T={
  pt:{aria:"Compartilhar o Conhecimento Solar. Segure para copiar o link.",tit:"Conhecimento Solar",
    text:"Entre no Portal do Conhecimento. 374 lições, a IA do Sol 2.0 e a voz da Águia Primordial — mistérios, história e sabedoria, no seu aparelho, de graça.",
    toast:"Link copiado ☀",sheet:"Compartilhar o Portal",wa:"WhatsApp",tg:"Telegram",x:"X",fb:"Facebook",em:"E-mail",cp:"Copiar link",fecha:"Fechar"},
  en:{aria:"Share Conhecimento Solar. Hold to copy the link.",tit:"Conhecimento Solar",
    text:"Enter the Portal of Knowledge. 374 lessons, the Sun 2.0 AI and the voice of the Primordial Eagle — mysteries, history and wisdom, on your device, for free.",
    toast:"Link copied ☀",sheet:"Share the Portal",wa:"WhatsApp",tg:"Telegram",x:"X",fb:"Facebook",em:"Email",cp:"Copy link",fecha:"Close"},
  es:{aria:"Compartir Conhecimento Solar. Mantén pulsado para copiar el enlace.",tit:"Conhecimento Solar",
    text:"Entra en el Portal del Conocimiento. 374 lecciones, la IA del Sol 2.0 y la voz del Águila Primordial — misterios, historia y sabiduría, en tu dispositivo, gratis.",
    toast:"Enlace copiado ☀",sheet:"Compartir el Portal",wa:"WhatsApp",tg:"Telegram",x:"X",fb:"Facebook",em:"Correo",cp:"Copiar enlace",fecha:"Cerrar"}
};
function lg(){var l=(window.MSI&&MSI.lang)||"";if(!l)try{l=localStorage.getItem("ms-lang")||""}catch(e){}return T[l]?l:"pt"}
function tx(){return T[lg()]}
function payload(){var t=tx();return {title:t.tit,text:t.text,url:URL_APP,linha:t.tit+"\n\n"+t.text+"\n"+URL_APP}}

function toast(msg){var el=document.getElementById("ms-share-toast");if(!el){el=document.createElement("div");el.id="ms-share-toast";el.className="ms-share-toast";el.setAttribute("role","status");document.body.appendChild(el)}
  el.textContent=msg;el.classList.add("ok");clearTimeout(toast._t);toast._t=setTimeout(function(){el.classList.remove("ok")},2200)}

function copiar(texto,depois){
  var ok=function(){if(depois)depois(true)},no=function(){if(depois)depois(false)};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(texto).then(ok,function(){legado(texto,ok,no)});
  else legado(texto,ok,no);
}
function legado(texto,ok,no){try{var i=document.createElement("textarea");i.value=texto;i.setAttribute("readonly","");i.style.cssText="position:fixed;left:-9999px;top:0";document.body.appendChild(i);i.select();var r=document.execCommand("copy");document.body.removeChild(i);r?ok():no()}catch(e){no()}}

function fecharFolha(){var b=document.getElementById("ms-share-bg");if(b)b.hidden=true}
function abrirFolha(){
  var t=tx(),p=payload(),bg=document.getElementById("ms-share-bg");
  if(!bg){
    bg=document.createElement("div");bg.id="ms-share-bg";bg.className="ms-share-bg";bg.hidden=true;
    bg.innerHTML='<div class="ms-share-sheet" role="dialog" aria-modal="true" aria-labelledby="ms-share-tit"><h2><span id="ms-share-tit"></span><button type="button" id="ms-share-x" aria-label="">×</button></h2><div class="ms-share-grid" id="ms-share-grid"></div></div>';
    document.body.appendChild(bg);
    bg.addEventListener("click",function(e){if(e.target===bg)fecharFolha()});
    document.getElementById("ms-share-x").addEventListener("click",fecharFolha);
    document.addEventListener("keydown",function(e){if(e.key==="Escape")fecharFolha()});
  }
  document.getElementById("ms-share-tit").textContent=t.sheet;
  document.getElementById("ms-share-x").setAttribute("aria-label",t.fecha);
  var enc=function(s){return encodeURIComponent(s)};
  var itens=[
    {id:"wa",href:"https://wa.me/?text="+enc(p.linha),ic:"💬",label:t.wa},
    {id:"tg",href:"https://t.me/share/url?url="+enc(p.url)+"&text="+enc(p.title+"\n"+p.text),ic:"✈️",label:t.tg},
    {id:"x",href:"https://twitter.com/intent/tweet?text="+enc(p.title+" — "+p.text)+"&url="+enc(p.url),ic:"𝕏",label:t.x},
    {id:"fb",href:"https://www.facebook.com/sharer/sharer.php?u="+enc(p.url),ic:"f",label:t.fb},
    {id:"em",href:"mailto:?subject="+enc(p.title)+"&body="+enc(p.linha),ic:"✉️",label:t.em},
    {id:"cp",href:"",ic:"☀",label:t.cp,copy:true}
  ];
  var g=document.getElementById("ms-share-grid");g.innerHTML="";
  itens.forEach(function(it){
    var el;
    if(it.copy){el=document.createElement("button");el.type="button";el.addEventListener("click",function(){copiar(p.url,function(ok){if(ok){toast(t.toast);fecharFolha()}})});}
    else{el=document.createElement("a");el.href=it.href;el.target="_blank";el.rel="noopener noreferrer"}
    el.innerHTML='<span class="ms-share-ic" aria-hidden="true">'+it.ic+'</span><span>'+it.label+"</span>";
    g.appendChild(el);
  });
  bg.hidden=false;
}

function compartilhar(){
  var p=payload();
  if(navigator.share){
    navigator.share({title:p.title,text:p.text,url:p.url}).catch(function(e){if(e&&e.name!=="AbortError")abrirFolha()});
    return;
  }
  abrirFolha();
}

function ligar(btn){
  var t=tx();
  btn.setAttribute("aria-label",t.aria);
  btn.setAttribute("title",t.aria);
  var longo=false,timer=0;
  function limpa(){if(timer){clearTimeout(timer);timer=0}}
  btn.addEventListener("pointerdown",function(e){
    if(e.button!=null&&e.button!==0)return;
    longo=false;limpa();
    timer=setTimeout(function(){
      longo=true;timer=0;
      try{if(navigator.vibrate)navigator.vibrate(25)}catch(err){}
      copiar(payload().url,function(ok){if(ok)toast(tx().toast)});
    },600);
  });
  btn.addEventListener("pointerup",limpa);
  btn.addEventListener("pointercancel",limpa);
  btn.addEventListener("pointerleave",limpa);
  btn.addEventListener("click",function(e){
    if(longo){e.preventDefault();e.stopPropagation();longo=false;return}
    compartilhar();
  });
  btn.addEventListener("contextmenu",function(e){e.preventDefault()});
}

function inicia(){
  var b=document.getElementById("ms-share-sol");
  if(b)ligar(b);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",inicia);else inicia();
window.MSShare={abrir:compartilhar,copiar:function(){copiar(payload().url,function(ok){if(ok)toast(tx().toast)})}};
}();
