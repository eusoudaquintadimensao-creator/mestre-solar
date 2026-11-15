# ☀️ Conhecimento Solar · Portal do Conhecimento (app)

Um assistente com voz e a cara do JARVIS. Ele ensina mistérios, história e sabedoria seguindo a regra da **verdade calculada**: o que é comprovado, ele afirma; o que é crença, ele atribui a quem acredita; o que ninguém sabe, ele admite. Funciona no celular e no computador, pode ser instalado como app (PWA) e continua funcionando sem internet depois do primeiro uso.

**Abrir o app:** https://eusoudaquintadimensao-creator.github.io/mestre-solar/

## O que vem na pasta

| Arquivo | Para que serve |
|---|---|
| `index.html` | O app inteiro, leve (~148 KB). Traz o visual, o motor, o JARVIS e uma base mínima de 15 ensinamentos. |
| `conteudo/` | A base completa: `indice.json`, `grupos/*.json` (carregados só quando você abre o tema), `audio/*.mp3` (a voz gravada), `perfis.json`, `jornada.json`, `frases.json`, `glossario.json`. |
| `manifest.json`, `sw.js`, `icons/` | O que transforma a página em app instalável e offline. |
| `prints/` | Telas de exemplo do app. |

## Como o app encontra o conteúdo

No topo do `index.html` há um bloco **CONFIGURAÇÃO**, legível e editável. O app tenta, em ordem:

1. **`./conteudo/`**, a pasta ao lado do `index.html` (servida pelo GitHub Pages)
2. **jsDelivr** (CDN rápida e gratuita do GitHub): `https://cdn.jsdelivr.net/gh/eusoudaquintadimensao-creator/mestre-solar@main/conteudo/`
3. **raw.githubusercontent.com**, o arquivo cru do GitHub
4. **a base mínima embutida**, para o app nunca ficar mudo

Cada parte que baixa fica guardada no aparelho. Se a internet cair, o que você já abriu continua disponível.

## Publicação

Este repositório é publicado pelo **GitHub Pages** (Settings → Pages → branch `main`, pasta raiz) em https://eusoudaquintadimensao-creator.github.io/mestre-solar/. O endereço usa HTTPS, então o app pode ser instalado no celular e funciona offline.

## Atualizar ensinamentos sem republicar o app

Edite o JSON em `conteudo/grupos/` (ou o `indice.json`) direto no GitHub. O `index.html` não muda.
- A jsDelivr guarda cópias por até 12 horas. Para ver a mudança na hora, abra `https://purge.jsdelivr.net/gh/eusoudaquintadimensao-creator/mestre-solar@main/conteudo/indice.json` (e o arquivo do grupo editado).
- No aparelho, o app mostra primeiro o que já tem guardado e atualiza em segundo plano. A novidade aparece na abertura seguinte.

Cada ensinamento segue este formato: `tema`, `palavras` (gatilhos), `camada1`/`camada2`/`camada3` (os 3 níveis de profundidade), `fontes` (links), `nivelVerdade` (selos) e `seguir` (sugestões).

## Os selos da verdade calculada

| Selo | Significado |
|---|---|
| ✅ Comprovado | fato histórico ou científico documentado |
| 📜 Tradição | o que uma tradição diz, atribuído a ela |
| 🔭 Hipótese | debatida, ainda não comprovada |
| ❓ Desconhecido | ninguém sabe ainda |
| ⚠️ Mito | crença popular comprovadamente falsa |

Toque no selo para ver a legenda. Diga **"qual a fonte?"** ou **"como você sabe isso?"** para ver de onde veio a última resposta, e **"mitos"** para a lista de mitos derrubados (de todos os lados).

## JARVIS: conversa e tempo real

- **"bom dia"** traz hora, clima, hoje na história e 3 manchetes, sempre com fonte e link.
- Comandos: **clima**, **clima em Curitiba**, **previsão de amanhã**, **notícias**, **notícias sobre X**, **hoje na história**.
- Ele aprende conversando: **"me chamo..."**, **"moro em..."**, **"gosto de..."**, **"prefiro tom direto"** ou **"tom acolhedor"**. Para apagar, diga **"esquecer meus dados"**. Tudo fica só no seu aparelho.
- Fontes gratuitas, sem chave: Open-Meteo (clima), Wikipédia (Eventos atuais, notícias em destaque, "neste dia"). Ele nunca inventa notícia: quando uma fonte falha, tenta a próxima ou diz que não conseguiu. Os dados ficam guardados por 30 minutos.

