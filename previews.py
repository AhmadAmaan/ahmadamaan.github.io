from html import escape

def label(x,y,value,size=9,color='#c5af98',**attrs):
    more=' '.join(f'{k.replace("_","-")}="{v}"' for k,v in attrs.items())
    return f'<text x="{x}" y="{y}" font-family="ui-monospace,monospace" font-size="{size}" fill="{color}" {more}>{escape(value)}</text>'

def panel(x,y,w,h,fill='#2b2018',stroke='#69503b',radius=6):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}"/>'

def artwork(content,name):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 260" role="img" aria-label="{escape(name)}"><defs><radialGradient id="glow"><stop stop-color="#6d4730" stop-opacity=".3"/><stop offset="1" stop-color="#241a13" stop-opacity="0"/></radialGradient><pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#9a7d61" opacity=".23"/></pattern></defs><rect width="560" height="260" fill="#241a13"/><rect width="560" height="260" fill="url(#dots)"/><ellipse cx="280" cy="125" rx="240" ry="145" fill="url(#glow)"/>{content}</svg>'''

def project_visual(index):
    if index==0:
        c=label(30,30,'01 / INFERENCE TELEMETRY',9)+label(530,30,'OBSERVE THE INVISIBLE',8,text_anchor='end')
        c+='<path d="M80 132H480" stroke="#866245" stroke-dasharray="3 5"/>'
        for x,name,caption in [(44,'SDK','instrument'),(167,'OUTBOX','persist'),(290,'QUEUE','deliver'),(413,'WORKER','normalize')]:
            c+=panel(x,87,102,79)
            c+=label(x+51,112,name,10,'#eed5b6',text_anchor='middle')
            c+=label(x+51,150,caption,8,'#ad967e',text_anchor='middle')
            c+=f'<path d="M{x+18} 127h66" stroke="#70543c"/>'
        for x in [155,278,401]: c+=f'<path d="m{x-4} 122 5 5-5 5" fill="none" stroke="#d2a477"/>'
        c+='<path d="M75 187H483M75 207H483" stroke="#59412e" stroke-opacity=".5"/><path class="preview-trace" d="M75 201 105 198 125 203 153 185 180 192 210 187 237 181 260 188 286 175 312 186 340 182 365 197 390 171 416 180 443 172 482 182" fill="none" stroke="#b7c29a" stroke-width="1.7"/>'
        c+=label(30,239,'SDK → OUTBOX → QUEUE → WORKER → DASHBOARD',8)
        return artwork(c,'Conceptual inference pipeline: SDK, durable outbox, queue, worker, and telemetry')
    if index==1:
        c=label(30,30,'02 / FROM EXPERIENCE TO A PLAN',9)
        c+=panel(43,67,133,48,fill='#2d2220',stroke='#755a65')+label(57,87,'YOUR EXPERIENCE',8,'#d6becf')+label(57,101,'What you have built',8)
        c+=panel(43,133,133,48,fill='#2d2220',stroke='#755a65')+label(57,153,'THE OPPORTUNITY',8,'#d6becf')+label(57,167,'What the role needs',8)
        c+='<path d="M176 91h30v33h46M176 157h30v-33" fill="none" stroke="#957389" stroke-dasharray="3 4"/>'
        c+='<path d="m253 124 18-18 18 18-18 18z" fill="#a98da5"/><path d="m264 124 7-7 7 7-7 7z" fill="#e5d8e1"/><path d="M289 124h30" stroke="#957389"/>'
        c+=panel(329,55,180,162,fill='#18120f',stroke='#574537')
        c+=panel(323,49,180,162,fill='#382a21',stroke='#785b44')
        c+=panel(317,43,180,162,fill='#f1e5d5',stroke='#e1caae')
        c+=label(335,68,'YOUR APPLICATION PLAN',9,'#59432e')
        for y,title,w in [(95,'Experience that fits',130),(128,'Interview practice',115),(161,'Next steps',125)]:
            c+=f'<rect x="335" y="{y-7}" width="10" height="10" rx="2" fill="none" stroke="#9e7c59"/>'
            c+=label(353,y,title,8,'#6a513a')+f'<rect x="353" y="{y+10}" width="{w-18}" height="3" rx="1.5" fill="#d8c7b1"/>'
        c+=label(30,239,'REAL EXPERIENCE. EDITABLE OUTPUT. HUMAN REVIEW.',8)
        return artwork(c,'Conceptual application coach: experience and role context become an editable preparation plan')
    if index==2:
        c=label(30,30,'03 / FUELWISE',9)
        for offset in [0,20,40,60,80]:
            c+=f'<path d="M-20 {65+offset}C90 {15+offset} 122 {135+offset} 220 {96+offset}S370 {10+offset} 580 {75+offset}" fill="none" stroke="#6e543a" stroke-opacity=".27"/>'
        c+='<path d="M83 188C147 195 112 115 202 132S303 56 346 85 420 98 476 52" fill="none" stroke="#30281b" stroke-width="12"/><path d="M83 188C147 195 112 115 202 132S303 56 346 85 420 98 476 52" fill="none" stroke="#bbc6a0" stroke-width="3"/>'
        for x,y in [(83,188),(202,132),(346,85),(476,52)]:
            c+=f'<circle cx="{x}" cy="{y}" r="10" fill="#241a13" stroke="#73815e" stroke-width=".8"/><circle cx="{x}" cy="{y}" r="4" fill="#c8cfae"/>'
        c+=panel(347,187,180,42)+label(360,204,'ROUTE · STOPS · COST',9,'#e3cfb3')+label(360,219,'Road-distance validated',8)
        c+=label(30,239,'REACHABLE STOPS. EXPLICIT ASSUMPTIONS.',8)
        return artwork(c,'Illustrative road route with reachable fuel stops and validated road distances')
    if index==3:
        c=label(30,30,'04 / MERCHANTPAY',9)+label(530,30,'DEVNET / TEST TOKENS',8,text_anchor='end')
        c+=panel(42,66,148,130)+label(57,89,'PAYMENT INTENT',9,'#eed5b6')
        c+='<rect x="58" y="106" width="25" height="25" rx="5" fill="#a6866a"/><path d="m65 118 5 5 8-10" fill="none" stroke="#fff0d9" stroke-width="1.5"/>'
        c+=label(57,150,'Exact token units',8)+label(57,172,'Idempotent requests',8)
        c+='<path d="M190 129h71M281 129h35" stroke="#8c6b50" stroke-dasharray="3 5"/><circle cx="271" cy="129" r="11" fill="#344032" stroke="#839373"/><path d="m266 129 4 4 6-7" stroke="#d3dec1" fill="none"/>'
        c+=panel(317,66,201,130)+label(333,89,'VERIFY → RECONCILE',9,'#eed5b6')
        for y,title in [(118,'Finality confirmed'),(143,'Amount matched'),(168,'Ledger balanced')]:
            c+=f'<circle cx="347" cy="{y-3}" r="3" fill="#aebf97"/>'+label(359,y,title,8)
        c+=label(30,239,'A PAYMENT IS A VERIFIED STATE TRANSITION.',8)
        return artwork(c,'Conceptual payment flow from idempotent intent to verified settlement and balanced ledger')
    c=label(30,30,'05 / A TOURNAMENT OF POSSIBILITIES',9)+label(30,51,'100,000 simulations · Published experiment, June 2026',8)
    for y,name,width in [(91,'Spain',222),(126,'Argentina',204),(161,'France',117),(196,'Portugal',60)]:
        c+=label(35,y,name,9)
        c+=f'<rect class="probability-bar" x="126" y="{y-11}" width="{width}" height="13" rx="2" fill="'+('#de9e6b' if name=='Portugal' else '#9f8062')+'"/>'
    c+='<g fill="none" stroke="#8c6b50"><path d="M416 86h22v34h27M416 153h22v-33M416 182h22v35h27M416 250h22v-33M465 120h20v48h23M465 217h20v-49" transform="translate(0 -17)"/></g>'
    for x,y in [(415,69),(415,136),(415,165),(415,233),(465,103),(465,200),(508,151)]:c+=f'<circle cx="{x}" cy="{y}" r="3" fill="#c49c72"/>'
    c+=label(30,239,'PROBABILITIES, NOT CERTAINTIES.',8)
    return artwork(c,'Relative title probabilities and a conceptual tournament bracket from the June 2026 experiment')

