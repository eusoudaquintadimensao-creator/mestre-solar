#!/usr/bin/env python3
"""Gera a base unificada do Sol do app (o Sol da tela principal): conteudo/sol1/kb-{pt,en,es}.json.
Junta, só com conteúdo real:
  1. as 374 lições do app (sol/kb-*.json, gerado por ferramentas/sol-kb.py) — rode sol-kb.py antes;
  2. os apps que estão dentro do Conhecimento Solar: Rede de App Portal Solar (21 apps), Solara GPS: Miami Beach,
     MIAMI DRIVE SOLARA 2088, Homem Cinza (homemcinza.com), Radar Águia Solar, Águia Primordial English (ia/kb.json),
     podcast Sol Nascente (ep. 1–6), memorial Marguerite Porete, Sol 2.0 e o próprio app.
Fontes dos apps: ferramentas/fontes-sol1/*.txt (texto extraído dos sites publicados; atualize com --baixar)
e as pastas locais /workspace/... quando existirem (kb.json do English, pages.json do Homem Cinza, KIT-POSTAGEM do podcast).
Uso: python3 ferramentas/sol1-kb.py [--baixar]"""
import json,os,re,sys,html,hashlib,urllib.request
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(R)
F='ferramentas/fontes-sol1/'
WS='/workspace/'
def hs(t): return hashlib.sha1(t.encode('utf-8')).hexdigest()[:10]
def limpa(t):
    t=html.unescape(str(t or ''));t=re.sub(r'<[^>]+>',' ',t);t=re.sub(r'[\u0000-\u0008\u000b-\u001f]',' ',t)
    return re.sub(r'\s+',' ',t).strip()
SITES={'rede-de-app':'https://rede-de-app.conhecimento-solar.workers.dev/','solara-gps-miami-beach':'https://solara-gps-miami-beach.conhecimento-solar.workers.dev/',
 'miami-drive-solara-2088':'https://miami-drive-solara-2088.conhecimento-solar.workers.dev/','radar':'https://eusoudaquintadimensao-creator.github.io/radar-aguia-solar/'}
if '--baixar' in sys.argv:
    for k,u in SITES.items():
        s=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 sol1-kb'}),timeout=30).read().decode('utf-8','ignore')
        s=re.sub(r'<script.*?</script>|<style.*?</style>|<noscript.*?</noscript>',' ',s,flags=re.S)
        open(F+k+'.txt','w').write(limpa(s));print('baixado',k)
def txt(k):
    try: return open(F+k+'.txt').read()
    except Exception: return ''
VAZIO=re.compile(r'(cerca de|por|a partir de|~|US\$|R\$)\s*[;,.)(+]|\(\s*\)|—\s*—|\bR\$ —|carregando')
def frases(t):
    return [f.strip() for f in re.split(r'(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9“"🛰💸🛂🍹🧾⚠])',t) if f.strip()]
def pedacos(t,tam=520,maxp=40):
    out=[];cur=''
    for f in frases(t):
        if VAZIO.search(f) or len(f)<25: continue
        if len(cur)+len(f)>tam and cur: out.append(cur.strip());cur=''
        cur+=' '+f
        if len(out)>=maxp: break
    if cur.strip() and len(out)<maxp: out.append(cur.strip())
    return out
APPS=[]  # docs de app: i,app,t,p,r,u,tab,lg(opcional: idioma do texto)
def add(app,t,r,p=(),u='',tab='',lg=None,pri=0):
    r=limpa(r)
    if len(r)<20: return
    d={'i':'ap-'+hs(app+t+r),'app':app,'t':limpa(t),'p':[limpa(x) for x in p if x],'r':r}
    if u:d['u']=u
    if tab:d['tab']=tab
    if lg:d['lg']=lg
    if pri:d['pri']=pri;d['c']=1
    APPS.append(d)
