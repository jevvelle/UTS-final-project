// ---------- Island explorer ----------
(()=>{
const $=id=>document.getElementById(id),cv=$('cv'),ctx=cv.getContext('2d');
const css2=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const C={dark:css2('--dark'),moss:css2('--moss'),beige:css2('--beige'),rosy:css2('--rosy'),mid:css2('--mid'),gold:css2('--gold'),goldD:css2('--gold-d')};
const WW=1600,WH=1000,IX=800,IY=500,RX=700,RY=420;
const S=[{id:'p2',t:'From the Editor',x:250,y:520},{id:'p3',t:'Ready for Anything',x:450,y:300},{id:'p4',t:'The Shape of Me',x:720,y:200},{id:'p6',t:'How I Think',x:1010,y:220},{id:'p7',t:'Quiet Steps',x:1260,y:340},{id:'p8',t:'Eight Roles',x:1330,y:580},{id:'p10',t:'Not Yet',x:1060,y:760},{id:'p11',t:'Still Sailing at 28',x:720,y:790}];
const TREES=[[380,420],[560,450],[900,380],[1150,500],[1160,330],[560,640],[900,650],[430,720],[1200,690],[830,330],[1450,450],[300,330],[1000,540],[640,520],[560,260],[1130,230]];
const P={x:340,y:610,dir:1,t:0,mv:false},keys={},seen=new Set();
let W,H,dpr,sc,running=false,last=0,time=0,near=null,target=null,joy={x:0,y:0},modalOpen=false,endShown=false,medal=false,winOpen=false;
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
 if(seen.size===8&&!endShown){endShown=true;showWin()}
}
$('close').onclick=closePanel;
function showWin(){winOpen=modalOpen=true;$('win').querySelector('.medal').style.display='';$('win').classList.add('open')}
$('claim').onclick=()=>{
 medal=true;$('winT').textContent='Medal claimed';
 $('winP').textContent='Your character is now wearing it. Thank you for walking through my magazine.';
 $('winB').innerHTML='<button class="btn" id="keep">Keep exploring</button><button class="btn alt" id="ending">Read the back cover</button>';
 $('prog').textContent='Adventure complete';
 $('keep').onclick=()=>{winOpen=modalOpen=false;$('win').classList.remove('open')};
 $('ending').onclick=()=>{$('win').classList.remove('open');winOpen=false;openPanel('p12')};
};
function go(s){if(s.id==='chest')chest();else openPanel(s.id)}
function note(t,p){winOpen=modalOpen=true;$('win').querySelector('.medal').style.display='none';$('winT').textContent=t;$('winP').textContent=p;
 $('winB').innerHTML='<button class="btn" id="okb">Close</button>';$('okb').onclick=()=>{winOpen=modalOpen=false;$('win').classList.remove('open')};$('win').classList.add('open')}
function chest(){seen.size<8?note('The chest is locked','Visit all 8 stops first, then come back.'):note('Sabaody Archipelago','You have explored the gateway to the New World. Thank you for taking the time.')}
$('act').onclick=()=>{if(near&&!modalOpen)go(near)};
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if(winOpen)return;
 if(k==='escape'&&modalOpen){closePanel();return}
 if(modalOpen)return;
 if((k==='e'||k==='enter'||k===' ')&&near){e.preventDefault();go(near);return}
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
 const M=260,f=(p,v,w)=>v>=w+2*M?(w-v)/2:Math.max(-M,Math.min(w+M-v,p-v/2));
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
 [...S,CHEST].forEach(s=>{const d=Math.hypot(s.x-P.x,s.y-P.y);if(d<best){best=d;near=s}});
 $('act').style.display=(near&&!modalOpen)?'block':'none';
 if(near)$('act').textContent='Open: '+near.t;
}
function loop(now){
 if(!running)return;
 const dt=Math.min(.05,(now-last)/1000);last=now;time+=dt;update(dt);draw();requestAnimationFrame(loop);
}

