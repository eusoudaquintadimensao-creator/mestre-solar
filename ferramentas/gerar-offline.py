#!/usr/bin/env python3
"""Gera offline.json: lista de arquivos (caminho, bytes, hash curto) por pacote, para o 'Usar offline'.
Rode antes de cada commit que mude conteúdo:  python3 ferramentas/gerar-offline.py"""
import os,hashlib,json,re
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(R)
import subprocess as _sp;_sp.check_call(['python3','ferramentas/csp.py'])
sw=open('sw.js').read();ver=re.search(r'VERSAO = "([^"]+)"',sw).group(1)
G={'base':[],'aguia':[],'jervis':[]}
def h(p): return hashlib.sha1(open(p,'rb').read()).hexdigest()[:12]
base=['index.html','manifest.json','offline.js']+['icons/'+f for f in sorted(os.listdir('icons'))]
for p in base:
    if os.path.isfile(p): G['base'].append([p,os.path.getsize(p),h(p)])
import subprocess
for p in sorted(subprocess.check_output(['git','ls-files','-co','--exclude-standard','conteudo'],text=True).split('\n')):
        if not p or not os.path.isfile(p): continue
        f=os.path.basename(p)
        if f.startswith('.') or f.endswith('.bak'): continue
        if p.endswith('.mp3'):
            g='jervis' if '/audio-sigma/' in p else 'aguia'
        else: g='base'
        G[g].append([p,os.path.getsize(p),h(p)])
out={'versao':ver,'pacotes':{k:{'bytes':sum(x[1] for x in v),'n':len(v),'arquivos':v} for k,v in G.items()}}
json.dump(out,open('offline.json','w'),separators=(',',':'))
print(ver,{k:(v['n'],round(v['bytes']/1e6,1)) for k,v in out['pacotes'].items()})