U_APP='https://eusoudaquintadimensao-creator.github.io/mestre-solar/'
U_ENG='https://eusoudaquintadimensao-creator.github.io/aguia-primordial-english/'
U_RADAR='https://eusoudaquintadimensao-creator.github.io/radar-aguia-solar/'
U_REDE=SITES['rede-de-app'];U_GPS=SITES['solara-gps-miami-beach'];U_MIA=SITES['miami-drive-solara-2088'];U_HC='https://homem-cinza.conhecimento-solar.workers.dev'
# ---------- 1) resumos curados dos apps (PT/EN/ES), escritos a partir do que cada app mostra ----------
RES={
'rede':('Rede de App Portal Solar',U_REDE,'#rede',
 {'pt':('Rede de App Portal Solar',['rede de app','rede de app portal solar','portal solar','aba rede de app','quais apps','quantos apps','lista de apps','aplicativos da rede'],
   'A Rede de App Portal Solar é a aba Rede de App do Conhecimento Solar. Ela reúne a Agenda da Águia (despertador que chama você pelo nome), a hora solar, uma TV de tecnologia, o mapa do mundo com avião, os dados do universo e 21 aplicativos gratuitos, como Mestre Solar, Homem Cinza, Mira, Águia Primordial English, FONTE, Cinza, Calculadora Solar, Rota Alta e Pulso. Todos são grátis: o valor mostrado em cada card é só quanto custaria pelo que entrega, e juntos valeriam 517 reais por mês.'),
  'en':('Portal Solar App Network',['app network','rede de app','portal solar','which apps','how many apps','list of apps'],
   'The Portal Solar App Network is the Rede de App tab of Conhecimento Solar. It brings together the Eagle Agenda (an alarm that calls you by name), solar time, a tech TV, a world map with a plane, universe data and 21 free apps, such as Mestre Solar, Homem Cinza, Mira, Águia Primordial English, FONTE, Cinza, Calculadora Solar, Rota Alta and Pulso. All are free; the price on each card only shows what it would be worth, and together they would be worth 517 reais a month.'),
  'es':('Red de Apps Portal Solar',['red de apps','rede de app','portal solar','que apps','cuantas apps','lista de apps'],
   'La Red de Apps Portal Solar es la pestaña Rede de App de Conhecimento Solar. Reúne la Agenda del Águila (un despertador que te llama por tu nombre), la hora solar, una TV de tecnología, el mapa del mundo con avión, datos del universo y 21 aplicaciones gratuitas, como Mestre Solar, Homem Cinza, Mira, Águia Primordial English, FONTE, Cinza, Calculadora Solar, Rota Alta y Pulso. Todas son gratis; el valor de cada tarjeta solo muestra cuánto valdría, y juntas valdrían 517 reales al mes.')}),
'gps':('Solara GPS: Miami Beach',U_GPS,'',
 {'pt':('Solara GPS: Miami Beach',['solara gps','gps de miami','solara gps miami beach','miami beach','gps miami','mapa de miami','viajar para miami','guia de miami'],
   'O Solara GPS: Miami Beach é o GPS de Miami para brasileiros: mapa de satélite com zoom até a rua, os melhores bairros, praias, hotéis e preços em dólar e real, e o passo a passo de passaporte, visto e passagem barata, só com fontes confiáveis. Ele tem as primeiras 24 horas em Miami, o que fazer, o que não fazer, transporte, custos, checklist e melhor época. Fica no card Solara GPS em Nossas criações, na aba Rede de App.'),
  'en':('Solara GPS: Miami Beach',['solara gps','miami gps','miami beach','map of miami','travel to miami','miami guide'],
   'Solara GPS: Miami Beach is a Miami GPS for Brazilians: a satellite map that zooms to street level, the best neighborhoods, beaches, hotels and prices in dollars and reais, plus step-by-step passport, visa and cheap flights, using only trusted sources. It covers the first 24 hours in Miami, what to do and not to do, transport, costs, a checklist and the best season. It is the Solara GPS card in Nossas criações, in the Rede de App tab.'),
  'es':('Solara GPS: Miami Beach',['solara gps','gps de miami','miami beach','mapa de miami','viajar a miami','guia de miami'],
   'Solara GPS: Miami Beach es el GPS de Miami para brasileños: mapa satelital con zoom hasta la calle, los mejores barrios, playas, hoteles y precios en dólares y reales, y el paso a paso de pasaporte, visa y pasaje barato, solo con fuentes confiables. Incluye las primeras 24 horas en Miami, qué hacer y qué no hacer, transporte, costos, checklist y mejor época. Está en la tarjeta Solara GPS de Nossas criações, en la pestaña Rede de App.')}),
'miami':('MIAMI DRIVE SOLARA 2088',U_MIA,'',
 {'pt':('MIAMI DRIVE SOLARA 2088',['miami drive','miami drive solara 2088','solara 2088','solara bay','neon distrito','jogo de carro','jogo de direcao','jogos do app'],
   'MIAMI DRIVE SOLARA 2088 são dois jogos de direção em mundo aberto, grátis no navegador do celular e do computador: Solara Bay, uma praia ensolarada com avenidas de palmeiras e neon, e Neon Distrito, a versão cyber com chuva e letreiros. Têm drift, corridas de rua com 5 pilotos, a ponte de 11 quilômetros sobre o mar, helicóptero, rádio e garagem. Os jogos salvam o progresso no aparelho e podem ser instalados como app. Controles no computador: WASD, Espaço, Shift e E.'),
  'en':('MIAMI DRIVE SOLARA 2088',['miami drive','solara 2088','solara bay','neon distrito','car game','driving game'],
   'MIAMI DRIVE SOLARA 2088 is two free open-world driving games in the phone or computer browser: Solara Bay, a sunny beach with palm avenues and neon, and Neon Distrito, the cyber version with rain and signs. They have drifting, street races with 5 drivers, an 11 km bridge over the sea, a helicopter, radio and a garage. Progress is saved on the device and the games can be installed as apps. Computer controls: WASD, Space, Shift and E.'),
  'es':('MIAMI DRIVE SOLARA 2088',['miami drive','solara 2088','solara bay','neon distrito','juego de autos','juego de conducir'],
   'MIAMI DRIVE SOLARA 2088 son dos juegos gratuitos de conducción en mundo abierto, en el navegador del celular o la computadora: Solara Bay, una playa soleada con avenidas de palmeras y neón, y Neon Distrito, la versión cyber con lluvia y letreros. Tienen drift, carreras callejeras con 5 pilotos, un puente de 11 km sobre el mar, helicóptero, radio y garaje. Guardan el progreso en el dispositivo y se pueden instalar como app.')}),
'hc':('Homem Cinza',U_HC,'',
 {'pt':('Homem Cinza (homemcinza.com)',['homem cinza','homemcinza','homemcinza com','homem cinza com','site do homem cinza','o que e o homem cinza','homens cinza'],
   'Homem Cinza, o homemcinza.com, é o site dos homens cinza: comportamento, características, sobrevivencialismo, preparação e expansão de consciência. A versão nova tem abas embaixo no celular, dá acesso ao Conhecimento Solar e ao podcast Sol Nascente, e tem a aba Jogos com o MIAMI DRIVE SOLARA 2088. Fica no card Homem Cinza em Nossas criações, na aba Rede de App.'),
  'en':('Homem Cinza (homemcinza.com)',['homem cinza','homemcinza','grey man','gray man'],
   'Homem Cinza (homemcinza.com) is the site of the grey men: behavior, traits, survivalism, preparedness and expansion of consciousness. The new version has bottom tabs on the phone, links to Conhecimento Solar and the Sol Nascente podcast, and a Games tab with MIAMI DRIVE SOLARA 2088. Its texts are in Portuguese.'),
  'es':('Homem Cinza (homemcinza.com)',['homem cinza','homemcinza','hombre gris'],
   'Homem Cinza (homemcinza.com) es el sitio de los hombres grises: comportamiento, características, supervivencia, preparación y expansión de la conciencia. Tiene pestañas abajo en el celular, acceso a Conhecimento Solar y al podcast Sol Nascente, y una pestaña Juegos con MIAMI DRIVE SOLARA 2088. Sus textos están en portugués.')}),
'podcast':('Podcast Sol Nascente',U_APP+'#podcast','#podcast',
 {'pt':('Podcast Sol Nascente',['podcast','sol nascente','podcast sol nascente','episodios','quantos episodios','aurora e caio','ultimo episodio','novo episodio'],
   'O Sol Nascente é o podcast do Conhecimento Solar, apresentado pela Aurora e pelo Caio. São 6 episódios em vídeo: 1, O mapa do despertar; 2, A Matrix da religião; 3, Você não é a voz na sua cabeça; 4, Quem viu a Terra do espaço voltou diferente; 5, A mente que a Matrix não programa; e 6, Queimaram a mulher. O livro sobreviveu, sobre Marguerite Porete, gravado num estúdio high-tech na praia. Cada episódio pode ser baixado e compartilhado.'),
  'en':('Sol Nascente podcast',['podcast','sol nascente','episodes','how many episodes','aurora and caio','latest episode'],
   'Sol Nascente is the Conhecimento Solar podcast, hosted by Aurora and Caio. There are 6 video episodes: 1, The map of awakening; 2, The Matrix of religion; 3, You are not the voice in your head; 4, Those who saw Earth from space came back different; 5, The mind the Matrix cannot program; and 6, They burned the woman. The book survived, about Marguerite Porete, filmed in a high-tech beach studio. Episodes are in Portuguese and can be downloaded and shared.'),
  'es':('Podcast Sol Nascente',['podcast','sol nascente','episodios','cuantos episodios','aurora y caio','ultimo episodio'],
   'Sol Nascente es el podcast de Conhecimento Solar, presentado por Aurora y Caio. Son 6 episodios en video: 1, El mapa del despertar; 2, La Matrix de la religión; 3, No eres la voz en tu cabeza; 4, Quien vio la Tierra desde el espacio volvió diferente; 5, La mente que la Matrix no programa; y 6, Quemaron a la mujer. El libro sobrevivió, sobre Marguerite Porete, grabado en un estudio high-tech en la playa. Están en portugués.')}),
'sol2':('Sol 2.0',U_APP+'sol/','',
 {'pt':('Sol 2.0',['sol 2 0','sol 2','sol dois','ia offline','sol 2 0 ia offline','constelacao do conhecimento','bussola do sol'],
   'O Sol 2.0 é a página de IA offline do app, na primeira aba. Ele responde com as 374 lições, com voz gravada e legenda palavra por palavra em português, inglês e espanhol, lembra a conversa, e tem a Constelação do Conhecimento, onde cada lição explorada vira uma estrela acesa, e a Bússola do Sol, que sugere a próxima estrela.'),
  'en':('Sol 2.0',['sol 2 0','sol 2','offline ai','knowledge constellation','sun compass'],
   'Sol 2.0 is the app\'s offline AI page, in the first tab. It answers from the 374 lessons with a recorded voice and word-by-word captions in Portuguese, English and Spanish, remembers the conversation, and has the Knowledge Constellation, where each lesson you explore becomes a lit star, and the Sun Compass, which suggests the next star.'),
  'es':('Sol 2.0',['sol 2 0','sol 2','ia offline','constelacion del conocimiento','brujula del sol'],
   'Sol 2.0 es la página de IA offline de la app, en la primera pestaña. Responde con las 374 lecciones, con voz grabada y subtítulos palabra por palabra en portugués, inglés y español, recuerda la conversación y tiene la Constelación del Conocimiento y la Brújula del Sol.')}),
'sol1':('Sol do app',U_APP,'',
 {'pt':('O Sol da tela principal',['o que voce faz','o que voce sabe fazer','o que o sol faz','seus recursos','o que ha de novo no sol','paleta de comandos','memoria do sol','o que voce lembra de mim','volume da voz','volume da musica'],
   'Eu sou o Sol da tela principal. Respondo sem internet sobre as lições do Conhecimento Solar e sobre os apps que estão dentro dele: Rede de App, Solara GPS, MIAMI DRIVE SOLARA 2088, Homem Cinza, Radar Águia Solar, Águia Primordial English, o podcast Sol Nascente e o memorial de Marguerite Porete. Lembro como você quer ser chamado, o tom e os temas de que você mais gosta, só no seu aparelho. Pulso com a minha voz, e você ajusta o volume da voz e da música no painel ☰. Segure o Sol para falar comigo.'),
  'en':('The main-screen Sun',['what can you do','what do you do','your features','command palette','what do you remember about me','voice volume','music volume'],
   'I am the Sun on the main screen. I answer offline about the Conhecimento Solar lessons and the apps inside it: Rede de App, Solara GPS, MIAMI DRIVE SOLARA 2088, Homem Cinza, Radar Águia Solar, Águia Primordial English, the Sol Nascente podcast and the Marguerite Porete memorial. I remember what you want to be called, your tone and favourite topics, only on your device. I pulse with my voice, and you set voice and music volume in the ☰ panel. Hold the Sun to talk to me.'),
  'es':('El Sol de la pantalla principal',['que puedes hacer','que haces','tus funciones','paleta de comandos','que recuerdas de mi','volumen de la voz','volumen de la musica'],
   'Soy el Sol de la pantalla principal. Respondo sin internet sobre las lecciones de Conhecimento Solar y sobre las apps que tiene dentro: Rede de App, Solara GPS, MIAMI DRIVE SOLARA 2088, Homem Cinza, Radar Águia Solar, Águia Primordial English, el podcast Sol Nascente y el memorial de Marguerite Porete. Recuerdo cómo quieres que te llame, tu tono y tus temas favoritos, solo en tu dispositivo. Ajusta el volumen de la voz y de la música en el panel ☰. Mantén pulsado el Sol para hablarme.')}),
'share':('Compartilhar',U_APP,'',
 {'pt':('Compartilhar o app',['como compartilho o app','compartilhar o app','mandar o link do app','copiar o link','botao de compartilhar'],
   'Para compartilhar o Conhecimento Solar, toque no sol pulsante no canto direito do topo: abre o compartilhamento do aparelho, para WhatsApp ou onde quiser. Segure o ícone para copiar só o link; aparece o aviso Link copiado.'),
  'en':('Share the app',['how do i share the app','share the app','copy the link','share button'],
   'To share Conhecimento Solar, tap the pulsing sun in the top right corner: it opens your device share menu. Hold the icon to copy only the link.'),
  'es':('Compartir la app',['como comparto la app','compartir la app','copiar el enlace','boton de compartir'],
   'Para compartir Conhecimento Solar, toca el sol pulsante en la esquina superior derecha: abre el menú de compartir del dispositivo. Mantén pulsado el icono para copiar solo el enlace.')}),
}
for key,(app,u,tab,L3) in RES.items():
    for lg,(t,p,r) in L3.items(): add(app,t,r,p,u,tab,lg=lg,pri=1)
