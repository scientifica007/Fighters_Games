// DUEL REBORN: stylized frame-by-frame procedural sprites.
// Every displayed pose is rasterized once into an offscreen 260x310 frame,
// then reused as a normal sprite. No per-frame rig path construction in arena.
import {getFighter} from './roster.js';
import {drawFace} from './faces.js';
const CW=260,CH=310;const TAU=Math.PI*2;
const cache=new Map();
const limit=(n,a,b)=>Math.max(a,Math.min(b,n));
function shape(c,points,fill,edge='#0a1223',w=3){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
 if(fill){c.fillStyle=fill;c.fill()}
 if(edge){c.lineWidth=w;c.strokeStyle=edge;c.stroke()}
}
function oval(c,x,y,rx,ry,color,edge=null,w=2){
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();
 if(edge){c.strokeStyle=edge;c.lineWidth=w;c.stroke()}
}
function stroke(c,pts,width,color,edge='#111427'){
 c.lineCap='round';c.lineJoin='round';
 c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
 if(edge){c.strokeStyle=edge;c.lineWidth=width+5;c.stroke()}
 c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function square(c,x,y,w,h,r,fill,edge=null){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();
 if(edge){c.strokeStyle=edge;c.lineWidth=2;c.stroke()}
}
const AZ={base:'#276e91',shade:'#172f54',highlight:'#6ce5ff',trim:'#e4ce92',cloth:'#1b3a60',skin:'#dba98b',hair:'#edf9ef',boot:'#0c223b'};
const NA={base:'#d65c52',shade:'#6c2a43',highlight:'#ffb389',trim:'#f5ca7f',cloth:'#45243f',skin:'#e4ae93',hair:'#f8a064',boot:'#251829'};
function armor(c,x,y,size,palette){
 shape(c,[[x-size,y-8],[x+size,y-8],[x+size+3,y+9],[x,y+17],[x-size-3,y+9]],
 palette.base,'#111928',3);
 stroke(c,[[x-size+4,y],[x+size-4,y]],3,palette.trim,null);
 oval(c,x,y+8,3,3,palette.highlight);
}
function drawAzur(c,pose,frame){
 const p=AZ;
 const arm=pose.hand,torsoY=pose.torso;
 const step=pose.step;
 const wind=Math.sin(frame*.8)*3;
 // Robe & split cloth at rear.
 shape(c,[[-26,-106+torsoY],[-34,-68+torsoY],[-51+step*.35,-4],
          [-13,-35],[11,-36],[43-step*.25,-11],[33,-68+torsoY],[25,-111+torsoY]],p.shade);
 shape(c,[[-24,-82+torsoY],[-42+wind,-10],[-19,-24],[-4,-81+torsoY]],'#1e5379','#15253e',2);
 shape(c,[[19,-78+torsoY],[33-wind,-18],[15,-32],[7,-80+torsoY]],'#275f87','#15253e',2);
 // Lower body with readable walking silhouette.
 for(const side of [-1,1]){
   const x=side*14;const knee=x+step*side*.55;const foot=x+step*side*.95;
   stroke(c,[[x,-61+torsoY],[knee,-33],[foot,pose.legY]],16,p.cloth);
   armor(c,knee,-29,9,p);
   shape(c,[[foot-13,pose.legY-13],[foot+8,pose.legY-13],[foot+20,pose.legY-3],[foot-18,pose.legY-3]],p.boot);
   stroke(c,[[foot-12,pose.legY-12],[foot+11,pose.legY-12]],2,p.highlight,null);
 }
 // Chest layered lamellar plates.
 const light=c.createLinearGradient(-36,0,36,0);
 light.addColorStop(0,p.shade);light.addColorStop(.5,p.base);light.addColorStop(1,p.shade);
 shape(c,[[-33,-125+torsoY],[-13,-135+torsoY],[17,-135+torsoY],[35,-124+torsoY],[27,-66+torsoY],[0,-60+torsoY],[-29,-69+torsoY]],light);
 shape(c,[[-25,-121+torsoY],[0,-128+torsoY],[25,-121+torsoY],[19,-85+torsoY],[0,-76+torsoY],[-20,-85+torsoY]],'#254971',p.highlight,2);
 for(let i=0;i<4;i++)stroke(c,[[-19,-111+i*10+torsoY],[0,-105+i*10+torsoY],[20,-111+i*10+torsoY]],1.7,'#d4d0a080',null);
 shape(c,[[-25,-124+torsoY],[-7,-140+torsoY],[0,-124+torsoY],[7,-140+torsoY],[27,-125+torsoY],[16,-118+torsoY],[0,-123+torsoY],[-17,-115+torsoY]],p.shade);
 // Sash, seal.
 stroke(c,[[-29,-72+torsoY],[28,-72+torsoY]],8,p.boot);
 square(c,-7,-77+torsoY,15,11,3,p.trim);
 shape(c,[[3,-118+torsoY],[-5,-103+torsoY],[4,-105+torsoY],[-7,-88+torsoY],[13,-108+torsoY],[3,-106+torsoY]],p.highlight,null);
 // Back arm
 stroke(c,[[-30,-122+torsoY],[-45,-98+torsoY],[-30,-80+torsoY]],15,p.shade);
 armor(c,-39,-101+torsoY,10,p);
 // Individual face rig: angular scarred veteran Azur, not a generic oval.
 drawFace(c,'azur',torsoY,pose,frame);
 // Tall asymmetric shoulder armor.
 armor(c,-33,-123+torsoY,21,p);
 armor(c,34,-122+torsoY,19,p);
 shape(c,[[27,-130+torsoY],[47,-121+torsoY],[46,-108+torsoY],[24,-105+torsoY]],p.trim,p.boot,2);
 // Forward attack arm.
 stroke(c,[[26,-117+torsoY],[37+arm*.24,-96+torsoY],[42+arm*.7,-78+torsoY-pose.reachY]],17,p.shade);
 armor(c,38+arm*.24,-95+torsoY,11,p);
 stroke(c,[[37+arm*.7,-78+torsoY-pose.reachY],[48+arm,-74+torsoY-pose.reachY]],12,p.base);
 square(c,37+arm,-86+torsoY-pose.reachY,23,21,4,p.boot,p.trim);
 // Katana: steel blade with tang and glint, slash tilts on attack.
 c.save();c.translate(51+arm,-76+torsoY-pose.reachY);c.rotate(pose.swordAngle);
 stroke(c,[[0,15],[0,-18]],7,p.boot);
 shape(c,[[-7,-18],[-7,-113],[0,-139],[7,-113],[7,-18]],'#ebfaff',p.boot,2);
 shape(c,[[0,-129],[4,-112],[3,-17],[0,-17]],'#81d1e8',null);
 stroke(c,[[-15,-19],[15,-19]],5,p.trim);
 c.restore();
}
function drawNara(c,pose,frame){
 const p=NA,arm=pose.hand,torsoY=pose.torso,step=pose.step;
 const braid=Math.sin(frame*.7)*6+pose.hand*.11;
 // Wide fabric scarf & skirt panels silhouette.
 shape(c,[[-20,-126+torsoY],[-40,-100+torsoY],[-39,-59+torsoY],[-49-step*.3,-3],[-16,-35],[23,-33],[45+step*.45,-5],
   [36,-64+torsoY],[25,-116+torsoY]],p.cloth);
 shape(c,[[-34,-107+torsoY],[-56,-88+torsoY],[-85-braid,-86+torsoY],[-66,-72+torsoY],[-27,-88+torsoY]],p.highlight,p.shade,2);
 shape(c,[[-22,-83+torsoY],[-41+step*.4,-12],[-20,-31],[-3,-73+torsoY]],p.base,null);
 shape(c,[[12,-78+torsoY],[37-step*.35,-18],[13,-30],[3,-81+torsoY]],'#ad3d4c',null);
 // Slim athletic leggings, asymmetrical boots and shinguards.
 for(const side of [-1,1]){
  const x=side*13,k=x+step*side*.6,foot=x+step*side*.95;
  stroke(c,[[x,-59+torsoY],[k,-30],[foot,pose.legY]],15,p.cloth);
  armor(c,k,-29,9,p);
  shape(c,[[foot-11,pose.legY-19],[foot+7,pose.legY-19],[foot+10,pose.legY-3],[foot-16,pose.legY-3]],p.boot);
  stroke(c,[[foot-10,pose.legY-17],[foot+7,pose.legY-15]],3,p.trim,null);
 }
 // Leather chest and raised collar.
 const vest=c.createLinearGradient(-26,0,26,0);vest.addColorStop(0,p.shade);vest.addColorStop(.5,p.base);vest.addColorStop(1,p.shade);
 shape(c,[[-27,-128+torsoY],[-7,-140+torsoY],[13,-140+torsoY],[28,-125+torsoY],[24,-64+torsoY],[0,-58+torsoY],[-25,-66+torsoY]],vest);
 shape(c,[[-21,-123+torsoY],[0,-126+torsoY],[19,-120+torsoY],[15,-90+torsoY],[1,-79+torsoY],[-15,-90+torsoY]],p.base,p.trim,2);
 shape(c,[[-8,-114+torsoY],[5,-116+torsoY],[10,-101+torsoY],[0,-90+torsoY],[-11,-101+torsoY]],'#f9c983',p.shade,2);
 stroke(c,[[-25,-70+torsoY],[27,-70+torsoY]],8,p.boot);
 square(c,-6,-75+torsoY,12,11,3,p.trim);
 // Rear bent arm with elbow guards.
 stroke(c,[[-27,-124+torsoY],[-41,-100+torsoY],[-29,-88+torsoY]],15,p.shade);
 armor(c,-39,-101+torsoY,10,p);
 // Individual face rig: round-eyed young fighter Nara with ponytail and freckles.
 drawFace(c,'nara',torsoY,pose,frame);
 // Shoulder armor & forearm gauntlet. More physical than swordfighter.
 armor(c,-27,-124+torsoY,18,p);armor(c,28,-124+torsoY,18,p);
 stroke(c,[[28,-120+torsoY],[35+arm*.4,-97+torsoY],[44+arm*.8,-81+torsoY-pose.reachY]],16,p.shade);
 armor(c,36+arm*.4,-98+torsoY,10,p);
 stroke(c,[[43+arm*.8,-81+torsoY-pose.reachY],[52+arm,-83+torsoY-pose.reachY]],13,p.base);
 square(c,45+arm,-99+torsoY-pose.reachY,33,29,8,p.shade,p.trim);
 for(let j=0;j<3;j++)stroke(c,[[49+arm+j*8,-93+torsoY-pose.reachY],[49+arm+j*8,-80+torsoY-pose.reachY]],2.5,p.trim,null);
 if(pose.power){
  c.save();c.globalAlpha=.6;
  for(let i=0;i<4;i++)shape(c,[[61+arm+i*4,-101+torsoY-pose.reachY],[81+arm+i*3,-144+torsoY-pose.reachY],
   [89+arm+i*4,-99+torsoY-pose.reachY]],p.highlight,null);
  c.restore();
 }
}
// Smoothly interpolated key poses create anticipation -> contact -> follow-through.
// Hit timing stays owned by the 60 Hz combat engine.
function keyframe(t,keys){
 if(t<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++){
  if(t<=keys[i][0]){
   let u=(t-keys[i-1][0])/(keys[i][0]-keys[i-1][0]);
   u=u*u*(3-2*u);
   return keys[i-1][1]+(keys[i][1]-keys[i-1][1])*u;
  }
 }
 return keys[keys.length-1][1];
}
function poseFor(state,phase,id){
 const nara=id==='nara',p={step:0,torso:0,hand:0,reachY:0,legY:-3,swordAngle:0,power:false};
 const wave=Math.sin(phase/12*Math.PI*2);
 if(state==='idle'){
  p.torso=Math.sin(phase/12*Math.PI*2)*2.1;
  p.hand=(nara?-3:1)+Math.sin(phase/12*Math.PI*2)*2.3;
  p.swordAngle=.17;
 }
 if(state==='walk'){
  p.step=wave*(nara?21:18);
  p.hand=-wave*(nara?13:9);
  p.torso=Math.abs(wave)*1.4;
  p.swordAngle=.1+wave*.07;
 }
 if(state==='jump'){
  p.torso=keyframe(phase,[[0,-2],[3,-8],[7,-4],[11,1]]);
  p.step=keyframe(phase,[[0,8],[3,12],[7,-16],[11,-6]]);
  p.hand=keyframe(phase,[[0,0],[3,-8],[7,16],[11,4]]);
  p.legY=-12;p.swordAngle=-.08;
 }
 if(state==='guard'){p.torso=-6;p.hand=-18;p.reachY=28;p.swordAngle=.9}
 if(state==='crouch'){p.torso=27;p.step=9;p.hand=1;p.reachY=10;p.legY=-3;p.swordAngle=.3}
 if(state==='hurt'){p.torso=keyframe(phase,[[0,-3],[2,6],[4,2]]);p.hand=-22;p.swordAngle=.8;p.step=-7}
 if(state==='light'){
  p.hand=keyframe(phase,nara?[[0,-14],[2,-21],[4,48],[7,58],[10,5]]:[[0,-12],[2,-19],[5,47],[7,54],[11,1]]);
  p.reachY=keyframe(phase,[[0,0],[3,5],[6,20],[10,0]]);
  p.step=keyframe(phase,[[0,-3],[5,9],[10,1]]);
  p.torso=keyframe(phase,[[0,0],[5,-3],[10,0]]);
  p.swordAngle=keyframe(phase,[[0,.7],[3,.9],[6,-1.1],[11,.16]]);
 }
 if(state==='heavy'){
  p.hand=keyframe(phase,[[0,0],[5,-30],[10,-33],[15,65],[21,4]]);
  p.reachY=keyframe(phase,[[0,0],[9,6],[16,30],[22,0]]);
  p.step=keyframe(phase,[[0,0],[8,-13],[14,19],[22,3]]);
  p.torso=keyframe(phase,[[0,-2],[13,7],[22,0]]);
  p.swordAngle=keyframe(phase,[[0,.4],[10,1.3],[16,-1.5],[23,.2]]);
 }
 if(state==='special'){
  p.hand=keyframe(phase,[[0,-7],[6,-35],[13,-35],[22,67],[34,5]]);
  p.reachY=keyframe(phase,[[0,0],[10,8],[21,32],[33,0]]);
  p.step=keyframe(phase,[[0,0],[10,-12],[21,20],[33,5]]);
  p.torso=keyframe(phase,[[0,0],[11,-6],[23,4],[34,0]]);
  p.power=phase>8&&phase<34;
  p.swordAngle=keyframe(phase,[[0,.6],[13,1.15],[21,-1.15],[34,.15]]);
 }
 if(state==='super'){
  p.step=keyframe(phase,[[0,0],[8,-15],[17,25],[29,5]]);
  p.torso=keyframe(phase,[[0,-2],[13,-10],[19,6],[29,0]]);
  p.hand=keyframe(phase,[[0,-15],[10,-40],[18,73],[29,5]]);
  p.reachY=keyframe(phase,[[0,0],[12,10],[19,41],[29,0]]);
  p.power=true;
  p.swordAngle=keyframe(phase,[[0,.5],[12,1.42],[19,-1.52],[29,.1]]);
 }
 if(state==='ko'){p.torso=12;p.step=14;p.hand=2;p.swordAngle=1.5}
 if(state==='win'){p.hand=28;p.reachY=31;p.swordAngle=-1.4;p.torso=-3}
 return p;
}
function renderCell(info,state,frame){
 const canvas=document.createElement('canvas');canvas.width=CW;canvas.height=CH;
 const c=canvas.getContext('2d');
 c.save();c.translate(CW/2,270);
 const p=poseFor(state,frame,info.id);
 if(state==='ko'){c.translate(-26,-8);c.rotate(-1.25)}
 if(state==='heavy'&&frame>=11&&frame<19)c.rotate(-.045);
 if(state==='special'&&frame>10&&frame<27)c.rotate(-.065);
 if(info.id==='azur')drawAzur(c,p,frame);else drawNara(c,p,frame);
 c.restore();return canvas;
}
export function sprite(infoOrId,state='idle',frame=0){
 const id=typeof infoOrId==='string'?getFighter(infoOrId).id:infoOrId.id;
 const canonical=['idle','walk','jump','crouch','guard','light','heavy','special','super','hurt','ko','win'].includes(state)?state:'idle';
 const max={idle:12,walk:12,jump:12,crouch:1,guard:4,light:12,heavy:24,special:35,super:30,hurt:5,ko:1,win:8}[canonical];
 const index=limit(Math.floor(frame),0,Infinity)%max;
 const key=id+'-'+canonical+'-'+index;
 if(cache.has(key))return cache.get(key);
 const result=renderCell(getFighter(id),canonical,index);
 cache.set(key,result);
 return result;
}
export function drawSprite(c,infoOrId,state,frame,x,feet,scale=1,dir=1,opacity=1){
 const img=sprite(infoOrId,state,frame);
 c.save();c.globalAlpha=opacity;
 c.translate(x,feet);c.scale(dir*scale,scale);
 c.drawImage(img,-CW/2*1,-270, CW,CH);c.restore();
}
export function drawPortrait(c,id,x,y,scale=1){
 drawSprite(c,id,'idle',2,x,y,scale,1);
}
export const spriteCacheStats=()=>({frames:cache.size});
