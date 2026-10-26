# ☀️ Mestre Solar · Portal do Conhecimento (app)

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
