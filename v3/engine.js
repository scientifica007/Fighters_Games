import {WIDTH,FLOOR,FPS,CORE,MOVES,FIGHTERS,getFighter,MOVE_ORDER} from './roster.js';

const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const dist=(a,b)=>Math.abs(a.x-b.x);
const idleInput=()=>({left:false,right:false,jump:false,guard:false,light:false,heavy:false,special:false,super:false});
export function createFighter(id,x,dir,slot){
 return {
  id:getFighter(id).id,x,y:FLOOR,vy:0,dir,slot,
  hp:CORE.health,meter:35,guard:100,state:'idle',action:null,
  hitstun:0,blockstun:0,knockback:0,grounded:true,combo:0,comboClock:0,
  specialCooldown:0,invuln:0,flash:0,airAttack:false,
  wins:0,anim:0,prev:{},aiDecision:idleInput(),aiThink:0
 };
}
export function createMatch({mode='cpu',p1='azur',p2='nara',difficulty='normal'}={}){
 return {
  mode,difficulty,phase:'ready',phaseFrames:85,frames:0,timeFrames:CORE.roundSeconds*FPS,
  round:1,winner:null,roundWinner:null,wins:[0,0],hitstop:0,
  fighters:[createFighter(p1,285,1,0),createFighter(p2,835,-1,1)],
  projectiles:[],effects:[],lastEvent:'',cameraShake:0,events:[],
  aiFrame:0
 };
}
export function resetRound(g){
 const ids=g.fighters.map(f=>f.id);
 g.round++;
 g.fighters=[createFighter(ids[0],285,1,0),createFighter(ids[1],835,-1,1)];
 g.fighters.forEach((f,i)=>f.wins=g.wins[i]);
 g.timeFrames=CORE.roundSeconds*FPS;g.phase='ready';g.phaseFrames=75;
 g.hitstop=0;g.cameraShake=0;g.roundWinner=null;g.projectiles=[];g.effects=[];
 g.lastEvent='';g.events=[];return g;
}
function emit(g,type,fields={}){
 const e={type,frame:g.frames,...fields};g.events.push(e);g.lastEvent=type;
}
function start(f,name,g){
 const m=MOVES[name];if(!m||f.hitstun>0||f.blockstun>0||!f.grounded)return false;
 if(name==='special'&&(f.meter<CORE.specialCost||f.specialCooldown>0))return false;
 if(name==='super'&&f.meter<CORE.superCost)return false;
 f.meter-=name==='special'?CORE.specialCost:name==='super'?CORE.superCost:0;
 if(name==='special')f.specialCooldown=90;
 f.action={name,frame:0,connected:false,created:false};
 f.state=name;f.anim=0;
 emit(g,'attack',{slot:f.slot,move:name});
 return true;
}
function canCancel(f,move){
 if(!f.action||!f.action.connected)return false;
 const a=f.action;
 if(a.frame<MOVES[a.name].startup)return false;
 if(a.name==='light')return ['heavy','special','super'].includes(move);
 if(a.name==='heavy')return ['special','super'].includes(move);
 if(a.name==='special')return move==='super';
 return false;
}
function commands(f,input,g){
 const fresh={};
 for(const m of ['jump',...MOVE_ORDER])fresh[m]=!!input[m]&&!f.prev[m];
 // Snapshot every input: avoids keyboard autorepeat and hold-to-combo exploits.
 f.prev={...input};
 if(f.hitstun>0||f.blockstun>0)return;
 // Highest-priority move first, so accidental double-key presses are deterministic.
 for(const move of ['super','special','heavy','light']){
   if(!fresh[move])continue;
   if(f.action){
     if(canCancel(f,move)){start(f,move,g);emit(g,'cancel',{slot:f.slot,to:move})}
     return;
   }
   start(f,move,g);return;
 }
 if(f.action)return;
 if(fresh.jump&&f.grounded&&!input.guard){
   f.vy=-CORE.jump;f.y-=.5;f.grounded=false;f.state='jump';emit(g,'jump',{slot:f.slot});
 }
}
function hurtbox(f){
 return {x:f.x-CORE.hurtWidth,y:f.y-CORE.hurtHeight,w:CORE.hurtWidth*2,h:CORE.hurtHeight};
}
function overlap(a,b){
 return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
}
function attackBox(f,m,shift=0){
 const extent=m.reach;
 // Rect extends from the torso forward, never behind the fighter.
 return {x:f.dir>0?f.x+23+shift:f.x-23-shift-extent,y:f.y+m.height[0],
  w:extent,h:m.height[1]-m.height[0]};
}
function defendersFacing(attacker,defender){
 return defender.dir===Math.sign(attacker.x-defender.x);
}
function hit(g,attacker,defender,moveName,source='melee'){
 const m=MOVES[moveName];if(!m||defender.hp<=0)return false;
 const guarded=(defender.state==='guard'||defender.state==='crouch')&&defendersFacing(attacker,defender)&&defender.grounded;
 const low=false; // future low/overhead moves can extend explicit guard rules.
 const old=defender.hp;
 if(guarded&&!low){
   defender.hp=clamp(defender.hp-m.chip,0,CORE.health);
   defender.guard=clamp(defender.guard-m.guardDamage,0,100);
   defender.blockstun=m.blockstun;defender.state='guard';
   defender.knockback=attacker.dir*(m.push*.5);
   defender.meter=clamp(defender.meter+7,0,100);
   if(defender.guard<=0){defender.blockstun=38;defender.hitstun=34;defender.state='hurt';defender.guard=24;emit(g,'guardbreak',{slot:defender.slot})}
   emit(g,'block',{slot:defender.slot,source,damage:old-defender.hp});
 }else{
   defender.hp=clamp(defender.hp-m.damage,0,CORE.health);
   defender.state='hurt';defender.hitstun=m.hitstun;defender.blockstun=0;
   defender.flash=9;defender.knockback=attacker.dir*m.push;
   attacker.meter=clamp(attacker.meter+m.meter+5,0,100);
   defender.meter=clamp(defender.meter+10,0,100);
   if(defender.comboClock>0)attacker.combo++;else attacker.combo=1;
   defender.comboClock=85;
   emit(g,'hit',{from:attacker.slot,to:defender.slot,move:moveName,damage:old-defender.hp,combo:attacker.combo,source});
 }
 const shake=moveName==='super'?16:moveName==='heavy'?11:7;
 g.cameraShake=Math.max(g.cameraShake,shake);
 g.hitstop=Math.max(g.hitstop,m.hitstop);
 g.effects.push({kind:guarded?'shield':'impact',x:defender.x-attacker.dir*22,y:defender.y-119,
  color:getFighter(attacker.id).color,life:19,max:19,scale:moveName==='super'?1.65:moveName==='heavy'?1.3:1,
  facing:attacker.dir});
 if(defender.hp<=0){roundEnd(g,attacker.slot,'ko')}
 return true;
}
function spawnProjectile(g,f,move){
 g.projectiles.push({owner:f.slot,x:f.x+f.dir*73,y:f.y-112,vx:f.dir*(move==='super'?14:10.5),
   radius:move==='super'?34:18,life:95,move,hit:false,color:getFighter(f.id).color});
 emit(g,'projectile',{slot:f.slot,move});
}
function updateAttack(g,f,other){
 const a=f.action;if(!a)return;
 const m=MOVES[a.name];
 a.frame++;
 const active=a.frame>m.startup&&a.frame<=m.startup+m.active;
 // Azur projects a traveling bolt at first active frame. The projectile has
 // its own AABB and can be blocked or evaded by jumping.
 const ranged=f.id==='azur'&&(a.name==='special'||a.name==='super');
 if(ranged&&active&&!a.created){a.created=true;spawnProjectile(g,f,a.name)}
 // Nara's unique rush and cinematic super.
 if(f.id==='nara'&&active&&(a.name==='special'||a.name==='super')){
   f.x=clamp(f.x+f.dir*(a.name==='super'?17:10),55,WIDTH-55);
 }
 if(active&&!a.connected&&!ranged){
   const reach=(f.id==='nara'&&a.name==='super')?220:m.reach;
   const m2=reach===m.reach?m:{...m,reach};
   if(overlap(attackBox(f,m2),hurtbox(other))){
     a.connected=hit(g,f,other,a.name);
   }
 }
 if(a.frame>=m.startup+m.active+m.recovery){
   f.action=null;f.state=f.grounded?'idle':'jump';f.anim=0;
 }
}
function updateProjectiles(g){
 for(const p of g.projectiles){
   p.x+=p.vx;p.life--;
   const target=g.fighters[1-p.owner],attacker=g.fighters[p.owner];
   if(p.hit||!target)continue;
   const hb={x:p.x-p.radius,y:p.y-p.radius,w:p.radius*2,h:p.radius*2};
   if(overlap(hb,hurtbox(target))){
     p.hit=true;p.life=0;
     hit(g,attacker,target,p.move,'projectile');
   }
 }
 g.projectiles=g.projectiles.filter(p=>p.life>0&&p.x>-70&&p.x<WIDTH+70);
}
function updateFighter(g,f,other,input){
 if(f.flash>0)f.flash--;
 if(f.comboClock>0)f.comboClock--;
 if(f.specialCooldown>0)f.specialCooldown--;
 const oldStun=f.hitstun>0||f.blockstun>0;
 if(f.hitstun>0)f.hitstun--;
 if(f.blockstun>0)f.blockstun--;
 if(f.invuln>0)f.invuln--;
 f.dir=other.x>=f.x?1:-1;
 if(oldStun){f.action=null;f.state='hurt'}
 else{
   commands(f,input,g);
   if(!f.action){
     if(f.grounded){
       f.state=input.guard?(input.left||input.right?'guard':'crouch'):'idle';
     }
   }
 }
 if(!oldStun&&!f.action&&!input.guard){
   const mv=Number(!!input.right)-Number(!!input.left);
   if(mv&&f.grounded){f.x+=mv*CORE.speed;f.state='walk'}
   if(mv&&!f.grounded)f.x+=mv*CORE.airSpeed;
 }
 if(f.grounded&&f.state==='crouch'&&!f.action)f.guard=clamp(f.guard+0.18,0,100);
 else if(!input.guard)f.guard=clamp(f.guard+.35,0,100);
 f.x=clamp(f.x+f.knockback,55,WIDTH-55);
 f.knockback*=.66;if(Math.abs(f.knockback)<.1)f.knockback=0;
 if(!f.grounded){f.vy+=CORE.gravity;f.y+=f.vy;
   if(f.y>=FLOOR){f.y=FLOOR;f.vy=0;f.grounded=true;if(!f.action&&!oldStun)f.state='idle'}
 }
 if(!oldStun&&f.action)updateAttack(g,f,other);
 if(!f.action&&!oldStun&&!f.grounded)f.state='jump';
 if(!f.action&&f.grounded&&f.state==='hurt'&&!oldStun)f.state='idle';
 f.anim++;
}
function separate(g){
 const [a,b]=g.fighters;
 // Solve the pair as a single constrained interval. Independent clamping
 // would let pushboxes overlap when both actors are pinned to a stage wall.
 const min=76,diff=b.x-a.x;
 if(Math.abs(diff)<min){
   const left=diff>=0?a:b,right=diff>=0?b:a;
   const midpoint=(a.x+b.x)/2;
   left.x=clamp(midpoint-min/2,55,WIDTH-55-min);
   right.x=left.x+min;
 }
 a.dir=b.x>=a.x?1:-1;b.dir=-a.dir;
}
function roundEnd(g,slot,reason){
 if(g.phase!=='fight')return;
 g.roundWinner=slot;g.wins[slot]++;
 g.phase=g.wins[slot]>=2?'matchOver':'roundOver';
 g.phaseFrames=80;g.winner=g.phase==='matchOver'?slot:null;
 emit(g,g.phase==='matchOver'?'matchOver':'roundOver',{winner:slot,reason});
}
function evaluateClock(g){
 if(g.timeFrames>0)return;
 const a=g.fighters[0],b=g.fighters[1];
 if(a.hp===b.hp){g.timeFrames=10*FPS;emit(g,'overtime');return}
 roundEnd(g,a.hp>b.hp?0:1,'time');
}
// Finite and deterministic AI decision intervals, without stat buffs.
export function cpuInput(g,random=Math.random){
 const bot=g.fighters[1],human=g.fighters[0],d=dist(bot,human);
 const skill=({easy:0.25,normal:.56,hard:.86})[g.difficulty]??.56;
 if(bot.aiThink>0){bot.aiThink--;return {...bot.aiDecision}}
 bot.aiThink=Math.round((1-skill)*22+4);
 const cmd=idleInput();
 if(d>115)cmd[human.x<bot.x?'left':'right']=true;
 if(d<66&&random()<.32)cmd[human.x<bot.x?'right':'left']=true;
 if(human.action&&d<160&&random()<skill*.78)cmd.guard=true;
 if(human.action&&human.id==='azur'&&random()<skill*.38&&bot.grounded&&d>180)cmd.jump=true;
 if(!cmd.guard&&d<145){
   if(random()<.32+skill*.42)cmd.light=true;
   else if(random()<skill*.32)cmd.heavy=true;
 }else if(!cmd.guard&&bot.meter>=CORE.specialCost&&d<(bot.id==='azur'?600:220)){
   if(random()<.2+skill*.3)cmd.special=true;
 }
 if(bot.meter>=CORE.superCost&&d<(bot.id==='azur'?560:240)&&random()<skill*.33){
   cmd.super=true;cmd.special=false;
 }
 bot.aiDecision=cmd;return {...cmd};
}
export function step(g,inputs=[{},{}],random=Math.random){
 if(g.phase==='matchOver'||g.phase==='roundOver')return g;
 g.frames++;g.events=[];g.cameraShake=Math.max(0,g.cameraShake-.8);
 if(g.phase==='ready'){
   if(--g.phaseFrames<=0){g.phase='fight';emit(g,'fight')}
   return g;
 }
 if(g.hitstop>0){g.hitstop--;return g}
 if(g.timeFrames>0)g.timeFrames--;
 const p1={...idleInput(),...inputs[0]};
 const p2=g.mode==='cpu'?cpuInput(g,random):{...idleInput(),...inputs[1]};
 updateFighter(g,g.fighters[0],g.fighters[1],p1);
 if(g.phase!=='fight')return g;
 updateFighter(g,g.fighters[1],g.fighters[0],p2);
 if(g.phase!=='fight')return g;
 separate(g);updateProjectiles(g);
 if(g.phase==='fight')evaluateClock(g);
 g.effects.forEach(e=>e.life--);g.effects=g.effects.filter(e=>e.life>0);
 return g;
}
export function moveFrameInfo(name){
 const m=MOVES[name];if(!m)return null;
 return {startup:m.startup,firstActive:m.startup+1,lastActive:m.startup+m.active,
  total:m.startup+m.active+m.recovery};
}
