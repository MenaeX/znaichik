# Промпты для рисунков

## Что уже сделано ✅

**Пятеро зверей готовы (29.08 утром).** Ёжик сгенерирован первым как образец
стиля, остальные четверо — от него картинкой-образцом. Лежат рядом: `yozh.webp`,
`zayats.webp`, `lisa.webp`, `belka.webp`, `medved.webp`. Подключены в `zveri.js`.

## Что осталось ⏳

**Девять предметов для заданий** — промпт внизу, раздел «Ещё нужны предметы».
Упёрлись в дневной лимит: 29.08 он пустил ровно пять генераций и закрылся
(«daily generation limit for your grace period», кредитов при этом 589).
Запускать, когда лимит откроется — образцом брать `yozh.png`.

Пока предметы остаются плоскими фигурами из `zveri.js`, и стиль внутри игры
смешанный: звери рисованные, предметы — нет.

## Как запускать

Через прямое подключение (я сам), либо командной строкой после `higgsfield auth login`:

```
higgsfield generate create nano_banana_pro --prompt "<промпт>" --aspect_ratio 1:1 --wait
```

🚨 **Порядок важен: сначала ёжик, остальные — от него.** Так все пятеро выйдут
в одном стиле. Правило из нашей памяти: серии делаются image-to-image от первого.

---

## 1. Ёжик — эталон стиля, генерится первым ✅ сделано

```
Friendly hedgehog character for a children's learning app.
Warm picture-book illustration, soft rounded shapes, gentle hand-drawn texture.
Palette: amber orange, moss green, cream parchment.
Big kind eyes, soft smile, sitting pose facing viewer.
Flat vector-like art with subtle paper grain, no harsh outlines, cozy storybook feel.
Plain cream background, no text, full body, centered, generous margin around character.
```

## 2–5. Остальные — от ёжика (image-to-image) ✅ сделано

К каждому промпту прикладывается картинка ёжика как образец стиля,
и добавляется строка: `same illustration style, same palette, same line quality`.

**Зайчик**
```
Friendly rabbit character, long upright ears, sitting pose, soft grey-beige fur,
pink inner ears. Same illustration style, same palette, same line quality as reference.
Big kind eyes, soft smile. Plain cream background, no text, full body, centered.
```

**Лисичка**
```
Friendly fox character, fluffy tail with white tip, pointed ears, white muzzle,
amber orange fur. Same illustration style, same palette, same line quality as reference.
Big kind eyes, soft smile. Plain cream background, no text, full body, centered.
```

**Белочка**
```
Friendly squirrel character, huge fluffy tail curled upward, ear tufts,
holding an acorn in both paws, sitting upright. Same illustration style, same palette,
same line quality as reference. Big kind eyes, soft smile.
Plain cream background, no text, full body, centered.
```

**Мишка**
```
Friendly bear cub character, round ears, cream muzzle, warm brown fur, sitting pose.
Same illustration style, same palette, same line quality as reference.
Big kind eyes, soft smile. Plain cream background, no text, full body, centered.
```

---

## Ещё нужны предметы для заданий

Тем же стилем, отдельным заходом. Это картинки к словам в заданиях на понимание
и на первый звук:

**кот · дом · мяч · сок · лук · рак · луна · тигр · оса · лиса**

```
Simple friendly illustration of a <предмет> for a children's learning app.
Same illustration style, same palette, same line quality as reference.
Single object, plain cream background, no text, centered, generous margin.
```

---

## Что показал опыт 29.08

- Общая деталь склеивает набор лучше слов про стиль: добавил всем зелёный шарф —
  и пятеро стали выглядеть одной компанией, а не пятью разными картинками.
- После генерации файл обязан пройти `podgotovit.py`: фон вырезается заливкой
  **от краёв**, иначе у ёжика выедает кремовое брюшко. 16,7 МБ → 114 КБ.
- Квадратный холст под рисунок не нужен: карточка сама держит квадрат,
  а лишние поля делают зверя мелким.

## Что делать с результатом

1. Скачать, сложить в `app/risunki/`.
2. Проверить **глазами каждую**: узнаётся ли зверь без подписи, нет ли обрезки,
   одинаковый ли стиль во всей пятёрке.
3. Заменить в `app/zveri.js` рисованные фигуры на картинки.
4. Прогнать приложение целиком и посмотреть все экраны.

🚨 Требование от Андрея 29.08: «визуал примитивный, рисунки примитивные».
Для зверей закрыто. Для предметов — пока нет.

## Запасной путь, если лимит не откроется

Есть другие модели в том же подключении: `nano_banana_2` (дешевле),
`z_image` (быстрая и дешёвая), `gpt_image_2` (общая). Пробовать по очереди —
лимит может считаться отдельно.
