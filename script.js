// ---------- icons (inline SVG, no emojis) ----------
const P={
 compass:'<circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6z"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 ship:'<path d="M12 3v13M12 4l7 11h-7M12 7l-6 8h6M3 19c3 2 6 2 9 0s6-2 9 0"/>',
 calc:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>',
 mirror:'<ellipse cx="12" cy="9" rx="6" ry="7"/><path d="M12 16v6M8 22h8"/>',
 book:'<path d="M2 4h7a3 3 0 013 3v14a2 2 0 00-2-2H2zM22 4h-7a3 3 0 00-3 3v14a2 2 0 012-2h8z"/>',
 pencil:'<path d="M17 3l4 4L8 20l-5 1 1-5z"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 shoe:'<path d="M2 18h20v-2c0-2-1-3-3-3l-5-1-3-3-4 2c-3 0-5 2-5 5z"/>',
 people:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 15c3 0 5 2 5 5"/>',
 leaf:'<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8"/>',
 suitcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>',
 chip:'<rect x="6" y="6" width="12" height="12" rx="1"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
 family:'<circle cx="8" cy="7" r="2.5"/><circle cx="16" cy="7" r="2.5"/><circle cx="12" cy="14" r="2"/><path d="M3 20c0-3 2-5 5-5M21 20c0-3-2-5-5-5M9 21c0-2 1-3 3-3s3 1 3 3"/>'
};
const ic=n=>'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+P[n]+'</svg>';
document.querySelectorAll('[data-ic]').forEach(e=>e.insertAdjacentHTML('afterbegin',ic(e.dataset.ic)));

const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// ---------- HEXACO radar + score cards ----------
const F=[['Honesty-Humility',4.36],['Emotionality',3.09],['Extraversion',4.49],['Agreeableness',4.49],['Conscientiousness',5.67],['Openness',4.26]];
const sub={Emotionality:[['Fearfulness 6.32',1],['Anxiety 2.87'],['Dependence 2.98']],Agreeableness:[['Patience 5.08',1],['Altruism 3.71']],Conscientiousness:[['Prudence 6.09',1],['Organization 5.81',1]],Openness:[['Aesthetic Appreciation 6.15',1]]};
(function(){
 const ink=css('--dark'),tom=css('--rosy'),mid=css('--mid');
 let s='<svg viewBox="0 0 420 380" style="width:100%;max-width:460px;display:block;margin:auto">',c=210,m=185,r=120,pts=[];
 const pt=(i,k)=>{const a=-Math.PI/2+i*Math.PI/3;return[c+Math.cos(a)*k,m+Math.sin(a)*k]};
 for(let k=1;k<=7;k++)s+='<polygon fill="none" stroke="'+ink+'33" points="'+F.map((_,i)=>pt(i,r*k/7).join(',')).join(' ')+'"/>';
 F.forEach((f,i)=>{
  const [x,y]=pt(i,r*f[1]/7),[ex,ey]=pt(i,r),[lx,ly]=pt(i,r+36);pts.push(x+','+y);
  s+='<line x1="'+c+'" y1="'+m+'" x2="'+ex+'" y2="'+ey+'" stroke="'+ink+'33"/>'
   +'<text x="'+lx+'" y="'+ly+'" text-anchor="middle" font-size="12" font-weight="600" fill="'+ink+'">'+f[0]+'</text>'
   +'<text x="'+lx+'" y="'+(ly+15)+'" text-anchor="middle" font-size="12" font-weight="700" fill="'+mid+'">'+f[1]+(f[1]===5.67?' \u2605':'')+'</text>';
 });
 s+='<polygon points="'+pts.join(' ')+'" fill="'+tom+'AA" stroke="'+ink+'" stroke-width="2"/></svg>';
 document.getElementById('radar').innerHTML=s;
 document.getElementById('cards').innerHTML=F.map(f=>'<div class="card"><div class="row"><span>'+f[0]+'</span><span>'+f[1]+'</span></div><div class="bar'+(f[1]>5?' top':'')+'"><i style="width:'+f[1]/7*100+'%"></i></div><div class="chips">'+(sub[f[0].split('-')[0]]||[]).map(x=>'<span'+(x[1]?' class="hi"':'')+'>'+x[0]+'</span>').join('')+'</div></div>').join('');
})();

// ---------- Multiple intelligences chart ----------
const M=[['Logical / Mathematical',84,'calc'],['Intrapersonal',72,'mirror'],['Verbal / Linguistic',62,'book'],['Visual / Spatial',62,'pencil'],['Musical',41,'music'],['Bodily / Kinesthetic',41,'shoe'],['Interpersonal',34,'people'],['Naturalist',22,'leaf']];
document.getElementById('mi').innerHTML=M.map((x,i)=>'<div class="col"><div class="bw">'+ic(x[2])+'<div class="b'+(i<2?' top':'')+'" style="--v:'+x[1]+'">'+x[1]+'%</div></div><div class="lbl">'+x[0]+'</div></div>').join('');

