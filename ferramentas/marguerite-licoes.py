#!/usr/bin/env python3
"""Grupo 'Marguerite Porete e a Inquisição' (PT/EN/ES) nos índices do app.
Fonte do texto: memorial /marguerite/ (mesmo conteúdo do site Águia Primordial English).
Rode de novo sem medo: substitui o grupo, não duplica."""
import json,os,unicodedata
def na(x): return ''.join(c for c in unicodedata.normalize('NFD',x.lower()) if unicodedata.category(c)!='Mn').replace(':','').replace("'",'')
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(R)
G='Marguerite Porete e a Inquisição';ARQ='marguerite-porete.json'
WP='https://pt.wikipedia.org/wiki/Marguerite_Porete';WE='https://en.wikipedia.org/wiki/Marguerite_Porete';WM='https://en.wikipedia.org/wiki/The_Mirror_of_Simple_Souls'
PG='https://eusoudaquintadimensao-creator.github.io/mestre-solar/marguerite/'
PDF='https://upload.wikimedia.org/wikipedia/commons/d/d8/Porete_-_Le_Miroir_des_simples_%C3%A2mes.pdf'
WS='https://fr.wikisource.org/wiki/Le_Miroir_des_simples_%C3%A2mes';IA='https://archive.org/details/mirrorofsimpleso00unse'
SI='https://en.wikipedia.org/wiki/Spanish_Inquisition';PI='https://en.wikipedia.org/wiki/Portuguese_Inquisition';WT='https://en.wikipedia.org/wiki/Witch_trials_in_the_early_modern_period'
# palavras comuns aos 3 idiomas (sem acento: o motor normaliza)
K={
'quem':['marguerite porete','margarida porete','margarete porete','marguerite','porete','beguina','beguinas','beguine','quem foi marguerite porete','who was marguerite porete','quien fue marguerite porete'],
'livro':['espelho das almas simples','o espelho das almas simples','mirror of simple souls','espejo de las almas simples','miroir des simples ames','mirouer','aniquilacao da alma','alma aniquilada','annihilated soul','alma aniquilada'],
'processo':['processo de marguerite porete','inquisidor da marguerite','inquisidor de marguerite porete','quem julgou marguerite','quem condenou marguerite','who condemned marguerite','quien condeno a marguerite','inquisidor de marguerite','julgamento de marguerite','inquisidor de marguerite','guilherme de paris','william of paris','guillermo de paris','herege relapsa','relapsed heretic','quinze artigos','fifteen articles','quince articulos','valenciennes'],
'fogueira':['fogueira de marguerite','marguerite na fogueira','queimada viva','burned at the stake','quemada viva','place de greve','1 de junho de 1310','1310','a mulher que sorriu na fogueira','sorriu na fogueira','smiled at the stake','sonrio en la hoguera','aquela que sorriu na fogueira'],
'depois':['livro sem nome','romana guarnieri','guarnieri','1946','autora do espelho','author of the mirror','autora del espejo'],
'memorial':['vitimas da inquisicao','victims of the inquisition','victimas de la inquisicion','quantos a inquisicao matou','quantas pessoas a inquisicao matou','how many did the inquisition kill','cuantos mato la inquisicion','inquisicao espanhola','inquisicao portuguesa','spanish inquisition','portuguese inquisition','inquisicion espanola','inquisicao no brasil','antonio jose da silva','caca as bruxas','witch hunts','caza de brujas','memorial da inquisicao'],
'voz':['se marguerite pudesse falar','marguerite falando','if marguerite could speak','si marguerite pudiera hablar','monologo de marguerite','palavras de marguerite','frases de marguerite','marguerite quotes','citas de marguerite','alma e a aguia','soul like the eagle'],
'baixar':['onde baixo o livro','baixar o livro','baixo o livro','download do livro','where can i download','donde descargo','descargar el libro','baixar o livro de marguerite','livro original de marguerite','download the mirror','descargar el espejo','livro da marguerite porete','manuscrito de chantilly','chantilly','pdf do espelho','kirchberger'],
'reflexao':['liberdade de consciencia','freedom of conscience','libertad de conciencia','quem pode trancar uma consciencia','dogma e poder','chama de marguerite'],
}
L={
'pt':[
('quem','Marguerite Porete: quem foi',
 'Marguerite Porete nasceu por volta de 1250, provavelmente no condado de Hainaut, entre a França e o Sacro Império. Era uma mulher muito instruída e uma beguina, das mulheres que viviam a fé livres, sem votos de convento e sem marido. Escreveu O Espelho das Almas Simples e foi queimada viva em Paris, em 1º de junho de 1310.',
 'Quase tudo o que sabemos dela vem dos autos do processo, escritos por quem queria calá-la. Mesmo assim, o retrato que sobra é claro: uma escritora que teve a ousadia de pensar o sagrado com a própria cabeça e na língua do povo. Não existe nenhum retrato autêntico dela; as imagens do memorial são representações artísticas. Diga memorial de Marguerite para abrir a página completa, com áudio em português e inglês.',
 'Para contemplar: de Marguerite guardaram as acusações, não o rosto. Que parte de você o mundo só conhece pelo que dizem sobre você?',
 [WP,WE,PG],['Comprovado'],['O Espelho das Almas Simples','A fogueira de 1310','O processo de Marguerite Porete']),
('livro','O Espelho das Almas Simples',
 'Na década de 1290, Marguerite escreveu em francês antigo, a língua do povo, e não em latim, O Espelho das Almas Simples e Aniquiladas. É um diálogo entre a Alma, o Amor e a Razão. A Alma atravessa sete estados até se desfazer de tudo o que é só seu e se tornar transparente, como um espelho, para o amor divino.',
 'Ela chama isso de aniquilação: não a morte da pessoa, mas o fim da prisão do ego. Uma alma assim já não vive pelo medo do castigo nem pela troca de favores com o céu; vive livre, porque ama. No capítulo 22 ela compara a alma livre à águia, que voa mais alto que todas as aves. Para o poder da época, essa liberdade era o perigo: quem encontra Deus pelo amor já não depende de intermediários.',
 'Para contemplar: do que você precisaria se desfazer para ficar transparente como um espelho? Medo, orgulho, a vontade de ter razão?',
 [WM,WS,PG],['Comprovado','Tradição'],['Marguerite Porete: quem foi','Baixar o livro de Marguerite Porete','Se Marguerite pudesse falar']),
('processo','O processo de Marguerite Porete',
 'Entre 1296 e 1306, o bispo de Cambrai mandou queimar o livro em praça pública, em Valenciennes, diante dela. Ela não obedeceu à proibição. Por volta de 1308 foi presa e entregue ao inquisidor da França, o dominicano Guilherme de Paris, o mesmo do processo contra os Templários. Ficou cerca de um ano e meio presa e se recusou a fazer o juramento e a responder.',
 'Sem poder interrogá-la, os inquisidores puseram o livro no banco dos réus. Tiraram dele quinze frases, os artigos, e em abril de 1310 vinte e um teólogos da Universidade de Paris os declararam heréticos. Hoje, só três dos quinze artigos são identificados com segurança. Por ter voltado a divulgar um livro já condenado, ela foi declarada herege relapsa. Antes, três religiosos, entre eles Godofredo de Fontaines, mestre de teologia em Paris, tinham aprovado o texto.',
 'Para contemplar: o silêncio dela foi a sua defesa. Quando calar é mais forte do que se explicar?',
 [WE,WP],['Comprovado'],['A fogueira de 1310','O Espelho das Almas Simples']),
('fogueira','A fogueira de 1310',
 'Em 1º de junho de 1310, na Place de Grève, em Paris, onde hoje fica a praça da Prefeitura, Marguerite Porete foi queimada viva. Ela não se retratou. A continuação da crônica de Guillaume de Nangis, escrita por quem não tinha simpatia por ela, registrou que ela enfrentou a morte com tanta calma que a multidão chorou.',
 'Sobre a expressão a mulher que sorriu na fogueira: as fontes dizem calma e serenidade, e dizem que o povo chorou; nenhuma fonte da época diz que ela sorriu. A imagem do sorriso é uma leitura poética dessa paz. O beguino Guiard de Cressonessart, que tentou defendê-la, confessou sob pressão e foi condenado à prisão perpétua. Queimaram a mulher; não conseguiram queimar o que ela havia compreendido.',
 'Para contemplar: que tipo de paz permite olhar o fogo sem ódio? De onde vem uma calma que não depende do que acontece lá fora?',
 [WE,WP,PG],['Comprovado'],['Depois do fogo: o livro sem nome','Vítimas da Inquisição: o memorial']),
('depois','Depois do fogo: o livro sem nome',
 'O livro sobreviveu sem o nome dela. Foi copiado e traduzido para o latim, o italiano e o inglês médio, e circulou por vários países, lido por monges e freiras que não sabiam que liam uma mulher condenada. Só em 1946 a historiadora italiana Romana Guarnieri reconheceu, em manuscritos latinos da Biblioteca Vaticana, o livro de Marguerite Porete.',
 'Antes disso, o Espelho chegou a ser atribuído a outros autores, e em 1927 foi impresso em inglês como obra de um místico francês desconhecido, na edição de Clare Kirchberger. Seiscentos e trinta e seis anos depois da fogueira, ela recuperou o próprio nome.',
 'Para contemplar: as ideias dela viajaram séculos sem assinatura. Uma verdade precisa do nome de quem a disse para continuar viva?',
 [WM,WE],['Comprovado'],['Baixar o livro de Marguerite Porete','Marguerite Porete: quem foi']),
('memorial','Vítimas da Inquisição: o memorial',
 'Marguerite não foi a única. Os historiadores estimam que a Inquisição espanhola processou cerca de cento e cinquenta mil pessoas e entregou à morte entre três mil e cinco mil. A Inquisição portuguesa, que também agiu no Brasil, queimou vivas pelo menos mil cento e setenta e cinco pessoas, segundo Henry Charles Lea.',
 'Entre as vítimas da Inquisição portuguesa estava o dramaturgo carioca Antônio José da Silva, executado em Lisboa em 1739. Nas caças às bruxas da Europa, movidas por tribunais religiosos e também civis, católicos e protestantes, entre quarenta mil e sessenta mil pessoas foram executadas, a maioria mulheres. Os próprios historiadores avisam que esses números são mínimos: muitas mortes nas prisões e sob tortura nunca foram registradas.',
 'Para contemplar: por trás de cada número há um nome e uma voz apagada. Não é preciso desprezar quem crê para reconhecer isso; muitos fiéis sinceros também foram vítimas. O que você pode fazer hoje para que nenhuma consciência seja trancada?',
 [SI,PI,WT,PG],['Comprovado','Hipótese'],['A fogueira de 1310','Liberdade de consciência']),
('voz','Se Marguerite pudesse falar',
 'No memorial há um texto escrito em homenagem, como se ela falasse. Atenção: é um texto imaginado, não uma fala histórica. Ele começa assim: Eu sou Marguerite. Não tenho retrato; ninguém pintou o meu rosto. De mim guardaram apenas as acusações. Mas eu deixei um espelho.',
 'E termina assim: Eu me chamo Marguerite, e com o meu nome falam milhares que não puderam terminar a sua frase. Terminem por nós. Pensem livres. Amem sem medo. Já as palavras dela de verdade estão no livro. No capítulo 6, a Alma diz: Virtudes, eu me despeço de vocês para sempre; meu coração ficará mais livre e mais alegre. E no capítulo 22 a alma livre é comparada à águia, que voa mais alto que qualquer outra ave.',
 'Para contemplar: se você pudesse deixar uma única frase para quem vem depois, qual seria?',
 [PG,WS],['Tradição'],['O Espelho das Almas Simples','Liberdade de consciência']),
('baixar','Baixar o livro de Marguerite Porete',
 'O livro original pode ser baixado de graça, só em edições de domínio público: o manuscrito de Chantilly, do século quinze, em PDF de duzentas e cinquenta e seis páginas no Wikimedia Commons; o texto completo em francês médio, transcrito pelo Wikisource; e a tradução inglesa medieval publicada em 1927, no Internet Archive.',
 'Os links estão no memorial, na seção O livro, e nas fontes desta lição. A transcrição do Wikisource é CC BY-SA 4.0 e fica guardada no app para ler sem internet. As traduções modernas têm direito autoral e por isso aparecem só como referência, sem arquivo.',
 'Para contemplar: ler a fonte original, mesmo devagar, é um ato de liberdade. Que livro você conhece só pelo que os outros falaram dele?',
 [PDF,WS,IA,PG],['Comprovado'],['O Espelho das Almas Simples','Depois do fogo: o livro sem nome']),
('reflexao','Liberdade de consciência',
 'A história de Marguerite pergunta a cada um de nós: quem tem o direito de decidir o que você pode pensar, ler, escrever e sentir sobre o sagrado? Durante séculos, instituições que diziam falar em nome de Deus usaram o medo, o fogo e o silêncio para controlar consciências.',
 'O que se denuncia aqui não é a fé sincera, mas o dogma armado de poder, a ideia de que a verdade precisa de carcereiros. A liberdade de consciência, de pensamento e de conhecimento foi conquistada com vidas como a dela. Cada vez que alguém pensa por si, pergunta sem medo e compartilha o que aprendeu, a chama de Marguerite continua acesa, não como fogueira, mas como luz.',
 'Para contemplar: em que assunto você ainda pede permissão para pensar?',
 [PG,WE],['Tradição'],['Vítimas da Inquisição: o memorial','Se Marguerite pudesse falar']),
],
'en':[
('quem','Marguerite Porete: who she was',
 'Marguerite Porete was born around 1250, probably in the county of Hainaut, between France and the Holy Roman Empire. She was a highly educated woman and a beguine, one of the women who lived their faith freely, without convent vows and without a husband. She wrote The Mirror of Simple Souls and was burned alive in Paris on 1 June 1310.',
 'Almost everything we know about her comes from the trial records, written by those who wanted to silence her. Even so, the portrait that remains is clear: a writer who dared to think about the sacred with her own mind and in the language of the people. No authentic portrait of her exists; the images in the memorial are artistic representations. Say Marguerite memorial to open the full page, with audio in Portuguese and English.',
 'To contemplate: they kept her accusations, not her face. What part of you does the world only know through what others say about you?',
 [WE,PG],['Comprovado'],['The Mirror of Simple Souls','The fire of 1310','The trial of Marguerite Porete']),
('livro','The Mirror of Simple Souls',
 'In the 1290s Marguerite wrote, in Old French, the language of the people, and not in Latin, The Mirror of Simple and Annihilated Souls. It is a dialogue between the Soul, Love and Reason. The Soul passes through seven states until it lets go of everything that is only its own and becomes transparent, like a mirror, to divine love.',
 'She calls this annihilation: not the death of the person, but the end of the prison of the ego. Such a soul no longer lives out of fear of punishment or by trading favours with heaven; it lives free, because it loves. In chapter 22 she compares the free soul to the eagle, which flies higher than all other birds. For the power of that time, this freedom was the danger: whoever finds God through love no longer depends on intermediaries.',
 'To contemplate: what would you need to let go of to become transparent like a mirror? Fear, pride, the need to be right?',
 [WM,WS,PG],['Comprovado','Tradição'],['Marguerite Porete: who she was','Download Marguerite Porete\'s book','If Marguerite could speak']),
('processo','The trial of Marguerite Porete',
 'Between 1296 and 1306 the bishop of Cambrai had the book burned in public in Valenciennes, in front of her. She did not obey the ban. Around 1308 she was arrested and handed over to the inquisitor of France, the Dominican William of Paris, the same man behind the trial of the Templars. She spent about a year and a half in prison and refused to take the oath or to answer.',
 'Unable to question her, the inquisitors put the book on trial. They took fifteen sentences from it, the articles, and in April 1310 twenty-one theologians of the University of Paris declared them heretical. Today only three of the fifteen articles can be identified with certainty. Because she had kept spreading a book already condemned, she was declared a relapsed heretic. Earlier, three churchmen, among them Godfrey of Fontaines, a master of theology in Paris, had approved the text.',
 'To contemplate: her silence was her defence. When is silence stronger than explaining yourself?',
 [WE],['Comprovado'],['The fire of 1310','The Mirror of Simple Souls']),
('fogueira','The fire of 1310',
 'On 1 June 1310, at the Place de Grève in Paris, where the City Hall square is today, Marguerite Porete was burned alive. She did not recant. The continuation of the chronicle of Guillaume de Nangis, written by someone with no sympathy for her, recorded that she faced death so calmly that the crowd wept.',
 'About the phrase the woman who smiled at the stake: the sources speak of calm and serenity, and say the people wept; no source of the time says she smiled. The smile is a poetic reading of that peace. The beguin Guiard de Cressonessart, who tried to defend her, confessed under pressure and was sentenced to life in prison. They burned the woman; they could not burn what she had understood.',
 'To contemplate: what kind of peace lets someone face the fire without hatred? Where does a calm come from that does not depend on what happens outside?',
 [WE,PG],['Comprovado'],['After the fire: the nameless book','Victims of the Inquisition: the memorial']),
('depois','After the fire: the nameless book',
 'The book survived without her name. It was copied and translated into Latin, Italian and Middle English, and travelled through several countries, read by monks and nuns who did not know they were reading a condemned woman. Only in 1946 did the Italian historian Romana Guarnieri recognise Marguerite Porete\'s book in Latin manuscripts of the Vatican Library.',
 'Before that, the Mirror was even attributed to other authors, and in 1927 it was printed in English as the work of an unknown French mystic, in Clare Kirchberger\'s edition. Six hundred and thirty-six years after the fire, she got her own name back.',
 'To contemplate: her ideas travelled for centuries without a signature. Does a truth need the name of whoever said it to stay alive?',
 [WM,WE],['Comprovado'],['Download Marguerite Porete\'s book','Marguerite Porete: who she was']),
('memorial','Victims of the Inquisition: the memorial',
 'Marguerite was not the only one. Historians estimate that the Spanish Inquisition prosecuted about one hundred and fifty thousand people and sent between three thousand and five thousand to their deaths. The Portuguese Inquisition, which also reached Brazil, burned at least one thousand one hundred and seventy-five people alive, according to Henry Charles Lea.',
 'Among the victims of the Portuguese Inquisition was the Rio-born playwright Antônio José da Silva, executed in Lisbon in 1739. In Europe\'s witch hunts, driven by church courts and also by secular courts, Catholic and Protestant alike, between forty thousand and sixty thousand people were executed, most of them women. Historians themselves warn that these numbers are minimums: many deaths in prison and under torture were never recorded.',
 'To contemplate: behind every number there is a name and a silenced voice. You do not need to despise believers to see this; many sincere believers were victims too. What can you do today so that no conscience is locked away?',
 [SI,PI,WT,PG],['Comprovado','Hipótese'],['The fire of 1310','Freedom of conscience']),
('voz','If Marguerite could speak',
 'The memorial has a text written as a tribute, as if she were speaking. Note: it is an imagined text, not a historical speech. It begins: I am Marguerite. I have no portrait; nobody painted my face. They kept only the accusations against me. But I left a mirror.',
 'And it ends: My name is Marguerite, and through my name speak thousands who could not finish their sentence. Finish it for us. Think freely. Love without fear. Her real words are in the book. In chapter 6 the Soul says: Virtues, I take leave of you for evermore; now shall mine heart be more free and more in peace. And in chapter 22 the free soul is compared to the eagle, which flies higher than any other bird.',
 'To contemplate: if you could leave a single sentence to those who come after you, what would it be?',
 [PG,WS],['Tradição'],['The Mirror of Simple Souls','Freedom of conscience']),
('baixar','Download Marguerite Porete\'s book',
 'The original book can be downloaded for free, in public-domain editions only: the fifteenth-century Chantilly manuscript, as a two-hundred-and-fifty-six-page PDF on Wikimedia Commons; the full Middle French text transcribed by Wikisource; and the medieval English translation published in 1927, on the Internet Archive.',
 'The links are in the memorial, in the section The book, and in the sources of this lesson. The Wikisource transcription is CC BY-SA 4.0 and is stored in the app to read offline. Modern translations are under copyright, so they are listed only as references, without files.',
 'To contemplate: reading the original source, even slowly, is an act of freedom. Which book do you only know from what others said about it?',
 [PDF,WS,IA,PG],['Comprovado'],['The Mirror of Simple Souls','After the fire: the nameless book']),
('reflexao','Freedom of conscience',
 'Marguerite\'s story asks each of us: who has the right to decide what you may think, read, write and feel about the sacred? For centuries, institutions that claimed to speak in God\'s name used fear, fire and silence to control consciences.',
 'What is denounced here is not sincere faith, but dogma armed with power, the idea that truth needs jailers. Freedom of conscience, of thought and of knowledge was won with lives like hers. Every time someone thinks for themselves, asks without fear and shares what they learned, Marguerite\'s flame stays lit, not as a fire, but as light.',
 'To contemplate: on what subject do you still ask permission to think?',
 [PG,WE],['Tradição'],['Victims of the Inquisition: the memorial','If Marguerite could speak']),
],
'es':[
('quem','Marguerite Porete: quién fue',
 'Marguerite Porete nació hacia 1250, probablemente en el condado de Henao, entre Francia y el Sacro Imperio. Era una mujer muy instruida y una beguina, de las mujeres que vivían la fe con libertad, sin votos de convento y sin marido. Escribió El espejo de las almas simples y fue quemada viva en París el 1 de junio de 1310.',
 'Casi todo lo que sabemos de ella viene de las actas del proceso, escritas por quienes querían callarla. Aun así, el retrato que queda es claro: una escritora que se atrevió a pensar lo sagrado con su propia cabeza y en la lengua del pueblo. No existe ningún retrato auténtico de ella; las imágenes del memorial son representaciones artísticas. Di memorial de Marguerite para abrir la página completa, con audio en portugués e inglés.',
 'Para contemplar: de Marguerite guardaron las acusaciones, no el rostro. ¿Qué parte de ti el mundo solo conoce por lo que dicen de ti?',
 [WE,PG],['Comprovado'],['El espejo de las almas simples','La hoguera de 1310','El proceso de Marguerite Porete']),
('livro','El espejo de las almas simples',
 'En la década de 1290, Marguerite escribió en francés antiguo, la lengua del pueblo, y no en latín, El espejo de las almas simples y anonadadas. Es un diálogo entre el Alma, el Amor y la Razón. El Alma atraviesa siete estados hasta deshacerse de todo lo que es solo suyo y volverse transparente, como un espejo, para el amor divino.',
 'Ella lo llama aniquilación: no la muerte de la persona, sino el fin de la prisión del ego. Un alma así ya no vive por miedo al castigo ni por el trueque de favores con el cielo; vive libre, porque ama. En el capítulo 22 compara el alma libre con el águila, que vuela más alto que todas las aves. Para el poder de la época, esa libertad era el peligro: quien encuentra a Dios por el amor ya no depende de intermediarios.',
 'Para contemplar: ¿de qué tendrías que deshacerte para volverte transparente como un espejo? ¿Miedo, orgullo, las ganas de tener razón?',
 [WM,WS,PG],['Comprovado','Tradição'],['Marguerite Porete: quién fue','Descargar el libro de Marguerite Porete','Si Marguerite pudiera hablar']),
('processo','El proceso de Marguerite Porete',
 'Entre 1296 y 1306, el obispo de Cambrai mandó quemar el libro en público, en Valenciennes, delante de ella. Ella no obedeció la prohibición. Hacia 1308 fue arrestada y entregada al inquisidor de Francia, el dominico Guillermo de París, el mismo del proceso contra los templarios. Pasó cerca de un año y medio presa y se negó a prestar juramento y a responder.',
 'Sin poder interrogarla, los inquisidores sentaron al libro en el banquillo. Sacaron de él quince frases, los artículos, y en abril de 1310 veintiún teólogos de la Universidad de París los declararon heréticos. Hoy solo tres de los quince artículos se identifican con seguridad. Por haber vuelto a difundir un libro ya condenado, fue declarada hereje relapsa. Antes, tres religiosos, entre ellos Godofredo de Fontaines, maestro de teología en París, habían aprobado el texto.',
 'Para contemplar: su silencio fue su defensa. ¿Cuándo callar es más fuerte que explicarse?',
 [WE],['Comprovado'],['La hoguera de 1310','El espejo de las almas simples']),
('fogueira','La hoguera de 1310',
 'El 1 de junio de 1310, en la Place de Grève de París, donde hoy está la plaza del Ayuntamiento, Marguerite Porete fue quemada viva. No se retractó. La continuación de la crónica de Guillaume de Nangis, escrita por alguien que no simpatizaba con ella, registró que enfrentó la muerte con tanta calma que la multitud lloró.',
 'Sobre la expresión la mujer que sonrió en la hoguera: las fuentes hablan de calma y serenidad, y dicen que el pueblo lloró; ninguna fuente de la época dice que sonriera. La sonrisa es una lectura poética de esa paz. El beguino Guiard de Cressonessart, que intentó defenderla, confesó bajo presión y fue condenado a cadena perpetua. Quemaron a la mujer; no pudieron quemar lo que ella había comprendido.',
 'Para contemplar: ¿qué clase de paz permite mirar el fuego sin odio? ¿De dónde viene una calma que no depende de lo que pasa afuera?',
 [WE,PG],['Comprovado'],['Después del fuego: el libro sin nombre','Víctimas de la Inquisición: el memorial']),
('depois','Después del fuego: el libro sin nombre',
 'El libro sobrevivió sin su nombre. Fue copiado y traducido al latín, al italiano y al inglés medio, y circuló por varios países, leído por monjes y monjas que no sabían que leían a una mujer condenada. Solo en 1946 la historiadora italiana Romana Guarnieri reconoció, en manuscritos latinos de la Biblioteca Vaticana, el libro de Marguerite Porete.',
 'Antes, el Espejo llegó a atribuirse a otros autores, y en 1927 se imprimió en inglés como obra de un místico francés desconocido, en la edición de Clare Kirchberger. Seiscientos treinta y seis años después de la hoguera, ella recuperó su propio nombre.',
 'Para contemplar: sus ideas viajaron siglos sin firma. ¿Una verdad necesita el nombre de quien la dijo para seguir viva?',
 [WM,WE],['Comprovado'],['Descargar el libro de Marguerite Porete','Marguerite Porete: quién fue']),
('memorial','Víctimas de la Inquisición: el memorial',
 'Marguerite no fue la única. Los historiadores estiman que la Inquisición española procesó a unas ciento cincuenta mil personas y llevó a la muerte a entre tres mil y cinco mil. La Inquisición portuguesa, que también actuó en Brasil, quemó vivas al menos a mil ciento setenta y cinco personas, según Henry Charles Lea.',
 'Entre las víctimas de la Inquisición portuguesa estuvo el dramaturgo nacido en Río de Janeiro Antônio José da Silva, ejecutado en Lisboa en 1739. En las cazas de brujas de Europa, impulsadas por tribunales religiosos y también civiles, católicos y protestantes, entre cuarenta mil y sesenta mil personas fueron ejecutadas, la mayoría mujeres. Los propios historiadores advierten que estas cifras son mínimas: muchas muertes en prisión y bajo tortura nunca se registraron.',
 'Para contemplar: detrás de cada número hay un nombre y una voz apagada. No hace falta despreciar a quien cree para reconocerlo; muchos fieles sinceros también fueron víctimas. ¿Qué puedes hacer hoy para que ninguna conciencia sea encerrada?',
 [SI,PI,WT,PG],['Comprovado','Hipótese'],['La hoguera de 1310','Libertad de conciencia']),
('voz','Si Marguerite pudiera hablar',
 'En el memorial hay un texto escrito como homenaje, como si ella hablara. Atención: es un texto imaginado, no un discurso histórico. Empieza así: Soy Marguerite. No tengo retrato; nadie pintó mi rostro. De mí guardaron solo las acusaciones. Pero dejé un espejo.',
 'Y termina así: Me llamo Marguerite, y con mi nombre hablan miles que no pudieron terminar su frase. Terminadla por nosotros. Pensad libres. Amad sin miedo. Sus palabras verdaderas están en el libro. En el capítulo 6 el Alma dice: Virtudes, me despido de vosotras para siempre; mi corazón será más libre y más alegre. Y en el capítulo 22 el alma libre se compara con el águila, que vuela más alto que cualquier otra ave.',
 'Para contemplar: si pudieras dejar una sola frase a quienes vienen después, ¿cuál sería?',
 [PG,WS],['Tradição'],['El espejo de las almas simples','Libertad de conciencia']),
('baixar','Descargar el libro de Marguerite Porete',
 'El libro original se puede descargar gratis, solo en ediciones de dominio público: el manuscrito de Chantilly, del siglo quince, en un PDF de doscientas cincuenta y seis páginas en Wikimedia Commons; el texto completo en francés medio, transcrito por Wikisource; y la traducción inglesa medieval publicada en 1927, en Internet Archive.',
 'Los enlaces están en el memorial, en la sección El libro, y en las fuentes de esta lección. La transcripción de Wikisource es CC BY-SA 4.0 y queda guardada en la app para leer sin internet. Las traducciones modernas tienen derechos de autor, por eso aparecen solo como referencia, sin archivo.',
 'Para contemplar: leer la fuente original, aunque sea despacio, es un acto de libertad. ¿Qué libro conoces solo por lo que otros dijeron de él?',
 [PDF,WS,IA,PG],['Comprovado'],['El espejo de las almas simples','Después del fuego: el libro sin nombre']),
('reflexao','Libertad de conciencia',
 'La historia de Marguerite nos pregunta a cada uno: ¿quién tiene derecho a decidir lo que puedes pensar, leer, escribir y sentir sobre lo sagrado? Durante siglos, instituciones que decían hablar en nombre de Dios usaron el miedo, el fuego y el silencio para controlar conciencias.',
 'Lo que aquí se denuncia no es la fe sincera, sino el dogma armado de poder, la idea de que la verdad necesita carceleros. La libertad de conciencia, de pensamiento y de conocimiento se conquistó con vidas como la suya. Cada vez que alguien piensa por sí mismo, pregunta sin miedo y comparte lo que aprendió, la llama de Marguerite sigue encendida, no como hoguera, sino como luz.',
 'Para contemplar: ¿sobre qué tema todavía pides permiso para pensar?',
 [PG,WE],['Tradição'],['Víctimas de la Inquisición: el memorial','Si Marguerite pudiera hablar']),
]}
GN={'pt':G,'en':G,'es':G}
TG={'pt':['marguerite porete e a inquisicao','temas de marguerite porete','marguerite porete','memorial marguerite','inquisicao'],
    'en':['marguerite porete and the inquisition','marguerite porete topics','marguerite porete','marguerite memorial','inquisition'],
    'es':['marguerite porete y la inquisicion','temas de marguerite porete','marguerite porete','memorial de marguerite','inquisicion']}