# intenções do Sol 2.0 que falam dos apps (radar, english, app, novo, offline, selos, criador, memorial)
src=open('ferramentas/sol-kb.py').read();ns={};exec(src[src.index('INT={'):src.index('for lg in')],ns)
NOMES={'radar-aguia':('Radar Águia Solar',U_RADAR,'#radar'),'aguia-english':('Águia Primordial English',U_ENG,'#aguia-english'),'marguerite-pagina':('Memorial Marguerite Porete',U_APP+'marguerite/',''),
 'app':('Conhecimento Solar',U_APP,''),'novo':('Conhecimento Solar',U_APP,''),'offline':('Conhecimento Solar',U_APP,''),'selos':('Conhecimento Solar',U_APP,''),'criador':('Conhecimento Solar',U_APP,'')}
for lg,lst in ns['INT'].items():
    for a,p,r in lst:
        if a in NOMES: n,u,tab=NOMES[a];add(n,n if a in('radar-aguia','aguia-english','marguerite-pagina') else 'Conhecimento Solar: '+a,r,p,u,tab,lg=lg,pri=1)
# ---------- 2) passagens do conteúdo real (PT) ----------
# Rede de App: os 21 apps
t=txt('rede-de-app');n=0
for m in re.finditer(r'(\d\d) (.+?) ((?:[^V]|V(?!aleria))+?) Valeria R\$ (\d+)/mês Grátis',t[t.find('Principal 01')+10:] if 'Principal 01' in t else t):
    num,resto,_,preco=m.group(1),m.group(2)+' '+m.group(3),None,m.group(4)
    nomes=['Mestre Solar','EU SOU O EU SOU','Homem Cinza','Mira','Mulheres no Volante','Guia Construção Certo','Águia Primordial English','Ninho da Águia','ORBE','Vibra Língua','Cinza Vibracional','FONTE','Cinza','Ateliê Cinza','Calistenia Cinza','Safelight','Eu Sou o Eu Sou','Calculadora Solar','Plataforma Solar','Rota Alta','Pulso']
    nm=next((x for x in sorted(nomes,key=len,reverse=True) if resto.startswith(x+' ')),None)
    if not nm: continue
    desc=resto[len(nm):].strip()
    add('Rede de App Portal Solar','App '+nm,nm+' é o app número '+str(int(num))+' da Rede de App Portal Solar: '+desc+' É grátis; o card mostra que valeria '+preco+' reais por mês.',[nm.lower(),'app '+nm.lower(),'o que e o '+nm.lower(),'o que e '+nm.lower()],U_REDE,'#rede',lg='pt');n+=1
