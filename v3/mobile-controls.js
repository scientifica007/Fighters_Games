// Thumb-first mobile controls. Buttons are *beside* the 16:9 arena on
// landscape phones, with an accessible side-by-side fallback on portrait.
export const MOVE_PAD=Object.freeze([
 Object.freeze({key:'jump',label:'قفز',glyph:'↑',cell:'jump'}),
 Object.freeze({key:'left',label:'يسار',glyph:'◀',cell:'left'}),
 Object.freeze({key:'guard',label:'صدّ',glyph:'⬟',cell:'guard'}),
 Object.freeze({key:'right',label:'يمين',glyph:'▶',cell:'right'})
]);
export const ATTACK_PAD=Object.freeze([
 Object.freeze({key:'light',label:'سريعة',glyph:'F',cell:'light'}),
 Object.freeze({key:'heavy',label:'ثقيلة',glyph:'G',cell:'heavy'}),
 Object.freeze({key:'special',label:'خاصة',glyph:'✦',cell:'special'}),
 Object.freeze({key:'super',label:'خارقة',glyph:'★',cell:'super'})
]);
export function mountMobileControls(movement,attacks,onPress,onRelease,canPress=()=>true){
 const active=new Map(); // Each action can have multiple pointer IDs.
 function panel(root,kind,items,caption){
  root.replaceChildren();
  root.className='mobile-pad '+kind;
  const title=document.createElement('span');title.className='pad-caption';title.textContent=caption;
  root.append(title);
  for(const item of items){
   const b=document.createElement('button');b.type='button';
   b.className='pad-button pad-'+item.cell;
   b.dataset.action=item.key;b.dataset.pad=kind;
   b.setAttribute('aria-label',item.label);
   b.innerHTML='<span class="pad-glyph" aria-hidden="true"></span><span class="pad-label"></span>';
   b.querySelector('.pad-glyph').textContent=item.glyph;
   b.querySelector('.pad-label').textContent=item.label;
   const key=item.key;
   b.addEventListener('pointerdown',e=>{
    if(!canPress())return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    e.preventDefault();
    try{b.setPointerCapture(e.pointerId)}catch{}
    const ids=active.get(key)||new Set();
    if(ids.has(e.pointerId))return;
    ids.add(e.pointerId);active.set(key,ids);
    b.classList.add('pressed');onPress(key);
   },{passive:false});
   const stop=e=>{
    if(e)e.preventDefault();
    const ids=active.get(key);
    if(!ids)return;
    if(e&&!(ids.has(e.pointerId)))return;
    if(e)ids.delete(e.pointerId);else ids.clear();
    if(ids.size===0){active.delete(key);b.classList.remove('pressed');onRelease(key)}
   };
   b.addEventListener('pointerup',stop,{passive:false});
   b.addEventListener('pointercancel',stop,{passive:false});
   b.addEventListener('lostpointercapture',stop);
   b.addEventListener('contextmenu',e=>e.preventDefault());
   root.append(b);
  }
 }
 panel(movement,'movement',MOVE_PAD,'الحركة');
 panel(attacks,'attacks',ATTACK_PAD,'الهجمات');
 return {
  release(){
   for(const name of active.keys())onRelease(name);
   active.clear();
   for(const root of [movement,attacks])
    for(const button of root.querySelectorAll('button'))button.classList.remove('pressed');
  }
 };
}