for lg,lic in L.items():
    pre='' if lg=='pt' else lg+'/'
    out=[]
    for k,tema,r,a,c3,fo,nv,seg in lic:
        out.append({'grupo':G,'tema':tema,'palavras':[na(tema)]+K[k],'resposta':r,'aprofundar':a,'camada3':c3,'fontes':fo,'nivelVerdade':nv,'parte':'Marguerite Porete','seguir':seg,'id':'mp-'+k})
    json.dump(out,open('conteudo/'+pre+'grupos/'+ARQ,'w'),ensure_ascii=False,indent=1)
    ip='conteudo/'+pre+'indice.json';ix=json.load(open(ip))
    ix['grupos']=[g for g in ix['grupos'] if g.get('arquivo')!=ARQ]+[{'nome':G,'arquivo':ARQ,'n':len(out)}]
    ix['topicos']=[t for t in ix['topicos'] if t.get('_arq')!=ARQ]+[{'grupo':G,'tema':o['tema'],'palavras':o['palavras'],'nivelVerdade':o['nivelVerdade'],'_arq':ARQ,'parte':'Marguerite Porete'} for o in out]
    ix['gatilhosGrupo']=[g for g in ix['gatilhosGrupo'] if g.get('grupo')!=G]+[{'gatilhos':TG[lg],'grupo':G}]
    ix.setdefault('moldura',{})[G]={'pt':'Uma mulher queimada em 1310 por um livro sobre o amor e a liberdade da alma, e um memorial a todas as vozes silenciadas pela Inquisição. Fatos com fonte; o que é homenagem imaginada vem marcado.','en':'A woman burned in 1310 for a book about love and the freedom of the soul, and a memorial to every voice silenced by the Inquisition. Facts with sources; imagined tribute is labelled.','es':'Una mujer quemada en 1310 por un libro sobre el amor y la libertad del alma, y un memorial a todas las voces silenciadas por la Inquisición. Hechos con fuente; el homenaje imaginado va señalado.'}[lg]
    json.dump(ix,open(ip,'w'),ensure_ascii=False,indent=2)
    print(lg,len(out),'lições;',len(ix['topicos']),'tópicos')
