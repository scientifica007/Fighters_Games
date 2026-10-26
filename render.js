import { RULES } from './fighters.js';

const W = RULES.arenaWidth, H = 540, FLOOR = RULES.floorY;
function rr(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.stroke()}}
function line(c,x1,y1,x2,y2,color,width=3){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function polygon(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function bg(c,t,stage){
  const warm=stage===3||stage===6;
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,warm?'#24203c':'#101c32');g.addColorStop(.56,warm?'#463344':'#263653');g.addColorStop(1,'#13192a');c.fillStyle=g;c.fillRect(0,0,W,H);
  const moonX=755,moonY=115;const halo=c.createRadialGradient(moonX,moonY,15,moonX,moonY,220);
  halo.addColorStop(0,warm?'#f39e6b4c':'#97cfff35');halo.addColorStop(1,'#101e3600');c.fillStyle=halo;c.fillRect(500,-80,470,420);
  ellipse(c,moonX,moonY,44,44,warm?'#e6b0a6':'#a9c9dc');ellipse(c,moonX-13,moonY-11,29,28,warm?'#f1c3a9':'#d0e7ed');
  c.strokeStyle='#e5e6ff14';c.lineWidth=1;for(let i=0;i<8;i++){const y=168+i*19;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(210,y+Math.sin(t*.2+i)*10,620,y-13,W,y+7);c.stroke()}
  function skyline(depth,color,base,step){
    c.fillStyle=color;c.beginPath();c.moveTo(0,FLOOR);for(let x=0;x<=W+step;x+=step){let v=Math.abs(Math.sin(x*.014+depth*6)*Math.cos(x*.005+depth))*105;let h=base-v;c.lineTo(x,h);c.lineTo(x+step*.84,h)}c.lineTo(W,FLOOR);c.closePath();c.fill();
    c.strokeStyle='#ffffff0a';for(let x=24;x<W;x+=step){let y=base-Math.abs(Math.sin(x*.014+depth*6)*Math.cos(x*.005+depth))*105;c.beginPath();c.moveTo(x,y+15);c.lineTo(x,FLOOR);c.stroke()}
  }
  skyline(1,'#1c2940',370,47);skyline(2,'#182235',407,67);
  for(let x=28;x<W;x+=48){const y=325+Math.abs(Math.sin(x*.03))*56;const lum=(Math.sin(t*.7+x)*.2+.55);c.fillStyle='rgba(245,188,116,'+lum*.25+')';c.fillRect(x,y,3,7)}
  const fg=c.createLinearGradient(0,FLOOR,0,H);fg.addColorStop(0,'#344056');fg.addColorStop(1,'#171f30');c.fillStyle=fg;c.fillRect(0,FLOOR,W,H-FLOOR);
  line(c,0,FLOOR,W,FLOOR,'#b2a78c',4);line(c,0,FLOOR+6,W,FLOOR+6,'#b9a37b52',1);
  c.strokeStyle='#b6c6d914';c.lineWidth=1;for(let x=-340;x<1300;x+=100){c.beginPath();c.moveTo(x,FLOOR);c.lineTo(x+(x-W/2)*.25,H);c.stroke()}
  for(let y=480;y<H;y+=16){line(c,0,y,W,y,'#aabbd30a',1)}
  c.save();c.translate(W/2,FLOOR+35);c.strokeStyle='#ceb38025';c.lineWidth=2;c.beginPath();c.ellipse(0,0,127,25,0,0,Math.PI*2);c.stroke();c.beginPath();c.ellipse(0,0,87,16,0,0,Math.PI*2);c.stroke();c.restore();
  for(let i=0;i<24;i++){let x=(i*149+Math.sin(t*.3+i*3)*38+W)%W,y=70+(i*101)%340+Math.sin(t+i)*5;ellipse(c,x,y,1.4,1.4,i%3===0?'#e9cb8c72':'#8dcee958')}
  const vg=c.createRadialGradient(W/2,H/2,110,W/2,H/2,580);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#03091488');c.fillStyle=vg;c.fillRect(0,0,W,H);
}

export function drawFighter(c,f,x,foot,scale=1,facing=1,t=0,preview=false){
  const d=f.info||f,shape=d.shape,active=f.attack&&f.attack.t>0,kind=active?f.attack.kind:'';
  const attacking=kind==='light'||kind==='heavy'||kind==='special';
  const walk=!preview&&Math.abs(f.walk||0)>0.18?Math.sin(t*15+(f.x||0)*.008)*9:0;
  const bob=preview?Math.sin(t*2.4)*2:Math.sin(t*3.7)*1.3;
  const lean=attacking?(kind==='heavy'?8:4):0;
  const main=d.color,deep=d.dark,accent=d.accent,skin=d.skin;
  c.save();
  if(!preview){ellipse(c,x,FLOOR+4,37*scale,7*scale,'#01091581');if(f.block){ellipse(c,x,FLOOR-67,54,78,main+'0b')}}
  c.translate(x,foot+bob);c.scale(scale*facing,scale);
  if(f.flash>0){c.shadowColor='#ffffff';c.shadowBlur=24}
  // Flowing silhouette, cloak and distinctive silhouette by school.
  polygon(c,[[-24,-91],[-30,-70],[-37,-13],[-14,-25],[8,-22],[32,-8],[28,-72],[22,-91]],deep);
  if(shape==='scarf'){polygon(c,[[-15,-91],[-49,-79],[-70,-58],[-42,-66],[-29,-53]],main);line(c,-26,-79,-74,-77,accent,4)}
  if(shape==='flame'){polygon(c,[[-10,-96],[-32,-58],[-29,-23],[3,-35],[27,-15],[20,-94]],'#9c3548')}
  if(shape==='boss'){polygon(c,[[-20,-93],[-54,-38],[-34,-22],[-13,-49],[21,-46],[44,-23],[55,-38],[26,-97]],deep);line(c,-38,-56,-53,-33,main,4)}
  // legs, boots
  line(c,-12,-49,-16+walk*.5,-18,'#101724',15);line(c,11,-48,17-walk*.5,-17,'#121a27',15);
  line(c,-17+walk*.5,-19,-20+walk,0,main,11);line(c,17-walk*.5,-19,20-walk,0,main,11);
  rr(c,-33+walk,-5,25,8,3,'#0a1020');rr(c,9-walk,-5,26,8,3,'#0a1020');
  // torso
  polygon(c,[[-24,-94],[-9,-101],[14,-101],[25,-91],[23,-50],[2,-43],[-22,-50]],deep);
  polygon(c,[[-19,-89],[0,-96],[19,-90],[17,-59],[0,-53],[-16,-61]],main);
  polygon(c,[[-5,-93],[5,-93],[12,-66],[0,-60],[-11,-66]],deep);
  line(c,-20,-55,20,-55,'#0b1120',6);rr(c,-7,-59,14,8,2,accent);
  if(shape==='armor'||shape==='boss'){
    polygon(c,[[-22,-97],[-39,-97],[-43,-79],[-23,-80]],accent);
    polygon(c,[[22,-97],[39,-97],[43,-79],[23,-80]],accent);
    if(shape==='boss')line(c,-17,-89,17,-89,'#f3b8d4',3);
  }
  // arms
  const reach=attacking?(kind==='heavy'?28:21):0;
  line(c,-19,-86,-29,-66,'#101625',15);
  line(c,-29,-66,-15,-59,main,12);
  line(c,19,-87,31+reach,-70+(attacking?-8:0),'#151924',16);
  line(c,31+reach,-70+(attacking?-8:0),42+reach,-59-(attacking?13:0),main,13);
  ellipse(c,43+reach,-59-(attacking?13:0),9,9,accent);
  if(shape==='gauntlet'){rr(c,36+reach,-72-(attacking?13:0),23,27,5,accent);line(c,43+reach,-69,54+reach,-65,deep,3)}
  if(shape==='armor'){rr(c,28+reach,-75-(attacking?9:0),23,26,4,accent)}
  if(shape==='blade'){
    const gx=48+reach,gy=-62-(attacking?14:0);
    line(c,gx,gy,gx+36,gy-38,'#c9e5f3',6);line(c,gx+4,gy-3,gx+41,gy-42,accent,2);
    line(c,gx-9,gy+9,gx+10,gy-10,deep,6);
  }
  if(shape==='hood'){polygon(c,[[-21,-115],[-31,-101],[-26,-78],[-13,-92]],deep)}
  // neck / head / hair and headgear
  rr(c,-7,-111,14,16,3,skin);
  ellipse(c,0,-122,19,23,skin);
  if(shape==='flame'){
    polygon(c,[[-18,-125],[-24,-149],[-11,-143],[-4,-163],[5,-148],[18,-154],[17,-126]],'#f1a15d');
    polygon(c,[[-13,-137],[-10,-151],[1,-145],[14,-148],[17,-132]],deep);
  }else if(shape==='scarf'){
    polygon(c,[[-18,-131],[-26,-124],[-18,-145],[2,-151],[19,-139],[21,-125]],'#174f61');
    line(c,-22,-108,-39,-98,accent,5);
  }else if(shape==='hood'){
    polygon(c,[[-23,-119],[-22,-140],[-5,-154],[14,-148],[24,-132],[19,-113]],deep);
    rr(c,-18,-122,36,15,5,'#20233b');line(c,-12,-115,13,-115,main,2);
  }else if(shape==='armor'){
    polygon(c,[[-23,-127],[-20,-148],[0,-157],[21,-148],[22,-127],[14,-110],[-14,-110]],deep);
    polygon(c,[[-19,-138],[0,-151],[18,-138],[15,-129],[-16,-129]],accent);
    line(c,-18,-121,18,-121,main,3);
  }else if(shape==='boss'){
    polygon(c,[[-21,-129],[-28,-155],[-13,-147],[-6,-164],[0,-149],[11,-165],[17,-145],[31,-153],[21,-129]],main);
    rr(c,-19,-130,38,19,4,'#24142f');line(c,-15,-120,16,-120,accent,3);
  }else if(shape==='gauntlet'){
    polygon(c,[[-21,-132],[-15,-148],[13,-146],[20,-134],[13,-129],[-12,-129]],'#473126');
  }else{
    polygon(c,[[-20,-135],[-20,-145],[0,-152],[21,-144],[20,-134],[12,-129],[-12,-129]],deep);
  }
  if(shape!=='armor'&&shape!=='hood'&&shape!=='boss'){line(c,0,-121,14,-121,'#191a28',3)}
  // personal glowing chest seal
  ellipse(c,0,-79,5,5,accent);
  if(active&&kind!=='special'){
    c.globalAlpha=Math.min(1,Math.max(0,1.3-(f.attack.t||0)*3));
    c.strokeStyle=main;c.lineWidth=7;c.lineCap='round';c.beginPath();c.arc(30,-76,38,Math.PI*1.46,Math.PI*1.99);c.stroke();
    c.lineWidth=2;c.strokeStyle='#f9ffff';c.stroke();c.globalAlpha=1;
  }
  if(f.block){c.strokeStyle=main;c.lineWidth=5;c.globalAlpha=.85;c.beginPath();c.arc(23,-72,46,-1.1,.98);c.stroke();c.globalAlpha=1}
  if(f.stun>0){ellipse(c,0,-164,4,4,accent);ellipse(c,13,-158,3,3,accent)}
  c.restore();
}

export function portrait(c,f,t=0){
  const w=c.canvas.width,h=c.canvas.height;c.clearRect(0,0,w,h);
  const g=c.createRadialGradient(w/2,h*.73,1,w/2,h*.73,w*.56);g.addColorStop(0,f.color+'37');g.addColorStop(1,'#0000');c.fillStyle=g;c.fillRect(0,0,w,h);
  const sc=Math.min(1.02,(h-12)/158);
  drawFighter(c,{info:f,walk:0,attack:null,block:false,stun:0,flash:0},w/2,h-2,sc,1,t,true);
}

function hud(c,g){
  const a=g.fighters[0],b=g.fighters[1];if(!a||!b)return;
  c.save();rr(c,20,15,920,74,11,'#081423b9','#8f9aab3a');
  function bar(f,x,right){
    c.textAlign=right?'right':'left';c.direction='rtl';c.fillStyle='#eef5fb';c.font='bold 18px system-ui';c.fillText(f.info.name,right?925:35,38);
    c.font='12px system-ui';c.fillStyle='#acc0d1';c.fillText(f.info.title,right?925:35,57);
    const bx=right?562:35,bw=363;rr(c,bx,63,bw,13,5,'#394351');
    let hg=c.createLinearGradient(bx,0,bx+bw,0);hg.addColorStop(0,right?'#ffb69e':'#67c9d9');hg.addColorStop(1,right?'#f17f97':'#89f9c2');
    c.fillStyle=hg;const hw=bw*Math.max(0,f.hp)/RULES.hp;if(right)c.fillRect(bx+bw-hw,64,hw,11);else c.fillRect(bx+1,64,hw,11);
    c.fillStyle='#d6f0f3';c.fillRect(right?bx+bw-bw*f.guard/100:bx,79,bw*f.guard/100,3);
    if(f.specialCd>0){c.fillStyle='#f2d39b';c.font='11px system-ui';c.fillText('المهارة: '+Math.ceil(f.specialCd)+'ث',right?720:215,56)}
  }
  bar(a,35,false);bar(b,562,true);
  rr(c,438,18,84,57,11,'#1c2a3c','#7f8da6');
  c.textAlign='center';c.direction='ltr';c.fillStyle=g.timer<11?'#ff958d':'#f9e8c8';c.font='bold 31px system-ui';c.fillText(String(Math.max(0,Math.ceil(g.timer))).padStart(2,'0'),480,56);
  c.restore();
}
function projectiles(c,g){
  for(const p of g.projectiles){
    c.save();const col=p.color;
    const gr=c.createRadialGradient(p.x,p.y,2,p.x,p.y,29);
    gr.addColorStop(0,'#ffffff');gr.addColorStop(.25,col);gr.addColorStop(1,col+'00');
    c.fillStyle=gr;c.beginPath();c.arc(p.x,p.y,29,0,Math.PI*2);c.fill();ellipse(c,p.x,p.y,9,9,'#f6f8ff');c.restore();
  }
}
function effects(c,g){
  for(const p of g.particles){
    c.save();c.globalAlpha=Math.max(0,p.life/p.maxLife);
    if(p.text){c.font='900 '+(p.size||20)+'px system-ui';c.textAlign='center';c.fillStyle=p.color;c.fillText(p.text,p.x,p.y)}
    else{ellipse(c,p.x,p.y,Math.max(1,p.size*p.life/p.maxLife),Math.max(1,p.size*p.life/p.maxLife),p.color)}
    c.restore();
  }
  for(const f of g.fighters){if(f.attack&&f.attack.kind==='special'){
    const a=f.attack.t;if(a>.2&&a<.65){
      c.save();c.globalAlpha=Math.min(1,(a-.2)*3);c.strokeStyle=f.info.color;c.lineWidth=4;c.beginPath();
      if(f.info.special==='spin')c.ellipse(f.x,f.y-77,70*a/.55,48*a/.55,0,0,Math.PI*2);
      else if(f.info.special==='shock')c.ellipse(f.x+f.dir*75,FLOOR-10,110*a/.55,15,0,0,Math.PI*2);
      else if(f.info.special==='upper')c.ellipse(f.x+f.dir*18,f.y-92,32,62,0,0,Math.PI*2);
      else c.ellipse(f.x,f.y-85,34,57,0,0,Math.PI*2);c.stroke();c.restore();
    }
  }}
}
export function render(c,g,t){
  c.clearRect(0,0,W,H);
  c.save();if(g.shake>0)c.translate(Math.sin(t*71)*g.shake,Math.cos(t*88)*g.shake*.4);
  bg(c,t,g.stageIndex||0);
  for(const f of g.fighters){drawFighter(c,f,f.x,f.y,1.12,f.dir,t)}
  projectiles(c,g);effects(c,g);c.restore();hud(c,g);
  if(g.announcement>0){c.save();c.textAlign='center';c.direction='rtl';c.shadowColor='#101321';c.shadowBlur=15;c.fillStyle='#fff2d9';c.font='900 34px system-ui';c.fillText(g.message,480,175);c.restore()}
}
