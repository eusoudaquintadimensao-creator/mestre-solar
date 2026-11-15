# Segurança do Conhecimento Solar (app + IA do Sol)

Revisão de 15/11/2026, junto com o Sol da tela principal (Sol 1). O app é estático (GitHub Pages): não há servidor nosso,
banco de dados, login nem senha. A IA do Sol roda no aparelho e só busca nas lições e nos apps do próprio Conhecimento Solar.

## O que foi verificado e o resultado

| Item | Como foi verificado | Resultado |
|---|---|---|
| XSS (texto da pessoa ou da base virando HTML) | Auditoria dos usos de `innerHTML` (62 ocorrências) do `index.html` e dos `.js` de `conteudo/`, `sol/`, `marguerite/`; teste com `<img onerror>`, `<script>` e `<b onmouseover>` digitados para o Sol | Nenhum texto da pessoa vai para `innerHTML`. Mensagens usam `textContent`; Sol 2.0 e legendas escapam (`esc`/`escapeHtml`). O Sol 1 só usa `textContent`. Teste: nada executou, nada foi inserido. |
| Injeção de instruções na IA ("ignore as instruções…") | Teste na conversa | O Sol 1 não executa nem renderiza nada da entrada: ele só procura na base. Fora do conteúdo, ele diz que não está na base (não inventa). As IAs no aparelho (Chrome/WebLLM) são opcionais e a saída delas também entra como texto puro. |
| Content-Security-Policy | `ferramentas/csp.py` | Já existia (scripts inline só com hash sha256). **Apertada:** `script-src` do jsDelivr só em `/npm/` (antes qualquer caminho, e `/gh/` serve qualquer repositório do GitHub); `connect-src` e `media-src` do jsDelivr só em `/gh/eusoudaquintadimensao-creator/`; saíram os hosts da IA externa que está bloqueada (pollinations, openai, groq, googleapis, localhost). **Nova CSP** no memorial `marguerite/`. |
| Iframes (Rede de App, Radar, Águia English) | Leitura das tags | `sandbox` e `allow` mínimos já estavam; `referrerpolicy` estrito. Ver "o que fica" sobre a mesma origem. |
| Links em nova aba | Busca por `target="_blank"` e `window.open` | Todos com `rel="noopener noreferrer"`. |
| Dados salvos (localStorage) | Teste com perfil e volume estragados | A "rede de segurança" do topo do app valida o formato e agora inclui as chaves novas (`ms-sol-nome-v1`, `ms-sol1-*`, `ms-sol2-v1`). O Sol 1 valida cada campo (nome só letras até 30, tom de uma lista, números com limite). |
| Service worker (escopo e cache) | Leitura + teste offline | **Corrigido:** abrir outra página do app (ex.: `conteudo/tabela-*.html`) gravava essa página no lugar do `index.html`, e o app offline abria a página errada. Agora cada página guarda o próprio endereço. **Corrigido:** o SW só cuida de endereços dentro de `/mestre-solar/` (o github.io do autor é uma origem só para todos os repositórios) e só guarda resposta 200 da própria origem, sem redirecionamento. |
| Clickjacking | Teste com o app dentro de um iframe de outra origem | O GitHub Pages não permite mandar `frame-ancestors`/`X-Frame-Options` (cabeçalhos) e a meta tag não vale para isso. **Novo:** anti-moldura em JS: dentro de site que não é da família (github.io do autor, `*.conhecimento-solar.workers.dev`, homemcinza.com, `*.grok.me`) o app fica coberto por um botão "Abrir o Conhecimento Solar". |
| Scripts de terceiros | Busca por `<script src>` externos | Nenhum script externo carrega sozinho. Só a IA Livre (opcional, Ajustes) importa `@mlc-ai/web-llm@0.2.86` do jsDelivr, com versão fixa. |
| Segredos no repositório | Varredura do histórico inteiro (102 commits) por chaves de Google, OpenAI, GitHub, Groq, Slack, AWS, Hugging Face, NVIDIA, chaves privadas e atribuições de token/senha | Nada encontrado. Nenhum arquivo `.env`, `.pem` ou de credenciais. |
| Dependências | `package.json` do repositório | Só `ferramentas/contador-cf` (Worker do contador), com `wrangler` como dependência de desenvolvimento; nada disso vai para o site. O contador só aceita a origem do app (CORS por lista). |

## O que fica (limites honestos de um site estático)

- **Mesma origem com os outros sites do autor.** Tudo em `eusoudaquintadimensao-creator.github.io` (Conhecimento Solar, Radar, Águia English, outros repositórios) é uma origem só: compartilham `localStorage` e o `sandbox` dos iframes do Radar e do Águia English não isola nada. O app não guarda senha nem dado sensível, só preferências. A solução definitiva é um domínio próprio para o app (ex.: `app.homemcinza.com`) ou mover os apps para domínios separados.
- **Cabeçalhos de segurança** (HSTS, `frame-ancestors`, `X-Content-Type-Options`, `Permissions-Policy`) não podem ser configurados no GitHub Pages. O anti-moldura em JS é uma proteção parcial (navegador sem JS não é protegido). Colocar o app atrás de um Worker da Cloudflare (como já é feito no Homem Cinza) permitiria mandar esses cabeçalhos.
- **IA Livre (WebLLM)**: `import()` dinâmico não aceita `integrity` (SRI). A versão é fixa e a CSP limita ao `/npm/` do jsDelivr, mas confiamos no jsDelivr para esse módulo opcional. Para eliminar, hospedar o pacote no próprio repositório.
- **`style-src 'unsafe-inline'`** continua, porque o app usa muitos estilos inline. Sem script inline sem hash, o risco é baixo.
- **Wikipédia** só é consultada quando a pessoa toca em "Buscar na Wikipédia (internet)" depois que o Sol diz que o assunto não está na base.

## Como conferir de novo

```
python3 ferramentas/csp.py                 # recalcula a CSP depois de mudar script inline
NODE_PATH=<node_modules com puppeteer-core> node ferramentas/teste-sol1.js   # 50 perguntas + XSS + offline + anti-moldura
```
