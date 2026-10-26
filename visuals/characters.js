// Procedurally illustrated fighters (v2). No external images, fonts or binary assets.
// Animation uses existing gameplay state; visual poses do not modify hitboxes or stats.
const PI=Math.PI;
function path(c,pts,fill,stroke=null,w=2){
 c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
 if(fill){c.fillStyle=fill;c.fill()}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke()}
}
function circle(c,x,y,r,fill,outline=null,w=2){
 c.beginPath();c.arc(x,y,r,0,PI*2);if(fill){c.fillStyle=fill;c.fill()}if(outline){c.strokeStyle=outline;c.lineWidth=w;c.stroke()}
}
function oval(c,x,y,rx,ry,fill,outline=null){
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,PI*2);
 if(fill){c.fillStyle=fill;c.fill()}if(outline){c.strokeStyle=outline;c.lineWidth=2;c.stroke()}
}
function segment(c,x,y,xx,yy,width,fill,outline='#091320'){
 c.lineCap='round';c.lineJoin='round';
 c.strokeStyle=outline;c.lineWidth=width+4;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();
 c.strokeStyle=fill;c.lineWidth=width;c.stroke();
}
function box(c,x,y,w,h,r,fill,outline){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();
 if(outline){c.strokeStyle=outline;c.lineWidth=2;c.stroke()}
}
function armor(c,x,y,s,col,light){
 path(c,[[x-s,y-4],[x+s,y-4],[x+s+3,y+12],[x,y+18],[x-s-3,y+12]],col,'#101c2d',2);
 segment(c,x-s+3,y+3,x+s-3,y+3,3,light,col);
}
const STYLE={
 azur:{frame:'slim',head:'crest',hair:'#eff8ff',detail:'sword',coat:'short'},
 nara:{frame:'athletic',head:'flame',hair:'#f1ab59',detail:'blades',coat:'split'},
 sakh:{frame:'heavy',head:'helm',hair:'#55446e',detail:'shield',coat:'short'},
 rima:{frame:'slim',head:'braid',hair:'#1c625b',detail:'fan',coat:'scarf'},
 zill:{frame:'slim',head:'hood',hair:'#402a64',detail:'dagger',coat:'long'},
 rayed:{frame:'athletic',head:'short',hair:'#4a302b',detail:'fists',coat:'split'},
 nexus:{frame:'heavy',head:'crown',hair:'#4a244a',detail:'staff',coat:'long'}
};
export function drawFighter(c,f,x,foot,scale=1,facing=1,time=0,preview=false){
 const info=f.info||f,p=STYLE[info.id]||STYLE.azur;
 const walk=f.walk||0,air=!preview&&foot<456;
 const attack=f.attack||null,kind=attack?.kind||'';
 const wind=attack?Math.min(1,attack.t/(kind==='heavy'?.27:kind==='special'?.34:.12)):0;
 const swing=attack?Math.min(1,Math.max(0,(attack.t-(kind==='heavy'?.12:.04))/.20)):0;
 const block=!!f.block;const wobble=preview?Math.sin(time*2.2)*2.5:Math.sin(time*3.3)*1.4;
 const stride=Math.sin(time*13+walk*1.7)*Math.abs(walk)*13;
 const breathe=Math.sin(time*2.2)*1.6;
 const forward=kind==='heavy'?26*swing:kind==='light'?18*swing:kind==='special'?12*swing:0;
 const dark='#0b1524',edge='#091321';
 const main=info.color,light=info.accent,deep=info.dark,skin=info.skin;
 const wide=p.frame==='heavy';
 const torso=wide?31:p.frame==='athletic'?25:20;
 const shoulder=wide?38:30;
 c.save();
 if(!preview){oval(c,x,466,34*scale,7*scale,'#040a14a0')}
 c.translate(x,foot+wobble);c.scale(scale*facing,scale);
 if(f.flash>0){c.globalAlpha=.93;c.shadowBlur=23;c.shadowColor='#f0f8ff'}
 // Aura halos only while preparing special and during high-impact frames.
 if(kind==='special'){
   c.save();c.globalAlpha=.38+.13*Math.sin(time*24);
   const aura=c.createRadialGradient(0,-90,16,0,-90,104);
   aura.addColorStop(0,main+'66');aura.addColorStop(1,main+'00');
   c.fillStyle=aura;c.beginPath();c.arc(0,-89,103,0,PI*2);c.fill();
   c.strokeStyle=main;c.lineWidth=1.8;c.beginPath();c.ellipse(0,-88,48,90,0,-1.6,1.2);c.stroke();
   c.restore();
 }
 // Separate moving layers, including distinguishing long coats and ribbons.
 if(['long','split','scarf'].includes(p.coat)){
   const flap=Math.sin(time*3.4)*4+walk*6;
   path(c,[[-22,-97],[-36+flap,-79],[-40+flap,-17],[-10,-38],[13,-34],[43+flap,-8],[31,-94]],deep,edge,3);
   path(c,[[-26,-87],[-35+flap,-28],[-13,-40],[-6,-75]],main,null);
   path(c,[[20,-80],[35+flap,-21],[16,-35],[12,-82]],main,null);
 }
 if(p.coat==='scarf'){
   const xw=-30-8*Math.sin(time*2.2);
   path(c,[[-9,-125],[-32,-126],[xw-29,-116],[xw-48,-92],[xw-12,-104],[-5,-112]],light,edge,2);
   path(c,[[-7,-116],[-36,-107],[-65,-107+Math.sin(time*2)*5],[-39,-98],[-7,-106]],main,null);
 }
 if(p.coat==='short'){
   path(c,[[-torso+2,-96],[-29,-53],[-25,-28],[-2,-41],[27,-28],[30,-52],[torso-2,-99]],deep,edge);
 }
 // Legs with flexion and separate armored boots.
 for(const side of [-1,1]){
   const hip=side*12;
   const knee=side*13+stride*side*.55+(air?-7:0);
   const boot=side*19+stride*side+(air?-side*6:0);
   const lift=air?17+side*5:Math.max(0,-side*stride)*.35;
   segment(c,hip,-53,knee,-30,wide?17:13,dark);
   segment(c,knee,-30,boot,-12-lift,wide?16:12,deep);
   armor(c,knee,-28,wide?12:9,main,light+'aa');
   path(c,[[boot-11,-11-lift],[boot+8,-11-lift],[boot+14,-2-lift],[boot-16,-2-lift]],dark,main,2);
   segment(c,boot-9,-11-lift,boot+9,-11-lift,3,light+'bc',dark);
 }
 // Torso: dimensional shading, layered plates and unique chest icon.
 let chest=c.createLinearGradient(-torso,0,torso,0);
 chest.addColorStop(0,deep);chest.addColorStop(.4,main);chest.addColorStop(.85,main);chest.addColorStop(1,deep);
 path(c,[[-shoulder,-117],[-12,-124],[17,-124],[shoulder,-113],[torso,-67],[12,-53],[-15,-55],[-torso,-68]],chest,edge,4);
 path(c,[[-torso+7,-113],[0,-119],[torso-7,-113],[torso-10,-76],[0,-68],[-torso+10,-76]],deep,light+'66',2);
 path(c,[[-torso+11,-109],[0,-113],[torso-11,-108],[0,-99]],main+'cc',null);
 segment(c,-torso,-64,torso,-64,8,edge);box(c,-8,-69,16,10,3,light,deep);
 // Collar and engraved chest marking
 path(c,[[-23,-118],[-7,-127],[0,-116],[8,-127],[22,-117],[10,-111],[0,-115],[-10,-109]],deep,edge,2);
 if(info.id==='azur'){path(c,[[-6,-101],[3,-104],[-3,-91],[9,-96],[-6,-79],[0,-92],[-9,-89]],light)}
 if(info.id==='nara'){path(c,[[0,-108],[-9,-94],[-1,-91],[-5,-82],[7,-87],[8,-98]],light)}
 if(info.id==='sakh'){path(c,[[-13,-104],[0,-110],[13,-104],[12,-91],[0,-83],[-12,-91]],light);path(c,[[-7,-101],[7,-101],[0,-91]],deep)}
 if(info.id==='rima'){circle(c,0,-95,9,light);circle(c,0,-95,5,deep);circle(c,0,-95,2,main)}
 if(info.id==='zill'){path(c,[[-7,-103],[11,-107],[4,-98],[11,-88],[-8,-89],[1,-95]],light)}
 if(info.id==='rayed'){path(c,[[-10,-104],[0,-113],[10,-104],[6,-91],[-6,-91]],light)}
 if(info.id==='nexus'){path(c,[[0,-110],[10,-99],[0,-84],[-10,-99]],light);circle(c,0,-99,3,main)}
 // Belt pieces, clothing clasps.
 for(const px of [-19,19])circle(c,px,-63,3,light);
 // Back arm tucked (secondary / rear weapon)
 const rearY=block?-105:-85;
 segment(c,-shoulder+4,-112,-shoulder-8,rearY,wide?16:13,deep);
 segment(c,-shoulder-8,rearY,-15,block?-91:-72,wide?16:12,main);
 circle(c,-15,block?-91:-72,7,light,edge);
 if(p.head==='hood'||p.head==='crown'){
   path(c,[[-25,-141],[-40,-109],[-34,-82],[-15,-104]],deep,edge);
 }
 // Neck and face: visible planes make the silhouette readable.
 box(c,-8,-134,16,18,4,skin,edge);
 oval(c,0,-150,19,24,skin,edge);
 path(c,[[-11,-160],[0,-164],[13,-156],[8,-143],[0,-138],[-11,-145]],'#f5d0b82c');
 circle(c,15,-149,3,skin);
 segment(c,1,-149,11,-149,2,edge);
 segment(c,12,-149,17,-147,1.8,edge);
 segment(c,6,-140,13,-141,1.5,deep);
 // Headgear is fully different for each archetype.
 switch(p.head){
  case 'crest':
    path(c,[[-20,-150],[-20,-164],[-12,-163],[-2,-177],[12,-164],[21,-163],[20,-148],[11,-159],[-9,-156]],p.hair,edge,3);
    path(c,[[2,-174],[12,-192],[16,-161]],light,edge,2);
    path(c,[[-10,-161],[15,-165],[19,-159],[1,-155]],deep);break;
  case 'flame':
    path(c,[[-20,-151],[-22,-174],[-12,-166],[-5,-187],[5,-167],[18,-183],[23,-156]],p.hair,edge,3);
    path(c,[[-7,-164],[0,-181],[4,-166],[11,-177],[14,-157]],deep,null);break;
  case 'helm':
    path(c,[[-26,-155],[-21,-174],[-9,-178],[0,-193],[9,-178],[21,-174],[26,-153],[21,-134],[13,-131],[13,-153],[-15,-153],[-13,-132],[-23,-134]],deep,edge,3);
    path(c,[[-23,-164],[0,-181],[23,-164],[17,-156],[-17,-156]],light,edge,2);
    box(c,-17,-155,35,10,2,'#17213a');segment(c,-13,-151,14,-151,3,main);break;
  case 'braid':
    path(c,[[-21,-160],[-20,-174],[-11,-180],[10,-178],[19,-167],[20,-154],[12,-160],[-14,-156]],p.hair,edge,3);
    for(let j=0;j<4;j++)circle(c,-23-j*3,-157+j*9,5,j%2?light:deep,edge,1);
    path(c,[[-21,-163],[0,-170],[22,-158],[13,-157],[-10,-155]],light);break;
  case 'hood':
    path(c,[[-29,-135],[-25,-173],[-8,-188],[12,-182],[26,-160],[24,-131],[17,-144],[8,-165],[-14,-165],[-19,-137]],deep,edge,3);
    path(c,[[-23,-163],[3,-181],[20,-155],[17,-145],[-14,-149]],main,null);
    box(c,-16,-151,33,11,4,'#1b1b35');segment(c,-10,-146,13,-146,3,light);break;
  case 'short':
    path(c,[[-22,-158],[-24,-169],[-15,-172],[-6,-179],[4,-169],[17,-174],[21,-155],[11,-161],[-14,-159]],p.hair,edge,3);
    path(c,[[-17,-158],[-4,-167],[11,-161],[17,-155]],light);break;
  case 'crown':
    path(c,[[-24,-152],[-28,-186],[-14,-178],[-9,-202],[0,-179],[10,-204],[18,-179],[32,-187],[24,-151],[15,-135],[-15,-135]],deep,edge,4);
    path(c,[[-25,-181],[-13,-172],[-7,-192],[1,-169],[10,-191],[17,-173],[28,-181],[22,-151],[-20,-151]],main,null);
    box(c,-17,-153,34,15,3,'#251429',light);
    circle(c,0,-152,5,light);break;
 }
 // Boots and arm silhouette are readable even when reduced to a roster portrait.
 if(wide){
   path(c,[[-shoulder,-119],[-shoulder-18,-112],[-shoulder-22,-91],[-shoulder+4,-90]],main,edge,3);
   path(c,[[shoulder-5,-121],[shoulder+20,-111],[shoulder+20,-90],[shoulder-7,-90]],main,edge,3);
   segment(c,shoulder+6,-113,shoulder+16,-100,3,light,deep);
 }else{
   armor(c,-shoulder-1,-112,17,deep,light);
   armor(c,shoulder+1,-112,18,main,light);
 }
 // Forward arm: telegraphed extension changes between idle, guard and attack.
 let elbowX=shoulder+12,elbowY=-90;
 let handX=shoulder+3,handY=-78;
 if(block){elbowX=23;elbowY=-105;handX=13;handY=-131}
 if(kind){elbowX=shoulder+14+forward*.5;elbowY=-100-8*swing;handX=40+forward;handY=-94-18*swing}
 segment(c,shoulder-1,-108,elbowX,elbowY,wide?17:14,deep);
 segment(c,elbowX,elbowY,handX,handY,wide?16:12,main);
 circle(c,handX,handY,wide?10:8,light,edge);
 armor(c,elbowX,elbowY,wide?13:10,main,light);
 if(block){
   c.strokeStyle=main;c.lineWidth=6;c.beginPath();c.arc(11,-100,47,-1.4,1.05);c.stroke();
   c.strokeStyle=light+'99';c.lineWidth=2;c.beginPath();c.arc(11,-100,53,-1.4,1.05);c.stroke();
 }
 if(p.detail==='sword'){
   segment(c,handX+1,handY,handX+11,handY-11,6,deep);
   path(c,[[handX+7,handY-10],[handX+47,handY-79],[handX+53,handY-84],[handX+18,handY-8]],'#d8eaf7',deep,2);
   segment(c,handX-1,handY-18,handX+27,handY-7,4,light,deep);
   segment(c,handX+24,handY-27,handX+48,handY-77,2,main);
 }
 if(p.detail==='blades'){
   for(const off of [-6,7])path(c,[[handX-1,handY+off],[handX+27,handY-12+off],[handX+37,handY-47+off],[handX+16,handY-22+off]],light,deep,2);
 }
 if(p.detail==='shield'){
   path(c,[[handX-2,handY-35],[handX+30,handY-35],[handX+39,handY],[handX+14,handY+21],[handX-9,handY]],deep,light,3);
   path(c,[[handX+14,handY-30],[handX+26,handY-10],[handX+14,handY+8],[handX+2,handY-10]],main);
 }
 if(p.detail==='fan'){
   for(let i=0;i<5;i++){
     const ang=-PI*.9+i*PI*.18;
     segment(c,handX,handY,handX+30*Math.cos(ang),handY+30*Math.sin(ang),2,light,deep);
   }
   path(c,[[handX-30,handY-9],[handX,handY-33],[handX+29,handY-9],[handX,handY+2]],main+'b5',light,2);
 }
 if(p.detail==='dagger'){
   path(c,[[handX,handY],[handX+18,handY-7],[handX+35,handY-49],[handX+20,handY-37]],light,edge,2);
   segment(c,handX-4,handY-8,handX+23,handY+1,3,main);
 }
 if(p.detail==='fists'){
   box(c,handX-9,handY-15,30,27,7,main,edge);
   for(let i=0;i<3;i++)segment(c,handX-4+i*8,handY-7,handX-4+i*8,handY+6,2,light,deep);
   segment(c,handX-4,handY-15,handX+17,handY-15,3,light,deep);
 }
 if(p.detail==='staff'){
   segment(c,handX+10,handY+23,handX+27,handY-93,8,deep,light);
   circle(c,handX+28,handY-100,16,main,edge,3);
   path(c,[[handX+28,handY-120],[handX+42,handY-101],[handX+28,handY-83],[handX+13,handY-101]],light,edge,2);
   circle(c,handX+28,handY-101,5,'#fff3fc');
 }
 if(kind==='light'||kind==='heavy'){
   c.save();c.globalAlpha=Math.max(0,1-(attack?.t||0)*2.2);
   c.strokeStyle=main;c.shadowColor=main;c.shadowBlur=15;c.lineWidth=kind==='heavy'?10:6;
   c.beginPath();c.arc(handX+9,handY-10,47,PI*1.45,PI*1.93);c.stroke();
   c.strokeStyle='#f5ffff';c.lineWidth=2;c.stroke();c.restore();
 }
 if(f.stun>0){for(let i=0;i<3;i++)circle(c,-18+i*18,-207+Math.sin(time*9+i*3)*4,3,light)}
 c.restore();
}
export function portrait(c,f,time=0){
 const w=c.canvas.width,h=c.canvas.height;c.clearRect(0,0,w,h);
 const g=c.createRadialGradient(w*.5,h*.66,4,w*.5,h*.66,w*.62);
 g.addColorStop(0,f.color+'55');g.addColorStop(.7,f.color+'17');g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(0,0,w,h);
 const scale=Math.min(w/116,(h-10)/218);
 drawFighter(c,{info:f,flash:0,attack:null,walk:0,block:false,stun:0},w/2,h-4,scale,1,time,true);
}
