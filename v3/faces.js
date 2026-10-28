// Original face studies for the two combatants.
// Faces deliberately have distinct bone structures, features, complexion,
// expressions, and hairlines (not palette-swapped ovals).
const T=Math.PI*2;
function polygon(c,pts,fill,outline='#171525',w=2.2){
 c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
 c.closePath();c.fillStyle=fill;c.fill();
 if(outline){c.strokeStyle=outline;c.lineWidth=w;c.lineJoin='round';c.stroke()}
}
function path(c,pts,color,w=2){
 c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
 c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();
}
function disc(c,x,y,rx,ry,col){
 c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,T);c.fill();
}
function faceAzur(c,expression){
 // Strong, older angular face: broad brow, long nose, sharp jaw, scar and stubble.
 polygon(c,[[-11,-145],[-7,-133],[9,-133],[10,-147]],'#b57f6c');
 const skin=c.createLinearGradient(-19,-161,20,-162);
 skin.addColorStop(0,'#98665e');skin.addColorStop(.35,'#deaa8d');
 skin.addColorStop(.8,'#eac2a0');skin.addColorStop(1,'#bf8b74');
 polygon(c,[[-21,-178],[-12,-187],[13,-185],[21,-176],[22,-157],[15,-144],
    [10,-136],[-2,-135],[-15,-147],[-22,-164]],skin);
 polygon(c,[[-17,-174],[-3,-179],[10,-173],[16,-156],[8,-144],[-1,-143],[-13,-150]],'#f3c3a418',null);
 // Angled temple, temple scar and aquiline bridge (clear profile at low resolution).
 polygon(c,[[12,-165],[22,-165],[29,-157],[20,-151],[14,-151]],'#c8937c',null);
 path(c,[[9,-169],[15,-158],[20,-156]],'#9c5d54',2.5);
 path(c,[[21,-155],[25,-155]],'#7f5554',1.5);
 // Heavy brow and blue-grey eye with distinctive severe expression.
 path(c,[[2,-173],[16,-176]],'#263045',4);
 path(c,[[6,-171],[18,-171]],'#fff1d4',3);
 disc(c,13,-170,3.3,3.3,'#42647b');
 disc(c,14,-171,1.6,1.6,'#0f2035');
 disc(c,15,-172,0.8,0.9,'#ffffff');
 // Vertical scar crossing cheek.
 path(c,[[5,-164],[1,-154],[-2,-147]],'#8b5b5d',1.4);
 path(c,[[6,-164],[2,-153]],'#f3d0b0',.7);
 // Fine dark goatee / rough jaw, unlike Nara's smooth face.
 polygon(c,[[-11,-143],[-6,-136],[4,-132],[12,-141],[7,-138],[-1,-139]],'#424047',null);
 path(c,[[10,-145],[17,-147]],'#6c3b3e',2.2);
 if(expression==='hurt')path(c,[[7,-143],[16,-141]],'#672d3e',2.7);
 else if(expression==='attack')path(c,[[7,-145],[17,-145]],'#6b3a40',2.5);
 else path(c,[[9,-144],[16,-145]],'#643e40',1.8);
 // Silver-white layered cropped hair, with navy band and martial crown.
 polygon(c,[[-23,-173],[-27,-188],[-19,-193],[-11,-207],[-3,-198],
  [7,-211],[15,-199],[24,-196],[23,-177],[15,-185],[4,-187],[-9,-182]],'#e0edf0');
 polygon(c,[[-18,-194],[-6,-205],[-5,-189],[9,-205],[13,-190],[21,-194],[16,-183],[-10,-185]],'#fffdf0',null);
 polygon(c,[[-21,-177],[5,-184],[20,-180],[18,-175],[1,-176],[-19,-172]],'#20395d');
 path(c,[[-16,-174],[16,-178]],'#7edcff',2.7);
 // Silver sideburn separates mature fighter from youthful Nara.
 polygon(c,[[-21,-174],[-25,-166],[-17,-155],[-16,-173]],'#dae8e4',null);
 polygon(c,[[17,-178],[20,-167],[17,-158],[14,-171]],'#ecf8e9',null);
}
function faceNara(c,expression,frame=0){
 // Younger, round / heart-shaped face, raised cheeks, expressive eyes and braid.
 polygon(c,[[-9,-147],[-7,-133],[6,-133],[8,-145]],'#ba756b');
 const skin=c.createLinearGradient(-23,-162,24,-162);
 skin.addColorStop(0,'#b9796f');skin.addColorStop(.4,'#f2b797');
 skin.addColorStop(.78,'#ffd6ab');skin.addColorStop(1,'#d68a79');
 polygon(c,[[-18,-185],[0,-190],[15,-184],[20,-175],[20,-155],[14,-143],
  [4,-136],[-8,-141],[-20,-152],[-22,-169]],skin);
 disc(c,3,-153,9,6,'#ee987c67');
 // Ear is visible in front of hair; hoop earring.
 disc(c,-21,-157,5.4,8.2,'#e4a18c');
 c.strokeStyle='#ffe9a0';c.lineWidth=2;c.beginPath();c.arc(-23,-150,3.8,-.2,Math.PI*1.15);c.stroke();
 // High expressive brow and large almond eye, emerald iris.
 path(c,[[0,-176],[14,-172]],'#56324a',2.9);
 polygon(c,[[1,-168],[8,-172],[17,-170],[10,-164]],'#fff5e3',null);
 disc(c,10,-168,3.5,4,'#397d6c');disc(c,11,-168,1.7,2.6,'#1b2e37');
 disc(c,11,-170,1.2,1.2,'#fffaf0');
 path(c,[[2,-168],[-1,-172]],'#402c41',1.8);
 // Short upturned nose and defined lip contour, different from Azur.
 path(c,[[18,-164],[23,-158],[19,-157]],'#bf766c',1.8);
 disc(c,18,-157,1.1,1,'#a96c67');
 for(const [x,y] of [[5,-154],[9,-151],[12,-155]])disc(c,x,y,0.75,0.75,'#b76a62');
 if(expression==='attack'){path(c,[[6,-144],[16,-146]],'#9f4251',2.6);path(c,[[7,-142],[15,-143]],'#f19b93',1)}
 else if(expression==='hurt')path(c,[[8,-143],[14,-141]],'#8b3b45',2.4);
 else {path(c,[[7,-144],[13,-143],[17,-146]],'#a24d57',1.8);path(c,[[9,-142],[14,-143]],'#ed9c95',1.1)}
 // Reddish-orange coiffure frames the face with swept bangs.
 polygon(c,[[-23,-170],[-22,-186],[-12,-199],[-3,-203],[15,-201],[24,-190],
  [24,-169],[17,-183],[6,-182],[-2,-176],[-13,-173]],'#ae5548');
 polygon(c,[[-23,-179],[-16,-195],[-2,-201],[12,-195],[18,-184],
  [7,-186],[-3,-180],[-16,-177]],'#f9a65f',null);
 polygon(c,[[-15,-192],[-9,-199],[8,-198],[-1,-188],[9,-181],[-6,-183]],'#ffd08b',null);
 // Burgundy headband & long high ponytail tied with gold clasp.
 path(c,[[-19,-179],[4,-188],[22,-184]],'#652742',5);
 path(c,[[-18,-180],[5,-188],[19,-184]],'#f3d392',1.3);
 c.save();c.translate(-19,-195);c.rotate(Math.sin(frame*.52)*.13);
 polygon(c,[[-4,0],[-21,-6],[-38,0],[-49,29],[-60,36],[-55,15],[-50,-5],[-32,-19],[-7,-16]],'#f2a063');
 polygon(c,[[-30,-12],[-42,-3],[-52,27],[-46,20],[-34,-9]],'#ffd092',null);
 path(c,[[-12,-11],[-32,-18]],'#62273b',4);
 c.restore();
}
export function drawFace(c,id,y=0,pose={},frame=0){
 c.save();c.translate(0,y);
 // The jaw follows attack anticipation; features stay attached to the head.
 c.translate(0,Math.max(-3,Math.min(3,(pose.reachY||0)*-.085)));
 const expression=pose.power||pose.hand>25?'attack':pose.step===-7?'hurt':'neutral';
 if(id==='azur')faceAzur(c,expression);else faceNara(c,expression,frame);
 c.restore();
}
export const FACE_PROFILES=Object.freeze({
 azur:Object.freeze({shape:'angular jaw',eyes:'blue-grey',hair:'silver short',detail:'scar and goatee'}),
 nara:Object.freeze({shape:'round heart',eyes:'emerald',hair:'orange long ponytail',detail:'freckles and earring'})
});


// Enlarged character likeness for HUD and character selection. This is an
// actual re-rendered face at portrait scale, not a scaled-up generic icon.
export function drawFaceAvatar(c,id,x,y,size=60){
 const r=size/2;
 c.save();
 c.beginPath();c.arc(x,y,r,0,T);c.clip();
 const g=c.createLinearGradient(x-r,y-r,x+r,y+r);
 if(id==='azur'){g.addColorStop(0,'#29465b');g.addColorStop(1,'#0c1e36')}
 else{g.addColorStop(0,'#833d54');g.addColorStop(1,'#2b1a38')}
 c.fillStyle=g;c.fillRect(x-r,y-r,size,size);
 const scale=size/77;
 c.translate(x,y+160*scale);
 c.scale(scale,scale);
 polygon(c,[[-33,-141],[-22,-129],[-28,-97],[28,-97],[22,-129],[33,-141]],
  id==='azur'?'#224d72':'#9f4b53');
 drawFace(c,id,0,{},1);
 c.restore();
 c.save();c.beginPath();c.arc(x,y,r-1,0,T);c.lineWidth=2.5;
 c.strokeStyle=id==='azur'?'#82dff3':'#f8bf99';c.stroke();c.restore();
}
