/**
 * Замер: что записываем, как двигаемся по лестнице, что показываем родителю.
 *
 * Правила взяты из plans/lestnica-diagnostiki.md, а тот — из источников.
 * Здесь только исполнение, никаких новых педагогических решений.
 */

const KLYUCH = 'nauchik-v1';

/* ── Память ────────────────────────────────────────────────────────
   🚨 Ответ пишется НЕИЗМЕНЯЕМЫМ событием вместе с версией лестницы.
   Карта — производная, её можно пересчитать заново. Иначе после починки
   кривого задания у родителя карта поменяется сама собой: вчера «слоги
   складывает», сегодня нет. Находка защиты плана. */
function prochitat(){
  try {
    const d = JSON.parse(localStorage.getItem(KLYUCH)) || {};
    return { sobytiya: d.sobytiya || [], zahodov: d.zahodov || 0,
             uroven: d.uroven || {}, uroven_kogda: d.uroven_kogda || {},
             vozrast: d.vozrast || 0, proydeno: d.proydeno || {} };
  }
  catch(e){ return { sobytiya: [], zahodov: 0, uroven: {}, proydeno: {} }; }
}
function sohranit(p){
  try { localStorage.setItem(KLYUCH, JSON.stringify(p)); } catch(e){ /* приватный режим */ }
}

