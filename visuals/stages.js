// Stage art v2: seven distinct environments, static layers cached to avoid
// re-rasterizing scenery 60 times a second on inexpensive laptops and phones.
const W=960, H=540, FLOOR=463;
const THEMES=[
 {sky:['#071b2b','#193956','#4d6273'],glow:'#83e0ed',sun:'#dbeaf2',stone:'#536678',floor:'#2b3a49',name:'STONE GATE'},
 {sky:['#071f32','#215364','#a8b0a0'],glow:'#7be0c6',sun:'#e7fbdf',stone:'#547a70',floor:'#314b50',name:'WIND GARDENS'},
 {sky:['#14223d','#824f62','#e6a46d'],glow:'#efc385',sun:'#ffe3ad',stone:'#65576d',floor:'#55424c',name:'DAWN CITADEL'},
 {sky:['#1c1024','#662e43','#be6356'],glow:'#ff9b69',sun:'#ffca96',stone:'#654556',floor:'#462c39',name:'EMBER FORGE'},
 {sky:['#080f29','#342552','#685384'],glow:'#ae9aff',sun:'#c9c5ff',stone:'#434264',floor:'#272944',name:'SHADOW ALLEY'},
 {sky:['#061324','#1e3451','#34577c'],glow:'#85c7ff',sun:'#bce0ff',stone:'#425d74',floor:'#253649',name:'STORM TOWER'},
 {sky:['#160b27','#4b1743','#773357'],glow:'#ff7eb7',sun:'#fac6eb',stone:'#543556',floor:'#2c253f',name:'LAST THRONE'}
];
export const STAGE_PALETTES=THEMES.map(t=>Object.freeze({...t,sky:Object.freeze([...t.sky])}));
const circle=(c,x,y,r,fill)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill()};
const poly=(c,coords,fill)=>{c.beginPath();coords.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill()};
const stroke=(c,x,y,u,v,color,w=2)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(u,v);c.stroke()};
const rect=(c,x,y,w,h,fill)=>{c.fillStyle=fill;c.fillRect(x,y,w,h)};
function tower(c,x,y,w,h,col,accent){
  rect(c,x,y,w,h,col);rect(c,x-7,y-13,w+14,17,col);
  for(let i=0;i<3;i++)rect(c,x+7+i*(w-16)/3,y+32,5,24,accent+'55');
  rect(c,x+w*.4,y+h*.5,w*.2,h*.14,'#0816248c');
}
function arch(c,x,y,w,h,col,accent){
  c.fillStyle=col;c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+h*.38);
  c.bezierCurveTo(x,y-h*.13,x+w,y-h*.13,x+w,y+h*.38);c.lineTo(x+w,y+h);c.closePath();c.fill();
  // Paint an interior opening with the backdrop tint. Avoid destination-out,
  // which would incorrectly erase the entire scene behind the arch.
  c.fillStyle='#172d3e';
  c.beginPath();c.moveTo(x+w*.22,y+h);c.lineTo(x+w*.22,y+h*.4);
  c.bezierCurveTo(x+w*.22,y+h*.09,x+w*.78,y+h*.09,x+w*.78,y+h*.4);c.lineTo(x+w*.78,y+h);c.closePath();c.fill();
  stroke(c,x+4,y+h*.32,x+w-4,y+h*.32,accent+'77',2);
  for(const xx of [x+10,x+w-10])stroke(c,xx,y+h*.32,xx,y+h*.96,accent+'52',2);
}
function distantLandscape(c,theme,stage){
  const y=292;
  const far=c.createLinearGradient(0,240,0,FLOOR);far.addColorStop(0,theme.sky[1]);far.addColorStop(1,'#101b2c');
  poly(c,[[0,y+35],[100,y-5],[160,y+22],[275,y-35],[360,y+30],[510,y-45],[640,y+26],[755,y-18],[840,y+10],[960,y-25],[960,FLOOR],[0,FLOOR]],far);
  poly(c,[[0,388],[103,350],[203,382],[330,342],[460,371],[620,320],[725,364],[870,332],[960,369],[960,FLOOR],[0,FLOOR]],'#152638bb');
  // Tiny distant windows/lights.
  for(let i=0;i<40;i++){const x=(i*157)%W,y=354+(i*29)%83;rect(c,x,y,2,4,theme.glow+'65')}
}
function sky(c,theme,stage){
  const grad=c.createLinearGradient(0,0,0,FLOOR);
  theme.sky.forEach((s,i)=>grad.addColorStop(i/(theme.sky.length-1),s));
  rect(c,0,0,W,FLOOR,grad);
  const sx=stage===2?170:stage===3?755:stage===6?480:730,sy=stage===2?131:116;
  const glow=c.createRadialGradient(sx,sy,2,sx,sy,258);
  glow.addColorStop(0,theme.glow+'55');glow.addColorStop(.5,theme.glow+'16');glow.addColorStop(1,'#00000000');
  rect(c,0,0,W,440,glow);
  circle(c,sx,sy,stage===2?66:stage===6?59:44,theme.sun);
  if(stage!==2&&stage!==3){
    c.fillStyle=theme.sky[0];c.beginPath();c.arc(sx-13,sy-11,stage===6?48:36,0,Math.PI*2);c.fill();
  }
  for(let i=0;i<74;i++){
    const x=(i*239+51)%W,y=20+(i*97)%265,r=i%9===0?2:0.9;
    circle(c,x,y,r,'#f4f4ee'+(i%5===0?'88':'46'));
  }
  if(stage===2||stage===3){
    for(let i=0;i<8;i++)poly(c,[[i*150-95,218],[i*150+50,204],[i*150+190,225],[i*150+30,224]],'#ffd9a00b');
  }
}
function foreground(c,theme,stage){
  let g=c.createLinearGradient(0,FLOOR,0,H);g.addColorStop(0,theme.floor);g.addColorStop(1,'#111827');rect(c,0,FLOOR,W,H-FLOOR,g);
  rect(c,0,FLOOR-7,W,7,theme.stone);rect(c,0,FLOOR-7,W,2,theme.glow+'a0');
  // Perspective panels, cracks and stone inlays.
  for(let x=-240;x<=1150;x+=76){stroke(c,x,FLOOR,x+(x-W/2)*.3,H,'#c5d3e521',1)}
  for(let y=478;y<H;y+=16)stroke(c,0,y,W,y,'#e1d9cd12',1);
  for(let i=0;i<11;i++){
    const x=(i*187+29)%W,y=480+(i*13)%48;
    stroke(c,x,y,x+19,y-3,'#0a15265e',2);
    stroke(c,x+19,y-3,x+34,y+2,'#090f1c66',2);
  }
  c.strokeStyle=theme.glow+'67';c.lineWidth=3;c.beginPath();c.ellipse(W/2,FLOOR+35,118,24,0,0,Math.PI*2);c.stroke();
  c.lineWidth=1;c.beginPath();c.ellipse(W/2,FLOOR+35,83,14,0,0,Math.PI*2);c.stroke();
  for(let a=0;a<8;a++){const theta=a*Math.PI/4;stroke(c,480+80*Math.cos(theta),FLOOR+35+14*Math.sin(theta),480+113*Math.cos(theta),FLOOR+35+22*Math.sin(theta),theme.glow+'58',2)}
}
function buildStage(c,stage){
 const t=THEMES[stage]||THEMES[0];sky(c,t,stage);distantLandscape(c,t,stage);
 c.save();
 switch(stage){
  case 0:{ // ruined ceremonial temple; glowing gate and pillars
   arch(c,373,219,215,237,'#273c4d',t.glow);
   for(const x of [80,234,710,860]){
     rect(c,x-13,237,65,210,'#30465a');rect(c,x-20,225,79,16,'#62778a');rect(c,x-26,216,91,9,'#7b8794');
     rect(c,x-13,405,65,17,'#62778a');
     for(let y=249;y<410;y+=30)stroke(c,x-10,y,x+49,y,t.glow+'26',2);
     poly(c,[[x-24,215],[x+20,178],[x+64,215]],'#496071');
   }
   for(const x of [300,626]){rect(c,x,369,28,81,'#34495c');circle(c,x+14,363,14,t.glow+'b0')}
   break;
  }
  case 1:{ // layered botanical terraces and suspended bridges
   for(const x of [86,244,700,861]){
     rect(c,x,235,27,214,'#3a5b59');
     circle(c,x+9,236,41,'#1d6661');circle(c,x-22,262,35,'#255d56');circle(c,x+37,260,31,'#2e8071');
     for(let k=0;k<4;k++)stroke(c,x+9,267+k*27,x+14+Math.sin(k)*18,287+k*25,'#8bbca158',3);
   }
   poly(c,[[0,371],[180,342],[390,365],[570,339],[780,358],[960,324],[960,393],[0,393]],'#3c656281');
   for(const x of [128,790]){rect(c,x,335,18,112,'#527169');rect(c,x-15,325,49,13,'#88a99c')}
   break;
  }
  case 2:{ // dawn rooftop fortress
   for(const [x,h] of [[39,240],[213,170],[712,190],[857,265]])tower(c,x,448-h,77,h,'#4c4c63',t.glow);
   poly(c,[[0,337],[155,313],[320,332],[590,311],[786,335],[960,294],[960,375],[0,375]],'#68556b');
   rect(c,0,355,W,12,'#9e7790');
   for(const x of [170,720]){rect(c,x,269,16,178,'#6d5a70');poly(c,[[x-3,269],[x+8,240],[x+19,269]],'#ecc39b')}
   break;
  }
  case 3:{ // molten industrial foundry
   for(const x of [57,208,708,870]){
     tower(c,x,211,45,233,'#34283b',t.glow);rect(c,x+9,234,22,101,'#cf593e85');
     for(let i=0;i<5;i++)rect(c,x+2,328+i*21,40,3,'#d77c5f42');
   }
   for(const x of [0,716]){
     rect(c,x,368,245,16,'#693d41');
     for(let i=0;i<5;i++)stroke(c,x+i*44,370,x+i*44+30,429,'#7d4b50',6);
   }
   for(const x of [301,573]){circle(c,x,334,39,'#54303b');circle(c,x,334,26,'#d7594e');circle(c,x,334,16,'#ffb26c')}
   break;
  }
  case 4:{ // shadow city, pagoda rooftops and lamps
   for(const [x,y,w,h] of [[45,259,184,190],[725,217,199,233],[293,292,86,149],[593,308,90,141]]){
     rect(c,x,y,w,h,'#212541');poly(c,[[x-20,y+4],[x+w/2,y-48],[x+w+20,y+4]],'#413353');rect(c,x+17,y+34,w-34,5,'#a580a34b');
     for(let xx=x+20;xx<x+w-20;xx+=32)rect(c,xx,y+68,9,28,'#f2a2c13b');
   }
   for(const x of [235,682]){stroke(c,x,275,x,431,'#535375',4);circle(c,x,281,18,'#edafc6');circle(c,x,281,10,'#fff0cb')}
   break;
  }
  case 5:{ // storm citadel, cables and lightning rods
   for(const x of [89,250,673,843]){
     tower(c,x,201,61,246,'#283a4e',t.glow);
     poly(c,[[x-8,203],[x+30,149],[x+69,203]],'#435b73');
     stroke(c,x+30,149,x+30,102,'#a2c7d5',5);
     stroke(c,x+21,163,x+39,163,'#8aa8c5',2);
   }
   for(let i=0;i<5;i++){const x=i*208-24;stroke(c,x,372,x+238,332,'#637b963b',3)}
   arch(c,403,262,156,192,'#34465d',t.glow);
   break;
  }
  case 6:{ // boss throne, huge magic portal and twin obsidian statues
   const g=c.createRadialGradient(480,289,20,480,289,180);
   g.addColorStop(0,'#b8569466');g.addColorStop(.7,'#6a2b7160');g.addColorStop(1,'#00000000');rect(c,275,90,410,380,g);
   for(let i=0;i<4;i++){
     c.strokeStyle=i%2?'#ed91d883':'#9e86ec99';c.lineWidth=3;c.beginPath();c.ellipse(480,272,112+i*10,151+i*7,0,0,Math.PI*2);c.stroke();
   }
   for(const x of [79,789]){
     poly(c,[[x,450],[x-22,342],[x+23,275],[x+42,201],[x+66,277],[x+111,357],[x+91,450]],'#30263e');
     poly(c,[[x+21,273],[x-1,226],[x+32,243],[x+43,180],[x+65,242],[x+101,226],[x+77,281]],'#754971');
     circle(c,x+44,269,10,'#ef8fbd');
   }
   rect(c,336,407,287,44,'#3a2748');rect(c,376,386,208,26,'#573658');
   for(const x of [310,634]){rect(c,x,383,26,65,'#453251');circle(c,x+13,379,15,t.glow)}
   break;
  }
 }
 c.restore();foreground(c,t,stage);
 // Final color-grade/vignette ties characters to the stage.
 const shade=c.createRadialGradient(W/2,H/2,150,W/2,H/2,630);
 shade.addColorStop(0,'#080a1900');shade.addColorStop(1,'#03070dbb');
 rect(c,0,0,W,H,shade);
}
let cachedStage=-1,cachedCanvas=null;
export function drawStage(c,time,stageIndex=0){
 const stage=Math.max(0,Math.min(6,stageIndex|0)),theme=THEMES[stage];
 // Canvas rendering cost for scenery is paid only at first visit to a stage.
 if(cachedStage!==stage){
   cachedStage=stage;
   cachedCanvas=typeof document!=='undefined'?document.createElement('canvas'):null;
   if(cachedCanvas){cachedCanvas.width=W;cachedCanvas.height=H;buildStage(cachedCanvas.getContext('2d'),stage)}
 }
 if(cachedCanvas)c.drawImage(cachedCanvas,0,0);
 else buildStage(c,stage);
 // Subtle ambient motes drift regardless of animation, without modifying gameplay.
 for(let i=0;i<26;i++){
   const x=(i*173+time*(8+i%4*4))%W;
   const y=152+(i*67)%292+Math.sin(time*.8+i*5)*13;
   c.globalAlpha=(.25+.22*Math.sin(time*.9+i*4))*.86;
   circle(c,x,y,1+(i%4===0?1.5:0),theme.glow);
 }
 c.globalAlpha=1;
 if(stage===5){
   const thunder=Math.sin(time*.67+Math.sin(time*.23)*2);
   if(thunder>.96){c.fillStyle='#c2dfff15';c.fillRect(0,0,W,FLOOR);
     stroke(c,657,0,627,83,'#c6f4ff78',3);stroke(c,627,83,665,135,'#c6f4ff78',2);
   }
 }
 if(stage===6){c.save();c.translate(480,271);c.rotate(time*.11);c.strokeStyle='#ffa4e953';
   c.lineWidth=1;c.beginPath();c.ellipse(0,0,132,166,0,0,Math.PI*2);c.stroke();c.restore();
 }
}
