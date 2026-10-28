// Duel Reborn v3: original fighters; all shared combat rules live here.
export const WIDTH=1120,HEIGHT=630,FLOOR=526,FPS=60;
export const CORE=Object.freeze({
  health:100,speed:4.2,airSpeed:3.55,jump:14.4,gravity:.67,
  hurtWidth:40,hurtHeight:190,roundSeconds:80,specialCost:25,superCost:100
});
export const FIGHTERS=Object.freeze([
 Object.freeze({id:'azur',name:'آزر',title:'نصل البرق',subtitle:'السيف الأزرق',color:'#6ce5ff',accent:'#e4fdff',deep:'#183861',hair:'#f7f4dc',
   description:'مبارز يتحكم بالمسافة ويطلق صاعقة أفقية.',signature:'شقّ البرق',superName:'عاصفة السماء',form:'blade'}),
 Object.freeze({id:'nara',name:'نارا',title:'لهيب الشفق',subtitle:'القبضة القرمزية',color:'#ff9976',accent:'#fff1c2',deep:'#69273b',hair:'#ecb481',
   description:'مقاتلة اندفاعات سريعة تضغط على دفاع الخصم.',signature:'اندفاع الشهاب',superName:'تنين الشفق',form:'flame'})
]);
export const getFighter=id=>FIGHTERS.find(f=>f.id===id)||FIGHTERS[0];
// Startup / active / recovery in simulation frames at a fixed 60 Hz.
// Hit and hurt rectangles below are explicit: no arbitrary circle collision.
export const MOVES=Object.freeze({
 light:Object.freeze({startup:5,active:3,recovery:12,damage:7,chip:0,guardDamage:9,reach:103,height:[-143,-64],hitstun:17,blockstun:11,push:15,meter:9,hitstop:7}),
 heavy:Object.freeze({startup:13,active:4,recovery:21,damage:13,chip:0,guardDamage:17,reach:134,height:[-149,-48],hitstun:23,blockstun:16,push:25,meter:14,hitstop:11}),
 special:Object.freeze({startup:19,active:10,recovery:23,damage:17,chip:3,guardDamage:25,reach:155,height:[-145,-58],hitstun:29,blockstun:19,push:36,meter:0,hitstop:13}),
 super:Object.freeze({startup:16,active:14,recovery:35,damage:28,chip:5,guardDamage:38,reach:213,height:[-169,-40],hitstun:38,blockstun:23,push:65,meter:0,hitstop:16})
});
export const MOVE_ORDER=['light','heavy','special','super'];