print('rede: apps',n)
for chave,app,u,tab in (('rede-de-app','Rede de App Portal Solar',U_REDE,'#rede'),('solara-gps-miami-beach','Solara GPS: Miami Beach',U_GPS,''),('miami-drive-solara-2088','MIAMI DRIVE SOLARA 2088',U_MIA,''),('radar','Radar Águia Solar',U_RADAR,'#radar')):
    t=txt(chave)
    if chave=='rede-de-app': t=t[:t.find('Aplicativos Grátis')] if 'Aplicativos Grátis' in t else t
    for k,pd in enumerate(pedacos(t,560,45)): add(app,app+' · '+str(k+1),pd,[],u,tab,lg='pt')
# Águia Primordial English: base da IA do próprio site
try:
    kb=json.load(open(WS+'aguia-primordial-english-site/ia/kb.json'))
    for e in kb['entradas']:
        x=limpa(e['x']);x=re.sub(r'https?://\S+','',x)
        for k,pd in enumerate(pedacos(x,600,3)): add('Águia Primordial English',e['t'],pd,[e.get('k','')],U_ENG,'#aguia-english',lg='pt')
    print('english',len(kb['entradas']))
except Exception as ex: print('english: sem kb.json local',ex)
# Homem Cinza: texto das páginas
try:
    pg=json.load(open(WS+'homemcinza-cf/pages.json'));n=0
    for rota,o in pg.items():
        tit=limpa(o.get('title','')).split(' homem cinza.com')[0];corpo=' '.join(limpa(b.get('x','')) for b in o.get('b',[]) if b.get('t') in ('p','h2','h3','li','quote'))
        base=(limpa(o.get('desc',''))+' '+corpo).strip()
        for k,pd in enumerate(pedacos(base,600,2)): add('Homem Cinza',tit or 'Homem Cinza',pd,[],U_HC+(rota if rota.startswith('/') else ''),lg='pt');n+=1
    print('homem cinza: passagens',n)
