// Original roster and common combat constants.
// Balance principle: identical core health, movement, attacks, cooldown and special damage.
// Specials differ in geometry/tempo, not in raw damage or a hidden boss stat boost.
export const RULES = Object.freeze({
  hp: 100, guard: 100, speed: 232, jump: 545, gravity: 1540,
  lightDamage: 7, heavyDamage: 12, specialDamage: 15,
  lightReach: 91, heavyReach: 111,
  lightWindup: 0.105, heavyWindup: 0.265, specialWindup: 0.34,
  lightDuration: 0.29, heavyDuration: 0.53, specialDuration: 0.78,
  lightGuard: 13, heavyGuard: 26, specialGuard: 30,
  specialCooldown: 6.6, roundTime: 70,
  arenaWidth: 960, floorY: 463
});

export const FIGHTERS = [
  { id: 'azur', name: 'آزر', title: 'نصل البرق', role: 'قتال متوسط المدى', color: '#67dcff', dark: '#185b97', skin: '#eebd93', accent: '#e6faff', shape: 'blade', special: 'bolt', specialName: 'صاعقة الأفق', specialDescription: 'مقذوف سريع يُجبر الخصم على القفز أو الصد.', portrait: '⚡', tactic: 'اقفز فوق صاعقته واقترب منه.' },
  { id: 'nara', name: 'نارا', title: 'شعلة الشفق', role: 'اندفاع مباشر', color: '#ff9561', dark: '#9c3548', skin: '#eab28a', accent: '#ffdc90', shape: 'flame', special: 'dash', specialName: 'اندفاع الشهاب', specialDescription: 'اندفاع هجومي متوقع المسار لكنه سريع.', portrait: '✦', tactic: 'تراجع واترك اندفاعها يمر ثم عاقبها.' },
  { id: 'sakh', name: 'صخر', title: 'درع الجبل', role: 'السيطرة على المسافة', color: '#bda4ff', dark: '#59418d', skin: '#c99d83', accent: '#ece1ff', shape: 'armor', special: 'shock', specialName: 'زلزال الدرع', specialDescription: 'موجة أرضية قصيرة المدى، قوية على الحراسة.', portrait: '◆', tactic: 'حافظ على مسافتك واقفز فوق موجته.' },
  { id: 'rima', name: 'ريما', title: 'رقصة الريح', role: 'التحرك والمراوغة', color: '#93ffd4', dark: '#2b8b89', skin: '#edbe99', accent: '#e5fff4', shape: 'scarf', special: 'spin', specialName: 'إعصار الندى', specialDescription: 'ضربة دائرية تصد الهجمات القريبة.', portrait: '◌', tactic: 'لا تقاتل داخل محيط الإعصار.' },
  { id: 'zill', name: 'ظِلّ', title: 'شبح الليل', role: 'المباغتة والتموضع', color: '#e18bff', dark: '#57336e', skin: '#d5a4a1', accent: '#f5deff', shape: 'hood', special: 'warp', specialName: 'عبور الظل', specialDescription: 'انتقال خاطف خلف الخصم مع إنذار بصري.', portrait: '☽', tactic: 'استدر تلقائياً واصدد عند ظهور العلامة.' },
  { id: 'rayed', name: 'رائد', title: 'قبضة الفجر', role: 'مواجهة القفز', color: '#ffe18a', dark: '#a26c39', skin: '#ab745b', accent: '#fff4d1', shape: 'gauntlet', special: 'upper', specialName: 'قبضة النيزك', specialDescription: 'ضربة صاعدة ممتازة ضد الهجوم من الجو.', portrait: '✺', tactic: 'استدرجه إلى تنفيذ الضربة ثم عاقب هبوطه.' },
  { id: 'nexus', name: 'نيكس', title: 'حارس البوابة', role: 'الخصم النهائي', color: '#ff6b9b', dark: '#6e2b6c', skin: '#c7acc5', accent: '#ffe6f2', shape: 'boss', special: 'bolt', specialName: 'شقّ البوابة', specialDescription: 'صاعقة من الطاقة لا تتجاوز ضرر مهارات الأبطال.', portrait: '◇', tactic: 'الزعيم أذكى في قراءة المسافات، وليس أعلى صحة أو ضرراً.' }
];

export const SELECTABLE = FIGHTERS.filter(f => f.id !== 'nexus');
export const STORY_OPPONENTS = ['sakh', 'rima', 'rayed', 'nara', 'zill', 'azur', 'nexus'];
export const STAGES = [
  { name: 'البوابة الحجرية', mood: 'الاختبار الأول', intelligence: 0.14 },
  { name: 'حدائق الريح', mood: 'التوقيت', intelligence: 0.27 },
  { name: 'ساحة الفجر', mood: 'التصدي للقفز', intelligence: 0.41 },
  { name: 'قلب الشفق', mood: 'الضغط الهجومي', intelligence: 0.54 },
  { name: 'أزقة الظلال', mood: 'المباغتة', intelligence: 0.66 },
  { name: 'برج العاصفة', mood: 'الردود الذكية', intelligence: 0.78 },
  { name: 'العرش الأخير', mood: 'الزعيم النهائي', intelligence: 0.93 }
];
export const findFighter = id => FIGHTERS.find(f => f.id === id) || SELECTABLE[0];
