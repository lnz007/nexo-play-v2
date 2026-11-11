(()=>{
const $=s=>document.querySelector(s),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const LB={up:'↑',down:'↓',left:'←',right:'→',cross:'×',circle:'○',triangle:'△',square:'□',l1:'L1',l2:'L2',r1:'R1',r2:'R2',ps:'PS',mic:'Mic',options:'Opções'};
const BT=Object.keys(LB);
const KM={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right',j:'cross',k:'circle',i:'triangle',l:'square',q:'l1','1':'l2',e:'r1','3':'r2',enter:'options',p:'ps',m:'mic'};
const DEF={vis:true,op:.9,sz:1,vib:true},st={...DEF};
try{const o=JSON.parse(localStorage.getItem('nexo')||'{}');st.vis=o.vis!==false;st.op=clamp(+o.op||DEF.op,.2,1);st.sz=clamp(+o.sz||1,.7,1.3);st.vib=o.vib!==false}catch(e){}
const root=document.documentElement,ctl=$('#ctl'),panel=$('#panel'),els=[...document.querySelectorAll('[data-b]')];
function apply(){root.style.setProperty('--op',st.op);root.style.setProperty('--s',st.sz);ctl.classList.toggle('off',!st.vis);$('#o-vis').checked=st.vis;$('#o-op').value=st.op;$('#o-sz').value=st.sz;$('#o-vib').checked=st.vib;$('#tog').textContent=st.vis?'✕':'◉';$('#tog').setAttribute('aria-label',st.vis?'Ocultar controles':'Mostrar controles')}
function save(){apply();try{localStorage.setItem('nexo',JSON.stringify(st))}catch(e){}}
$('#o-vis').onchange=e=>{st.vis=e.target.checked;save()};
$('#o-op').oninput=e=>{st.op=+e.target.value;save()};
$('#o-sz').oninput=e=>{st.sz=+e.target.value;save()};
$('#o-vib').onchange=e=>{st.vib=e.target.checked;save()};
$('#reset').onclick=()=>{Object.assign(st,DEF);save()};
$('#tog').onclick=()=>{st.vis=!st.vis;save()};
$('#gear').onclick=()=>{panel.hidden=false;$('#close').focus()};
const closeP=()=>{panel.hidden=true};$('#close').onclick=closeP;panel.onclick=e=>{if(e.target===panel)closeP()};
const inp={lx:0,ly:0,rx:0,ry:0};BT.forEach(b=>inp[b]=0);
const ptr=new Map(),keys=new Set();
function recalc(){const h=new Set([...ptr.values(),...keys]);let n=false;
 for(const b of BT){const v=h.has(b)?1:0;if(v&&!inp[b])n=true;inp[b]=v}
 els.forEach(e=>e.classList.toggle('on',!!inp[e.dataset.b]));
 if(n&&st.vib&&navigator.vibrate)navigator.vibrate(12)}
let tried=false;
function unlock(){if(tried)return;tried=true;(async()=>{try{if(!document.fullscreenElement)await root.requestFullscreen({navigationUI:'hide'})}catch(e){}try{await screen.orientation?.lock?.('landscape')}catch(e){}})()}
els.forEach(el=>{const id=el.dataset.b;
 el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);ptr.set(e.pointerId,id);unlock();recalc()});
 const rel=e=>{if(ptr.delete(e.pointerId))recalc()};
 ['pointerup','pointercancel','lostpointercapture'].forEach(t=>el.addEventListener(t,rel))});
document.querySelectorAll('[data-s]').forEach(el=>{const k=el.querySelector('.knob'),[ax,ay]=el.dataset.s==='l'?['lx','ly']:['rx','ry'];let pid=null;
 const aim=e=>{const r=el.getBoundingClientRect(),h=r.width/2,nx=(e.clientX-r.left-h)/h,ny=(e.clientY-r.top-h)/h,raw=Math.hypot(nx,ny)||1,m=Math.min(1,raw),dx=nx/raw,dy=ny/raw,q=m<.12?0:(m-.12)/.88;
  inp[ax]=dx*q;inp[ay]=dy*q;k.style.transform=`translate(${dx*m*h*.5}px,${dy*m*h*.5}px)`};
 const end=e=>{if(e.pointerId!==pid)return;pid=null;inp[ax]=inp[ay]=0;k.style.transform='';el.classList.remove('on')};
 el.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;el.setPointerCapture(pid);el.classList.add('on');unlock();aim(e)});
 el.addEventListener('pointermove',e=>{if(e.pointerId===pid)aim(e)});
 ['pointerup','pointercancel','lostpointercapture'].forEach(t=>el.addEventListener(t,end))});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='escape'){closeP();return}if(!panel.hidden)return;
 if(k==='h'){if(!e.repeat){st.vis=!st.vis;save()}return}
 const id=KM[k];if(!id)return;e.preventDefault();if(!keys.has(id)){keys.add(id);recalc()}});
