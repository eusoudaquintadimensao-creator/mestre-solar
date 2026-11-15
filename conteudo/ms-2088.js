/* Conhecimento Solar · 2.0: abas Sol 2.0 e Marguerite Porete, atalho junto do Sol, comandos de voz/texto para abrir as páginas novas e as abas Radar Águia e Águia English. */
!function(){"use strict";
var D=document;function lg(){var l=(window.MSI&&MSI.lang)||"";if(!l)try{l=localStorage.getItem("ms-lang")||""}catch(e){}return l==="en"||l==="es"?l:"pt"}
var T={pt:{sol:"Sol 2.0",solS:"IA offline",marg:"Marguerite",margA:"Marguerite Porete: memorial",atalho:"SOL 2.0 · IA OFFLINE",solA:"Abrir o Sol 2.0, a IA offline do Conhecimento Solar"},
en:{sol:"Sun 2.0",solS:"offline AI",marg:"Marguerite",margA:"Marguerite Porete: memorial",atalho:"SUN 2.0 · OFFLINE AI",solA:"Open Sun 2.0, the offline AI of Conhecimento Solar"},
es:{sol:"Sol 2.0",solS:"IA offline",marg:"Marguerite",margA:"Marguerite Porete: memorial",atalho:"SOL 2.0 · IA OFFLINE",solA:"Abrir el Sol 2.0, la IA offline de Conhecimento Solar"}};
function poe(){var t=T[lg()],nav=D.querySelector("nav.abas");if(!nav||D.getElementById("ms2-aba-sol"))return;
  var ceu=D.getElementById("ceu");if(ceu&&!D.querySelector(".ms2-universo")){var u=D.createElement("div");u.className="ms2-universo";u.setAttribute("aria-hidden","true");ceu.parentNode.insertBefore(u,ceu.nextSibling)}
  var a=D.createElement("a");a.id="ms2-aba-sol";a.className="aba ms2-aba-sol";a.href="./sol/";a.setAttribute("aria-label",t.solA);a.innerHTML='<b aria-hidden="true">☀</b><span>'+t.sol+'<small>'+t.solS+'</small></span>';a.style.textDecoration="none";
  nav.insertBefore(a,nav.firstChild);try{nav.scrollLeft=0}catch(e){}
  var m=D.createElement("a");m.id="ms2-aba-marg";m.className="aba ms2-aba-marg";m.href="./marguerite/";m.setAttribute("aria-label",t.margA);m.innerHTML='<b aria-hidden="true">🕯️</b>'+t.marg;m.style.textDecoration="none";
  var rede=nav.querySelector(".aba-rede");nav.insertBefore(m,rede?rede.nextSibling:nav.children[1]);
  var palco=D.querySelector(".palco");if(palco&&!D.getElementById("ms2-sol2")){var s=D.createElement("a");s.id="ms2-sol2";s.className="ms2-sol2";s.href="./sol/";s.setAttribute("aria-label",t.solA);s.innerHTML='<i aria-hidden="true"></i><b>'+t.atalho+'</b>';palco.appendChild(s)}}
/* "abrir o memorial", "memorial da Marguerite", "Sol 2.0" digitados ou falados abrem as páginas novas */
var RX_M=/(abr\w* .*memorial|memorial (de |da |do )?marguerite|aba (da )?marguerite|open .*memorial|marguerite memorial|abrir el memorial)/i,RX_S=/^(abr\w* (o )?)?(sol 2(\.0)?|ia offline|open sun 2(\.0)?|abrir el sol 2(\.0)?)\s*$/i,RX_R=/^(abr\w* (o |el |la )?)?(radar aguia( solar)?|radar da aguia|aba (do |de o )?radar)\s*$/i,RX_E=/^(abr\w* (o |a |el |la )?)?(ingles|aguia english|aguia primordial english|aba (do |da |de )?(ingles|aguia english|aguia primordial english))\s*$/i;
function nz(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim()}
D.addEventListener("submit",function(ev){var f=ev.target;if(!f||f.id!=="form")return;var i=D.getElementById("texto"),v=nz(i&&i.value);if(!v)return;
  if(RX_M.test(v)){ev.preventDefault();ev.stopImmediatePropagation();i.value="";location.href="./marguerite/"}
  else if(RX_S.test(v)){ev.preventDefault();ev.stopImmediatePropagation();i.value="";location.href="./sol/"}
  else if(RX_R.test(v)){ev.preventDefault();ev.stopImmediatePropagation();i.value="";var b=D.querySelector(".aba-radar");if(b)b.click()}
  else if(RX_E.test(v)){ev.preventDefault();ev.stopImmediatePropagation();i.value="";var e=D.querySelector(".aba-eng");if(e)e.click()}},true);
if(D.readyState==="loading")D.addEventListener("DOMContentLoaded",poe);else poe();
}();