export function sozdatZamer(L){
  const P = prochitat();
  /* Заход считается при его начале — иначе затруднения текущего захода
     не отличить от вчерашних. А знакомство держится ОТДЕЛЬНЫМ флагом,
     не номером захода: раньше оно терялось от перезагрузки страницы. */
  /* Что уже выдали в ЭТОМ заходе. Без этого обучающий шаг выдавался
     без конца: его ответы в замер не пишутся, значит по счётчику попыток
     он навсегда остаётся «нетронутым». */
  let vydannye = new Set();
  /* Сколько заданий выдали по каждому навыку в этом заходе. Нужно, чтобы
     чтение и счёт шли поровну: смотреть только на ПРЕДЫДУЩЕЕ задание мало —
     у чтения девять ступеней против семи у счёта, и оно перетягивает заход
     на себя. Прогон 29.08: 54 задания чтения против 6 на счёт. */
  let vydano_po_navyku = {};

  /** Все ступени подряд, с указанием навыка. */
  function vseStupeni(){
    const out = [];
    for (const [kod, nav] of Object.entries(L.navyki))
      nav.stupeni.forEach((st, i) => out.push({ navyk: kod, stupen: st, poryadok: i }));
    return out;
  }

  /** Собирает задание на ступени: берём то, которое ещё не давали. */
  function sobrat(x){
    vydannye.add(x.stupen.id);
    vydano_po_navyku[x.navyk] = (vydano_po_navyku[x.navyk] || 0) + 1;
    const zadano = P.sobytiya.filter(e => e.stupen === x.stupen.id).length;
    const zad = x.stupen.zadaniya[zadano % x.stupen.zadaniya.length];
    return { navyk: x.navyk, stupen: x.stupen, zadanie: zad, i: zadano };
  }

  /** Что уже известно про ступень: взята, шатко, не взята, не проверяли. */
  function sostoyanie(idStupeni){
    const svoi = P.sobytiya.filter(s => s.stupen === idStupeni);
    if (!svoi.length) return { est: null, popytok: 0 };
    // «Взято» = верно с первой попытки и без подсказок
    const chisto = svoi.filter(s => s.verno && !s.podskazok).length;
    const dolya = chisto / svoi.length;
    /* 🚨 Правило «три задания на ступень» — требование к ЗАМЕРУ, а не к
       вердикту. Раньше оно стояло только в ветке «умеет», и выходило так:
       ребёнок отвечает верно на всё, лесенка уходит выше после первого
       верного, трёх записей на ступени не набирается никогда — и родитель
       читает «шатко: иногда получается, 1 из 1 сразу». Само себе противоречит.
       Прогон критика 29.08: 13 таких строк из 15 при НУЛЕ ошибок за три вечера.

       Теперь порог симметричен:
       — доля 80 % и выше — «умеет», сколько бы ни было попыток;
       — одна попытка с ошибкой — «проверяем», а не приговор: диагноз
         с одного наблюдения ставить нельзя;
       — «пока нет» — только если предлагали дважды и ни разу не вышло. */
    /* 🚨 Одного верного ответа мало, если ответ ВЫБИРАЛСЯ из вариантов:
       при выборе из пяти каждый пятый ребёнок «знает» ступень случайно.
       Там, где ответ собирается (слог, слово, счёт предметами), угадать
       нельзя — хватает и одного. Правило из CLAUDE.md: «механика без
       угадывания, мы измеряем везение, а не знание». */
    const vybirali = P.sobytiya.some(e => e.stupen === idStupeni && e.vybor);
    const nado_verno = vybirali ? 2 : 1;
    if (dolya >= 0.8 && chisto >= nado_verno)
      return { est: true, popytok: svoi.length, chisto, dolya };
    if (svoi.length < 2)   return { est: 'proveryaem', popytok: svoi.length, chisto, dolya };
    return { est: dolya > 0 ? 'shatko' : false, popytok: svoi.length, chisto, dolya };
  }

  return {
    /**
     * Выдаёт СЛЕДУЮЩЕЕ задание — по тому, что ребёнок уже показал.
     *
     * Раньше заход собирался очередью из 11 заданий ДО начала и внутри
     * не менялся. Это не подстройка: ребёнок, который читает по слогам,
     * всё равно получал буквы. Правила взяты у готовых программ
     * (plans/2026-08-29-programma-obucheniya.md, §5):
     *
     * — старт от точки, названной взрослым, и на ступень НИЖЕ заявленной
     *   (Prodigy: первый успех до первого затруднения);
     * — уровень пересчитывается после КАЖДОГО ответа (Lalilo);
     * — держим долю верных в коридоре 70–90 % (DoodleMaths);
     * — параллельно не больше ПЯТИ открытых ступеней (Lalilo);
     * — подсказанное в зачёт не идёт.
     */
    sleduyushee(){
      const vse = vseStupeni();
      const otkrytye = vse.filter(x => {
        const s = sostoyanie(x.stupen.id);
        return s.est === 'shatko' || (s.popytok > 0 && s.est !== true);
      });

      /* 🚨 ЛЕСЕНКА: верно — идём выше, ошибся — ниже.
         Замер обязан быстро дойти до потолка ребёнка, а не собирать
         статистику на каждой ступени. Prodigy стартует ниже заявленного
         и идёт вверх, пока не упрётся; Lalilo пересчитывает уровень после
         каждого ответа. Повторять ступень трижды подряд — это набор
         статистики, а не поиск границы: за 25 заданий мы так охватывали
         восемь ступеней из шестнадцати. */
      /* Лесенка строится только из ИЗМЕРЯЕМЫХ ступеней: обучающие шаги
         (знакомство, показ направления чтения) в неё не входят, иначе
         движение упирается в них — они никогда не «берутся». */
      const po_navyku = {};
      for (const x of vse){
        if (x.stupen.ne_zamer) continue;
        (po_navyku[x.navyk] = po_navyku[x.navyk] || []).push(x);
      }

      /** На какой ступени стояли в прошлый раз — чтобы понять, идём вверх
          или вниз. */
      function gde_stoyali(kod){
        const spisok = po_navyku[kod] || [];
        const svoi = P.sobytiya.filter(e => e.navyk === kod);
        if (!svoi.length) return -1;
        return spisok.findIndex(x => x.stupen.id === svoi[svoi.length - 1].stupen);
      }

      /** Куда идти по навыку: индекс ступени, которую даём следующей. */
      function sleduyushiy_indeks(kod){
        const spisok = po_navyku[kod];
        const svoi = P.sobytiya.filter(e => e.navyk === kod);

        /* 🚨 Отметка взрослого перебивает историю, если она СВЕЖЕЕ последнего
           ответа. Раньше уровень учитывался только на чистом профиле — то есть
           ручка не работала ровно у тех, чьи родители на неё и жалуются:
           у детей, которые уже поиграли. Поймано критиком 29.08. */
        const kogda = (P.uroven_kogda || {})[kod] || 0;
        const posledniy_otvet = svoi.length ? (svoi[svoi.length - 1].kogda || 0) : 0;
        if (kogda > posledniy_otvet){
          const nazvan = (P.uroven || {})[kod];
          if (typeof nazvan === 'number')
            return Math.max(0, Math.min(spisok.length - 1, nazvan - 1));
        }

        const v_kramkah = i => Math.max(0, Math.min(spisok.length - 1, i));
        const nomer = id => spisok.findIndex(x => x.stupen.id === id);
        const chisto = e => e.verno && !e.podskazok;

        if (!svoi.length){
          /* 🚨 Старт от уровня, который назвал взрослый, и на ступень НИЖЕ:
             первый успех должен случиться до первого затруднения (Prodigy
             стартует на класс ниже заявленного). Взрослый не назвал —
             берём возраст как ГРУБУЮ прикидку. Возраст знаний не означает
             (Андрей, 19.09: «в 5 лет может быть больше, чем у 7-летнего»),
             поэтому он и не назначает уровень, а только выбирает, откуда
             начать поиск: ошибка тут стоит одного-двух заданий, потому что
             дальше работает галоп. */
          const nazvan = P.uroven && P.uroven[kod];
          if (typeof nazvan === 'number') return v_kramkah(nazvan - 1);
          const let_ = P.vozrast || 0;
          if (let_ >= 7) return v_kramkah(Math.round(spisok.length * 0.3));
          if (let_ === 6) return v_kramkah(Math.round(spisok.length * 0.15));
          return 0;
        }

        /* 🚨 ПОИСК ГРАНИЦЫ. Шаг ±1 — это обход лестницы, а не поиск:
           при четырнадцати ступенях чтения и восьми заданиях на навык
           за вечер ребёнок, читающий словами, добирался до своего потолка
           к третьему заходу, а до того получал давно знакомое. Андрей
           19.09: «не учить тому что знает или наоборот».

           Вверх идём галопом (+1, +2, +4, +8), вниз — только делением
           вилки пополам. Несимметрично намеренно: промах вверх стоит
           одного неверного ответа, промах вниз — череды провалов, а
           лестница требует заканчивать заход посильным. */
        const v_zahode = svoi.filter(e => e.zahod === P.zahodov);
        if (!v_zahode.length){
          /* Новый заход: начинаем от потолка прошлых — со ступени ВЫШЕ
             взятой. Ребёнок за неделю подрос, и перепроверять снизу
             всё, что он уже показал, значит тратить его вечер. */
          let potolok = -1;
          for (const e of svoi) if (chisto(e)) potolok = Math.max(potolok, nomer(e.stupen));
          return v_kramkah(potolok + 1);
        }

        let vzyato = -1, ne_vzyato = spisok.length;
        for (const e of v_zahode){
          const i = nomer(e.stupen);
          if (i < 0) continue;
          if (chisto(e)) vzyato = Math.max(vzyato, i);
          else ne_vzyato = Math.min(ne_vzyato, i);
        }

        if (vzyato + 1 < ne_vzyato){
          if (ne_vzyato < spisok.length)
            return v_kramkah(Math.floor((vzyato + ne_vzyato) / 2));   // сужаем вилку
          /* Осечек ещё не было — потолок выше, шагаем всё шире. */
          let podryad = 0;
          for (let i = v_zahode.length - 1; i >= 0 && chisto(v_zahode[i]); i--) podryad++;
          return v_kramkah(vzyato + Math.pow(2, Math.max(0, podryad - 1)));
        }

        /* Граница найдена: между «берёт» и «не берёт» пусто. Дальше
           обычный шаг — держимся у границы и набираем наблюдения,
           потому что вердикт ставится не с одного ответа. */
        const posledniy = svoi[svoi.length - 1];
        const gde = nomer(posledniy.stupen);
        if (gde < 0) return 0;
        return v_kramkah(gde + (chisto(posledniy) ? 1 : -1));
      }

      /* 🚨 Не долбим одним и тем же. Если по навыку три затруднения подряд
         на самой нижней ступени — на сегодня этот навык откладываем. Иначе
         ребёнок, который не справляется, получает одно и то же задание
         двенадцать раз подряд (поймано прогоном 29.08 с неверными ответами).
         Правило из лестницы: «вниз, к посильному, и заканчиваем заход победой». */
      /* 🚨 Считаем затруднения ТОЛЬКО В ЭТОМ ЗАХОДЕ. Раньше счётчик смотрел
         на всю память: после неудачного захода ребёнок при следующем открытии
         сразу видел «На сегодня всё. Приходи завтра!» — и так каждый день,
         навсегда, потому что новым верным ответам взяться было неоткуда.
         Закрытая дверь доставалась ровно тому ребёнку, ради которого всё
         и затевалось. Поймано критиком 29.08 прогоном zavtra.py. */
      const podryad_neudach = kod => {
        const svoi = P.sobytiya.filter(e => e.navyk === kod && e.zahod === P.zahodov);
        let n = 0;
        for (let i = svoi.length - 1; i >= 0 && !svoi[i].verno; i--) n++;
        return n;
      };
      /* 🚨 Пока лесенка ещё может спуститься — не закрываем навык.
         Родитель, отметивший уровень выше реального, иначе запирал игру:
         ребёнок получал шесть непосильных заданий и упирался в «Приходи
         завтра». Спуск к посильному — это поиск, а не провал. Закрываем
         навык только когда дошли до самой нижней ступени и там не выходит.
         Поймано критиком 29.08 прогоном vyshe.py. */
      const na_dne = kod => {
        const svoi = P.sobytiya.filter(e => e.navyk === kod);
        if (!svoi.length) return false;
        const spisok = po_navyku[kod] || [];
        return spisok.length ? spisok[0].stupen.id === svoi[svoi.length - 1].stupen : false;
      };
      /* 🚨 Три промаха на дне — не повод бросать навык. Раньше он гас,
         и весь остаток захода уходил во второй: у ребёнка, который слабее
         в чтении, из 24 заданий чтению досталось ТРИ, а родителю в карте
         вышло семь прочерков «не проверяли» — замер не сделан там, где был
         нужнее всего. Вместо закрытия отдаём ступень, которую ребёнок
         БЕРЁТ: заход должен заканчиваться победой, а не чередой провалов. */
      const est_pobeda = kod => (po_navyku[kod] || [])
        .some(x => sostoyanie(x.stupen.id).est === true);
      let zhivye = Object.keys(po_navyku)
        .filter(k => podryad_neudach(k) < 3 || !na_dne(k) || est_pobeda(k));
      /* Если закрылись оба — заход заканчиваем, но только когда в нём уже
         что-то было. На первом задании захода дверь не запираем никогда. */
      if (!zhivye.length){
        const bylo_v_zahode = P.sobytiya.some(e => e.zahod === P.zahodov);
        if (bylo_v_zahode) return null;
        zhivye = Object.keys(po_navyku);
      }

      /* Чередуем навыки по счёту выданного: берём тот, которого меньше.
         Это и отдых для ребёнка, и ровная карта по обоим навыкам. */
      const skolko = k => vydano_po_navyku[k] || 0;
      const otstayushiy = zhivye.sort((a, b) => skolko(a) - skolko(b))[0];

      /* Берём отстающий навык и на нём — ступень по лесенке.
         Обучающие шаги (знакомство, показ направления чтения) выдаём
         один раз в первый заход и только в начале. */
      const obuchayushiy = vse.find(x => x.stupen.ne_zamer
                                         && !(P.proydeno || {})[x.stupen.id]
                                         && !vydannye.has(x.stupen.id));
      if (obuchayushiy) return sobrat(obuchayushiy);

      const kod = otstayushiy;
      const spisok = po_navyku[kod];
      if (!spisok || !spisok.length) return null;

      /* 🚨 Держим КОРИДОР УСПЕХА. DoodleMaths прямо задаёт 70–90 % верных
         и объясняет это тем, что ребёнка надо «обнадёжить и мотивировать»;
         расчётный оптимум скорости обучения — около 85 %. Если в заходе
         доля верных просела ниже двух третей, следующее задание берём
         с той ступени, которую ребёнок БЕРЁТ. Иначе выходит вечер из одних
         провалов: прогон 29.08 дал 8 заданий и 2 верных — 25 %. */
      const v_zahode = P.sobytiya.filter(e => e.zahod === P.zahodov);
      const dolya_zahoda = v_zahode.length
        ? v_zahode.filter(e => e.verno).length / v_zahode.length : 1;
      /* Порог держим у нижнего края коридора: 0,75 — это «три из четырёх»,
         записанное в правилах лестницы. Реагируем со второго ответа, а не
         с четвёртого: к четвёртому ребёнок уже устал от неудач. */
      const posledniy_mimo = v_zahode.length && !v_zahode[v_zahode.length - 1].verno;
      const nuzhna_pobeda = v_zahode.length >= 2 && dolya_zahoda < 0.75 && posledniy_mimo;

      /* 🚨 Два промаха подряд — даём заведомо посильное. Правило нарочно
         тупое и потому надёжное: берём САМУЮ НИЖНЮЮ ступень навыка, а если
         ребёнок уже что-то взял — высшую из взятых. Раньше правило искало
         «взятую ступень» и часто не находило, а ребёнок продолжал получать
         непосильное: прогон дал 2 верных из 8 за вечер. */
      if (nuzhna_pobeda || podryad_neudach(kod) >= 2){
        const beryot = spisok.filter(x => sostoyanie(x.stupen.id).est === true);
        if (beryot.length) return sobrat(beryot[beryot.length - 1]);
        return sobrat(spisok[0]);          // ниже уже некуда
      }

      let i = sleduyushiy_indeks(kod);
      /* 🚨 Пропускаем взятые ступени ТОЛЬКО когда идём вверх. Раньше цикл
         шагал вверх всегда — и отменял шаг вниз: ребёнок, упёршийся в свою
         границу, каждый заход получал одно и то же непосильное задание.
         Прогон критика 29.08: второй и третий заходы дали 25 заданий и
         НОЛЬ верных ответов. Семилетка после двух таких вечеров игру
         не откроет. Теперь при спуске взятая ступень — это не помеха,
         а задание-победа: заход обязан заканчиваться тем, что получается
         (правило из lestnica-diagnostiki: «вниз, к посильному, и заканчиваем
         заход победой»). */
      const idyom_vverh = i > gde_stoyali(kod);
      if (idyom_vverh){
        let shagov = 0;
        while (shagov < spisok.length && sostoyanie(spisok[i].stupen.id).est === true
               && i < spisok.length - 1){ i++; shagov++; }
      }
      return sobrat(spisok[i]);
    },

    /** Обучающий шаг пройден — больше не показываем. Флаг переживает
        перезагрузку страницы, в отличие от номера захода. */
    obuchayushiyProyden(id){
      P.proydeno = { ...(P.proydeno || {}), [id]: true };
      sohranit(P);
    },

    /* ── Режим: замер или обучение ──────────────────────────────────
       Первый заход — замер целиком: надо найти уровень. Дальше обучение
       становится основным, а замер живёт фоном и уточняет карту:
       одно измеряющее задание на каждые четыре обучающих. */
    rezhim(vydano){
      if ((P.zahodov || 0) <= 1) return 'zamer';
      return (vydano % 5 === 4) ? 'zamer' : 'uchim';
    },

    /** Навык, которого в заходе было меньше — им и занимаемся. */
    otstayushiyNavyk(){
      const skolko = k => vydano_po_navyku[k] || 0;
      return Object.keys(L.navyki).sort((a, b) => skolko(a) - skolko(b))[0];
    },

    /** Собрать задание на конкретной ступени (для обучения). */
    sobratNaStupeni(x){ return sobrat(x); },

    /** Ступень для обучения: та, где ребёнок уже на границе.
        Сначала «шатко» — граница найдена; иначе первая невзятая;
        а если взято ВСЁ — закрепляем верхнюю. */
    stupenDlyaObucheniya(kod){
      const svoi = vseStupeni().filter(x => x.navyk === kod && !x.stupen.ne_zamer);

      /* 🚨 Отметка взрослого действует и в ОБУЧЕНИИ, не только в замере.
         Раньше учитывалась только замером: родитель ставил «читает
         предложения», а обучение всё равно начинало с первого звука —
         то есть ручка работала наполовину и незаметно. Поймано прогоном
         31.08 при проверке новой ступени. */
      const kogda = (P.uroven_kogda || {})[kod] || 0;
      const otvety = P.sobytiya.filter(e => e.navyk === kod);
      const posledniy = otvety.length ? (otvety[otvety.length - 1].kogda || 0) : 0;
      if (kogda > posledniy){
        const nazvan = (P.uroven || {})[kod];
        if (typeof nazvan === 'number' && svoi.length)
          return svoi[Math.max(0, Math.min(svoi.length - 1, nazvan - 1))];
      }

      const shatkie = svoi.filter(x => sostoyanie(x.stupen.id).est === 'shatko');
      if (shatkie.length) return shatkie[0];
      const nevzyatye = svoi.filter(x => sostoyanie(x.stupen.id).est !== true);
      if (nevzyatye.length) return nevzyatye[0];
      /* 🚨 Ребёнок прошёл всю лестницу — это не повод закрывать заход.
         Раньше здесь возвращался null, движок откатывался к замеру, тот
         тоже ничего не находил, и ребёнок получал заход из ДВУХ заданий
         и «Приходи завтра». Теперь закрепляем верхнюю ступень: у неё
         в банке десятки заданий, они не повторяются. */
      return svoi.length ? svoi[svoi.length - 1] : null;
    },

    /** Возраст ребёнка — грубая прикидка, откуда начинать ПОИСК.
        🚨 Уровнем он не становится: экран возраста до 19.09 вообще ни
        на что не влиял, хотя подпись обещала обратное. */
    vozrast(let_){ P.vozrast = +let_ || 0; sohranit(P); },

    /** Что взрослый указал про уровень: {навык: индекс ступени}. */
    uroven(){ return { ...(P.uroven || {}) }; },

    /** Взрослый передвинул ручку. Пишем и в память — она пригодится
        следующему заходу; уже собранные ответы не трогаем. */
    postavitUroven(kod, indeks){
      P.uroven = { ...(P.uroven || {}) };
      P.uroven_kogda = { ...(P.uroven_kogda || {}) };
      if (indeks === null || indeks === undefined){
        delete P.uroven[kod]; delete P.uroven_kogda[kod];
      } else {
        P.uroven[kod] = indeks;
        P.uroven_kogda[kod] = Date.now();   // когда родитель передвинул ручку
      }
      sohranit(P);
    },

    /** Ступени навыка списком — для ручки в родительском разделе. */
    stupeniNavyka(kod){
      return vseStupeni().filter(x => x.navyk === kod && !x.stupen.ne_zamer)
                         .map(x => ({ id: x.stupen.id, imya: x.stupen.imya }));
    },

    /** Новый заход: забываем, что выдавали в прошлом. */
    nachatZahod(){
      vydannye = new Set();
      vydano_po_navyku = {};
      P.zahodov = (P.zahodov || 0) + 1;
      sohranit(P);
    },

    /** Сколько заданий уже выдано в этом заходе — заход длится 8–10 минут. */
    hvatit(vydano, sekund){
      return vydano >= (L.pravila.zadaniy_v_zahode || 25) || sekund > 600;
    },

    zapisat(sobytie){
      /* Номер захода в каждом событии: по нему считаем затруднения
         текущего захода, не трогая вчерашние. */
      P.sobytiya.push({ ...sobytie, zahod: P.zahodov });
      sohranit(P);
    },

    /** Карта для родителя. Бытовым языком, без терминов и без нормы. */
    itog(){
      const stupeni = {};
      for (const [, nav] of Object.entries(L.navyki)){
        for (const st of nav.stupeni){
          if (st.ne_zamer) continue;   // обучающий шаг в карту не идёт
          const s = sostoyanie(st.id);
          if (s.est === null){
            stupeni[st.id] = { klass:'pusto', metka:'—', podpis:'не проверяли' };
            continue;
          }
          const srednee = Math.round(
            P.sobytiya.filter(e => e.stupen === st.id)
                      .reduce((a, e) => a + (e.sekund || 0), 0) / s.popytok);
          if (s.est === 'proveryaem'){
            stupeni[st.id] = { klass:'pusto', metka:'проверяем',
              podpis:`Предлагали ${s.popytok} раз — этого мало, чтобы судить` };
            continue;
          }
          if (s.est === true)
            stupeni[st.id] = { klass:'est', metka:'умеет',
              podpis:`${st.opisanie_roditelyu}. Сразу верно ${s.chisto} из ${s.popytok}` +
                     (s.popytok < 3 ? ' — проверим ещё' : '') };
          else if (s.est === 'shatko')
            stupeni[st.id] = { klass:'shatko', metka:'шатко',
              podpis:`Иногда получается: ${s.chisto} из ${s.popytok} сразу, в среднем ${srednee} с` };
          else
            stupeni[st.id] = { klass:'net', metka:'пока нет',
              podpis:`Предлагали ${s.popytok} раз, ни разу с первого` };
        }
      }
      return { stupeni, vsego: P.sobytiya.length, zahodov: P.zahodov };
    }
  };
}
