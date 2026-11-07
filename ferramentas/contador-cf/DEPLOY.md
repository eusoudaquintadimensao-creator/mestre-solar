# Contador ao vivo + Estrelas — como colocar no ar

Status (07/11 ~05:25 BRT): conta Cloudflare conectada (connector `user-Cloudflare`). Subdomínio **conhecimento-solar.workers.dev** já criado.
O deploy do Worker parou com o erro 10034: **o dono precisa verificar o e-mail da conta Cloudflare**, clicando no link que o Cloudflare enviou ou reenviando em dash.cloudflare.com → perfil.
Endereço final: **https://contador-conhecimento-solar.conhecimento-solar.workers.dev** (já está no `CONTADOR_URL` da branch).

## Caminho rápido depois da verificação (sem wrangler)
1. CallDynamicTool user-Cloudflare `execute` com `code: "$file:/workspace/contador-cf/deploy-exec.js"`. Isso sobe o script, o DO SQLite (migração v1), o ORIGENS, o segredo ADMIN_TOKEN, o cron e o workers.dev. O arquivo contém o segredo (chmod 600): nunca imprimir.
   Se mudar `worker/src/index.js`, gere o arquivo de novo (ver RETOMAR.md).
2. `node teste/live.js --zerar`: testa contra o Worker publicado (app da branch servido sob a origem real) e zera as contagens de teste via `/admin/zerar`.
3. fetch + rebase em origin/main, gerar-offline.py, VERSAO nova, ff main e push.
4. `node teste/live.js --publicado`: confere o site real e gera os prints live-site-*.png.

`POST /admin/zerar` (cabeçalho `x-admin` = segredo em /workspace/contador-cf/.admin-token) zera os 4 totais e reinicia o "desde". Só funciona sem Origin de navegador e com o segredo; sem ele devolve 404.

- Worker (backend): `/workspace/contador-cf/worker` (git local; cópia em `ferramentas/contador-cf/` no app)
- App: worktree `/workspace/contador-cf/wt`, branch `contador-estrelas` (commit local, sem push)
- Com o endereço ainda de exemplo (`SEU-SUBDOMINIO`), o painel fica escondido e o app não faz nenhum pedido ao contador. Por isso, a branch pode ir para o main antes do deploy sem quebrar nada.

## O que o dono precisa fazer (uma vez)
1. Criar uma conta gratuita no Cloudflare: https://dash.cloudflare.com/sign-up (só e-mail e senha, sem cartão).
2. Em **Workers & Pages**, aceitar o subdomínio gratuito `*.workers.dev` que o Cloudflare sugerir (ou escolher outro).
3. Autorizar o login do wrangler no navegador do computador do bot (passo 1 abaixo). Senha e códigos ele digita direto na página do Cloudflare, nunca no chat.

O plano Free basta: Durable Objects com SQLite fazem parte do Workers Free. São 100 mil pedidos por dia e 100 mil linhas gravadas por dia. Se algum dia passar disso, os pedidos falham até 00:00 UTC (21:00 em Brasília), e o app mostra os "últimos números conhecidos". Nada é cobrado e os totais não se perdem.

## Passos de deploy (no computador do bot)
```bash
cd /workspace/contador-cf/worker
npx wrangler login            # abre o navegador; o dono entra na conta Cloudflare e clica "Allow"
npx wrangler whoami           # confere a conta
npx wrangler deploy           # cria o Worker + Durable Object (migração v1, SQLite) + cron diário
# a saída mostra o endereço, ex.: https://contador-conhecimento-solar.<subdominio>.workers.dev
curl -s https://contador-conhecimento-solar.<subdominio>.workers.dev/totais   # deve responder {"visitas":0,...}
```
Alternativa sem o login pelo navegador: o dono cria um API Token ("Edit Cloudflare Workers") no painel e entrega por formulário seguro, nunca pelo chat. Depois é só rodar `CLOUDFLARE_API_TOKEN=... npx wrangler deploy`.

## Ligar no app
```bash
cd /workspace/contador-cf/wt               # branch contador-estrelas
# 1) trocar a constante (único lugar; o CSP lê dela):
sed -i 's#https://contador-conhecimento-solar.SEU-SUBDOMINIO.workers.dev#https://contador-conhecimento-solar.<subdominio>.workers.dev#' index.html
# 2) atualizar a VERSAO no sw.js (ex.: ms-AAAA-MM-DD-HHMM-contador-ligado)
# 3) recalcular CSP + offline (obrigatório depois de mexer em script inline):
python3 ferramentas/gerar-offline.py
sed -n 5p index.html | grep -o 'wss://[^ ;"]*'     # deve mostrar o host do Worker
git commit -am "Contador: liga o Worker publicado"
```

## Publicar (só com o OK do dono)
```bash
git fetch origin && git rebase origin/main     # se o main andou: refazer gerar-offline.py e a VERSAO
cd /workspace/ms-pages/push && git merge --ff-only contador-estrelas && git push origin main
# conferir: curl -s https://eusoudaquintadimensao-creator.github.io/mestre-solar/sw.js | head -2   (VERSAO nova)
```
Depois de publicar, abrir o app no celular. O painel aparece embaixo do Sol, com "Ao vivo".

## O que é guardado (privacidade)
- Só 4 números (visitas, instalações, downloads, estrelas), a data de início e um backup diário desses números.
- "Agora no app" vem dos WebSockets abertos, que não são gravados. Sem WebSocket, o app manda a cada 30 s um token aleatório da aba. Esse token não fica salvo no aparelho, não liga a ninguém e é apagado em 70 s.
- Não lê nem grava IP, user agent, cookie, nome, localização ou referer. O Worker só olha os cabeçalhos `Origin` (CORS), `Upgrade` e `Content-Length`.
- Logs e observabilidade desligados no `wrangler.toml` (`observability.enabled=false`, `logs.enabled=false`, `logpush=false`, `preview_urls=false`).
- CORS e WebSocket só para `https://eusoudaquintadimensao-creator.github.io`. Pedidos de outra origem, ou sem origem, recebem 403 ao tentar somar.
- Nenhuma chave secreta no app.

## Endpoints
- `GET /totais` → `{visitas, instalacoes, downloads, estrelas, online, desde, ultimoBackup}` (exportação; funciona com curl)
- `GET /backups?n=60` → fotos diárias (cron `0 3 * * *` = 00:00 em Brasília; guarda 800 dias)
- `POST /visita`, `/instalacao`, `/download`, `/estrela {"d":1|-1}`, `/presenca {"tok":"…"}` (só do app)
- `GET /ws` → WebSocket de presença (hibernação; ping "p"/"o" a cada 25 s; timeout de 75 s; mais de 20 mensagens por minuto fecha a conexão)
- Anti-abuso: no máximo +1 por pedido, totais nunca abaixo de 0, teto global por minuto em cada contador, corpo de no máximo 200 bytes e no máximo 20 mil conexões.

## Testes locais (refazer quando mexer)
```bash
/workspace/contador-cf/worker/dev.sh &                 # wrangler dev local em 127.0.0.1:8787 (sem conta)
/workspace/contador-cf/teste/prepara-site.sh           # cópia do app apontando para 127.0.0.1:8787
(cd /workspace/contador-cf/teste/site && python3 -m http.server 18795 --bind 127.0.0.1 &)
cd /workspace/contador-cf/teste && node teste.js && node abuso.js    # 39/39 e 12/12
```
