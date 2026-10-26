// In-battle interface & effects: cinematic telegraphs remain readable on a
// 960x540 logical arena. No effect changes collision, damage or hit timings.
import { RULES } from '../fighters.js';
const W=960,H=540;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill()}
function line(c,x,y,xx,yy,color,width){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke()}
function rounded(c,x,y,w,h,r,fill,stroke=null){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();
 if(stroke){c.lineWidth=1;c.strokeStyle=stroke;c.stroke()}
}
function label(c,text,x,y,align='left',size=14,color='#fff',weight=700){
 c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.font=weight+' '+size+'px system-ui, sans-serif';c.fillText(text,x,y);
}
function filledBar(c,x,y,width,height,pct,color,reverse=false){
 const n=Math.max(0,Math.min(1,pct)),w=width*n;
 rounded(c,x,y,width,height,5,'#090f1ebf','#ffffff26');
 if(w<1)return;
 const gradient=c.createLinearGradient(x,y,x+width,y);
 gradient.addColorStop(0,color);gradient.addColorStop(.5,'#f7f7f0');gradient.addColorStop(1,color);
 c.save();c.beginPath();c.roundRect(x,y,width,height,5);c.clip();
 c.fillStyle=gradient;c.fillRect(reverse?x+width-w:x,y,w,height);
 c.fillStyle='#ffffff42';c.fillRect(reverse?x+width-w:x,y,w,3);
 c.restore();
}
export function drawHUD(c,g){
 const a=g.fighters[0],b=g.fighters[1];if(!a||!b)return;
 c.save();c.direction='ltr';
 // Dark glass keeps information legible over seven wildly different scenes.
 const top=c.createLinearGradient(0,0,0,104);
 top.addColorStop(0,'#020917ec');top.addColorStop(1,'#071322a0');
 rounded(c,15,12,930,93,12,top,'#bdd4e838');
 for(const [i,f] of g.fighters.entries()){
   const left=i===0,x=left?26:934,align=left?'left':'right';
   const nameX=left?35:925;
   rounded(c,left?27:887,19,45,44,7,f.info.dark,f.info.color+'ad');
   c.save();c.shadowColor=f.info.color;c.shadowBlur=8;
   label(c,f.info.portrait,left?50:910,41,'center',25,f.info.accent,900);c.restore();
   label(c,f.info.name,left?83:875,36,align,18,'#f4f6fc',900);
   label(c,f.info.title,left?83:875,58,align,10,'#c4cbd5',500);
   filledBar(c,left?29:562,72,369,13,f.hp/RULES.hp,left?'#50d9f4':'#f77b94',!left);
   filledBar(c,left?29:562,92,369,4,f.guard/RULES.guard,'#e8cd9c',!left);
   const skillProgress=1-clamp(f.specialCd/RULES.specialCooldown,0,1);
   c.beginPath();c.arc(left?421:539,83,17,0,Math.PI*2);
   c.strokeStyle='#ffffff25';c.lineWidth=4;c.stroke();
   c.beginPath();c.arc(left?421:539,83,17,-Math.PI/2,-Math.PI/2+skillProgress*2*Math.PI);
   c.strokeStyle=f.info.color;c.lineWidth=4;c.stroke();
   if(f.specialCd>0)label(c,Math.ceil(f.specialCd)+'',left?421:539,84,'center',13,'#fff2d9',900);
   else label(c,'✦',left?421:539,84,'center',15,f.info.color,900);
 }
 rounded(c,446,25,68,63,10,'#18223a','#e6c89991');
 label(c,'TIME',480,39,'center',9,'#f0c992',800);
 label(c,String(Math.max(0,Math.ceil(g.timer))).padStart(2,'0'),480,67,'center',29,g.timer<11?'#ff9a9a':'#ffebc5',900);
 if(g.wins){ // Match wins; dots convey best-of-three on same machine.
   for(let i=0;i<2;i++)for(let j=0;j<2;j++){
     oval(c,i===0?345+j*15:615-j*15,32,4,4,j<g.wins[i]?'#ffde97':'#8ba1b15c');
   }
 }
 c.restore();
}
function strokeEllipse(c,x,y,rx,ry,color,width,alpha=1){
 c.save();c.globalAlpha=alpha;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);
 c.strokeStyle=color;c.lineWidth=width;c.stroke();c.restore();
}
export function drawAbilities(c,g,t){
 if(!g||!g.fighters)return;
 // Lingering trails convey motion and threat. Transparent telegraphs are not hitboxes.
 for(const f of g.fighters){
   const attack=f.attack;if(!attack||attack.kind!=='special')continue;
   const a=attack.t,s=f.info.special,col=f.info.color,dir=f.dir;
   c.save();c.shadowColor=col;c.shadowBlur=15;
   const blend=clamp((a-.12)*4,0,1)*clamp((.8-a)*3,0,1);
   c.globalAlpha=blend;
   if(s==='bolt'){
     for(let i=0;i<3;i++)line(c,f.x+dir*(20+i*15),f.y-76-i*2,f.x+dir*(50+i*15),f.y-92,col,3);
   }else if(s==='dash'){
     for(let j=0;j<3;j++){
       const x=f.x-dir*(25+j*20);
       strokeEllipse(c,x,f.y-83,23+j*6,52+j*8,col,4,.4);
     }
   }else if(s==='shock'){
     strokeEllipse(c,f.x+dir*85,459,165,19,col,5);
     for(let i=0;i<7;i++){
       const x=f.x+dir*(i*28);
       line(c,x,461,x+dir*14,434-(i%3)*11,col,4);
     }
   }else if(s==='spin'){
     for(let i=0;i<3;i++){
       c.beginPath();c.ellipse(f.x,f.y-91,75+i*10,44+i*8,-.2+t*.9+i,0,Math.PI*1.4);
       c.strokeStyle=i%2?f.info.accent:col;c.lineWidth=5-i;c.stroke();
     }
   }else if(s==='warp'){
     strokeEllipse(c,f.x,f.y-80,37,76,col,4);
     line(c,f.x-16,f.y-130,f.x+17,f.y-20,f.info.accent,2);
   }else if(s==='upper'){
     for(let i=0;i<5;i++){
       const y=f.y-20-i*21;
       line(c,f.x+dir*(6+i*5),y,f.x+dir*(17+i*9),y-35,col,5-i*.65);
     }
   }
   c.restore();
 }
}
export function drawProjectiles(c,g,t){
 for(const p of g.projectiles){
   const dir=Math.sign(p.vx)||1,color=p.color;
   c.save();c.shadowColor=color;c.shadowBlur=18;c.globalCompositeOperation='screen';
   const glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,38);
   glow.addColorStop(0,'#ffffff');glow.addColorStop(.23,color);glow.addColorStop(1,color+'00');
   oval(c,p.x,p.y,38,30,glow);
   for(let i=0;i<4;i++)line(c,p.x-dir*(23+i*17),p.y+Math.sin(t*16+i)*7,p.x-dir*(2+i*7),p.y,color,6-i);
   oval(c,p.x,p.y,12,8,'#fffdf3');
   line(c,p.x-dir*15,p.y,p.x+dir*16,p.y,'#ffffff',3);
   c.restore();
 }
}
export function drawHitParticles(c,g){
 for(const p of g.particles){
   c.save();c.globalAlpha=clamp(p.life/p.maxLife,0,1);
   if(p.text){
     c.shadowColor='#000a';c.shadowBlur=7;
     label(c,p.text,p.x,p.y,'center',p.size||19,p.color,900);
   }else{
     const r=Math.max(1,p.size*p.life/p.maxLife);
     c.shadowColor=p.color;c.shadowBlur=6;
     oval(c,p.x,p.y,r,r*.65,p.color);
   }
   c.restore();
 }
}
export function drawRoundBanner(c,g){
 if(g.announcement<=0)return;
 c.save();const a=clamp(g.announcement*2,0,1);
 c.globalAlpha=a;c.direction='rtl';
 const gradient=c.createLinearGradient(260,0,700,0);
 gradient.addColorStop(0,'#06132700');gradient.addColorStop(.2,'#09192abb');
 gradient.addColorStop(.8,'#09192abb');gradient.addColorStop(1,'#06132700');
 c.fillStyle=gradient;c.fillRect(200,165,560,83);
 label(c,g.message,480,208,'center',32,'#fff0d7',900);
 line(c,319,170,641,170,'#f0d4a44a',1);
 line(c,319,245,641,245,'#f0d4a44a',1);
 c.restore();
}
export function drawImpactFlash(c,g){
 if(g.shake<5)return;
 c.save();c.globalAlpha=(g.shake-5)/120;
 c.fillStyle='#e2f4ff';c.fillRect(0,0,W,H);
 c.restore();
}