## IA Livre (opcional): sendo honesto

Em **⚙️ Ajustes → IA Livre**, o app pode baixar uma IA que roda **dentro do navegador** (WebLLM, modelo Qwen2.5 1.5B, cerca de 1 GB, baixado uma única vez).
- Precisa de **WebGPU**: Chrome ou Edge recentes no computador, ou Chrome Android mais novo. Sem WebGPU, o app avisa e segue com a base do Portal e a Wikipédia.
- É uma IA pequena: rápida e privada, mas pode errar. Ela responde **com base nos ensinamentos do Portal** (ela os recebe junto com a pergunta) e é instruída a marcar o selo de verdade de cada afirmação. Mesmo assim, confira as fontes.
- Ordem das respostas: base do Portal → Wikipédia → IA Livre.

### Ollama (IA no seu computador, mais forte)

1. Instale o Ollama (ollama.com) e rode `ollama pull qwen2.5:1.5b` (ou um modelo maior, como `qwen2.5:7b`).
2. Libere o acesso do navegador. Defina a variável `OLLAMA_ORIGINS` com o endereço do app (ou `*`, só para testar) e reinicie o Ollama:
   - Windows: `setx OLLAMA_ORIGINS "*"`
   - Mac: `launchctl setenv OLLAMA_ORIGINS "*"`
   - Linux: `OLLAMA_ORIGINS="*" ollama serve`
3. No app, abra ⚙️ Ajustes → **Usar Ollama** (endereço padrão `http://localhost:11434`).

Observação: um app publicado em HTTPS pode ser impedido pelo navegador de falar com `http://localhost`. Nesse caso, abra o app localmente (`python -m http.server` na pasta) para usar o Ollama.

## Novidades de novembro/2026: Sol 2.0, Marguerite Porete e visual 2.0

### ☀️ Sol 2.0 (`sol/`): a IA offline do app
Abrir: https://eusoudaquintadimensao-creator.github.io/mestre-solar/sol/ (aba **Sol 2.0** no app, a primeira da barra).
- **Responde só com as lições do app** (374 lições + respostas fixas sobre o próprio app), no aparelho, sem internet e sem servidor. Busca BM25 com acentos normalizados, radicais, frases-gatilho de cada lição e checagem de cobertura: se a pergunta não está nas lições, ele diz que não sabe e mostra os temas mais próximos.
- **Voz do Sol gravada** (Duarte em PT, Ryan em EN, Álvaro em ES) com **legenda palavra por palavra** (tempo exato de cada palavra vindo do próprio sintetizador). Também dá para escolher a voz da Águia Primordial (gravações do app, PT) ou a voz do aparelho (botão 🎙️).
- **Conversa com memória**: "fale mais" (aprofundar), "contemplar", "qual a fonte?", perguntas com "ele/ela/isso" usam o último tema, "o que eu já perguntei?", "me chamo …" (grava em `ms-sol-nome-v1`, o mesmo nome do app).
- **Constelação do Conhecimento** (botão ✦): cada lição é uma estrela; as que você explorou ficam acesas. Toque numa estrela para perguntar.
- **Bússola do Sol**: a sugestão dourada ✦ é a próxima estrela ainda apagada no tema que você mais explora.
- Universo em movimento (imagem HD + estrelas que aceleram quando o Sol fala) e o Sol pulsa com o volume da voz.
- Teste: `node ferramentas/teste-sol.js` (36 perguntas PT/EN/ES, celular, computador e modo sem internet; precisa de puppeteer-core e Chrome).

Arquivos: `sol/index.html`, `sol/sol.js`, `sol/sol.css`, `sol/kb-{pt,en,es}.json` (gerado), `sol/voz/<lg>/<hash>.mp3` + `tempos.json` (gerado), `sol/falas.json`, `sol/img/`.
Atualizar depois de mudar lições: `python3 ferramentas/sol-kb.py` e `/workspace/.ttsenv/bin/python ferramentas/sol-voz.py pt en es` (só grava o que falta).

### 🕯️ Memorial Marguerite Porete (`marguerite/`)
Mesmo conteúdo do memorial do Águia Primordial English, com a identidade do Conhecimento Solar (`marg-cs.css`): história em 8 partes com narração PT/EN da Aurora e legenda sincronizada, as palavras dela (manuscrito de Chantilly), memorial das vítimas da Inquisição com faixas publicadas e fontes, vela, reflexão e o livro original (só edições em domínio público). As imagens dela são **representações artísticas** (não existe retrato autêntico) e as fontes dizem que ela enfrentou o fogo com calma e que a multidão chorou, não que sorriu.
As 9 lições do tema **Marguerite Porete e a Inquisição** (PT/EN/ES) estão no índice do app (`ferramentas/marguerite-licoes.py`), então o Sol do app e o Sol 2.0 respondem sobre ela.

