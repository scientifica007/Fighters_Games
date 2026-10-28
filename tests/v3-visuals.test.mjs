import test from 'node:test';
import assert from 'node:assert/strict';
import {FIGHTERS} from '../v3/roster.js';
import {sprite,drawSprite,drawPortrait,spriteCacheStats} from '../v3/art.js';
import {drawArena} from '../v3/stage.js';

function fakeContext(canvas){
 let count=0;const called=()=>{count++};
 const gradient=()=>({addColorStop:called});
 return {
  canvas,get count(){return count},
  beginPath:called,closePath:called,moveTo:called,lineTo:called,
  quadraticCurveTo:called,bezierCurveTo:called,arc:called,ellipse:called,
  rect:called,roundRect:called,fillRect:called,strokeRect:called,
  fill:called,stroke:called,clearRect:called,drawImage:called,
  save:called,restore:called,translate:called,rotate:called,scale:called,
  fillText:called,strokeText:called,createLinearGradient:gradient,createRadialGradient:gradient
 };
}
globalThis.document={createElement(tag){
 assert.equal(tag,'canvas');
 const canvas={width:0,height:0};
 canvas.getContext=()=>{if(!canvas.ctx)canvas.ctx=fakeContext(canvas);return canvas.ctx};
 return canvas;
}};

test('original sprites support all combat poses without external images',()=>{
 const states=['idle','walk','jump','guard','crouch','light','heavy','special','super','hurt','ko','win'];
 for(const f of FIGHTERS){
  for(const state of states){
   const img=sprite(f.id,state,6);
   assert.equal(img.width,260);
   assert.equal(img.height,310);
   assert.ok(img.getContext().count>30, f.id+' '+state);
  }
 }
 assert.ok(spriteCacheStats().frames>=24);
});
test('identical sprite frames reuse cached raster canvases',()=>{
 const first=sprite('azur','light',7),second=sprite('azur','light',7);
 assert.equal(first,second);
});
test('battle sprites and large portrait render on canvases without throwing',()=>{
 const c=document.createElement('canvas').getContext('2d');
 for(const f of FIGHTERS){
  drawSprite(c,f.id,'heavy',13,280,520,1.12,-1);
  drawPortrait(c,f.id,90,250,.95);
 }
 assert.ok(c.count>0);
});
test('arena layers draw, cache, and animate without touching gameplay models',()=>{
 const c=document.createElement('canvas').getContext('2d');
 drawArena(c,1.4,15);
 const n=c.count;
 assert.ok(n>30);
 drawArena(c,2.1,-15);
 assert.ok(c.count>n);
});
