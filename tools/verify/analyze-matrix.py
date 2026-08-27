import json,sys,re,collections
OUT=sys.argv[1]
def load(b): return json.load(open(f'{OUT}/{b}/matrix.json'))
COMPKEYS="button input checkbox textarea switch radio badge alert dialog data-table menu select popover tooltip accordion tabs progress tag spinner avatar divider empty-state grid stack card skeleton".split()
def prefix(n):
    n=n[5:]  # strip --ui-
    for k in sorted(COMPKEYS,key=len,reverse=True):
        if n==k or n.startswith(k+'-'): return k
    return None
def token_numbers(M,placement):
    P=M['placements'][placement]; light=P['light']; 
    page=next(k for k in light if not k.startswith('__') and 'vars' in light[k])
    names=light[page]['vars'].keys(); colour=set(light[page]['colorNames'])
    comp_colour=[n for n in names if prefix(n) and n in colour]
    def changed(theme):
        t=P[theme][page]['vars']; return [n for n in comp_colour if t[n]!=light[page]['vars'][n]]
    res={'denominator':len(comp_colour)}
    for th in ('dark','acme'):
        ch=changed(th); res[th]={'changed':len(ch),'unchanged':sorted(set(comp_colour)-set(ch))}
        by=collections.defaultdict(list)
        for n in comp_colour: by[prefix(n)].append(n in ch)
        res[th]['fully']=sorted(c for c,l in by.items() if all(l)); res[th]['partly']=sorted(c for c,l in by.items() if any(l) and not all(l)); res[th]['frozen']=sorted(c for c,l in by.items() if not any(l)); res[th]['components']=len(by)
    da=P['dark-acme'][page]['vars']; d=P['dark'][page]['vars']; a=P['acme'][page]['vars']
    res['dark-acme']={'surface':da.get('--ui-color-surface'),'primary':da.get('--ui-color-primary'),'text':da.get('--ui-color-text'),'eq_dark':sum(1 for n in comp_colour if da[n]==d[n]),'eq_acme':sum(1 for n in comp_colour if da[n]==a[n]),'eq_light':sum(1 for n in comp_colour if da[n]==light[page]['vars'][n])}
    res['radius']={'root_radius':light[page]['vars'].get('--ui-radius'),'radii_md':light[page]['vars'].get('--ui-radii-md'),'acme_radius':a.get('--ui-radius'),'radius_tokens_changed_acme':[n for n in names if 'radius' in n and prefix(n) and a[n]!=light[page]['vars'][n]]}
    return res
def painted_numbers(M,placement,base='light',theme='dark'):
    P=M['placements'][placement]; rows={}
    for cid in P[base]:
        if cid.startswith('__') or 'painted' not in P[base][cid] or 'painted' not in P[theme].get(cid,{}): continue
        L=P[base][cid]['painted']; T=P[theme][cid]['painted']
        idx={}
        for e in T: idx.setdefault((e['path'],e['text'],e['inOverlay']),[]).append(e)
        tot=0; chg=0; unchanged=collections.Counter(); radii_l=set(); radii_t=set()
        for e in L:
            k=(e['path'],e['text'],e['inOverlay']); m=idx.get(k)
            if not m: continue
            t=m.pop(0)
            paint_l=(e['bg'] if not e['bg'].startswith('rgba(0, 0, 0, 0)') else None, e['color'] if e['text'] else None, e['border'])
            paint_t=(t['bg'] if not t['bg'].startswith('rgba(0, 0, 0, 0)') else None, t['color'] if t['text'] else None, t['border'])
            if not any(paint_l): continue
            tot+=1
            if paint_l!=paint_t: chg+=1
            else: unchanged[(e['path'].split('>')[-1][:40], paint_l[0] or paint_l[1] or paint_l[2])]+=1
            if e['radius']!='0px': radii_l.add(e['radius'])
            if t['radius']!='0px': radii_t.add(t['radius'])
        rows[cid]={'painted':tot,'changed':chg,'unchanged_top':unchanged.most_common(3),'radii_base':sorted(radii_l),'radii_theme':sorted(radii_t),'overlay':P[base][cid]['overlayChildren']}
    return rows
def contrast(M,placement,theme,limit=4.5):
    P=M['placements'][placement]; fails=[]
    for cid in P[theme]:
        if cid.startswith('__') or 'contrast' not in P[theme][cid]: continue
        for c in P[theme][cid]['contrast']:
            large = c['px']>=24 or (c['px']>=18.66 and int(c['weight'])>=700)
            need = 3.0 if large else limit
            if c['ratio']<need: fails.append((cid,c['ratio'],c['fg'],c['bg'],c['path'].split('>')[-1][:40],c['text']))
    return sorted(fails,key=lambda x:x[1])
if __name__=='__main__':
    for b in sys.argv[2:]:
        M=load(b)
        for pl in M['placements']:
            print(f'\n##### {b} / class on <{pl}>')
            print(json.dumps(token_numbers(M,pl),indent=None)[:3000])
            for base,theme in (('light','dark'),('light','acme'),('dark','dark-acme'),('acme','dark-acme')):
                rows=painted_numbers(M,pl,base,theme)
                themed=[c for c,r in rows.items() if r['changed']>0]; frozen=[c for c,r in rows.items() if r['painted']>0 and r['changed']==0]
                print(f'  PAINTED {base}->{theme}: components with >=1 painted colour changed: {len(themed)}/{len(rows)} | frozen: {frozen}')
                if theme in ('dark','acme') and base=='light':
                    for c,r in sorted(rows.items()): print(f'    {c:12s} painted={r["painted"]:3d} changed={r["changed"]:3d} radii={r["radii_base"]}->{r["radii_theme"]} unchanged_top={r["unchanged_top"][:2]}')
            for th in ('light','dark','acme','dark-acme'):
                f=contrast(M,pl,th); print(f'  CONTRAST {th}: {len(f)} text nodes below AA; worst:', f[:6])
            errs={th:M['placements'][pl][th].get('__errors',[]) for th in M['placements'][pl]}
            print('  ERRORS:', {k:v[:3] for k,v in errs.items() if v})
