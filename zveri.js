/* Звери — рисунки, а не фигуры из кругов и треугольников.
   Сгенерированы 29.08 в едином стиле: ёжик первым, остальные от него
   как от образца (правило «серии делаются от первого»). Общая деталь —
   зелёный шарф; она и держит пятёрку вместе.
   Файлы прошли через risunki/podgotovit.py: фон вырезан заливкой от
   краёв, обрезано по зверю, 512 px, webp — 16,7 МБ стали 114 КБ.
   Прежние фигуры лежат в истории, коммит 23deaf2. */
/* 🚨 Два формата: webp для нового браузера, png для старого.
   На iPad с кнопкой «Домой» экран выбора зверя был ПУСТЫМ — заголовок
   есть, зверей нет: webp появился в Safari только с iOS 14, и на старых
   системах картинка не рисуется молча, без единой ошибки.
   <picture> решает это сам: браузер берёт формат, который понимает. */
const KARTINKA = imya =>
  `<picture>
     <source srcset="./risunki/${imya}.webp" type="image/webp">
     <img src="./risunki/${imya}.png" alt="" draggable="false" decoding="async">
   </picture>`;

export const ZVERI = {
  yozh:   KARTINKA('yozh'),
  zayats: KARTINKA('zayats'),
  lisa:   KARTINKA('lisa'),
  belka:  KARTINKA('belka'),
  medved: KARTINKA('medved'),
};

export const GALKA = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 5 5L19 7"/></svg>`;

// Картинки к словам — для заданий на понимание прочитанного
const KOT = `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="76" rx="30" ry="26" fill="#9C8878"/><path d="M36 56 32 34l18 12zM84 56l4-22-18 12z" fill="#9C8878"/><circle cx="50" cy="72" r="3.6" fill="#2C2820"/><circle cx="70" cy="72" r="3.6" fill="#2C2820"/><ellipse cx="60" cy="82" rx="5" ry="3.6" fill="#C25548"/><path d="M88 84c9 4 14 12 12 20" stroke="#9C8878" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`;
const LUNA = `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="36" fill="#EBD98F"/><circle cx="48" cy="50" r="7" fill="#DCC97C"/><circle cx="72" cy="66" r="9" fill="#DCC97C"/></svg>`;

/* Предметы, для которых есть рисунок в общем стиле со зверями.
   Остальные пока держатся на фигурах — их дорисуем, когда откроется
   дневной лимит генерации. 🚨 Оса ждёт перегенерации: вышла похожей
   на пчелу, а ребёнок должен узнать именно осу, иначе задание на звук
   «о» ломается (правило: предмет выглядит так, как его называет голос). */
/* Предметы, у которых есть рисунок в общем стиле со зверями.
   🚨 Кот, мяч и оса перерисованы 31.08 после живой пробы: прежние
   фигуры ребёнок не узнавал — кот читался как серый кружок, мяч как
   крест, оса как пчела. Задание на первый звук держится на узнавании
   предмета: не узнал — задание бессмысленно. */
/* 🚨 Все предметы — НАСТОЯЩИЕ рисунки, а не самодельные фигуры.
   Андрей на живой пробе 31.08: «нарисованы очень просто и примитивно,
   ребёнок может не понять» — это было про SVG-заглушки ниже.
   Задание на первый звук держится на узнавании предмета: не узнал —
   задание бессмысленно. Фон у файлов снят tools/ubrat_fon.py. */
const FAJLY = {
  'дом': 'dom', 'тигр': 'tigr', 'кот': 'kot', 'мяч': 'myach', 'оса': 'osa',
  'арбуз': 'arbuz', 'волк': 'volk', 'жук': 'zhuk', 'зонт': 'zont',
  'игла': 'igla', 'лук': 'luk', 'носок': 'nosok', 'облако': 'oblako',
  'рак': 'rak', 'сани': 'sani', 'утка': 'utka', 'флаг': 'flag',
  'хлеб': 'hleb', 'шар': 'shar', 'эскимо': 'eskimo',
  'белка': 'belka', 'лиса': 'lisa', 'медведь': 'medved',
  'ёж': 'yozh', 'заяц': 'zayats',
};
const risunok = imya => {
  const fajl = FAJLY[imya];
  return `<picture>
     <source srcset="./risunki/${fajl}.webp" type="image/webp">
     <img src="./risunki/${fajl}.png" alt="" draggable="false" decoding="async">
   </picture>`;
};

export const KARTINKI = {
  дом: risunok('дом'), тигр: risunok('тигр'), кот: risunok('кот'),
  мяч: risunok('мяч'), оса: risunok('оса'),
  арбуз: risunok('арбуз'), волк: risunok('волк'), жук: risunok('жук'),
  зонт: risunok('зонт'), игла: risunok('игла'), лук: risunok('лук'),
  носок: risunok('носок'), облако: risunok('облако'), рак: risunok('рак'),
  сани: risunok('сани'), утка: risunok('утка'), флаг: risunok('флаг'),
  хлеб: risunok('хлеб'), шар: risunok('шар'), эскимо: risunok('эскимо'),
  белка: risunok('белка'), лиса: risunok('лиса'), медведь: risunok('медведь'),
  ёж: risunok('ёж'), заяц: risunok('заяц'),
  кит: KOT, luna: LUNA, луна: LUNA,
  kot: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="76" rx="30" ry="26" fill="#9C8878"/>
    <path d="M36 56 32 34l18 12zM84 56l4-22-18 12z" fill="#9C8878"/>
    <circle cx="50" cy="72" r="3.6" fill="#2C2820"/><circle cx="70" cy="72" r="3.6" fill="#2C2820"/>
    <ellipse cx="60" cy="82" rx="5" ry="3.6" fill="#C25548"/>
    <path d="M88 84c9 4 14 12 12 20" stroke="#9C8878" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
  luna: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="36" fill="#EBD98F"/>
    <circle cx="48" cy="50" r="7" fill="#DCC97C"/><circle cx="72" cy="66" r="9" fill="#DCC97C"/>
    <circle cx="56" cy="76" r="5" fill="#DCC97C"/></svg>`,
  сок: `<svg viewBox="0 0 120 120"><path d="M38 34h44l-6 62H44z" fill="#E68A2E"/>
    <rect x="50" y="20" width="6" height="18" fill="#5D8F52"/></svg>`,
  лук: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="70" rx="26" ry="28" fill="#D9A05B"/>
    <path d="M60 42c-3-12 3-20 3-20s5 10 2 20" fill="#5D8F52"/></svg>`,
  рак: `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="66" rx="26" ry="22" fill="#C25548"/>
    <path d="M34 52 22 40M86 52l12-12" stroke="#C25548" stroke-width="7" stroke-linecap="round"/></svg>`,
  лиса: `<svg viewBox="0 0 120 120"><path d="M60 96c-20 0-32-14-30-34l30-24 30 24c2 20-10 34-30 34z" fill="#E68A2E"/>
    <path d="M36 54 30 30l18 10zM84 54l6-24-18 10z" fill="#C97426"/>
    <path d="M60 96c-9 0-16-5-20-13h40c-4 8-11 13-20 13z" fill="#FBF5E9"/>
    <circle cx="48" cy="62" r="3.6" fill="#2C2820"/><circle cx="72" cy="62" r="3.6" fill="#2C2820"/></svg>`,
};
