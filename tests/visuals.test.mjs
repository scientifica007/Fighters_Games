import test from 'node:test';
import assert from 'node:assert/strict';
import { FIGHTERS, RULES } from '../fighters.js';
import { STAGE_PALETTES, drawStage } from '../visuals/stages.js';
import { drawFighter, portrait } from '../visuals/characters.js';
import { render } from '../render.js';

function fakeCanvas(width=960,height=540){
  let calls=0;
  const noop=()=>{calls++};
  const gradient=()=>({addColorStop:noop});
  const ctx={
    canvas:{width,height},get calls(){return calls},
    beginPath:noop,closePath:noop,moveTo:noop,lineTo:noop,bezierCurveTo:noop,
    arc:noop,ellipse:noop,roundRect:noop,rect:noop,
    fill:noop,stroke:noop,fillRect:noop,strokeRect:noop,clearRect:noop,
    save:noop,restore:noop,translate:noop,scale:noop,rotate:noop,
    drawImage:noop,fillText:noop,clip:noop,
    createLinearGradient:gradient,createRadialGradient:gradient,
  };
  return ctx;
}
function sample(f,x,dir){
 return {info:f,x,y:RULES.floorY,dir,hp:100,guard:100,vy:0,attack:null,
         block:false,stun:0,flash:0,specialCd:0,walk:0};
}
test('each of seven arenas paints without exception and has a unique palette',()=>{
 assert.equal(STAGE_PALETTES.length,7);
 assert.equal(new Set(STAGE_PALETTES.map(v=>v.name)).size,7);
 assert.equal(new Set(STAGE_PALETTES.map(v=>v.glow)).size,7);
 for(let stage=0;stage<7;stage++){
   const c=fakeCanvas();drawStage(c,.5,stage);
   assert.ok(c.calls>170,'arena '+stage+' should contain architectural detail');
 }
});
test('every character draws at portrait and battle sizes in idle, guard and attack poses',()=>{
 for(const f of FIGHTERS){
   const portraitCtx=fakeCanvas(144,162);
   portrait(portraitCtx,f,0);
   assert.ok(portraitCtx.calls>50,f.id+' should have detailed portrait');
   for(const pose of ['idle','light','heavy','special','guard']){
     const c=fakeCanvas();
     const model=sample(f,350,1);
     if(pose==='guard')model.block=true;
     else if(pose!=='idle')model.attack={kind:pose,t:pose==='special'?.4:.18};
     drawFighter(c,model,350,463,1.1,1,1.5);
     assert.ok(c.calls>50,f.id+' should draw '+pose);
   }
 }
});
test('new renderer does not mutate fighters, gameplay stats or timers',()=>{
 const a=sample(FIGHTERS[0],255,1),b=sample(FIGHTERS[6],711,-1);
 const g={fighters:[a,b],projectiles:[],particles:[],shake:0,stageIndex:6,
          timer:58,announcement:1,message:'استعد للقتال!',wins:[1,0]};
 const original=JSON.stringify(g);
 const c=fakeCanvas();render(c,g,.5);
 assert.ok(c.calls>300);
 assert.equal(JSON.stringify(g),original);
});
test('all seven stage indices render with projectiles and impact particles',()=>{
 for(let i=0;i<7;i++){
   const a=sample(FIGHTERS[i],300,1),b=sample(FIGHTERS[(i+1)%7],650,-1);
   a.attack={kind:'special',t:.48};
   const game={fighters:[a,b],stageIndex:i,shake:6,timer:25,announcement:0,
    wins:[0,1],projectiles:[{x:500,y:385,vx:420,color:a.info.color}],
    particles:[{x:490,y:335,life:.2,maxLife:.5,color:'#ffffff',size:5},
               {x:530,y:330,life:.4,maxLife:.6,color:'#ffccbb',text:'−12',size:18}]};
   const c=fakeCanvas();assert.doesNotThrow(()=>render(c,game,3.5));
 }
});
