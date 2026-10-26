import { RULES, SELECTABLE, STAGES, STORY_OPPONENTS, findFighter } from './fighters.js';
import { portrait, render } from './render.js';

const $ = id => document.getElementById(id);
const arena = $('arena'), ctx = arena.getContext('2d');
let mode = 'arcade', picks = ['azur','nara'], stageIndex = 0;
let game = null, scene = 'select', paused = false, frame = 0, last = 0, accumulator = 0;
let muted = false, audio = null;
const down = new Set(), touchDown = new Set();
const KEYMAP = {
  KeyA:[0,'left'], KeyD:[0,'right'], KeyW:[0,'jump'], KeyS:[0,'block'], KeyF:[0,'light'], KeyG:[0,'heavy'], KeyH:[0,'special'],
  ArrowLeft:[1,'left'], ArrowRight:[1,'right'], ArrowUp:[1,'jump'], ArrowDown:[1,'block'], KeyJ:[1,'light'], KeyK:[1,'heavy'], KeyL:[1,'special']
};
const STORAGE = 'elemental-rivals-progress-v1';
function loadProgress(){
  try{const value=JSON.parse(localStorage.getItem(STORAGE)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return {}}
}
function saveProgress(char,number){
  const progress=loadProgress();progress[char]=Math.min(STAGES.length,Math.max(Number(progress[char])||0,number));
  try{localStorage.setItem(STORAGE,JSON.stringify(progress))}catch{}
}
function cleared(char){return Math.min(STAGES.length,Math.max(0,Number(loadProgress()[char])||0))}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rng=(min,max)=>Math.random()*(max-min)+min;
const actor=(fighter,x,dir,ai=false)=>({
  info:fighter,x,y:RULES.floorY,dir,hp:RULES.hp,guard:RULES.guard,vy:0,
  stun:0,flash:0,knock:0,attack:null,specialCd:0,block:false,walk:0,ai,
  think:0,brain:{move:0,block:false},wins:0
});
function playSound(freq=220,shape='triangle',duration=.12,volume=.04){
  if(muted)return;
  try{
    if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume().catch(()=>{});
    const oscillator=audio.createOscillator(),gain=audio.createGain();
    oscillator.type=shape;oscillator.frequency.setValueAtTime(freq,audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(55,freq*.55),audio.currentTime+duration);
    gain.gain.setValueAtTime(volume,audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();oscillator.stop(audio.currentTime+duration+.01);
  }catch{}
}
function renderCards(player){
  const root=$(player===0?'p1Cards':'p2Cards');root.replaceChildren();
  for(const f of SELECTABLE){
    const button=document.createElement('button');button.type='button';
    button.className='fighter-card'+(picks[player]===f.id?' selected':'');
    button.style.setProperty('--accent',f.color);
    button.setAttribute('aria-pressed',String(picks[player]===f.id));
    button.setAttribute('aria-label',f.name+'، '+f.title+'، مهارة '+f.specialName);
    button.innerHTML='<div class="portrait-wrap"><canvas width="144" height="162" aria-hidden="true"></canvas></div><div class="fighter-info"><b></b><small></small><div class="special-label"></div></div>';
    button.querySelector('b').textContent=f.name;
    button.querySelector('small').textContent=f.title;
    button.querySelector('.special-label').textContent='✦ '+f.specialName;
    button.addEventListener('click',()=>{picks[player]=f.id;renderCards(player);updatePreview();playSound(400,'sine',.065,.017)});
    root.append(button);
    portrait(button.querySelector('canvas').getContext('2d'),f,.8);
  }
}
function updatePreview(){
  const progress=cleared(picks[0]);
  const p1=findFighter(picks[0]),p2=mode==='duel'?findFighter(picks[1]):findFighter(STORY_OPPONENTS[Math.min(progress,6)]);
  portrait($('previewOne').getContext('2d'),p1,1.2);
  portrait($('previewTwo').getContext('2d'),p2,1.4);
  $('pickedOne').textContent=p1.name;$('pickedTwo').textContent=p2.name;
  $('duelPick').hidden=mode!=='duel';
  $('launchEyebrow').textContent=mode==='arcade'?'رحلة المحارب · سبع مواجهات':'المواجهة المحلية · لاعبان';
  $('launchTitle').textContent=mode==='arcade'?(progress===7?'أنهيت الرحلة، هل تعيد فتح البوابات؟':progress?'واصل الرحلة من البوابة '+(progress+1):'سبع بوابات تفصلك عن المجد'):'صديقان، مهارتان، فائز واحد';
  $('launchDesc').textContent=mode==='arcade'?'يتطور ذكاء الخصم عبر سبع مواجهات. الزعيم النهائي بنفس صحة جميع الأبطال وضررهم.':'يتنافس لاعبان على لوحة مفاتيح واحدة بنظام الأفضل من ثلاث جولات. تستطيعان اختيار الشخصية نفسها.';
  $('startBtn').innerHTML=mode==='arcade'&&progress>0&&progress<7?'تابع من المرحلة '+(progress+1)+' <span>←</span>':'ابدأ القتال <span>←</span>';
  const old=$('resetProgressBtn');if(old)old.remove();
  if(mode==='arcade'&&progress>0){
    const reset=document.createElement('button');reset.id='resetProgressBtn';reset.className='secondary';reset.type='button';
    reset.style.marginInlineStart='12px';reset.style.marginTop='7px';reset.textContent='ابدأ رحلة جديدة';
    reset.addEventListener('click',()=>{
      if(!confirm('هل تريد إعادة رحلة هذا المحارب من المرحلة الأولى؟'))return;
      const progressObj=loadProgress();progressObj[picks[0]]=0;
      try{localStorage.setItem(STORAGE,JSON.stringify(progressObj))}catch{}
      updatePreview();playSound(320);
    });
    $('startBtn').after(reset);
  }
}
function setMode(next){
  mode=next;for(const b of document.querySelectorAll('[data-mode]')){b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode))}
  updatePreview();
}
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>setMode(b.dataset.mode));
$('soundBtn').addEventListener('click',()=>{muted=!muted;$('soundLabel').textContent=muted?'الصوت: صامت':'الصوت: يعمل';$('soundBtn').setAttribute('aria-pressed',String(!muted));if(!muted)playSound(660)});
renderCards(0);renderCards(1);updatePreview();

