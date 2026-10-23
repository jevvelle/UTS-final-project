// ---------- Island explorer ----------
(()=>{
const $=id=>document.getElementById(id),cv=$('cv'),ctx=cv.getContext('2d');
const css2=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const C={dark:css2('--dark'),moss:css2('--moss'),beige:css2('--beige'),rosy:css2('--rosy'),mid:css2('--mid')};
const WW=1600,WH=1000,IX=800,IY=500,RX=700,RY=420;
const S=[{id:'p2',t:'From the Editor',x:250,y:520},{id:'p3',t:'Ready for Anything',x:450,y:300},{id:'p4',t:'The Shape of Me',x:720,y:200},{id:'p6',t:'How I Think',x:1010,y:220},{id:'p7',t:'Quiet Steps',x:1260,y:340},{id:'p8',t:'Eight Roles',x:1330,y:580},{id:'p10',t:'Not Yet',x:1060,y:760},{id:'p11',t:'Still Sailing at 28',x:720,y:790}];
const TREES=[[380,420],[560,450],[900,380],[1150,500],[1160,330],[560,640],[900,650],[430,720],[1200,690],[830,330],[1450,450],[300,330],[1000,540],[640,520],[560,260],[1130,230]];
const P={x:340,y:610,dir:1,t:0,mv:false},keys={},seen=new Set();
let W,H,dpr,sc,running=false,last=0,time=0,near=null,target=null,joy={x:0,y:0},modalOpen=false,endShown=false;
const touch=matchMedia('(pointer:coarse)').matches;
$('hint').textContent=touch?'Drag the joystick or tap the map to walk. Reach a pad, then tap Open.':'Arrow keys or WASD to walk. Reach a pad and press E.';

function resize(){dpr=window.devicePixelRatio||1;W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;sc=Math.min(W,H)/520;sc=Math.max(sc,.75)}
addEventListener('resize',resize);

// ---- modes ----
function setMode(m){document.body.className=m;running=(m==='play');window.scrollTo(0,0);if(running){resize();last=performance.now();requestAnimationFrame(loop)}}
$('goPlay').onclick=()=>setMode('play');$('goRead').onclick=()=>setMode('read');
$('hudRead').onclick=()=>setMode('read');$('switch').onclick=()=>setMode('play');

// ---- panels ----
function openPanel(id){
 const src=$(id);if(!src)return;
 const c=src.cloneNode(true);c.removeAttribute('id');
 $('mbody').innerHTML='';$('mbody').appendChild(c);
 $('modal').classList.add('open');$('modal').scrollTop=0;modalOpen=true;
 if(id!=='p12'){seen.add(id);$('prog').textContent=seen.size+' of 8 stops'}
}
function closePanel(){
 $('modal').classList.remove('open');modalOpen=false;
 if(seen.size===8&&!endShown){endShown=true;openPanel('p12')}
}
$('close').onclick=closePanel;
$('act').onclick=()=>{if(near&&!modalOpen)openPanel(near.id)};
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if(k==='escape'&&modalOpen){closePanel();return}
 if(modalOpen)return;
 if((k==='e'||k==='enter'||k===' ')&&near){e.preventDefault();openPanel(near.id);return}
 if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
 keys[k]=true;target=null;
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});

// ---- touch: joystick + tap to walk ----
const jb=$('joy'),kn=$('knob');let jid=null;
function jmove(e){const r=jb.getBoundingClientRect(),dx=e.clientX-(r.left+60),dy=e.clientY-(r.top+60),d=Math.hypot(dx,dy)||1,m=Math.min(d,50);
 joy.x=dx/d*m/50;joy.y=dy/d*m/50;kn.style.transform='translate('+joy.x*40+'px,'+joy.y*40+'px)';target=null}
jb.addEventListener('pointerdown',e=>{jid=e.pointerId;jb.setPointerCapture(jid);jmove(e)});
jb.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e)});
const jend=e=>{if(e.pointerId===jid){jid=null;joy.x=joy.y=0;kn.style.transform=''}};
jb.addEventListener('pointerup',jend);jb.addEventListener('pointercancel',jend);
cv.addEventListener('pointerdown',e=>{if(modalOpen)return;const c=cam();target={x:e.clientX/sc+c.x,y:e.clientY/sc+c.y}});

// ---- loop ----
function cam(){const vw=W/sc,vh=H/sc;
 const f=(p,v,w)=>v>=w?(w-v)/2:Math.max(0,Math.min(w-v,p-v/2));
 return{x:f(P.x,vw,WW),y:f(P.y,vh,WH)}}
function update(dt){
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 dx+=joy.x;dy+=joy.y;
 if(!dx&&!dy&&target){const tx=target.x-P.x,ty=target.y-P.y,d=Math.hypot(tx,ty);if(d<6)target=null;else{dx=tx/d;dy=ty/d}}
 const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}
 P.mv=m>.05&&!modalOpen;
 if(P.mv){P.x+=dx*230*dt;P.y+=dy*230*dt;P.t+=dt;if(Math.abs(dx)>.2)P.dir=dx>0?1:-1}
 const nx=(P.x-IX)/(RX-45),ny=(P.y-IY)/(RY-45),d=nx*nx+ny*ny;
 if(d>1){const k=1/Math.sqrt(d);P.x=IX+nx*k*(RX-45);P.y=IY+ny*k*(RY-45)}
 near=null;let best=80;
 S.forEach(s=>{const d=Math.hypot(s.x-P.x,s.y-P.y);if(d<best){best=d;near=s}});
 $('act').style.display=(near&&!modalOpen)?'block':'none';
 if(near)$('act').textContent='Open: '+near.t;
}
function loop(now){
 if(!running)return;
 const dt=Math.min(.05,(now-last)/1000);last=now;time+=dt;update(dt);draw();requestAnimationFrame(loop);
}

