// Duel Reborn: Dawn Citadel — layered environment of the first vertical slice.
// Drawn from original shapes; three cached static planes plus moving particles.
import {WIDTH as W,HEIGHT as H,FLOOR} from './roster.js';
const cache=new Map();
const line=(c,x,y,u,v,color,w=2)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(u,v);c.stroke()};
const ellipse=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
const poly=(c,points,fill,stroke=null,width=2)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}};
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
function seed(i){let x=Math.sin(i*498.72+23.55)*43758.5453;return x-Math.floor(x)}
function layer(name,paint){
 if(cache.has(name))return cache.get(name);
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;paint(canvas.getContext('2d'));cache.set(name,canvas);return canvas;
}
function sky(c){
 const grad=c.createLinearGradient(0,0,0,FLOOR);
 grad.addColorStop(0,'#09172d');grad.addColorStop(.3,'#283350');grad.addColorStop(.66,'#876275');grad.addColorStop(1,'#dba18a');
 rect(c,0,0,W,H,grad);
 const glow=c.createRadialGradient(832,174,4,832,174,276);
 glow.addColorStop(0,'#fee4b0a8');glow.addColorStop(.34,'#e3a28f44');glow.addColorStop(1,'#e9a3a100');
 rect(c,480,0,640,460,glow);
 ellipse(c,832,172,73,73,'#ffdeaf');
 ellipse(c,822,166,73,73,'#fae7bb22');
 for(let i=0;i<95;i++){const x=seed(i*3)*W,y=seed(i*3+2)*245;
  ellipse(c,x,y,i%6===0?1.9:.7,i%6===0?1.9:.7,'#e7ecf4'+(i%4===0?'9d':'52'))}
 // mountain ridgelines with layered mist
 poly(c,[[0,317],[68,285],[143,306],[259,244],[331,294],[423,237],[520,317],[672,245],[759,283],[881,207],[1013,294],[1120,255],[1120,470],[0,470]],'#34465c');
 poly(c,[[0,385],[85,320],[185,343],[286,283],[420,360],[512,300],[646,332],[746,279],[863,352],[944,305],[1120,332],[1120,472],[0,472]],'#25384e');
 for(let i=0;i<9;i++){const x=seed(i*4+13)*W,y=300+seed(i*9+4)*80;
   ellipse(c,x,y,170,20,'#d7b1ac0b')}
}
function castle(c){
 const dark='#1b2638',mid='#2d3a4e',edge='#637180',gold='#c89c7b';
 // Long defensive wall and steps, original fantasy stone architecture.
 rect(c,0,361,W,119,'#253346');rect(c,0,360,W,9,'#485568');
 for(let i=0;i<24;i++){
  const x=i*49;
  rect(c,x,339,33,29,'#314154');rect(c,x,363,48,9,'#45596a');
  line(c,x+24,374,x+24,463,'#12283a',2);
  if(i%3===0){rect(c,x+11,404,10,18,'#b77e6380')}
 }
 // Tower silhouettes and arch ribs in center.
 function building(x,y,width,height){
  rect(c,x,y,width,height,mid);
  poly(c,[[x-21,y],[x+width/2,y-62],[x+width+22,y]],'#1e2d41','#697086',3);
  poly(c,[[x-9,y-5],[x+width/2,y-50],[x+width+8,y-5]],'#596576');
  for(let i=0;i<3;i++){
   const wx=x+24+i*(width-48)/3;
   rect(c,wx,y+30,9,40,'#ad7d7975');
  }
  rect(c,x+width*.22,y+height*.52,width*.56,height*.46,dark);
 }
 building(70,270,155,200);building(860,254,164,214);
 // Layer of trees framing the main platform.
 for(const [x,y,s] of [[-15,389,1.1],[162,385,.85],[954,385,1.0],[1110,388,1.25]]){
  rect(c,x-9*s,y-30*s,18*s,107*s,'#151e30');
  for(let j=0;j<4;j++){
   const yy=y-(85-j*26)*s;
   poly(c,[[x-61*s,yy+39*s],[x,yy-48*s],[x+61*s,yy+39*s]],j%2?'#263b46':'#2c4d56');
  }
 }
 // Stone arches with glowing windows
 for(const x of [297,428,560,691]){
  rect(c,x,326,73,150,'#344252');
  poly(c,[[x-5,330],[x+36,285],[x+79,330]],'#1b2a3c');
  c.fillStyle='#14233c';c.beginPath();c.moveTo(x+18,461);c.lineTo(x+18,361);
  c.quadraticCurveTo(x+37,331,x+55,361);c.lineTo(x+55,461);c.closePath();c.fill();
  line(c,x+2,338,x+70,338,'#806f77',3);
 }
 // Main tall gate sits behind the fighters.
 rect(c,474,305,173,161,'#202b3c');
 poly(c,[[450,313],[559,243],[671,313]],'#1d2c3d');
 poly(c,[[466,305],[560,256],[653,305]],'#7e6471');
 rect(c,487,329,147,9,gold);
 poly(c,[[506,468],[506,375],[522,344],[610,344],[627,375],[627,468]],dark);
 c.strokeStyle='#d9a98d64';c.lineWidth=4;c.beginPath();c.arc(566,406,59,Math.PI,0);c.stroke();
 // Ornate geometric door panels.
 for(let i=0;i<6;i++){
  const x=526+i*14;rect(c,x,391,5,77,'#d1ae7440');
 }
 // Lanterns on outer columns.
 for(const x of [267,854]){
  rect(c,x-8,359,16,116,'#233041');
  rect(c,x-17,351,34,6,gold);
  poly(c,[[x-17,351],[x-2,335],[x+17,351]],'#b08a7d');
  rect(c,x-11,355,22,30,'#d09b70');
  rect(c,x-6,361,12,17,'#fff0ba');
  rect(c,x-17,385,34,4,gold);
 }
 // Wall irregularities and hand-set blocks
 for(let i=0;i<75;i++){const x=seed(i)*W,y=375+seed(i+91)*89;
  line(c,x,y,x+12+seed(i+19)*20,y,'#bdb5ab1c',1)}
}
function floor(c){
 rect(c,0,FLOOR-10,W,10,'#4a5363');
 const gradient=c.createLinearGradient(0,FLOOR,0,H);
 gradient.addColorStop(0,'#596071');gradient.addColorStop(1,'#182333');
 rect(c,0,FLOOR,W,H-FLOOR,gradient);
 line(c,0,FLOOR-10,W,FLOOR-10,'#e0be92',3);
 for(let i=0;i<14;i++){
  const x=i*92-18;
  line(c,x,FLOOR,x+(x-560)*.45,H,'#091d3099',2);
 }
 for(const y of [546,571,600])line(c,0,y,W,y,'#a2abb22b',2);
 // Central duel medallion: geometric relief and perspective.
 c.strokeStyle='#f1c49775';c.lineWidth=3;
 c.beginPath();c.ellipse(560,575,170,39,0,0,Math.PI*2);c.stroke();
 c.beginPath();c.ellipse(560,575,119,26,0,0,Math.PI*2);c.stroke();
 c.beginPath();c.ellipse(560,575,65,15,0,0,Math.PI*2);c.stroke();
 for(let i=0;i<12;i++){const a=i*Math.PI/6;line(c,560+122*Math.cos(a),575+26*Math.sin(a),560+163*Math.cos(a),575+37*Math.sin(a),'#dbc79a69',2)}
 // Side steps and fallen tiles.
 for(const x of [36,987]){
  rect(c,x,500,101,26,'#555668');rect(c,x-12,521,124,11,'#30384a');
 }
 for(let i=0;i<30;i++){
  const x=seed(i*15+2)*W,y=533+seed(i*15+4)*84;
  line(c,x,y,x+13,y+2,'#0d1c2d73',1);
 }
}
export function drawArena(c,time,scroll=0){
 const t=Number.isFinite(time)?time:0;
 // Parallax scenic layers. Cache actual architecture; animate only air.
 c.drawImage(layer('sky',sky),0,0);
 c.save();c.translate(-scroll*.09,0);
 c.drawImage(layer('castle',castle),-20,0,W+40,H);
 c.restore();
 c.drawImage(layer('floor',floor),0,0);
 // Near-camera drifting dust, kept intentionally sparse for combat legibility.
 for(let i=0;i<38;i++){
  const x=(seed(i*9+1)*W+t*(9+i%6*3))%W,y=130+seed(i*11+9)*380;
  const a=.16+.22*Math.sin(t*1.2+i);
  c.globalAlpha=Math.max(.03,a);
  ellipse(c,x,y,i%7===0?2.4:1.1,i%7===0?2.4:1.1,i%3===0?'#ffe3c0':'#90d4ec');
 }
 c.globalAlpha=1;
 // Curtain banners respond to a common wind cycle.
 for(const [x,h,col] of [[287,213,'#b96362'],[845,232,'#4c8299']]){
  const sway=Math.sin(t*1.55+x)*10;
  line(c,x,h,x,h+39,'#d9b587',3);
  poly(c,[[x-14,h+38],[x+14,h+38],[x+13+sway,h+115],[x+sway,h+102],[x-14+sway,h+115]],col,'#d9bc957a',2);
  line(c,x-8,h+48,x+8,h+48,'#ecd4a2a8',2);
 }
 const vignette=c.createRadialGradient(560,306,175,560,306,690);
 vignette.addColorStop(0,'#050b1400');vignette.addColorStop(1,'#030614a9');
 rect(c,0,0,W,H,vignette);
}