// ---- drawing: Sabaody-inspired mangrove archipelago ----
const BARK='#6B4A2B',BARK2='#4A3320',NAME='Sir Clemuel';
const CHEST={id:'chest',t:'Treasure chest',x:800,y:600};
const MT=[[330,410,1,'41'],[590,430,1.1,'42'],[1030,430,1,'43'],[1180,520,1.1,'44'],[470,720,1,'45'],[1180,740,1.1,'46'],[800,525,1.5,'1']];
const ISL=[[130,130,.7,'7'],[1470,130,.7,'8'],[130,880,.7,'9'],[1480,880,.7,'10']];
const COL={H:'#1B1B1F',S:'#EDA77F',m:'#B96A55',G:'#17171A',e:'#17171A',T:'#2F7F7A',B:'#8A8F99',P:'#1F2433',O:'#4A2F25'};
const BODY=[
'.....HHHHHHH.....',
'....HHHHHHHHH....',
'...HHHHHHHHHHH...',
'..HHHHHHHHHHHHH..',
'..HHSSSSSSSSSHH..',
'..HHSGGSSSGGSHH..',
'..HHGSeGSGeSGHH..',
'..HHGSSGSGSSGHH..',
'..HHSGGSSSGGSHH..',
'...HSSSSSSSSSH...',
'....SSSSmSSSS....',
'.....SSSSSSS.....',
'......SSSSS......',
'...TTTTTTTTTTT...',
'..TTTTTTTTTTTTT..',
'..TTTTTTTTTTTTT..',
'..TTTTTTTTTTTTT..',
'..SSTTTTTTTTTSS..',
'..SSTTTTTTTTTSS..',
'..SSBBBBBBBBBSS..',
'....PPPPPPPPP....',
'....PPPPPPPPP....'];
function mkBody(map,glasses){const c=document.createElement('canvas');c.width=17;c.height=BODY.length;const x=c.getContext('2d');
 BODY.forEach((r,y)=>[...r].forEach((ch,i)=>{if(!glasses&&(ch==='G'||ch==='e'))ch='S';if(map[ch]){x.fillStyle=map[ch];x.fillRect(i,y,1,1)}}));return c}
const bodyCv=mkBody(COL,true);
// original crew (no nameplates). Lines are quotes from the magazine, edit freely.
const NPCS=[
{x:650,y:590,hair:'#7A3E2B',shirt:'#D3968C',gl:0,line:'No captain reaches the end of the sea without a crew.'},
{x:735,y:665,hair:'#E8C45A',shirt:'#F7F4D5',gl:1,line:'It is okay not to do everything.'},
{x:865,y:665,hair:'#2B1B3A',shirt:'#839958',gl:0,line:'I am not a master of everything but I am ready.'},
{x:950,y:590,hair:'#8A8F99',shirt:'#105666',gl:1,line:'Stay for the payoff.'}];
NPCS.forEach(n=>n.cv=mkBody({...COL,H:n.hair,T:n.shirt},n.gl));

