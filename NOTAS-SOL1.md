# NOTAS-SOL1 — upgrade do Sol da tela principal (retomar daqui)
Backup: /workspace/backups/mestre-solar/20261115-191015-pre-sol1 (antes de tudo, HEAD 31dc074)

## Achados da análise
- "Jervis" no chip é a VOZ escolhida (sigma/Jervis), não o nome do usuário.
- Legenda sob o Sol (.sol-legenda, absolute) cobre o contador ao vivo (#ms-cont) no celular.
- "Jervis: Jervis recuando o volume…": rótulo "Jervis:" + abertura ab-086 que já começa com "Jervis". "recuando o volume" sem sentido; ab-064 "se agressar".
- Pipeline de pergunta: Na() → MSX.cmd → SOL.cmd (detectar → busca → IASOL.trata → responderBusca) → Ma().
  Gancho novo: dentro de SOL.cmd busca, `W.SOL1.trata(texto)` antes do IASOL.
- Já existem: CSP com hash, msRotuloFala, MestreSolar.render/falar/abrirPorId, SOL.ligaAnalyser.

## Plano / progresso
- [x] ferramentas/sol1-kb.py → conteudo/sol1/kb-{pt,en,es}.json (374 lições + ~600 trechos dos apps)
- [ ] conteudo/sol1/sol1.js + sol1.css (motor BM25, memória, visual reativo, volume, paleta, push-to-talk)
- [ ] gancho no index.html + legenda sem sobrepor + aberturas corrigidas
- [ ] segurança (SW escopo/navegação, CSP jsdelivr por caminho, SEGURANCA.md)
- [ ] testes (ferramentas/teste-sol1.js) celular/PC/offline
- [ ] publicar, conferir ao vivo, e-mail
