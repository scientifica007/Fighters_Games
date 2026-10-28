import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MOVE_PAD,ATTACK_PAD,mountMobileControls} from '../v3/mobile-controls.js';
import {FACE_PROFILES,drawFace,drawFaceAvatar} from '../v3/faces.js';

class Element{
 constructor(){this.children=[];this.events={};this.dataset={};this.attrs={};
  this.className='';this.classList={add:(x)=>{this._pressed=true},remove:(x)=>{this._pressed=false}};}
 replaceChildren(){this.children=[]}
 append(el){this.children.push(el)}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,fn){(this.events[k]||=[]).push(fn)}
 querySelector(s){if(!this.nodes)this.nodes={};return this.nodes[s] ||=new Element()}
 querySelectorAll(s){return s==='button'?this.children.filter(x=>x.isButton):[]}
 setPointerCapture(){}
 dispatch(name,pointerId=1){const event={pointerId,pointerType:'touch',button:0,preventDefault(){}};for(const fn of this.events[name]||[])fn(event)}
}
globalThis.document={createElement(type){const e=new Element();e.isButton=type==='button';return e}};

test('physical touch layout has exactly four directions and four actions',()=>{
 assert.deepEqual(MOVE_PAD.map(x=>x.key),['jump','left','guard','right']);
 assert.deepEqual(ATTACK_PAD.map(x=>x.key),['light','heavy','special','super']);
 assert.equal(new Set([...MOVE_PAD,...ATTACK_PAD].map(x=>x.cell)).size,8);
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.indexOf('id="touchMove"')<html.indexOf('id="screen"'));
 assert.ok(html.indexOf('id="screen"')<html.indexOf('id="touchFight"'));
 const css=fs.readFileSync(new URL('../v3/style.css',import.meta.url),'utf8');
 assert.match(css,/\.touch-left\s*\{grid-row:1;grid-column:1/);
 assert.match(css,/\.touch-right\s*\{grid-row:1;grid-column:3/);
 assert.match(css,/min-height:clamp\(46px/);
});
test('two thumbs can move and strike independently without stuck key states',()=>{
 const move=new Element(),attack=new Element(),held=new Set();
 const pad=mountMobileControls(move,attack,k=>held.add(k),k=>held.delete(k));
 const left=move.querySelectorAll('button').find(b=>b.dataset.action==='left');
 const fast=attack.querySelectorAll('button').find(b=>b.dataset.action==='light');
 assert.ok(left&&fast);
 left.dispatch('pointerdown',11);fast.dispatch('pointerdown',22);
 assert.equal(held.has('left'),true);assert.equal(held.has('light'),true);
 left.dispatch('pointerup',11);
 assert.equal(held.has('left'),false);assert.equal(held.has('light'),true);
 pad.release();assert.equal(held.size,0);
 assert.equal(fast._pressed,false);
});
test('disabled touch panel ignores taps while paused or not fighting',()=>{
 const move=new Element(),attack=new Element(),held=[];
 mountMobileControls(move,attack,x=>held.push(x),()=>{},()=>false);
 move.querySelectorAll('button')[0].dispatch('pointerdown');
 assert.equal(held.length,0);
});
test('fighter profiles distinguish physical facial features and portraits render',()=>{
 assert.notEqual(FACE_PROFILES.azur.shape,FACE_PROFILES.nara.shape);
 assert.notEqual(FACE_PROFILES.azur.eyes,FACE_PROFILES.nara.eyes);
 assert.notEqual(FACE_PROFILES.azur.hair,FACE_PROFILES.nara.hair);
 assert.notEqual(FACE_PROFILES.azur.detail,FACE_PROFILES.nara.detail);
 const draws=[];
 const g=()=>({addColorStop(){}});
 const ctx={beginPath(){},moveTo(){},lineTo(){},closePath(){},
  stroke(){draws.push('stroke')},fill(){draws.push('fill')},
  arc(){},ellipse(){},rect(){},fillRect(){draws.push('rect')},
  save(){},restore(){},translate(){},scale(){},clip(){},
  createLinearGradient:g,createRadialGradient:g
 };
 for(const fighter of ['azur','nara']){
  assert.doesNotThrow(()=>drawFace(ctx,fighter,0,{hand:30,reachY:20},7));
  assert.doesNotThrow(()=>drawFaceAvatar(ctx,fighter,50,50,60));
 }
 assert.ok(draws.length>50);
});