function ell(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fillStyle=fill;ctx.fill()}
function bigTree(x,y,s,n){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ell(0,8,64,16,'rgba(10,51,35,.28)');
 ctx.lineCap='round';ctx.strokeStyle=BARK2;ctx.lineWidth=9;
 [-3,-2,-1,1,2,3].forEach(i=>{ctx.beginPath();ctx.moveTo(i*24,6);ctx.quadraticCurveTo(i*17,-34,i*5,-70);ctx.stroke()});
 ctx.fillStyle=BARK;ctx.beginPath();ctx.moveTo(-20,-30);ctx.lineTo(-13,-120);ctx.lineTo(13,-120);ctx.lineTo(20,-30);ctx.closePath();ctx.fill();
 ctx.strokeStyle=BARK2;ctx.lineWidth=3;[-6,0,6].forEach(i=>{ctx.beginPath();ctx.moveTo(i,-40);ctx.lineTo(i*.6,-115);ctx.stroke()});
 [[0,-150,42],[-36,-132,30],[36,-132,30],[-14,-170,28],[18,-168,26]].forEach(([a,b,r])=>ell(a,b,r,r*.85,C.dark));
 [[-10,-160,12],[26,-144,10]].forEach(([a,b,r])=>ell(a,b,r,r*.8,C.mid));
 ctx.fillStyle=C.gold;ctx.beginPath();ctx.roundRect(-14,-92,28,17,4);ctx.fill();
 ctx.fillStyle=C.dark;ctx.font='700 12px Inter,Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n,0,-83);
 ctx.restore();
}
function ship(x,y,flip,kind){
 const pir=kind==='pirate';
 ctx.save();ctx.translate(x,y+Math.sin(time*1.5+x*.01)*3);ctx.scale(flip,1);
 ctx.fillStyle=pir?'#1B1B1F':C.beige;ctx.beginPath();ctx.moveTo(-62,0);ctx.lineTo(62,0);ctx.lineTo(46,30);ctx.lineTo(-46,30);ctx.closePath();ctx.fill();
 ctx.fillStyle=pir?C.rosy:C.mid;ctx.fillRect(-58,7,116,5);
 ctx.strokeStyle=BARK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-98);ctx.stroke();
 ctx.fillStyle=pir?'#1B1B1F':C.beige;ctx.beginPath();ctx.moveTo(-34,-90);ctx.lineTo(34,-90);ctx.lineTo(30,-16);ctx.lineTo(-30,-16);ctx.closePath();ctx.fill();
 if(pir){ctx.fillStyle=C.beige;ell(0,-62,10,10,C.beige);ctx.fillRect(-5,-54,10,7);ell(-4,-63,2.4,2.4,'#1B1B1F');ell(4,-63,2.4,2.4,'#1B1B1F');
  ctx.strokeStyle=C.beige;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-15,-44);ctx.lineTo(15,-30);ctx.moveTo(15,-44);ctx.lineTo(-15,-30);ctx.stroke()}
 else{ctx.fillStyle=C.mid;ctx.fillRect(-32,-70,64,6);ctx.fillRect(-31,-48,62,6)}
 ctx.fillStyle=pir?C.rosy:C.mid;ctx.beginPath();ctx.moveTo(0,-98);ctx.lineTo(26,-91);ctx.lineTo(0,-84);ctx.fill();
 ctx.restore();
}
function pad(s,i){
 const v=seen.has(s.id),isNear=near===s;
 ctx.beginPath();ctx.arc(s.x,s.y,isNear?54:48,0,7);ctx.fillStyle=v?C.rosy:C.beige;ctx.fill();
 ctx.lineWidth=5;ctx.strokeStyle=isNear?C.rosy:C.dark;ctx.stroke();
 ctx.strokeStyle=C.dark;ctx.fillStyle=C.dark;ctx.textAlign='center';ctx.textBaseline='middle';
 if(v){ctx.lineWidth=7;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(s.x-14,s.y);ctx.lineTo(s.x-4,s.y+11);ctx.lineTo(s.x+16,s.y-12);ctx.stroke()}
 else{ctx.font='900 34px Playfair Display,Georgia,serif';ctx.fillText(i+1,s.x,s.y+2)}
 ctx.font='600 15px Inter,Arial,sans-serif';const w=ctx.measureText(s.t).width+22;
 ctx.fillStyle=C.dark;ctx.beginPath();ctx.roundRect(s.x-w/2,s.y+58,w,28,14);ctx.fill();
 ctx.fillStyle=C.beige;ctx.fillText(s.t,s.x,s.y+73);
}
function chestDraw(){
 const x=CHEST.x,y=CHEST.y,open=seen.size===8;
 ctx.save();ctx.translate(x,y);
 if(open)ell(0,-14,38+Math.sin(time*3)*4,24,'rgba(232,196,90,.3)');
 ell(0,4,26,7,'rgba(10,51,35,.3)');
 ctx.fillStyle=BARK;ctx.fillRect(-20,-22,40,24);ctx.fillStyle=BARK2;ctx.beginPath();ctx.roundRect(-22,-36,44,16,6);ctx.fill();
 ctx.fillStyle=C.gold;ctx.fillRect(-22,-24,44,4);ctx.beginPath();ctx.arc(0,-14,5,0,7);ctx.fillStyle=open?C.gold:C.goldD;ctx.fill();
 ctx.restore();
}
function bubble(n){
 if(Math.hypot(n.x-P.x,n.y-P.y)>110)return;
 ctx.font='600 13px Inter,Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 const w=ctx.measureText(n.line).width+22,by=n.y-104;
 ctx.fillStyle=C.beige;ctx.beginPath();ctx.roundRect(n.x-w/2,by-14,w,28,14);ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=C.dark;ctx.stroke();
 ctx.fillStyle=C.dark;ctx.fillText(n.line,n.x,by+1);
}
function drawSprite(cv,x,y,dir,mv,t,med){
 const px=2.5,top=18-28*px,left=-8.5*px;
 ctx.save();ctx.translate(x,y);ell(0,17,20,6,'rgba(10,51,35,.3)');ctx.scale(dir,1);
 const s=mv?Math.sin(t*14):0;ctx.translate(0,mv?Math.abs(s)*-2:0);
 const leg=(col,sx,lift)=>{const lx=left+col*px,ly=top+22*px,h=(4-lift)*px;
  ctx.fillStyle=COL.P;ctx.fillRect(lx,ly-.5,4*px,h+.5);ctx.fillStyle=COL.O;ctx.fillRect(left+sx*px,ly+h,5*px,2*px)};
 leg(4,3,mv?Math.max(0,s)*1.6:0);leg(9,9,mv?Math.max(0,-s)*1.6:0);
 ctx.imageSmoothingEnabled=false;ctx.drawImage(cv,left,top,17*px,BODY.length*px);
 if(med){ctx.fillStyle=C.rosy;ctx.beginPath();ctx.moveTo(-7,-19);ctx.lineTo(0,-8);ctx.lineTo(7,-19);ctx.lineTo(3,-19);ctx.lineTo(0,-13);ctx.lineTo(-3,-19);ctx.fill();
  ctx.beginPath();ctx.arc(0,-7,6.5,0,7);ctx.fillStyle=C.gold;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle=C.goldD;ctx.stroke()}
 ctx.restore();
}
function plate(){
 const top=18-28*2.5;ctx.save();ctx.translate(P.x,P.y+top-32);
 ctx.font='600 13px Inter,Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 const w=ctx.measureText(NAME).width+22;
 ctx.fillStyle=C.dark;ctx.beginPath();ctx.roundRect(-w/2,0,w,24,12);ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=C.rosy;ctx.stroke();
 ctx.fillStyle=C.beige;ctx.fillText(NAME,0,12.5);ctx.restore();
}
function draw(){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=C.mid;ctx.fillRect(0,0,cv.width,cv.height);
 const c=cam(),k=dpr*sc;ctx.setTransform(k,0,0,k,-c.x*k,-c.y*k);
 ctx.strokeStyle='rgba(247,244,213,.13)';ctx.lineWidth=2;
 for(let y=-300;y<1300;y+=50){ctx.beginPath();for(let x=-300;x<1900;x+=40){const yy=y+Math.sin(x/60+time*1.4+y)*4;x===-300?ctx.moveTo(x,yy):ctx.lineTo(x,yy)}ctx.stroke()}
 // ships at sea: one sails by each way, others anchored
 ship(-350+(time*38)%2300,1090,1,'pirate');ship(1950-(time*30)%2300,-160,-1,'navy');
 ship(-130,300,1,'pirate');ship(1730,820,-1,'navy');ship(1700,120,-1,'pirate');
 // islets (the archipelago)
 ISL.forEach(([x,y])=>{ell(x,y,84,48,'rgba(247,244,213,.25)');ell(x,y,76,42,C.beige);ell(x,y,62,32,C.moss)});
 // main island
 ell(IX,IY,RX+22,RY+22,'rgba(247,244,213,.25)');ell(IX,IY,RX,RY,C.beige);ell(IX,IY,RX-36,RY-36,C.moss);
 ctx.setLineDash([2,12]);ctx.lineCap='round';ctx.lineWidth=5;ctx.strokeStyle=C.beige;ctx.beginPath();
 S.forEach((s,i)=>i?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y));ctx.stroke();ctx.setLineDash([]);
 // your ship at the dock
 ctx.save();ctx.translate(62,640+Math.sin(time*1.5)*4);
 ctx.fillStyle=C.rosy;ctx.beginPath();ctx.moveTo(-50,0);ctx.lineTo(50,0);ctx.lineTo(34,32);ctx.lineTo(-34,32);ctx.closePath();ctx.fill();
 ctx.strokeStyle=C.dark;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-78);ctx.stroke();
 ctx.fillStyle=C.beige;ctx.beginPath();ctx.moveTo(4,-74);ctx.lineTo(4,-8);ctx.lineTo(42,-8);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(-4,-60);ctx.lineTo(-4,-8);ctx.lineTo(-30,-8);ctx.closePath();ctx.fill();ctx.restore();
 S.forEach((s,i)=>pad(s,i));
 // things that stand up are drawn back to front
 const E=[];
 MT.forEach(([x,y,s,n])=>E.push({y,f:()=>bigTree(x,y,s,n)}));
 ISL.forEach(([x,y,s,n])=>E.push({y,f:()=>bigTree(x,y,s,n)}));
 NPCS.forEach(n=>E.push({y:n.y,f:()=>drawSprite(n.cv,n.x,n.y,1,false,0,false)}));
 E.push({y:CHEST.y,f:chestDraw});
 E.push({y:P.y,f:()=>{drawSprite(bodyCv,P.x,P.y,P.dir,P.mv,P.t,medal);plate()}});
 E.sort((a,b)=>a.y-b.y).forEach(e=>e.f());
 // floating bubbles rise from the ground
 for(let i=0;i<36;i++){
  const sp=18+(i%5)*6,p=((time*sp+i*53)%230)/230,bx=170+((i*197)%1260)+Math.sin(time*1.2+i)*8,by=300+((i*131)%560)-p*230,r=5+(i%4)*3;
  ctx.globalAlpha=Math.min(1,(1-p)*1.6);ctx.beginPath();ctx.arc(bx,by,r,0,7);ctx.fillStyle='rgba(247,244,213,.16)';ctx.fill();
  ctx.lineWidth=1.6;ctx.strokeStyle='rgba(247,244,213,.85)';ctx.stroke();
  ctx.beginPath();ctx.arc(bx-r*.35,by-r*.35,r*.22,0,7);ctx.fillStyle='rgba(247,244,213,.9)';ctx.fill();ctx.globalAlpha=1;
 }
 NPCS.forEach(bubble);
}

resize();

})();