#!/usr/bin/env python3
"""Recalcula a Content-Security-Policy do index.html (hash sha256 de cada <script> inline).
SEMPRE rode depois de editar qualquer <script> inline do index.html (gerar-offline.py já chama este)."""
import re,hashlib,base64,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=os.path.join(R,'index.html')
s=open(P,encoding='utf-8').read()
hs=[]
# Contador ao vivo: libera SÓ o host do Worker (https + wss), lido da constante CONTADOR_URL do index.html
mc=re.search(r'var CONTADOR_URL="(https?)://([^"/]+)',s)
cont=(" "+mc.group(1)+"://"+mc.group(2)+" "+("wss" if mc.group(1)=="https" else "ws")+"://"+mc.group(2)) if mc else ""
for m in re.finditer(r'<script>(.*?)</script>',s,re.S):
    hs.append("'sha256-"+base64.b64encode(hashlib.sha256(m.group(1).encode('utf-8')).digest()).decode()+"'")
pol="; ".join([
 "default-src 'self'",
 "script-src 'self' "+" ".join(hs)+" https://cdn.jsdelivr.net 'wasm-unsafe-eval'",
 "style-src 'self' 'unsafe-inline'",
 "img-src 'self' data: blob: https://*.wikimedia.org https://*.wikipedia.org",
 "media-src 'self' blob: data: https://cdn.jsdelivr.net https://raw.githubusercontent.com",
 "font-src 'self' data:",
 "connect-src 'self' https://*.wikipedia.org https://api.wikimedia.org https://abacus.jasoncameron.dev https://cdn.jsdelivr.net https://raw.githubusercontent.com https://huggingface.co https://*.huggingface.co https://*.hf.co https://api.open-meteo.com https://geocoding-api.open-meteo.com https://api.gdeltproject.org https://text.pollinations.ai https://api.openai.com https://api.groq.com https://generativelanguage.googleapis.com http://localhost:* http://127.0.0.1:*"+cont,
 "frame-src https://rede-de-app.conhecimento-solar.workers.dev",
 "worker-src 'self' blob:",
 "manifest-src 'self'",
 "object-src 'none'",
 "base-uri 'self'",
 "form-action 'self'"])
tag='<meta http-equiv="Content-Security-Policy" content="'+pol+'">'
s2=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>\n?','',s)
s2=s2.replace('<meta charset="UTF-8">','<meta charset="UTF-8">\n'+tag,1)
s2=s2.replace('<meta name="referrer" content="strict-origin-when-cross-origin">\n','')
s2=s2.replace(tag,tag+'\n<meta name="referrer" content="strict-origin-when-cross-origin">',1)
open(P,'w',encoding='utf-8').write(s2);print('CSP:',len(hs),'scripts inline com hash')
