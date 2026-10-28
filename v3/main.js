import {WIDTH,HEIGHT,FLOOR,FPS,CORE,MOVES,FIGHTERS,getFighter} from './roster.js';
import {createMatch,resetRound,step,moveFrameInfo} from './engine.js';
import {drawSprite,drawPortrait} from './art.js';
import {drawArena} from './stage.js';

const $=id=>document.getElementById(id);
const ctx=$('arena').getContext('2d'),keys=new Set(),touches=new Set();
let mode='cpu',difficulty='normal',picks=['azur','nara'],game=null,paused=false,sfx=true;
let lastTime=0,accumulator=0,ticker=0,audio=null,debug=false,seenResult=false;
const KEY={
 KeyA:[0,'left'],KeyD:[0,'right'],KeyW:[0,'jump'],KeyS:[0,'guard'],
 KeyF:[0,'light'],KeyG:[0,'heavy'],KeyH:[0,'special'],KeyU:[0,'super'],
 ArrowLeft:[1,'left'],ArrowRight:[1,'right'],ArrowUp:[1,'jump'],ArrowDown:[1,'guard'],
 KeyJ:[1,'light'],KeyK:[1,'heavy'],KeyL:[1,'special'],KeyO:[1,'super']
};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function sound(freq=200,duration=.11,wave='triangle',volume=.035){
 if(!sfx)return;
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume().catch(()=>{});
  const osc=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
  osc.type=wave;osc.frequency.setValueAtTime(freq,now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.48),now+duration);
  gain.gain.setValueAtTime(volume,now);
  gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);osc.stop(now+duration+.01);
 }catch{}
}
function card(f,slot){
 const b=document.createElement('button');b.type='button';b.className='fighter';
 b.style.setProperty('--color',f.color);
 b.classList.toggle('selected',picks[slot]===f.id);
 b.setAttribute('aria-label',f.name+'، '+f.title);
 b.setAttribute('aria-pressed',picks[slot]===f.id?'true':'false');
 b.innerHTML='<div class="fighter-details"><span class="fighter-index"></span><h3></h3><div class="title"></div><p></p><span class="ability"></span></div><canvas width="260" height="260" aria-hidden="true"></canvas><span class="tick">✓</span>';
 b.querySelector('.fighter-index').textContent=slot===0?'مقاتل 01 / PLAYER ONE':'مقاتل 02 / PLAYER TWO';
 b.querySelector('h3').textContent=f.name;
 b.querySelector('.title').textContent=f.title+' · '+f.subtitle;
 b.querySelector('p').textContent=f.description;
 b.querySelector('.ability').textContent='✦ '+f.signature;
 const c=b.querySelector('canvas').getContext('2d');drawPortrait(c,f.id,131,262,1.05);
 b.addEventListener('click',()=>{
  picks[slot]=f.id;
  if(mode==='cpu'&&slot===0)picks[1]=f.id==='azur'?'nara':'azur';
  renderSelection();sound(330,.08,'sine',.02);
 });
 return b;
}
function renderSelection(){
 const root=$('roster');root.replaceChildren();
 for(const f of FIGHTERS)root.append(card(f,0));
 const second=$('p2Roster');second.replaceChildren();
 for(const f of FIGHTERS){
  const b=document.createElement('button');b.type='button';b.className='mini-fighter'+(f.id===picks[1]?' active':'');
  b.textContent=f.name+' · '+f.title;b.setAttribute('aria-pressed',f.id===picks[1]?'true':'false');
  b.addEventListener('click',()=>{picks[1]=f.id;renderSelection();sound(450,.08,'sine',.02)});
  second.append(b);
 }
 $('p2Section').hidden=mode!=='duel';
 $('difficultyRow').hidden=mode!=='cpu';
 $('nameOne').textContent=getFighter(picks[0]).name;
 $('nameTwo').textContent=getFighter(picks[1]).name;
 for(const [canvas,id] of [[$('miniOne'),picks[0]],[$('miniTwo'),picks[1]]]){
  const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);
  drawPortrait(c,id,105,233,.9);
 }
 for(const b of document.querySelectorAll('[data-mode]')){
  const on=b.dataset.mode===mode;b.classList.toggle('selected',on);
  b.setAttribute('aria-pressed',String(on));
 }
 for(const b of document.querySelectorAll('[data-diff]')){
  const on=b.dataset.diff===difficulty;b.classList.toggle('active',on);
  b.setAttribute('aria-pressed',String(on));
 }
}
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{mode=b.dataset.mode;if(mode==='cpu')picks[1]=picks[0]==='azur'?'nara':'azur';renderSelection()});
for(const b of document.querySelectorAll('[data-diff]'))b.addEventListener('click',()=>{difficulty=b.dataset.diff;renderSelection()});
renderSelection();
function buildTouch(){
 const root=$('touch');root.replaceChildren();
 for(let p=0;p<(mode==='duel'?2:1);p++){
  const panel=document.createElement('div');panel.className='touch-set';
  const title=document.createElement('span');title.className='touch-title';title.textContent='المقاتل '+(p+1);panel.append(title);
  for(const [key,text] of [['left','◀'],['right','▶'],['jump','↑'],['guard','صدّ'],['light','سريعة'],['heavy','ثقيلة'],['special','خاصة'],['super','خارقة']]){
   const btn=document.createElement('button');btn.type='button';btn.textContent=text;
   if(key==='special'||key==='super')btn.classList.add('special');
   btn.setAttribute('aria-label','اللاعب '+(p+1)+' '+text);
   const token=p+':'+key;
   btn.addEventListener('pointerdown',e=>{
    if(!game||paused||game.phase!=='fight')return;
    e.preventDefault();try{btn.setPointerCapture(e.pointerId)}catch{}
    touches.add(token);btn.classList.add('pressed');
   });
   const up=e=>{touches.delete(token);btn.classList.remove('pressed');if(e)e.preventDefault()};
   btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);
   btn.addEventListener('lostpointercapture',()=>up());
   panel.append(btn);
  }
  root.append(panel);
 }
}
function inputFor(p){
 const data={left:false,right:false,jump:false,guard:false,light:false,heavy:false,special:false,super:false};
 for(const [code,[slot,action]] of Object.entries(KEY)){
  if(slot===p&&keys.has(code))data[action]=true;
 }
 for(const action of Object.keys(data))if(touches.has(p+':'+action))data[action]=true;
 return data;
}
function begin(){
 game=createMatch({mode,p1:picks[0],p2:picks[1],difficulty});seenResult=false;paused=false;
 keys.clear();touches.clear();accumulator=0;lastTime=performance.now();
 $('selection').hidden=true;$('battle').hidden=false;
 $('intermission').hidden=true;$('pauseLayer').hidden=true;
 $('controlsTwo').hidden=mode!=='duel';buildTouch();
 $('battleHeading').textContent=getFighter(picks[0]).name+' في مواجهة '+getFighter(picks[1]).name;
 window.scrollTo({top:0,behavior:'instant'});
 if(!ticker)ticker=requestAnimationFrame(loop);
}
$('playBtn').addEventListener('click',()=>{begin();sound(400,.25,'sawtooth',.03)});
function toMenu(){
 game=null;paused=false;keys.clear();touches.clear();$('battle').hidden=true;$('selection').hidden=false;
 $('intermission').hidden=true;$('pauseLayer').hidden=true;renderSelection();
 window.scrollTo({top:0,behavior:'instant'});
}
$('exitBtn').addEventListener('click',toMenu);
$('menuBtn').addEventListener('click',toMenu);
$('pauseMenuBtn').addEventListener('click',toMenu);
$('restartBtn').addEventListener('click',begin);
$('advanceBtn').addEventListener('click',()=>{
 if(!game||game.phase!=='roundOver')return;
 resetRound(game);seenResult=false;$('intermission').hidden=true;
 keys.clear();touches.clear();lastTime=performance.now();accumulator=0;
});
function pause(force){
 if(!game||game.phase==='matchOver'||game.phase==='roundOver')return;
 paused=typeof force==='boolean'?force:!paused;
 $('pauseLayer').hidden=!paused;keys.clear();touches.clear();
 accumulator=0;lastTime=performance.now();
}
$('pauseBtn').addEventListener('click',()=>pause());
$('resumeBtn').addEventListener('click',()=>pause(false));
$('soundBtn').addEventListener('click',()=>{
 sfx=!sfx;$('soundBtn').textContent=sfx?'المؤثرات: تشغيل':'المؤثرات: صامت';
 $('soundBtn').setAttribute('aria-pressed',String(sfx));sound(600,.07,'sine',.023);
});
window.addEventListener('keydown',e=>{
 if(!game)return;
 if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(!e.repeat)pause();return}
 if(e.code==='KeyB'){if(!e.repeat)debug=!debug;return}
 if(KEY[e.code]){e.preventDefault();keys.add(e.code)}
},{passive:false});
window.addEventListener('keyup',e=>{
 keys.delete(e.code);if(game&&KEY[e.code])e.preventDefault();
},{passive:false});
window.addEventListener('blur',()=>{keys.clear();touches.clear();if(game&&!paused&&game.phase==='fight')pause(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game&&!paused&&game.phase==='fight')pause(true)});
function eventSound(events){
 for(const e of events){
  if(e.type==='hit')sound(e.move==='super'?100:e.move==='heavy'?138:195,e.move==='super'?.24:.105,'sawtooth',.055);
  if(e.type==='block')sound(320,.09,'triangle',.027);
  if(e.type==='attack'&&e.move==='special')sound(410,.17,'sawtooth',.027);
  if(e.type==='attack'&&e.move==='super')sound(630,.32,'sine',.047);
  if(e.type==='guardbreak')sound(87,.26,'sawtooth',.07);
  if(e.type==='fight')sound(580,.21,'triangle',.05);
  if(e.type==='matchOver')sound(710,.3,'sine',.05);
 }
}
function nextView(){
 const g=game;if(!g||seenResult||!['roundOver','matchOver'].includes(g.phase))return;
 seenResult=true;$('intermission').hidden=false;
 const winner=g.roundWinner,champ=getFighter(g.fighters[winner].id),end=g.phase==='matchOver';
 $('dialogEyebrow').textContent=end?'انتهت المباراة — الأفضل من ثلاث':'نهاية الجولة '+g.round;
 $('dialogTitle').textContent=champ.name+(end?' يفوز بالمباراة!':' ينتصر!');
 $('dialogDesc').textContent='النتيجة: '+g.wins[0]+' — '+g.wins[1]+' · '+champ.title+(end?' · يمكنك إعادة المباراة أو اختيار مقاتل آخر.':' · استعد للجولة التالية.');
 $('advanceBtn').hidden=end;$('advanceBtn').textContent='الجولة '+(g.round+1)+' ←';
}
function line(c,x,y,x2,y2,col,w=2){
 c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
}
function text(c,value,x,y,size,color,align='left',weight=800){
 c.font=weight+' '+size+'px system-ui, sans-serif';c.fillStyle=color;
 c.textAlign=align;c.textBaseline='middle';c.fillText(value,x,y);
}
function rr(c,x,y,w,h,r,col,edge=null){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=col;c.fill();
 if(edge){c.strokeStyle=edge;c.lineWidth=1;c.stroke()}
}
function bar(c,x,y,w,h,value,color,right=false){
 rr(c,x,y,w,h,5,'#131c31','#ffffff48');
 const width=Math.max(0,w*clamp(value,0,1));
 if(width>0){const gr=c.createLinearGradient(x,0,x+w,0);
  gr.addColorStop(0,color);gr.addColorStop(.52,'#ffe9cc');gr.addColorStop(1,color);
  c.fillStyle=gr;c.fillRect(right?x+w-width:x,y,width,h);
 }
}
function hud(c,g){
 c.save();c.direction='ltr';
 const grad=c.createLinearGradient(0,0,0,133);
 grad.addColorStop(0,'#071022e8');grad.addColorStop(1,'#081522af');
 rr(c,14,10,1092,122,11,grad,'#dcbf9868');
 const names=g.fighters.map(f=>getFighter(f.id));
 for(let n=0;n<2;n++){
  const f=g.fighters[n],first=n===0,x=first?26:639,end=first?'left':'right';
  const face=first?35:1085;
  rr(c,first?27:1020,21,68,55,9,names[n].deep,names[n].color+'a9');
  text(c,first?'01':'02',first?61:1053,35,11,'#ffe8c1','center');
  text(c,names[n].name,first?108:1005,38,22,'#fff5dd',end,900);
  text(c,names[n].title,first?108:1005,64,12,'#b9cadb',end,600);
  bar(c,x,82,456,18,f.hp/CORE.health,first?'#58dafa':'#f78592',!first);
  bar(c,x,106,456,5,f.guard/100,'#e2c487',!first);
  bar(c,x,117,456,6,f.meter/100,names[n].color,!first);
  text(c,Math.round(f.hp)+'',first?495:626,53,14,'#ecf6fe',first?'right':'left');
  for(let win=0;win<2;win++){
   const dotX=first?406+win*18:716-win*18;
   c.beginPath();c.arc(dotX,42,5,0,Math.PI*2);
   c.fillStyle=win<g.wins[n]?'#f8d48b':'#8090a06b';c.fill();
  }
 }
 rr(c,511,17,98,77,11,'#192840','#d1b78e9c');
 text(c,'TIME',560,31,10,'#e1c48c','center');
 text(c,String(Math.ceil(g.timeFrames/FPS)).padStart(2,'0'),560,67,35,g.timeFrames<12*FPS?'#ff8c9b':'#f5e6d0','center',900);
 text(c,'SUPER',560,118,10,'#ffe1af','center',900);
 c.restore();
}
function renderFX(c,g,t){
 for(const p of g.projectiles){
  c.save();c.globalCompositeOperation='screen';
  const grad=c.createRadialGradient(p.x,p.y,2,p.x,p.y,p.radius*2.7);
  grad.addColorStop(0,'#ffffff');grad.addColorStop(.17,p.color);grad.addColorStop(1,p.color+'00');
  c.fillStyle=grad;c.beginPath();c.ellipse(p.x,p.y,p.radius*2.9,p.radius*1.8,0,0,Math.PI*2);c.fill();
  c.fillStyle='#fff9e5';c.beginPath();c.arc(p.x,p.y,p.radius*.68,0,Math.PI*2);c.fill();
  for(let i=0;i<3;i++)line(c,p.x-Math.sign(p.vx)*15*(i+1),p.y+Math.sin(t*23+i)*10,p.x,p.y,p.color,3+i);
  c.restore();
 }
 for(const e of g.effects){
  const alpha=e.life/e.max;
  c.save();c.translate(e.x,e.y);c.rotate((1-alpha)*.22);
  c.globalAlpha=alpha;c.globalCompositeOperation='screen';
  for(let i=0;i<11;i++){const angle=i*Math.PI*2/11+t*.12,r=(1-alpha)*83*e.scale;
   line(c,Math.cos(angle)*r*.34,Math.sin(angle)*r*.34,Math.cos(angle)*r+Math.cos(angle)*20,Math.sin(angle)*r+Math.sin(angle)*20,
    i%2?'#fff8d6':e.color,i%3===0?5:2);
  }
  if(e.kind==='shield'){c.beginPath();c.arc(0,0,55*e.scale*(1-alpha*.25),-.8,1.2);c.strokeStyle='#c6f4ff';c.lineWidth=6;c.stroke()}
  c.restore();
 }
 for(const f of g.fighters){
  if(!f.action)continue;
  if(f.action.name==='super'||f.action.name==='special'){
   const phase=f.action.frame;
   if(phase<25){c.save();c.globalAlpha=.5*Math.sin(Math.min(1,phase/28)*Math.PI);
    c.strokeStyle=getFighter(f.id).color;c.lineWidth=4;c.shadowColor=getFighter(f.id).color;c.shadowBlur=18;
    c.beginPath();c.arc(f.x,f.y-125,65+phase*2,-2,1.2);c.stroke();c.restore()}
  }
 }
}
function renderHitboxes(c,g){
 c.save();for(const f of g.fighters){
  c.strokeStyle='#34fb8a';c.lineWidth=2;c.strokeRect(f.x-CORE.hurtWidth,f.y-CORE.hurtHeight,CORE.hurtWidth*2,CORE.hurtHeight);
  const a=f.action;if(!a)continue;const m=MOVES[a.name];
  if(a.frame>m.startup&&a.frame<=m.startup+m.active){
   const boxX=f.dir>0?f.x+23:f.x-23-m.reach;
   c.strokeStyle='#ff465d';c.strokeRect(boxX,f.y+m.height[0],m.reach,m.height[1]-m.height[0]);
  }
 }c.restore();
}
function artState(f){
 if(f.hp<=0)return 'ko';
 if(f.hitstun>0||f.blockstun>0)return 'hurt';
 if(f.action)return f.action.name;
 if(!f.grounded)return 'jump';
 return f.state==='walk'||f.state==='guard'||f.state==='crouch'?f.state:'idle';
}
function renderGame(t){
 if(!game)return;
 const g=game;
 ctx.clearRect(0,0,WIDTH,HEIGHT);
 ctx.save();
 if(g.cameraShake>0){ctx.translate(Math.sin(t*76)*g.cameraShake*.63,Math.cos(t*97)*g.cameraShake*.23)}
 const avg=(g.fighters[0].x+g.fighters[1].x)/2;
 drawArena(ctx,t,clamp(avg-WIDTH/2,-220,220));
 for(const f of g.fighters){
  const opacity=f.flash>0&&f.flash%3===0?.8:1;
  ctx.save();
  ctx.fillStyle='#060f1c84';ctx.beginPath();ctx.ellipse(f.x,FLOOR+7,46,11,0,0,Math.PI*2);ctx.fill();ctx.restore();
  const state=artState(f),frame=f.action?Math.floor(f.action.frame/2):Math.floor(f.anim/4);
  drawSprite(ctx,f.id,state,frame,f.x,f.y,1.15,f.dir,opacity);
 }
 renderFX(ctx,g,t);if(debug)renderHitboxes(ctx,g);
 ctx.restore();
 hud(ctx,g);
 if(g.phase==='ready'){
  ctx.save();ctx.fillStyle='#081526b5';ctx.fillRect(360,201,400,132);
  ctx.strokeStyle='#e3c4959a';ctx.strokeRect(361,202,398,130);
  text(ctx,'ROUND '+g.round,560,235,18,'#e7c896','center',900);
  text(ctx,'استعد للقتال!',560,288,36,'#fff1d6','center',900);ctx.restore();
 }
 for(const f of g.fighters)if(f.combo>1&&f.comboClock>0){
  const x=f.slot===0?230:890;
  text(ctx,f.combo+' HITS',x,182,25,getFighter(f.id).color,'center',900);
 }
 if(g.hitstop>0){
  ctx.fillStyle='#f4f6ff0c';ctx.fillRect(0,0,WIDTH,HEIGHT);
 }
}
function loop(time){
 ticker=0;
 if(!game)return;
 const dt=Math.min(.055,Math.max(0,(time-lastTime)/1000));lastTime=time;
 if(!paused){
  accumulator+=dt;let count=0;
  while(accumulator>=1/FPS&&count<4){
   step(game,[inputFor(0),inputFor(1)]);
   eventSound(game.events);accumulator-=1/FPS;count++;
  }
  if(count===4)accumulator=0;
 }
 renderGame(time/1000);nextView();
 ticker=requestAnimationFrame(loop);
}