except Exception as ex: print('homem cinza: sem pages.json local',ex)
# Podcast: episódios (ms-podcast.js) + kits de postagem
js=open('conteudo/ms-podcast.js').read()
for m in re.finditer(r'\{ n: (\d+), titulo: "([^"]+)", sub: "([^"]+)"',js):
    n,ti,sub=m.groups();extra=''
    kit=WS+'podcast/ep%02d/KIT-POSTAGEM.md'%int(n)
    if os.path.exists(kit):
        k=open(kit).read();mm=re.search(r'Descrição: (.+)',k) or re.search(r'## TikTok \(legenda\)\n(.+)',k)
        if mm: extra=re.sub(r'#\S+','',mm.group(1)).strip()
        mc=re.search(r'Pergunta: \*\*(.+?)\*\*',k)
        if mc: extra+=' A pergunta final do episódio: '+mc.group(1)
    add('Podcast Sol Nascente','Episódio '+n+': '+ti,'O episódio '+n+' do podcast Sol Nascente, com Aurora e Caio, é '+ti+' Tema: '+sub+'. '+extra,['episodio '+n,'ep '+n,'episodio '+{'1':'um','2':'dois','3':'tres','4':'quatro','5':'cinco','6':'seis'}.get(n,n),ti.lower()],U_APP+'#podcast','#podcast',lg='pt',pri=1)
# ---------- 3) saída ----------
for lg in ('pt','en','es'):
    kb=json.load(open('sol/kb-'+lg+'.json'))
    L=[{'i':e['i'],'g':e['g'],'t':e['t'],'p':e['p'],'r':e['r'],'a':(e.get('a') or '')[:420]} for e in kb['licoes']]
    A=[d for d in APPS if d.get('lg') in (lg,'pt') and not (lg!='pt' and d.get('pri') and d.get('lg')=='pt')]
    A=[dict((k,v) for k,v in d.items() if k!='pri' and not (k=='lg' and v==lg)) for d in A]
    out={'v':kb.get('v',''),'gerado':'ferramentas/sol1-kb.py','lang':lg,'grupos':kb['grupos'],'licoes':L,'apps':A}
    p='conteudo/sol1/kb-'+lg+'.json';json.dump(out,open(p,'w'),ensure_ascii=False,separators=(',',':'))
    print(lg,len(L),'lições',len(A),'trechos de apps',os.path.getsize(p)//1024,'KB')