def systems_fallback():
    def tile(x,y,color):
        return f'<path d="m{x-34} {y} 34-19 34 19v9l-34 19-34-19z" fill="#6a4a33"/><path d="m{x-34} {y} 34-19 34 19-34 19z" fill="#b38c64" stroke="#e2bd90" stroke-width=".7"/><path d="m{x-12} {y} 12-7 12 7-12 7z" fill="{color}"/>'
    c='<ellipse cx="450" cy="218" rx="300" ry="126" fill="none" stroke="#8e6748" stroke-opacity=".35"/>'
    c+='<g fill="none" stroke="#b58b62" stroke-opacity=".5"><path d="M450 200Q337 150 220 120M450 200Q560 150 680 120M450 200Q340 270 220 270M450 200Q565 270 680 270"/></g>'
    for y in [235,207,179]:
        c+=f'<path d="m374 {y} 76-36 76 36v14l-76 36-76-36z" fill="#795438"/><path d="m374 {y} 76-36 76 36-76 36z" fill="#b68c62" stroke="#dfb98e" stroke-width=".8"/>'
    c+='<path d="m423 179 27-13 27 13-27 13z" fill="#473020"/><path d="m435 179 15-7 15 7-15 7z" fill="#eac393"/>'
    for x,y,color in [(220,120,'#dbb887'),(680,120,'#e4a16d'),(220,270,'#baa5ce'),(680,270,'#a9b997')]:c+=tile(x,y,color)
    return f'<svg class="systems-sculpture" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 400" aria-hidden="true">{c}</svg>'
