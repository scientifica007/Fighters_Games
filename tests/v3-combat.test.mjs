import test from 'node:test';
import assert from 'node:assert/strict';
import {CORE,FIGHTERS,MOVES,FPS,WIDTH,FLOOR} from '../v3/roster.js';
import {createMatch,resetRound,step,moveFrameInfo,cpuInput} from '../v3/engine.js';

const none={};
function ready(g){let safety=0;while(g.phase==='ready'&&safety++<120)step(g,[none,none]);assert.equal(g.phase,'fight');return g}
function advance(g,n,a={},b={}){for(let i=0;i<n;i++)step(g,[a,b])}
function adjacent(g){g.fighters[0].x=420;g.fighters[1].x=515}
test('two authored fighters, shared stats and exact frame-data contract',()=>{
 assert.equal(FIGHTERS.length,2);assert.notEqual(FIGHTERS[0].id,FIGHTERS[1].id);
 assert.ok(Object.isFrozen(CORE));assert.equal(CORE.health,100);
 for(const name of ['light','heavy','special','super']){
  const m=MOVES[name];const info=moveFrameInfo(name);
  assert.equal(info.firstActive,m.startup+1);assert.equal(info.total,m.startup+m.active+m.recovery);
  assert.ok(m.damage>0&&m.active>0&&m.startup>0);
 }
 assert.equal(CORE.specialCost,25);assert.equal(CORE.superCost,100);
});
test('60 Hz deterministic match advances only on explicit ticks',()=>{
 const g=createMatch({mode:'duel'});
 assert.equal(g.phase,'ready');const pre=JSON.stringify(g);
 assert.equal(JSON.stringify(g),pre);
 ready(g);assert.equal(g.timeFrames,CORE.roundSeconds*FPS);
 step(g,[{},{}]);assert.equal(g.timeFrames,CORE.roundSeconds*FPS-1);
 assert.equal(g.fighters[0].hp,g.fighters[1].hp);
});
test('light attack hits on active frames and never hits twice per swing',()=>{
 const g=ready(createMatch({mode:'duel'}));adjacent(g);
 step(g,[{light:true},{}]);advance(g,12);
 assert.equal(g.fighters[1].hp,100-MOVES.light.damage);
 advance(g,65);
 assert.equal(g.fighters[1].hp,93);
});
test('guard prevents normal damage and decreases guard gauge',()=>{
 const g=ready(createMatch({mode:'duel'}));adjacent(g);
 step(g,[{light:true},{guard:true}]);
 advance(g,12,{}, {guard:true});
 assert.equal(g.fighters[1].hp,100);
 assert.ok(g.fighters[1].guard<100);
});
test('light hit confirms can cancel into heavy, adding combo count',()=>{
 const g=ready(createMatch({mode:'duel'}));adjacent(g);
 step(g,[{light:true},{}]);
 advance(g,14);
 assert.equal(g.fighters[1].hp,93);
 // Wait until global hitstop has ended, then cancel while light is still in recovery.
 advance(g,2);
 step(g,[{heavy:true},{}]);
 assert.equal(g.fighters[0].action?.name,'heavy');
 advance(g,38);
 assert.ok(g.fighters[1].hp<=80);
 assert.ok(g.fighters[0].combo>=2);
});
test('special costs equal meter and Azur bolt hits through explicit AABB',()=>{
 const g=ready(createMatch({mode:'duel'}));
 g.fighters[0].x=300;g.fighters[1].x=670;
 step(g,[{special:true},{}]);
 assert.equal(g.fighters[0].meter,10);
 advance(g,70);
 assert.ok(g.fighters[1].hp<100,'bolt must collide after travel');
 assert.equal(g.fighters[0].specialCooldown>=0,true);
});
test('normal attack is blocked during stun and high-cost super cannot activate early',()=>{
 const g=ready(createMatch({mode:'duel'}));adjacent(g);
 step(g,[{super:true},{}]);
 assert.equal(g.fighters[0].action,null);
 assert.equal(g.fighters[0].meter,35);
 step(g,[{light:true},{}]);advance(g,13);
 const victim=g.fighters[1];
 step(g,[{}, {heavy:true}]);
 assert.equal(victim.action,null);
});
test('two round victories end match and preserve roster choice',()=>{
 const g=ready(createMatch({mode:'duel',p1:'nara',p2:'azur'}));
 adjacent(g);g.fighters[1].hp=5;
 step(g,[{light:true},{}]);advance(g,10);
 assert.equal(g.phase,'roundOver');
 assert.deepEqual(g.wins,[1,0]);
 resetRound(g);
 assert.equal(g.phase,'ready');assert.equal(g.fighters[0].id,'nara');
 ready(g);adjacent(g);g.fighters[1].hp=4;
 step(g,[{light:true},{}]);advance(g,10);
 assert.equal(g.phase,'matchOver');assert.equal(g.winner,0);
 assert.deepEqual(g.wins,[2,0]);
});
test('cpu difficulty does not change fighter strength',()=>{
 const easy=createMatch({mode:'cpu',difficulty:'easy'});
 const hard=createMatch({mode:'cpu',difficulty:'hard'});
 assert.deepEqual(easy.fighters.map(f=>[f.hp,f.meter,f.guard]),hard.fighters.map(f=>[f.hp,f.meter,f.guard]));
 ready(easy);ready(hard);
 const input=cpuInput(easy,()=>.11);
 assert.equal(typeof input.left,'boolean');assert.equal(typeof input.guard,'boolean');
});
test('jump, bounds and pushboxes remain physically valid',()=>{
 const g=ready(createMatch({mode:'duel'}));
 step(g,[{jump:true},{}]);assert.ok(g.fighters[0].y<FLOOR);
 advance(g,100);assert.equal(g.fighters[0].y,FLOOR);
 g.fighters[0].x=20;g.fighters[1].x=25;
 step(g,[{},{}]);
 assert.ok(g.fighters[0].x>=55&&g.fighters[1].x<=WIDTH-55);
 assert.ok(g.fighters[1].x-g.fighters[0].x>=70);
});
