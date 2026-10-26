import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { RULES, SELECTABLE, STAGES, STORY_OPPONENTS, findFighter } from '../fighters.js';

function boot(){
  const all=new Map(),listeners={},globalListeners={};
  let queued=null,now=0,frameNo=0;
  class FakeElement{
    constructor(tag='div'){this.tagName=tag;this.hidden=false;this.children=[];this.events={};this.dataset={};this.className='';this.style={setProperty(){}};this.classList={toggle(){}};this.textContent='';this.innerHTML='';this.width=960;this.height=540;}
    append(...xs){this.children.push(...xs)}
    after(){} remove(){}
    replaceChildren(){this.children=[]}
    setAttribute(){}
    addEventListener(event,fn){(this.events[event]||=[]).push(fn)}
    querySelector(sel){if(!this.parts)this.parts={};return this.parts[sel]||=new FakeElement(sel)}
    getContext(){return {}}
    blur(){}
  }
  const get=id=>all.get(id)||all.set(id,new FakeElement(id)).get(id);
  const modes=['arcade','duel'].map(mode=>{const e=new FakeElement('button');e.dataset.mode=mode;return e});
  const document={
    getElementById:get,createElement:tag=>new FakeElement(tag),
    querySelectorAll:()=>modes,addEventListener:(type,fn)=>{globalListeners[type]=fn},
    activeElement:{blur(){}},hidden:false
  };
  const window={
    addEventListener:(event,fn)=>{listeners[event]=fn},scrollTo(){}
  };
  const saved=new Map();
  const localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
  const sandbox={document,window,localStorage,confirm:()=>true,performance:{now:()=>now},
    requestAnimationFrame:fn=>{queued=fn;return ++frameNo},
    RULES,SELECTABLE,STAGES,STORY_OPPONENTS,findFighter,portrait:()=>{},render:()=>{},console,
    Math,Set,Map,Number,String,Array,Object};
  const source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8')
    .replace(/^import .+;\s*$/gm,'')+
    '\nglobalThis.__probe={getGame:()=>game,getScene:()=>scene,setMode,setupBattle,leaveGame,attack};\n';
  vm.runInNewContext(source,sandbox,{filename:'game.js',timeout:5000});
  const trigger=(id,event='click')=>{const ev=get(id).events[event]?.[0];assert.ok(ev,id+' has '+event);ev()};
  const keyboard=(code,pressed)=>{const e={code,preventDefault(){},repeat:false};
    if(pressed)listeners.keydown(e);else listeners.keyup(e)};
  const step=(frames=1)=>{for(let i=0;i<frames;i++){now+=1000/60;const fn=queued;queued=null;assert.ok(fn,'animation frame exists');fn(now)}};
  return {trigger,step,keyboard,sandbox,doc:document,localStorage,
    ...sandbox.__probe};
}

test('selection loads, story starts and a light attack damages a nearby opponent',()=>{
  const b=boot();assert.equal(b.getScene(),'select');
  b.trigger('startBtn');assert.equal(b.getScene(),'game');
  const g=b.getGame();assert.equal(g.fighters.length,2);assert.equal(g.fighters[0].hp,100);
  b.step(80);
  g.fighters[0].x=400;g.fighters[1].x=476;g.fighters[1].ai=false;
  b.keyboard('KeyF',true);b.step(12);b.keyboard('KeyF',false);
  assert.equal(g.fighters[1].hp,93);
  assert.equal(g.fighters[0].hp,100);
});

test('winning an arcade stage saves progress and advances to the next stage',()=>{
  const b=boot();b.trigger('startBtn');b.step(80);
  const g=b.getGame();g.fighters[1].ai=false;
  g.fighters[0].x=400;g.fighters[1].x=476;g.fighters[1].hp=6;
  b.keyboard('KeyF',true);b.step(12);b.keyboard('KeyF',false);
  assert.equal(g.ended,true);
  assert.equal(b.doc.getElementById('nextBtn').hidden,false);
  assert.equal(JSON.parse(b.localStorage.getItem('elemental-rivals-progress-v1')).azur,1);
  b.trigger('nextBtn');assert.equal(b.getGame().fighters[1].info.id,'rima');
});

test('local two-player mode accepts second player keyboard attacks',()=>{
  const b=boot();b.setMode('duel');b.trigger('startBtn');b.step(80);
  const g=b.getGame();assert.equal(g.fighters[1].ai,false);
  g.fighters[0].x=475;g.fighters[1].x=400;
  b.keyboard('KeyJ',true);b.step(12);b.keyboard('KeyJ',false);
  assert.equal(g.fighters[0].hp,93);
});

test('pause freezes the match timer and resumes from the same time',()=>{
  const b=boot();b.trigger('startBtn');b.step(80);
  b.trigger('pauseBtn');const before=b.getGame().timer;b.step(150);
  assert.equal(b.getGame().timer,before);
  b.trigger('resumeBtn');b.step(15);
  assert.ok(b.getGame().timer<before);
});
