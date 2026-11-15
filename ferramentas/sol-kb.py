#!/usr/bin/env python3
"""Gera a base do Sol 2.0 (sol/kb-pt.json, kb-en.json, kb-es.json) a partir das lições do app (conteudo/**/grupos)
+ respostas fixas sobre o próprio app (INTENCOES). Rode depois de mudar qualquer lição: python3 ferramentas/sol-kb.py"""
import json,os,glob,hashlib
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(R)
def hs(t): return hashlib.sha1(t.encode('utf-8')).hexdigest()[:12]
AG=json.load(open('conteudo/audio-aguia.json'))['mapa']
# Respostas fixas sobre o app (escritas a partir do que o app realmente tem)
INT={
'pt':[
 ('quem-sou',['quem e voce','quem es tu','o que e voce','voce e uma ia','qual seu nome','quem e o sol','o que e o sol'],
  'Eu sou o Sol, o núcleo do Conhecimento Solar. Respondo com as lições do próprio app, direto no seu aparelho, sem internet e sem servidor. Sigo a regra da verdade calculada: o que é comprovado eu afirmo, o que é crença eu atribuo a quem acredita, e o que ninguém sabe eu admito.'),
 ('app',['o que e o conhecimento solar','o que e esse app','sobre o que e esse app','para que serve esse app','o que tem no app','o que e o portal'],
  'O Conhecimento Solar é um portal de mistérios, história e sabedoria, com trezentas e setenta e quatro lições em vinte e um temas: despertar da Matrix, física quântica, princípios herméticos, a Bíblia lida por inteiro, mitos derrubados e, agora, Marguerite Porete e o memorial das vítimas da Inquisição. Cada lição tem três níveis de profundidade, fontes e um selo de verdade.'),
 ('novo',['o que tem de novo','novidades','o que mudou','atualizacao','o que ha de novo'],
  'Novidades: eu, o Sol 2.0, com respostas offline, voz gravada com legenda palavra por palavra, memória da conversa e a Constelação do Conhecimento, onde cada lição que você explora vira uma estrela acesa. E o memorial de Marguerite Porete, com áudio, o livro original para baixar e uma vela para acender.'),
 ('offline',['funciona sem internet','sem internet','offline','precisa de internet'],
  'Funciono sem internet. Depois da primeira visita, a minha base de lições fica guardada no aparelho. As vozes gravadas que você já ouviu também ficam. Para guardar tudo de uma vez, use o botão Usar offline no app.'),
 ('selos',['selos','selo','selo comprovado','selo de verdade','o que significa comprovado','verdade calculada','o que e hipotese','niveis de verdade'],
  'Os selos mostram o grau de certeza de cada lição. Comprovado é fato documentado. Tradição é o que uma tradição diz, atribuído a ela. Hipótese é debatida, ainda sem prova. Desconhecido é o que ninguém sabe. Mito é crença popular comprovadamente falsa.'),
 ('ajuda',['ajuda','como funciona','o que posso perguntar','como uso','comandos','me ajuda'],
  'Pergunte qualquer coisa sobre os temas do app, por exemplo: quem foi Hermes Trismegisto, o que é o efeito observador, ou quem foi Marguerite Porete. Depois diga mais, para aprofundar, ou contemplar, para a reflexão. Diga fontes para ver de onde veio. Abra a Constelação para ver as estrelas que você já acendeu.'),
 ('temas',['temas','quais sao os temas','lista de temas','assuntos','categorias'],
  'São vinte e um temas. Toque em um deles abaixo, ou abra a Constelação do Conhecimento para ver todos de uma vez, como estrelas.'),
 ('criador',['quem criou o app','quem criou o conhecimento solar','quem fez o app','criador do app','autor do app'],
  'O Conhecimento Solar é um projeto independente do Mestre Solar, da mesma família do Águia Primordial English, do Homem Cinza e do Solara GPS Miami Beach. Você encontra todos na aba Rede de App.'),
 ('marguerite-pagina',['memorial de marguerite','memorial marguerite','abrir memorial','pagina da marguerite','aba marguerite'],
  'O memorial de Marguerite Porete tem a história dela em oito partes, com narração em português e inglês e legenda sincronizada, as palavras dela tiradas do manuscrito, um memorial das vítimas da Inquisição com números e fontes, uma vela para acender e o livro original para baixar. Toque em abrir o memorial.'),
 ('ola',['oi','ola','bom dia','boa tarde','boa noite','e ai','salve'],
  'Olá. Sistemas solares ativos e base carregada. Sobre o que você quer saber hoje?'),
 ('obrigado',['obrigado','obrigada','valeu','gratidao'],
  'Eu é que agradeço. Cada pergunta acende uma estrela. Quer continuar?'),
],
'en':[
 ('quem-sou',['who are you','what are you','are you an ai','your name','who is the sun','what is the sun'],
  'I am the Sun, the core of Conhecimento Solar. I answer with the app\'s own lessons, right on your device, with no internet and no server. I follow the rule of calculated truth: what is proven I state, what is belief I attribute to those who hold it, and what nobody knows I admit.'),
 ('app',['what is conhecimento solar','what is this app','what is this app about','what is the portal','what does the app have'],
  'Conhecimento Solar is a portal of mysteries, history and wisdom, with three hundred and seventy-four lessons in twenty-one themes: awakening from the Matrix, quantum physics, Hermetic principles, the Bible read in full, debunked myths and now Marguerite Porete and the memorial to the victims of the Inquisition. Every lesson has three levels of depth, sources and a truth seal.'),
 ('novo',['what is new','news','what changed','update'],
  'What is new: me, Sun 2.0, with offline answers, recorded voice with word-by-word captions, conversation memory and the Constellation of Knowledge, where every lesson you explore becomes a lit star. And the Marguerite Porete memorial, with audio, the original book to download and a candle to light.'),
 ('offline',['work offline','without internet','offline','need internet'],
  'I work without internet. After the first visit, my lesson base is stored on your device. Recorded voices you have already heard stay too. To store everything at once, use the Offline button in the app.'),
 ('selos',['seals','seal','proven seal','truth seal','what does proven mean','calculated truth','what is hypothesis','truth levels'],
  'The seals show how certain each lesson is. Proven is documented fact. Tradition is what a tradition says, attributed to it. Hypothesis is debated, not yet proven. Unknown is what nobody knows. Myth is a popular belief proven false.'),
 ('ajuda',['help','how does it work','what can i ask','how do i use','commands'],
  'Ask anything about the app\'s themes, for example: who was Hermes Trismegistus, what is the observer effect, or who was Marguerite Porete. Then say more, to go deeper, or contemplate, for the reflection. Say sources to see where it came from. Open the Constellation to see the stars you have lit.'),
 ('temas',['themes','topics','list of topics','subjects','categories'],
  'There are twenty-one themes. Tap one below, or open the Constellation of Knowledge to see them all at once, as stars.'),
 ('criador',['who made the app','who created the app','who created conhecimento solar','creator of the app','author of the app'],
  'Conhecimento Solar is an independent project by Mestre Solar, from the same family as Águia Primordial English, Homem Cinza and Solara GPS Miami Beach. You will find them all in the App Network tab.'),
 ('marguerite-pagina',['marguerite memorial','open memorial','marguerite page','marguerite tab'],
  'The Marguerite Porete memorial tells her story in eight parts, with narration in Portuguese and English and synced captions, her own words from the manuscript, a memorial to the victims of the Inquisition with numbers and sources, a candle to light and the original book to download. Tap open the memorial.'),
 ('ola',['hi','hello','good morning','good afternoon','good evening','hey'],
  'Hello. Solar systems active and base loaded. What would you like to know today?'),
 ('obrigado',['thank you','thanks','gratitude'],
  'Thank you. Every question lights a star. Shall we continue?'),
],
'es':[
 ('quem-sou',['quien eres','que eres','eres una ia','tu nombre','quien es el sol','que es el sol'],
  'Soy el Sol, el núcleo de Conhecimento Solar. Respondo con las lecciones de la propia app, directamente en tu dispositivo, sin internet y sin servidor. Sigo la regla de la verdad calculada: lo comprobado lo afirmo, lo que es creencia lo atribuyo a quien cree, y lo que nadie sabe lo admito.'),
 ('app',['que es conhecimento solar','que es esta app','de que trata esta app','que es el portal','que tiene la app'],
  'Conhecimento Solar es un portal de misterios, historia y sabiduría, con trescientas setenta y cuatro lecciones en veintiún temas: despertar de la Matrix, física cuántica, principios herméticos, la Biblia leída entera, mitos derribados y ahora Marguerite Porete y el memorial de las víctimas de la Inquisición. Cada lección tiene tres niveles de profundidad, fuentes y un sello de verdad.'),
 ('novo',['que hay de nuevo','novedades','que cambio','actualizacion'],
  'Novedades: yo, el Sol 2.0, con respuestas sin internet, voz grabada con subtítulos palabra por palabra, memoria de la conversación y la Constelación del Conocimiento, donde cada lección que exploras se vuelve una estrella encendida. Y el memorial de Marguerite Porete, con audio, el libro original para descargar y una vela para encender.'),
 ('offline',['funciona sin internet','sin internet','offline','necesita internet'],
  'Funciono sin internet. Después de la primera visita, mi base de lecciones queda guardada en el dispositivo. Las voces grabadas que ya escuchaste también. Para guardar todo de una vez, usa el botón Offline de la app.'),
 ('selos',['sellos','sello','sello comprobado','sello de verdad','que significa comprobado','verdad calculada','que es hipotesis','niveles de verdad'],
  'Los sellos muestran el grado de certeza de cada lección. Comprobado es un hecho documentado. Tradición es lo que dice una tradición, atribuido a ella. Hipótesis está en debate, aún sin prueba. Desconocido es lo que nadie sabe. Mito es una creencia popular comprobadamente falsa.'),
 ('ajuda',['ayuda','como funciona','que puedo preguntar','como lo uso','comandos'],
  'Pregunta lo que quieras sobre los temas de la app, por ejemplo: quién fue Hermes Trismegisto, qué es el efecto observador o quién fue Marguerite Porete. Luego di más, para profundizar, o contemplar, para la reflexión. Di fuentes para ver de dónde vino. Abre la Constelación para ver las estrellas que ya encendiste.'),
 ('temas',['temas','cuales son los temas','lista de temas','asuntos','categorias'],
  'Son veintiún temas. Toca uno abajo, o abre la Constelación del Conocimiento para verlos todos a la vez, como estrellas.'),
 ('criador',['quien creo la app','quien hizo la app','creador de la app','autor de la app'],
  'Conhecimento Solar es un proyecto independiente de Mestre Solar, de la misma familia que Águia Primordial English, Homem Cinza y Solara GPS Miami Beach. Los encuentras todos en la pestaña Red de Apps.'),
 ('marguerite-pagina',['memorial de marguerite','abrir memorial','pagina de marguerite','pestana marguerite'],
  'El memorial de Marguerite Porete cuenta su historia en ocho partes, con narración en portugués e inglés y subtítulos sincronizados, sus propias palabras del manuscrito, un memorial de las víctimas de la Inquisición con cifras y fuentes, una vela para encender y el libro original para descargar. Toca abrir el memorial.'),
 ('ola',['hola','buenos dias','buenas tardes','buenas noches','que tal'],
  'Hola. Sistemas solares activos y base cargada. ¿Qué quieres saber hoy?'),
 ('obrigado',['gracias','muchas gracias','gratitud'],
  'Gracias a ti. Cada pregunta enciende una estrella. ¿Seguimos?'),
]}
for lg in ('pt','en','es'):
    pre='' if lg=='pt' else lg+'/'
    ix=json.load(open('conteudo/'+pre+'indice.json'))
    G=[g['nome'] for g in ix['grupos']];GA=[g['arquivo'] for g in ix['grupos']]
    L=[]
    for gi,arq in enumerate(GA):
        for k,t in enumerate(json.load(open('conteudo/'+pre+'grupos/'+arq))):
            e={'i':t.get('id') or (arq[:-5]+'-'+str(k)),'g':gi,'t':t['tema'],'p':t.get('palavras',[]),'r':t['resposta'],'a':t.get('aprofundar',''),'c':t.get('camada3',''),'f':t.get('fontes',[]),'n':t.get('nivelVerdade',[])}
            if t.get('seguir'):e['s']=t['seguir']
            if t.get('parte'):e['pa']=t['parte']
            if t.get('imagem'):e['im']='../conteudo/'+t['imagem']
            if lg=='pt':
                for fld,key in (('r','ar'),('a','aa'),('c','ac')):
                    if e[fld] in AG: e[key]=AG[e[fld]]
            e['h']=hs(e['r'])
            L.append(e)
    I=[{'i':'x-'+a,'p':p,'r':r,'h':hs(r)} for a,p,r in INT[lg]]
    out={'v':ix.get('versao',''),'lang':lg,'grupos':G,'licoes':L,'intencoes':I}
    json.dump(out,open('sol/kb-'+lg+'.json','w'),ensure_ascii=False,separators=(',',':'))
    print(lg,len(L),'lições',len(I),'intenções',os.path.getsize('sol/kb-'+lg+'.json')//1024,'KB')
