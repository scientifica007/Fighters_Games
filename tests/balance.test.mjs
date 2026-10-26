import test from 'node:test';
import assert from 'node:assert/strict';
import { RULES, FIGHTERS, SELECTABLE, STAGES, STORY_OPPONENTS, findFighter } from '../fighters.js';

test('six selectable original fighters plus one final boss',()=>{
  assert.equal(SELECTABLE.length,6);
  assert.equal(FIGHTERS.length,7);
  assert.equal(new Set(FIGHTERS.map(f=>f.id)).size,FIGHTERS.length);
  assert.equal(new Set(SELECTABLE.map(f=>f.special)).size,6);
  assert.equal(SELECTABLE.some(f=>f.id==='nexus'),false);
});
test('all combat damage and movement figures are shared in one immutable rulebook',()=>{
  assert.equal(RULES.hp,100);
  assert.equal(RULES.specialDamage,15);
  assert.equal(RULES.specialCooldown,6.6);
  assert.ok(RULES.heavyDamage>RULES.lightDamage);
  assert.ok(RULES.heavyWindup>RULES.lightWindup);
  assert.ok(RULES.specialCooldown>RULES.specialDuration);
  assert.ok(RULES.lightDamage>0 && RULES.speed>0);
  assert.ok(Object.isFrozen(RULES));
  for(const f of FIGHTERS){
    for(const forbidden of ['hp','health','speed','attackDamage','specialDamage','specialCooldown','damageMultiplier','bossHealth']) {
      assert.equal(Object.hasOwn(f,forbidden),false, f.id+' bypasses common balance rules');
    }
  }
});
test('each archetype has distinct visual identity and authored skill',()=>{
  for(const f of FIGHTERS){
    for(const key of ['name','title','role','color','dark','skin','accent','shape','special','specialName','specialDescription','tactic']){
      assert.ok(typeof f[key]==='string'&&f[key].length>0, f.id+' missing '+key);
    }
  }
  assert.equal(new Set(FIGHTERS.map(f=>f.shape)).size,FIGHTERS.length);
});
test('arcade ladder rises strictly in decision skill, never character stats',()=>{
  assert.equal(STAGES.length,7);
  assert.equal(STORY_OPPONENTS.length,STAGES.length);
  for(let i=0;i<STAGES.length;i++){
    assert.ok(FIGHTERS.some(f=>f.id===STORY_OPPONENTS[i]));
    assert.ok(STAGES[i].intelligence>=0&&STAGES[i].intelligence<=1);
    if(i>0)assert.ok(STAGES[i].intelligence>STAGES[i-1].intelligence);
  }
  assert.equal(STORY_OPPONENTS.at(-1),'nexus');
});
test('fighter lookup falls back safely',()=>{
  assert.equal(findFighter('nara').id,'nara');
  assert.equal(findFighter('nexus').id,'nexus');
  assert.equal(findFighter('unknown').id,SELECTABLE[0].id);
});