// ---- drawing ----
function ell(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fillStyle=fill;ctx.fill()}
function draw(){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=C.mid;ctx.fillRect(0,0,cv.width,cv.height);
 const c=cam(),k=dpr*sc;ctx.setTransform(k,0,0,k,-c.x*k,-c.y*k);
 ctx.strokeStyle='rgba(247,244,213,.13)';ctx.lineWidth=2;
 for(let y=-100;y<1100;y+=50){ctx.beginPath();for(let x=-200;x<1800;x+=40){const yy=y+Math.sin(x/60+time*1.4+y)*4;x===-200?ctx.moveTo(x,yy):ctx.lineTo(x,yy)}ctx.stroke()}
 ell(IX,IY,RX+22,RY+22,'rgba(247,244,213,.25)');ell(IX,IY,RX,RY,C.beige);ell(IX,IY,RX-36,RY-36,C.moss);
 // trail
 ctx.setLineDash([2,12]);ctx.lineCap='round';ctx.lineWidth=5;ctx.strokeStyle=C.beige;ctx.beginPath();
 S.forEach((s,i)=>i?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y));ctx.stroke();ctx.setLineDash([]);
 TREES.forEach(([x,y])=>{ell(x,y+14,22,8,'rgba(10,51,35,.25)');ctx.fillStyle=C.dark;ctx.fillRect(x-3,y-4,6,18);ell(x,y-14,22,20,C.dark);ell(x-6,y-18,9,8,C.mid)});
 ship();
 S.forEach((s,i)=>pad(s,i));
 player();
}
function ship(){
 ctx.save();ctx.translate(62,640+Math.sin(time*1.5)*4);
 ctx.fillStyle=C.rosy;ctx.beginPath();ctx.moveTo(-50,0);ctx.lineTo(50,0);ctx.lineTo(34,32);ctx.lineTo(-34,32);ctx.closePath();ctx.fill();
 ctx.strokeStyle=C.dark;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-78);ctx.stroke();
 ctx.fillStyle=C.beige;ctx.beginPath();ctx.moveTo(4,-74);ctx.lineTo(4,-8);ctx.lineTo(42,-8);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(-4,-60);ctx.lineTo(-4,-8);ctx.lineTo(-30,-8);ctx.closePath();ctx.fill();ctx.restore();
}
function pad(s,i){
 const v=seen.has(s.id),isNear=near===s;
 ctx.beginPath();ctx.arc(s.x,s.y,isNear?54:48,0,7);ctx.fillStyle=v?C.rosy:C.beige;ctx.fill();
 ctx.lineWidth=5;ctx.strokeStyle=isNear?C.rosy:C.dark;ctx.stroke();
 ctx.strokeStyle=C.dark;ctx.fillStyle=C.dark;
 if(v){ctx.lineWidth=7;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(s.x-14,s.y);ctx.lineTo(s.x-4,s.y+11);ctx.lineTo(s.x+16,s.y-12);ctx.stroke()}
 else{ctx.font='900 34px Playfair Display,Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(i+1,s.x,s.y+2)}
 ctx.font='600 15px Inter,Arial,sans-serif';const w=ctx.measureText(s.t).width+22;
 ctx.fillStyle=C.dark;ctx.beginPath();ctx.roundRect(s.x-w/2,s.y+58,w,28,14);ctx.fill();
 ctx.fillStyle=C.beige;ctx.fillText(s.t,s.x,s.y+73);
}
function player(){
 ctx.save();ctx.translate(P.x,P.y);ell(0,14,18,7,'rgba(10,51,35,.3)');
 ctx.scale(P.dir,1);
 const sw=P.mv?Math.sin(P.t*14)*6:0,bob=P.mv?Math.abs(Math.sin(P.t*14))*-2:0;
 ctx.translate(0,bob);
 ctx.fillStyle=C.dark;ctx.fillRect(-9,4,7,14+sw*.4);ctx.fillRect(2,4,7,14-sw*.4);        // legs
 ctx.fillStyle=C.mid;ctx.beginPath();ctx.roundRect(-13,-22,26,30,7);ctx.fill();           // shirt
 ctx.fillStyle=C.rosy;ctx.fillRect(-17,-20,5,16+sw*.5);ctx.fillRect(12,-20,5,16-sw*.5);    // arms
 ell(0,-34,13,13,'#F1C9A0');                                                               // head
 ctx.fillStyle=C.dark;ctx.beginPath();ctx.ellipse(0,-39,13,9,0,Math.PI,0);ctx.fill();     // hair
 ctx.strokeStyle=C.dark;ctx.lineWidth=2;                                                   // glasses
 ctx.beginPath();ctx.arc(-6,-34,5,0,7);ctx.moveTo(11,-34);ctx.arc(6,-34,5,0,7);ctx.moveTo(-1,-34);ctx.lineTo(1,-34);ctx.stroke();
 ctx.restore();
}
resize();

})();