### 🦅 Radar Águia Solar (aba no app)
O [Radar Águia Solar](https://eusoudaquintadimensao-creator.github.io/radar-aguia-solar/) entra no Conhecimento Solar pela aba **Radar Águia** (`#radar`): o app ao vivo em iframe, com o aviso de simulação visível e um botão para abrir em nova aba. Também há um cartão em **Nossas criações** (dentro da aba Rede de App). O Sol 2.0 responde "o que é o Radar Águia Solar" com o que o próprio Radar descreve: IA gratuita da NVIDIA, cenário mundial e simulador com dinheiro fictício (conteúdo educativo, não é recomendação de investimento).

### 🦅 Águia Primordial English (aba no app)
O [Águia Primordial English](https://eusoudaquintadimensao-creator.github.io/aguia-primordial-english/) entra no Conhecimento Solar pela aba **Águia English** (`#aguia-english`): o site ao vivo em iframe, com o selo "Escola de Inglês Cinza · 100% grátis", um botão para abrir em nova aba e um link para o [aplicativo original](https://zippy-pilot-pine-lotus.grok.me). Também há um cartão em **Nossas criações**. O Sol 2.0 responde "o que é o Águia Primordial English" com o que o próprio site descreve (6.239 palavras, 63 temas, voz em inglês e em português). Na conversa, "abrir o inglês" ou "abrir a águia english" abre a aba.

### Visual 2.0 (`conteudo/ms-2088.css` e `conteudo/ms-2088.js`)
Universo realista atrás do céu animado, bordas HUD ciano/ouro nas mensagens, abas novas **Sol 2.0**, **Marguerite**, **Radar Águia** e **Águia English**, atalho "SOL 2.0 · IA OFFLINE" junto do Sol (computador), dica de rolagem na barra de abas do celular. Escrever "abrir o memorial", "Sol 2.0", "abrir o radar" ou "abrir o inglês" na conversa abre a página ou a aba correspondente. Para voltar ao visual anterior basta remover as duas linhas que carregam esses arquivos no `index.html`.

### ☀ Compartilhar
No topo do app há um sol realista pulsante. Toque para compartilhar o Portal (menu nativo do aparelho, ou uma folha com WhatsApp, Telegram, X, Facebook, e-mail e copiar o link). Segure cerca de 600 ms para copiar só o link; aparece o aviso "Link copiado ☀". A prévia do link (WhatsApp e outras redes) usa `img/og-conhecimento-solar.jpg` (1200×630, JPEG).

O service worker agora guarda as páginas `sol/` e `marguerite/` com o próprio endereço (antes, qualquer página aberta era guardada no lugar do `index.html`).

## Instalar no celular

- **Android (Chrome):** menu ⋮ → *Instalar app* ou *Adicionar à tela inicial*.
- **iPhone (Safari):** Compartilhar → *Adicionar à Tela de Início*.

## Testar no computador

```
cd mestre-solar-app
python -m http.server 8000
```
Depois abra http://localhost:8000. Abrir o arquivo direto (`file://`) também funciona, mas sem modo offline.

## Privacidade

Nada sai do aparelho além das buscas que você mesmo pede (Wikipédia, clima, notícias). Nome, cidade, caminho, favoritos e histórico ficam no `localStorage` do navegador. Para apagar tudo, use **⚙️ Ajustes → Limpar**.

## IA externa (bloqueada até segunda ordem)

Interruptor único em `index.html`: `var IA_EXTERNA_BLOQUEADA = true;` (logo antes de `msOllamaOk`).
Com `true`, ficam bloqueados: "Conectar o Sol à internet" (Gemini/Groq/OpenAI/Pollinations) e o endereço de Ollama
nos Ajustes. As configurações salvas no aparelho não são apagadas, só ignoradas. Continuam: Sol offline, Gemini Nano
do Chrome (no aparelho) e IA Livre (WebLLM, no aparelho).
Para liberar: mude para `false`, devolva ao `connect-src` do CSP `https://text.pollinations.ai https://api.openai.com
https://api.groq.com https://generativelanguage.googleapis.com http://localhost:* http://127.0.0.1:*`, rode
`python3 ferramentas/gerar-offline.py` e suba a `VERSAO` do `sw.js`.