addEventListener('keyup',e=>{const id=KM[e.key.toLowerCase()];if(id&&keys.delete(id))recalc()});
const reset=()=>{ptr.clear();keys.clear();recalc()};addEventListener('blur',reset);
document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
// Jogo de teste
const cv=$('#game'),cx=cv.getContext('2d'),por=matchMedia('(orientation: portrait)'),hud=$('#hud');
const orb={x:0,y:0,ok:false},prev={};let W=0,H=0,trail=[],paused=false,mic=false,flash=0,motes=[];
const edge=n=>{const v=!!inp[n],e=v&&!prev[n];prev[n]=v;return e};
function size(){const d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.max(1,W*d|0);cv.height=Math.max(1,H*d|0);cx.setTransform(d,0,0,d,0,0);
 if(!orb.ok&&W){orb.x=W/2;orb.y=H*.55;orb.ok=true;motes=Array.from({length:40},()=>({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2,v:4+Math.random()*10}))}}
const col=()=>inp.cross?'#6fb3ff':inp.circle?'#ff6b7f':inp.square?'#e28bff':inp.triangle?'#6cf5b0':'#fff';
const f=v=>(v>=0?'+':'')+v.toFixed(2);let ht='';
let last=0;
function frame(t){const dt=Math.min(.05,(t-last)/1000);last=t;
 if(edge('options'))paused=!paused;if(edge('mic'))mic=!mic;if(edge('ps'))flash=1;flash=Math.max(0,flash-dt*2.5);
 trail.forEach(p=>p.l-=dt*.9);trail=trail.filter(p=>p.l>0);
 if(!por.matches&&W){
  if(!paused){let dx=inp.right-inp.left+inp.lx,dy=inp.down-inp.up+inp.ly;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}
   const sp=330*(inp.l1?.45:1)*(inp.r2?1.9:1);orb.x=clamp(orb.x+dx*sp*dt,30,W-30);orb.y=clamp(orb.y+dy*sp*dt,30,H-30);
   if(inp.r1)trail.push({x:orb.x,y:orb.y,c:col(),l:1});motes.forEach(p=>{p.y-=p.v*dt;if(p.y<0)p.y=H})}
  const g=cx.createRadialGradient(W/2,H*.6,10,W/2,H*.6,Math.max(W,H)*.75);g.addColorStop(0,'#1f5a50');g.addColorStop(.55,'#0d2a2a');g.addColorStop(1,'#050a0c');cx.fillStyle=g;cx.fillRect(0,0,W,H);
  cx.fillStyle='rgba(200,255,230,.35)';motes.forEach(p=>{cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()});
  trail.forEach(p=>{cx.globalAlpha=Math.max(0,p.l)*.7;cx.fillStyle=p.c;cx.beginPath();cx.arc(p.x,p.y,5,0,7);cx.fill()});cx.globalAlpha=1;
  if(inp.l2){cx.strokeStyle='rgba(255,255,255,.55)';cx.lineWidth=2;cx.beginPath();cx.arc(orb.x,orb.y,44,0,7);cx.stroke()}
  if(inp.rx||inp.ry){cx.strokeStyle='rgba(255,255,255,.85)';cx.lineWidth=3;cx.beginPath();cx.moveTo(orb.x,orb.y);cx.lineTo(orb.x+inp.rx*90,orb.y+inp.ry*90);cx.stroke()}
  const c=col();cx.shadowColor=c;cx.shadowBlur=24;cx.fillStyle=c;cx.beginPath();cx.arc(orb.x,orb.y,17,0,7);cx.fill();cx.shadowBlur=0;
  if(flash>0){cx.strokeStyle=`rgba(255,255,255,${flash})`;cx.lineWidth=10;cx.strokeRect(5,5,W-10,H-10)}
  if(paused){cx.fillStyle='rgba(255,255,255,.9)';cx.font='600 22px system-ui,sans-serif';cx.textAlign='center';cx.fillText('PAUSADO',W/2,H/2)}
  const h=BT.filter(b=>inp[b]).map(b=>LB[b]);
  const s=[h.length?h.join(' + '):'Nenhum comando',`E ${f(inp.lx)}, ${f(inp.ly)}   D ${f(inp.rx)}, ${f(inp.ry)}`,`Mic ${mic?'ligado':'desligado'} · ${paused?'pausado':'rodando'}`].join('\n');
  if(s!==ht){ht=s;hud.textContent=s}}
 requestAnimationFrame(frame)}
apply();size();addEventListener('resize',size);requestAnimationFrame(frame);
})();