function renderProgress(){
  const root=$('progressTrack');root.replaceChildren();root.hidden=mode==='duel';
  if(mode==='duel')return;
  STAGES.forEach((s,i)=>{const item=document.createElement('span');
    item.className='progress-item'+(i<stageIndex?' passed':'')+(i===stageIndex?' now':'')+(i===6?' boss':'');
    item.textContent=i===6?'◆':String(i+1);item.title=s.name;root.append(item);
  });
}
function setupBattle(initial=true){
  if(initial)stageIndex=mode==='arcade'?clamp(cleared(picks[0]),0,6):0;
  scene='game';paused=false;down.clear();touchDown.clear();
  $('selectionScene').hidden=true;$('gameScene').hidden=false;
  $('resultOverlay').hidden=true;$('pauseOverlay').hidden=true;
  $('secondHelp').hidden=mode!=='duel';
  $('battleKicker').textContent=mode==='arcade'?'المرحلة '+(stageIndex+1)+' من '+STAGES.length: 'مبارزة محلية · الأفضل من ثلاث';
  $('battleTitle').textContent=mode==='arcade'?STAGES[stageIndex].name:'ساحة المواجهة';
  const enemy=mode==='arcade'?findFighter(STORY_OPPONENTS[stageIndex]):findFighter(picks[1]);
  game={fighters:[actor(findFighter(picks[0]),243,1),actor(enemy,715,-1,mode==='arcade')],projectiles:[],particles:[],
    timer:RULES.roundTime,stageIndex:mode==='arcade'?stageIndex:2,elapsed:0,shake:0,
    message:'استعد للقتال!',announcement:1.4,readyDelay:1.15,ended:false,
    wins:[0,0],round:1,matchWinner:-1,resultWinner:-1};
  renderProgress();buildTouch();updateHint();document.activeElement?.blur();
  window.scrollTo({top:0,behavior:'instant'});
  last=performance.now();accumulator=0;
  if(!frame)frame=requestAnimationFrame(loop);
}
function nextRound(){
  const scores=game.wins.slice(),round=game.round+1,enemy=game.fighters[1].info;
  game.fighters=[actor(findFighter(picks[0]),243,1),actor(enemy,715,-1,mode==='arcade')];
  game.projectiles=[];game.particles=[];game.timer=RULES.roundTime;
  game.elapsed=0;game.shake=0;game.announcement=1.2;game.readyDelay=1.05;game.message='الجولة '+round;
  game.round=round;game.ended=false;game.wins=scores;game.matchWinner=-1;
  $('resultOverlay').hidden=true;down.clear();touchDown.clear();
}
function buildTouch(){
  const root=$('touchControls');root.replaceChildren();
  for(let player=0;player<(mode==='duel'?2:1);player++){
    const panel=document.createElement('div');panel.className='touch-panel';
    const label=document.createElement('span');label.textContent='اللاعب '+(player+1);panel.append(label);
    for(const [action,title] of [['left','◀'],['right','▶'],['jump','↑'],['block','صدّ'],['light','خفيفة'],['heavy','ثقيلة'],['special','خاصة']]){
      const button=document.createElement('button');button.type='button';button.textContent=title;
      if(action==='special')button.className='special';
      const id=player+':'+action;
      button.addEventListener('pointerdown',e=>{
        if(scene!=='game'||paused||game?.ended)return;
        e.preventDefault();try{button.setPointerCapture(e.pointerId)}catch{}
        touchDown.add(id);button.classList.add('pressed');requestAction(player,action);
      });
      const stop=e=>{touchDown.delete(id);button.classList.remove('pressed');e.preventDefault()};
      button.addEventListener('pointerup',stop);button.addEventListener('pointercancel',stop);
      button.addEventListener('lostpointercapture',()=>{touchDown.delete(id);button.classList.remove('pressed')});
      panel.append(button);
    }
    root.append(panel);
  }
}
function held(player,action){
  if(touchDown.has(player+':'+action))return true;
  return [...down].some(key=>{const pair=KEYMAP[key];return pair&&pair[0]===player&&pair[1]===action});
}
function requestAction(player,kind){
  if(!game||scene!=='game'||paused||game.ended||game.readyDelay>0)return;
  const f=game.fighters[player];if(!f||f.ai||f.stun>0)return;
  if(kind==='jump'){
    if(f.y>=RULES.floorY-.5&&!f.attack&&!f.block){f.vy=-RULES.jump;f.y-=1;playSound(290,'sine',.09,.026)}return;
  }
  if(['light','heavy','special'].includes(kind))attack(f,kind);
}
window.addEventListener('keydown',e=>{
  if(scene!=='game')return;
  if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(!game.ended)togglePause();return}
  const pair=KEYMAP[e.code];if(!pair)return;
  e.preventDefault();if(e.repeat||down.has(e.code))return;
  down.add(e.code);requestAction(pair[0],pair[1]);
},{passive:false});
window.addEventListener('keyup',e=>{down.delete(e.code);if(scene==='game'&&KEYMAP[e.code])e.preventDefault()},{passive:false});
window.addEventListener('blur',()=>{down.clear();touchDown.clear();if(scene==='game'&&game&&!game.ended&&!paused)togglePause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&scene==='game'&&game&&!game.ended&&!paused)togglePause()});
function togglePause(force){
  if(!game||game.ended)return;
  paused=typeof force==='boolean'?force:!paused;
  $('pauseOverlay').hidden=!paused;down.clear();touchDown.clear();last=performance.now();
}
$('pauseBtn').addEventListener('click',()=>togglePause());
$('resumeBtn').addEventListener('click',()=>togglePause(false));
function leaveGame(){scene='select';game=null;paused=false;down.clear();touchDown.clear();$('gameScene').hidden=true;$('selectionScene').hidden=false;$('resultOverlay').hidden=true;$('pauseOverlay').hidden=true;updatePreview();window.scrollTo({top:0,behavior:'instant'})}
$('leaveBtn').addEventListener('click',leaveGame);$('pauseMenuBtn').addEventListener('click',leaveGame);$('resultMenuBtn').addEventListener('click',leaveGame);
$('startBtn').addEventListener('click',()=>setupBattle(true));
$('rematchBtn').addEventListener('click',()=>setupBattle(false));
$('nextBtn').addEventListener('click',()=>{
  if(!game)return;
  if(mode==='duel'){nextRound();return}
  if(stageIndex<6){stageIndex++;setupBattle(false)}
});
function attack(f,kind){
  if(!game||game.ended||f.stun>0||f.attack||f.block)return false;
  if(kind==='special'&&f.specialCd>0)return false;
  f.attack={kind,t:0,resolved:false,activated:false,hit:false};
  if(kind==='special'){f.specialCd=RULES.specialCooldown;playSound(310,'sawtooth',.28,.035)}
  else if(kind==='heavy')playSound(140,'sawtooth',.13,.025);
  else playSound(210,'triangle',.085,.022);
  return true;
}
function sparks(x,y,color,count=8){
  for(let i=0;i<count;i++){const angle=rng(0,Math.PI*2),sp=rng(65,230);
    game.particles.push({x,y,vx:Math.cos(angle)*sp,vy:Math.sin(angle)*sp,life:rng(.18,.45),maxLife:.45,color,size:rng(2,5)});
  }
}
function floating(x,y,text,color='#ffffff'){
  game.particles.push({x,y,vx:rng(-10,10),vy:-45,life:.65,maxLife:.65,color,text,size:19});
}
function strike(f,target,damage,guardCost,reach,options={}){
  if(!game||game.ended)return false;
  const distance=Math.abs(f.x-target.x);
  if(distance>reach+24||(!options.air&&Math.abs(target.y-f.y)>104))return false;
  if(options.ground&&target.y<RULES.floorY-38)return false;
  const x=(f.x+target.x)/2,py=target.y-78;
  if(target.block&&target.y>=RULES.floorY-2&&target.stun<=0){
    target.guard-=guardCost;
    if(target.guard<=0){
      target.guard=0;target.stun=.84;target.block=false;
      target.hp=Math.max(0,target.hp-4);floating(target.x,target.y-160,'كسر الصدّ','#ffe1a1');
      playSound(85,'sawtooth',.25,.063);
    }else{target.hp=Math.max(0,target.hp-(options.special?2:1));playSound(170,'triangle',.11,.034)}
    sparks(x,py,'#a3efff',9);game.shake=5;target.knock=f.dir*85;
  }else{
    target.hp=Math.max(0,target.hp-damage);
    target.stun=options.special?.4:damage>=12?.34:.22;
    target.knock=f.dir*(options.special?270:damage>=12?225:130);
    target.flash=.17;game.shake=options.special?12:damage>=12?9:5;
    sparks(x,py,f.info.color,options.special?22:12);floating(target.x,py-39,'−'+damage,options.special?'#ffe6a8':'#ffffff');
    playSound(options.special?90:damage>=12?120:160,'sawtooth',.13,.068);
  }
  if(target.hp<=0)endRound(f===game.fighters[0]?0:1,'ko');
  return true;
}
function spawnBolt(f){
  game.projectiles.push({x:f.x+f.dir*48,y:f.y-77,vx:f.dir*490,owner:f,color:f.info.color,life:2.5});
  sparks(f.x+f.dir*34,f.y-77,f.info.color,12);
}
function updateAttack(f,other,dt){
  const a=f.attack;if(!a)return;
  a.t+=dt;const kind=a.kind;
  if(kind!=='special'){
    const wind=kind==='light'?RULES.lightWindup:RULES.heavyWindup;
    if(!a.resolved&&a.t>=wind){
      a.resolved=true;strike(f,other,kind==='light'?RULES.lightDamage:RULES.heavyDamage,
        kind==='light'?RULES.lightGuard:RULES.heavyGuard,
        kind==='light'?RULES.lightReach:RULES.heavyReach);
    }
    if(a.t>=(kind==='light'?RULES.lightDuration:RULES.heavyDuration))f.attack=null;
    return;
  }
  if(a.t>=RULES.specialWindup){
    if(!a.activated){
      a.activated=true;
      if(f.info.special==='bolt'){spawnBolt(f);a.resolved=true}
      if(f.info.special==='warp'){
        f.x=clamp(other.x-other.dir*67,52,RULES.arenaWidth-52);
        sparks(f.x,f.y-80,f.info.color,14);
      }
      if(f.info.special==='upper'&&f.y>=RULES.floorY-2){f.vy=-410;f.y-=1}
    }
    if(f.info.special==='dash'&&a.t<.61)f.x=clamp(f.x+f.dir*550*dt,34,RULES.arenaWidth-34);
    if(!a.resolved){
      let range=130,opt={special:true,air:true};
      if(f.info.special==='dash')range=93;
      if(f.info.special==='spin')range=157;
      if(f.info.special==='shock'){range=208;opt.ground=true;opt.air=false}
      if(f.info.special==='upper')range=122;
      if(f.info.special==='warp'){range=100;if(a.t<.43)return}
      if(strike(f,other,RULES.specialDamage,RULES.specialGuard,range,opt))a.resolved=true;
    }
  }
  if(a.t>=RULES.specialDuration)f.attack=null;
}
function updateProjectiles(dt){
  for(const p of game.projectiles){
    p.x+=p.vx*dt;p.life-=dt;
    const target=game.fighters.find(f=>f!==p.owner);
    if(target&&Math.abs(p.x-target.x)<35&&Math.abs(p.y-(target.y-78))<65){
      strike(p.owner,target,RULES.specialDamage,RULES.specialGuard,1000,{special:true,air:true});
      p.life=0;sparks(p.x,p.y,p.color,20);
    }
  }
  game.projectiles=game.projectiles.filter(p=>p.life>0&&p.x>-50&&p.x<RULES.arenaWidth+50);
}
function updateBot(f,enemy,dt){
  f.think-=dt;if(f.think>0)return;
  const intel=STAGES[stageIndex]?.intelligence??.5;
  f.think=clamp(.35-intel*.22+rng(-.06,.11),.09,.52);
  const d=Math.abs(enemy.x-f.x),toward=Math.sign(enemy.x-f.x);
  const coming=enemy.attack&&d<165;
  const projectile=game.projectiles.some(p=>p.owner===enemy&&Math.abs(p.x-f.x)<240);
  f.brain.block=!!(coming&&Math.random()<.1+intel*.82);
  f.brain.move=d>118?toward:(d<55&&Math.random()<intel*.48?-toward:Math.random()<.36?toward:0);
  if(f.brain.block)f.brain.move=0;
  if(projectile&&Math.random()<intel*.7&&f.y>=RULES.floorY-1&&!f.attack){f.vy=-RULES.jump;f.y-=1}
  if(d>130&&d<285&&intel>.45&&Math.random()<.045&&!f.attack&&f.y>=RULES.floorY-1){f.vy=-RULES.jump;f.y-=1}
  if(game.readyDelay>0||f.stun>0||f.block||f.attack)return;
  const chance=.24+intel*.50;
  if(Math.random()>chance)return;
  if(f.specialCd<=0&&Math.random()<.24+intel*.10){
    const special=f.info.special;
    const compatible=special==='bolt'?d>120&&d<650:special==='shock'?d<210:special==='spin'?d<145:special==='upper'?d<117:special==='dash'?d<225:d<245;
    if(compatible){attack(f,'special');return}
  }
  if(d<96){attack(f,Math.random()<.36+intel*.2?'heavy':'light')}
  else if(d<115&&Math.random()<intel*.45)attack(f,'heavy');
}
function moveActors(dt){
  const list=game.fighters;
  for(let i=0;i<2;i++){
    const f=list[i],other=list[1-i];
    f.dir=other.x>=f.x?1:-1;
    f.stun=Math.max(0,f.stun-dt);f.flash=Math.max(0,f.flash-dt);
    f.specialCd=Math.max(0,f.specialCd-dt);
    const brain=f.ai?f.brain:null;
    const left=f.ai?brain.move<0:held(i,'left'),right=f.ai?brain.move>0:held(i,'right');
    const wantsBlock=f.ai?brain.block:held(i,'block');
    f.block=!!(wantsBlock&&f.y>=RULES.floorY-1&&f.stun===0&&!f.attack&&f.guard>0);
    const moving=!f.block&&f.stun===0&&(!f.attack||f.attack.kind==='light')?(Number(right)-Number(left)):0;
    f.walk=moving;f.x=clamp(f.x+moving*RULES.speed*dt+f.knock*dt,40,RULES.arenaWidth-40);
    f.knock*=Math.exp(-12*dt);
    if(f.y<RULES.floorY||f.vy!==0){
      f.vy+=RULES.gravity*dt;f.y+=f.vy*dt;
      if(f.y>=RULES.floorY){f.y=RULES.floorY;f.vy=0}
    }
    if(!f.block)f.guard=clamp(f.guard+22*dt,0,RULES.guard);
  }
  const a=list[0],b=list[1];
  const gap=55,dist=b.x-a.x;
  if(Math.abs(dist)<gap){const offset=(gap-Math.abs(dist))/2,dir=dist>=0?1:-1;
    a.x=clamp(a.x-dir*offset,40,RULES.arenaWidth-40);
    b.x=clamp(b.x+dir*offset,40,RULES.arenaWidth-40);
  }
  a.dir=b.x>=a.x?1:-1;b.dir=-a.dir;
}
function endRound(winner,reason){
  if(game.ended)return;
  game.ended=true;game.resultWinner=winner;game.wins[winner]++;
  down.clear();touchDown.clear();playSound(winner===0?570:160,'triangle',.42,.045);
  const won=winner===0;
  $('resultOverlay').hidden=false;$('nextBtn').hidden=false;$('rematchBtn').hidden=false;
  if(mode==='arcade'){
    if(won)saveProgress(picks[0],stageIndex+1);
    const final=won&&stageIndex===6;
    $('resultEyebrow').textContent=won?'✦ انتصار في المرحلة '+(stageIndex+1):'حاول مجدداً';
    $('resultTitle').textContent=final?'أصبحت حارس العناصر!':won?'انتصار مستحق!':'انتهت المحاولة';
    $('resultText').textContent=final?'هزمت نيكس بالمهارة والتوقيت، وأنهيت مراحل الرحلة السبع.':won?'تجاوزت '+STAGES[stageIndex].name+'. المواجهة المقبلة أصعب بذكاء الخصم، لا بزيادة إحصاءاته.':'خسرت أمام '+game.fighters[1].info.name+'. جرّب استعمال الصدّ وراقب توقيت الضربة الخاصة.';
    $('nextBtn').hidden=!won||final;
    $('nextBtn').textContent='المواجهة التالية ←';
  }else{
    const matchOver=game.wins[winner]>=2;
    $('resultEyebrow').textContent=matchOver?'انتهت المباراة':'نتيجة الجولة '+game.round;
    $('resultTitle').textContent=(won?'اللاعب الأول':'اللاعب الثاني')+(matchOver?' يفوز بالمباراة!':' يفوز بالجولة!');
    $('resultText').textContent='الجولات: اللاعب الأول '+game.wins[0]+' — '+game.wins[1]+' اللاعب الثاني'+(reason==='time'?' · انتهى الوقت':'');
    $('nextBtn').hidden=matchOver;$('nextBtn').textContent='الجولة التالية ←';
  }
}
function updateParticles(dt){
  for(const p of game.particles){p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;p.life-=dt}
  game.particles=game.particles.filter(p=>p.life>0).slice(-120);
}
function update(dt){
  if(!game||game.ended||paused)return;
  game.elapsed+=dt;game.announcement=Math.max(0,game.announcement-dt);
  game.shake=Math.max(0,game.shake-35*dt);
  if(game.readyDelay>0){game.readyDelay-=dt;return}
  game.timer-=dt;
  if(game.timer<=0){
    game.timer=0;const [a,b]=game.fighters;
    const scoreA=a.hp,scoreB=b.hp;
    if(scoreA===scoreB){game.timer=8;game.message='وقت إضافي!';game.announcement=1.1;return}
    endRound(scoreA>scoreB?0:1,'time');return;
  }
  if(mode==='arcade')updateBot(game.fighters[1],game.fighters[0],dt);
  moveActors(dt);
  for(const f of game.fighters){
    const other=game.fighters.find(v=>v!==f);updateAttack(f,other,dt);
    if(game.ended)break;
  }
  if(!game.ended)updateProjectiles(dt);
  updateParticles(dt);
}
function loop(now){
  frame=0;if(scene!=='game'||!game)return;
  const dt=clamp((now-last)/1000,0,.06);last=now;
  if(!paused){accumulator+=dt;let steps=0;while(accumulator>=1/60&&steps<4){update(1/60);accumulator-=1/60;steps++}if(steps===4)accumulator=0}
  render(ctx,game,now/1000);
  frame=requestAnimationFrame(loop);
}
function updateHint(){
  $('arenaHint').textContent=mode==='arcade'?'انتصارك يعتمد على المسافة والتوقيت والحراسة.':'أفضل جولتين من أصل ثلاث يفوز بالمواجهة.';
}
