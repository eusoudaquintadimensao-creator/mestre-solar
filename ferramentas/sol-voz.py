#!/usr/bin/env python3
"""Grava a voz do Sol 2.0 (edge-tts) com o tempo de cada palavra, para a legenda sincronizada.
PT = pt-PT-DuarteNeural (o apresentador do Conhecimento Solar, rate -6%, pitch -22Hz); EN = en-GB-RyanNeural; ES = es-ES-AlvaroNeural.
Saída: sol/voz/<lg>/<hash>.mp3 (mono 24 kHz, 32 kbps) e sol/voz/<lg>/tempos.json {hash:[duração,[início de cada palavra]]}.
Só grava o que falta. Uso: /workspace/.ttsenv/bin/python ferramentas/sol-voz.py [pt en es]"""
import asyncio,json,os,re,sys,subprocess,unicodedata,edge_tts
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(R)
VZ={'pt':('pt-PT-DuarteNeural','-6%','-22Hz'),'en':('en-GB-RyanNeural','-6%','-18Hz'),'es':('es-ES-AlvaroNeural','-6%','-18Hz')}
def nz(s): return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if unicodedata.category(c)!='Mn' and (c.isalnum()))
def alinha(texto,bs,dur):
    tk=texto.split();ts=[None]*len(tk);j=0
    for off,w in bs:
        w2=nz(w)
        if not w2: continue
        for k in range(j,min(j+6,len(tk))):
            if w2 in nz(tk[k]) or (nz(tk[k]) and nz(tk[k]) in w2):
                if ts[k] is None: ts[k]=round(off/1e7,2)
                j=k+ (1 if nz(tk[k]).endswith(w2) or len(w2)>=len(nz(tk[k])) else 0);break
    # preenche buracos por interpolação
    last=0.0
    for k in range(len(ts)):
        if ts[k] is None:
            nxt=next((ts[m] for m in range(k+1,len(ts)) if ts[m] is not None),dur)
            ts[k]=round(last+(nxt-last)*0.5,2)
        last=ts[k]
    for k in range(1,len(ts)):
        if ts[k]<ts[k-1]: ts[k]=ts[k-1]
    return ts
async def grava(sem,lg,h,txt,dirv,T,falhas):
    async with sem:
        v,rate,pitch=VZ[lg]
        for tent in range(4):
            try:
                c=edge_tts.Communicate(txt,v,rate=rate,pitch=pitch,boundary='WordBoundary')
                bs=[];buf=bytearray()
                async for ch in c.stream():
                    if ch['type']=='audio': buf+=ch['data']
                    elif ch['type']=='WordBoundary': bs.append((ch['offset'],ch['text']))
                tmp=f'/tmp/solvoz-{lg}-{h}.mp3';open(tmp,'wb').write(buf)
                out=f'{dirv}/{h}.mp3'
                subprocess.run(['ffmpeg','-y','-loglevel','error','-i',tmp,'-ac','1','-ar','24000','-b:a','32k',out],check=True);os.remove(tmp)
                dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',out]).strip())
                T[h]=[round(dur,2),alinha(txt,bs,dur)];return
            except Exception as e:
                await asyncio.sleep(2+3*tent);err=e
        falhas.append((h,str(err)[:120]))
async def main(lgs):
    for lg in lgs:
        kb=json.load(open(f'sol/kb-{lg}.json'));dirv=f'sol/voz/{lg}';os.makedirs(dirv,exist_ok=True)
        tp=f'{dirv}/tempos.json';T=json.load(open(tp)) if os.path.exists(tp) else {}
        jobs={}
        for e in kb['licoes']:
            jobs[e['h']]=e['r']
            if e['i'].startswith('mp-'):  # Marguerite: as 3 camadas
                for f in ('a','c'):
                    if e.get(f): jobs[__import__('hashlib').sha1(e[f].encode()).hexdigest()[:12]]=e[f]
        for e in kb['intencoes']: jobs[e['h']]=e['r']
        for x in json.load(open('sol/falas.json'))[lg]: jobs[__import__('hashlib').sha1(x.encode()).hexdigest()[:12]]=x
        falta={h:t for h,t in jobs.items() if not (h in T and os.path.exists(f'{dirv}/{h}.mp3'))}
        print(lg,len(jobs),'falas,',len(falta),'a gravar',flush=True)
        sem=asyncio.Semaphore(6);falhas=[];n=0
        lst=list(falta.items())
        for i in range(0,len(lst),60):
            await asyncio.gather(*[grava(sem,lg,h,t,dirv,T,falhas) for h,t in lst[i:i+60]])
            json.dump(T,open(tp,'w'),separators=(',',':'));print(lg,min(i+60,len(lst)),'/',len(lst),flush=True)
        # remove órfãos
        for f in os.listdir(dirv):
            if f.endswith('.mp3') and f[:-4] not in jobs: os.remove(f'{dirv}/{f}');T.pop(f[:-4],None)
        T={h:v for h,v in T.items() if h in jobs};json.dump(T,open(tp,'w'),separators=(',',':'))
        print(lg,'falhas',falhas[:5],len(falhas),flush=True)
asyncio.run(main(sys.argv[1:] or ['pt','en','es']))
