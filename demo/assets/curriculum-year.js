const stepNotes = [
  "part1 先学今天最核心的 2 个词或词块。",
  "part2 把 part1 的内容放进今天的句子或场景。",
  "part3 先听，再做单词和整句跟读。",
];

const reviewStepNotes = [
  "part1 把本轮前 11 天的核心词块重新过一遍。",
  "part2 把本轮前 11 天的整句重新听和读一遍。",
  "part3 用单词和整句双模式，把这一轮整体复盘。",
];

const e = (ru, ipa, zh) => ({ ru, ipa, zh });

function lesson(title, foundations, phrases, options = {}) {
  return {
    title,
    foundations: foundations.map(toEntry),
    phrases: toPhraseList(phrases),
    words: (options.words ?? foundations).map(toEntry),
    voice: options.voice ? toEntry(options.voice) : null,
    stepNotes: options.stepNotes ?? stepNotes,
  };
}

function cycle(number, label, summary, lessons) {
  return {
    number,
    label,
    summary: toEntry(summary),
    lessons,
  };
}

function toEntry(entry) {
  if (Array.isArray(entry)) {
    const [ru, ipa, zh] = entry;
    return e(ru, ipa, zh);
  }

  return entry;
}

function toPhraseList(phrases) {
  if (Array.isArray(phrases) && Array.isArray(phrases[0])) {
    return phrases.map(toEntry);
  }

  return [toEntry(phrases)];
}

function makeItem(ru, ipa, zh, exampleRu, exampleIpa, exampleZh) {
  return { ru, ipa, zh, exampleRu, exampleIpa, exampleZh };
}

function makeReview(label, prompt, answerRu, answerIpa) {
  return { label, prompt, answerRu, answerIpa };
}

function makeDayOneExercises() {
  return [
    {
      id: "c1-d1-e1",
      type: "match_pairs",
      prompt: "匹配俄语和含义",
      targetLanguage: "mixed",
      pairs: [
        { ru: "А а", ipa: "[a]", zh: "字母 a", en: "letter a" },
        { ru: "О о", ipa: "[o]", zh: "字母 o", en: "letter o" },
        { ru: "Анна", ipa: "[AN-na]", zh: "安娜", en: "Anna" },
      ],
      feedback: {
        meaning: "А / О 是今天的核心字母，Анна 是例词。",
        explanation: "先建立俄语字形、中文含义和英文辅助记忆的连接。",
      },
    },
    {
      id: "c1-d1-e2",
      type: "listen_choose_words",
      prompt: "听句子，选出你听到的词",
      audioText: "Это Анна.",
      ipa: "[E-ta AN-na]",
      zh: "这是安娜。",
      correctTokens: ["Это", "Анна"],
      choices: ["Это", "Анна", "окно", "я", "утро"],
      feedback: {
        meaning: "Это Анна. = 这是安娜。",
        explanation: "先完整听一句，再从候选词里抓出真正听到的词。",
      },
    },
    {
      id: "c1-d1-e3",
      type: "sentence_builder",
      prompt: "拼出这句话",
      answer: "Это Анна.",
      ipa: "[E-ta AN-na]",
      zh: "这是安娜。",
      tokens: ["Анна", "Это"],
      feedback: {
        meaning: "Это Анна. = 这是安娜。",
        explanation: "Это 是“这是”，Анна 是人名。",
      },
    },
    {
      id: "c1-d1-e4",
      type: "listen_order",
      prompt: "按听到的顺序点词",
      answer: "Это Анна.",
      ipa: "[E-ta AN-na]",
      zh: "这是安娜。",
      tokens: ["Анна", "Это"],
      feedback: {
        meaning: "先听 Это，再听 Анна。",
        explanation: "听音排序比完整听写更适合刚入门阶段。",
      },
    },
    {
      id: "c1-d1-e5",
      type: "copy_or_type_ru",
      prompt: "把这句俄语输入一遍",
      answer: "Это Анна.",
      ipa: "[E-ta AN-na]",
      zh: "这是安娜。",
      showAnswerBeforeTyping: true,
      feedback: {
        meaning: "Это Анна. = 这是安娜。",
        explanation: "看着句子打一遍，有助于把字母和拼写真正记住。",
      },
    },
    {
      id: "c1-d1-e6",
      type: "sentence_builder",
      prompt: "拼出这个词",
      answer: "окно",
      ipa: "[ak-NO]",
      zh: "窗户",
      tokens: ["но", "ок"],
      feedback: {
        meaning: "окно = 窗户。",
        explanation: "今天用 окно 继续熟悉 О о 的读音。",
      },
    },
    {
      id: "c1-d1-e7",
      type: "repeat_after",
      prompt: "跟读这个词",
      answer: "Анна",
      ipa: "[AN-na]",
      zh: "安娜",
      mode: "word",
      slowMode: "word_by_word",
      feedback: {
        meaning: "Анна 是俄语人名。",
        explanation: "先把单词读稳，再进入整句跟读。",
      },
    },
    {
      id: "c1-d1-e8",
      type: "repeat_after",
      prompt: "跟读整句",
      answer: "Это Анна.",
      ipa: "[E-ta AN-na]",
      zh: "这是安娜。",
      mode: "phrase",
      slowMode: "word_by_word",
      feedback: {
        meaning: "Это Анна. = 这是安娜。",
        explanation: "今天的目标是认识 А / О，并能听读一个最小句。",
      },
    },
  ];
}

function makeGenericDayExercises(day) {
  const phrases = getScenePhrases(day);
  const mainPhrase = phrases[0] ?? day.voice;
  const secondPhrase = phrases[1] ?? mainPhrase;
  const mainTokens = tokenizeRu(mainPhrase.ru);
  const secondTokens = tokenizeRu(secondPhrase.ru);
  const wordPool = [...day.foundation, ...day.scene.words].filter(Boolean);
  const pairItems = wordPool.slice(0, 3);
  const firstWord = pairItems[0] ?? mainPhrase;
  const choices = makeChoiceBank(mainTokens, wordPool);

  return [
    {
      id: `c${day.cycleNumber}-d${day.cycleDay}-e1`,
      type: "match_pairs",
      prompt: "匹配俄语和含义",
      targetLanguage: "zh",
      pairs: pairItems.map((item) => ({
        ru: item.ru,
        ipa: item.ipa,
        zh: item.zh,
      })),
      feedback: {
        meaning: `今天先认出：${pairItems.map((item) => item.ru).join(" / ")}`,
        explanation: "先建立词形和含义，再进入句子。",
      },
    },
    {
      id: `c${day.cycleNumber}-d${day.cycleDay}-e2`,
      type: "listen_choose_words",
      prompt: "听句子，选出你听到的词",
      audioText: mainPhrase.ru,
      ipa: mainPhrase.ipa,
      zh: mainPhrase.zh,
      correctTokens: mainTokens,
      choices,
      feedback: {
        meaning: `${mainPhrase.ru} = ${mainPhrase.zh}`,
        explanation: "先听整句，再抓关键词。",
      },
    },
    {
      id: `c${day.cycleNumber}-d${day.cycleDay}-e3`,
      type: "listen_order",
      prompt: "按听到的顺序点词",
      answer: mainPhrase.ru,
      ipa: mainPhrase.ipa,
      zh: mainPhrase.zh,
      tokens: [...mainTokens].reverse(),
      feedback: {
        meaning: mainPhrase.zh,
        explanation: "排序题用来训练听力和俄语语序。",
      },
    },
    {
      id: `c${day.cycleNumber}-d${day.cycleDay}-e4`,
      type: "sentence_builder",
      prompt: "拼出这句话",
      answer: mainPhrase.ru,
      ipa: mainPhrase.ipa,
      zh: mainPhrase.zh,
      tokens: [...mainTokens].reverse(),
      feedback: {
        meaning: mainPhrase.zh,
        explanation: "把刚才听到的句子主动拼出来。",
      },
    },
    {
      id: `c${day.cycleNumber}-d${day.cycleDay}-e5`,
      type: "copy_or_type_ru",
      prompt: "把这句俄语输入一遍",
      answer: mainPhrase.ru,
      ipa: mainPhrase.ipa,
      zh: mainPhrase.zh,
      showAnswerBeforeTyping: true,
      feedback: {
        meaning: mainPhrase.zh,
        explanation: "输入一遍能强化字母、拼写和词序。",
      },
    },
    {
      id: `c${day.cycleNumber}-d${day.cycleDay}-e6`,
      type: "sentence_builder",
      prompt: "拼出变体句",
      answer: secondPhrase.ru,
      ipa: secondPhrase.ipa,
      zh: secondPhrase.zh,
      tokens: [...secondTokens].reverse(),
      feedback: {
        meaning: secondPhrase.zh,
        explanation: "同一场景内换一个词或句子，避免死记一条。",
      },
    },
    {
      id: `c${day.cycleNumber}-d${day.cycleDay}-e7`,
      type: "repeat_after",
      prompt: "跟读这个词",
      answer: firstWord.ru,
      ipa: firstWord.ipa,
      zh: firstWord.zh,
      mode: "word",
      slowMode: "word_by_word",
      feedback: {
        meaning: firstWord.zh,
        explanation: "先把关键词读稳。",
      },
    },
    {
      id: `c${day.cycleNumber}-d${day.cycleDay}-e8`,
      type: "repeat_after",
      prompt: "跟读整句",
      answer: mainPhrase.ru,
      ipa: mainPhrase.ipa,
      zh: mainPhrase.zh,
      mode: "phrase",
      slowMode: "word_by_word",
      feedback: {
        meaning: mainPhrase.zh,
        explanation: "最后把今天的核心句完整说出来。",
      },
    },
  ];
}

function makeCycleReviewExercises(day) {
  const reviewPhrases = day.cycleSections.flatMap((section) => section.phrases);
  const reviewWords = day.cycleSections.flatMap((section) => section.words);
  const firstPhrase = reviewPhrases[0] ?? day.voice;
  const middlePhrase = reviewPhrases[Math.floor(reviewPhrases.length / 2)] ?? firstPhrase;
  const finalPhrase = day.voice;
  const firstTokens = tokenizeRu(firstPhrase.ru);
  const middleTokens = tokenizeRu(middlePhrase.ru);

  return [
    {
      id: `c${day.cycleNumber}-review-e1`,
      type: "match_pairs",
      prompt: "复盘本轮高频词",
      targetLanguage: "zh",
      pairs: reviewWords.slice(0, 4).map((item) => ({
        ru: item.ru,
        ipa: item.ipa,
        zh: item.zh,
      })),
      feedback: {
        meaning: "把本轮出现过的词重新连回含义。",
        explanation: "复盘日不学新内容，只回收前 11 天。",
      },
    },
    {
      id: `c${day.cycleNumber}-review-e2`,
      type: "listen_choose_words",
      prompt: "听旧句子，选择听到的词",
      audioText: firstPhrase.ru,
      ipa: firstPhrase.ipa,
      zh: firstPhrase.zh,
      correctTokens: firstTokens,
      choices: makeChoiceBank(firstTokens, reviewWords),
      feedback: {
        meaning: firstPhrase.zh,
        explanation: "用听句选词检查旧内容是否还熟悉。",
      },
    },
    {
      id: `c${day.cycleNumber}-review-e3`,
      type: "listen_order",
      prompt: "按听到的顺序点词",
      answer: middlePhrase.ru,
      ipa: middlePhrase.ipa,
      zh: middlePhrase.zh,
      tokens: [...middleTokens].reverse(),
      feedback: {
        meaning: middlePhrase.zh,
        explanation: "把本轮句子重新做一次听力排序。",
      },
    },
    {
      id: `c${day.cycleNumber}-review-e4`,
      type: "sentence_builder",
      prompt: "拼出本轮整合句",
      answer: finalPhrase.ru,
      ipa: finalPhrase.ipa,
      zh: finalPhrase.zh,
      tokens: [...tokenizeRu(finalPhrase.ru)].reverse(),
      feedback: {
        meaning: finalPhrase.zh,
        explanation: "第 12 天用整合句把前 11 天收束起来。",
      },
    },
    {
      id: `c${day.cycleNumber}-review-e5`,
      type: "copy_or_type_ru",
      prompt: "把整合句输入一遍",
      answer: finalPhrase.ru,
      ipa: finalPhrase.ipa,
      zh: finalPhrase.zh,
      showAnswerBeforeTyping: true,
      feedback: {
        meaning: finalPhrase.zh,
        explanation: "复盘日用输入强化整轮核心表达。",
      },
    },
    {
      id: `c${day.cycleNumber}-review-e6`,
      type: "listen_order",
      prompt: "再听一次整合句并排序",
      answer: finalPhrase.ru,
      ipa: finalPhrase.ipa,
      zh: finalPhrase.zh,
      tokens: [...tokenizeRu(finalPhrase.ru)].reverse(),
      feedback: {
        meaning: finalPhrase.zh,
        explanation: "复盘日最后用整合句检查整轮语序。",
      },
    },
    {
      id: `c${day.cycleNumber}-review-e7`,
      type: "copy_or_type_ru",
      prompt: "再输入一次整合句",
      answer: finalPhrase.ru,
      ipa: finalPhrase.ipa,
      zh: finalPhrase.zh,
      showAnswerBeforeTyping: true,
      feedback: {
        meaning: finalPhrase.zh,
        explanation: "第二次输入用于强化整轮收束表达。",
      },
    },
    {
      id: `c${day.cycleNumber}-review-e8`,
      type: "repeat_after",
      prompt: "跟读本轮整合句",
      answer: finalPhrase.ru,
      ipa: finalPhrase.ipa,
      zh: finalPhrase.zh,
      mode: "phrase",
      slowMode: "word_by_word",
      feedback: {
        meaning: finalPhrase.zh,
        explanation: "用普通速度和逐词慢速完成最后复盘。",
      },
    },
  ];
}

function tokenizeRu(value) {
  return value
    .replace(/[.,!?]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function makeChoiceBank(correctTokens, wordPool) {
  const distractors = wordPool.flatMap((item) => tokenizeRu(item.ru));
  return [...new Set([...correctTokens, ...distractors])].slice(0, Math.max(correctTokens.length + 2, 5));
}

function buildLessonDay(cycleDef, cycleDay, lessonDef) {
  const globalDay = (cycleDef.number - 1) * 12 + cycleDay;
  const leadPhrase = lessonDef.phrases[0];
  const foundation = lessonDef.foundations.map((item) =>
    makeItem(
      item.ru,
      item.ipa,
      item.zh,
      leadPhrase.ru,
      leadPhrase.ipa,
      leadPhrase.zh,
    ),
  );

  const review = [
    ...lessonDef.foundations.map((item, index) =>
      makeReview(
        `核心 ${index + 1}`,
        `今天的核心项 ${index + 1} 是什么？`,
        item.ru,
        item.ipa,
      ),
    ),
    ...lessonDef.phrases.map((phrase, index) =>
      makeReview(
        index === 0 ? "整句" : `整句 ${index + 1}`,
        index === 0 ? "把今天的整句读出来。" : `把今天的第 ${index + 1} 句读出来。`,
        phrase.ru,
        phrase.ipa,
      ),
    ),
  ];

  const day = {
    day: globalDay,
    cycleNumber: cycleDef.number,
    cycleDay,
    cycleLabel: cycleDef.label,
    title: `${cycleDef.label} · ${lessonDef.title}`,
    theme: lessonDef.title,
    stepNotes: lessonDef.stepNotes,
    foundation,
    scene: lessonDef.phrases.length > 1
      ? { words: lessonDef.words, phrases: lessonDef.phrases }
      : { words: lessonDef.words, phrase: lessonDef.phrases[0] },
    voice: lessonDef.voice ?? leadPhrase,
    review,
  };

  if (globalDay === 1) {
    day.theme = "认识 А / О，并听懂一个最小句";
    day.exercises = makeDayOneExercises();
  } else {
    day.exercises = makeGenericDayExercises(day);
  }

  return day;
}

function buildCycleReviewDay(cycleDef, cycleDays) {
  const globalDay = cycleDef.number * 12;
  const cycleSections = cycleDays.map((day) => ({
    day: day.cycleDay,
    title: day.title.replace(`${cycleDef.label} · `, ""),
    foundation: day.foundation.map((item) => ({
      ...item,
      exampleZh: `本轮第 ${day.cycleDay} 天 · ${item.exampleZh}`,
    })),
    words: day.scene.words.map((word) => ({
      ...word,
      zh: `本轮第 ${day.cycleDay} 天 · ${word.zh}`,
    })),
    phrases: getScenePhrases(day).map((phrase) => ({
      ...phrase,
      zh: `本轮第 ${day.cycleDay} 天 · ${phrase.zh}`,
    })),
    review: getScenePhrases(day).map((phrase) =>
      makeReview(
        `第 ${day.cycleDay} 天`,
        "把这一天的整句重新读一遍。",
        phrase.ru,
        phrase.ipa,
      ),
    ),
  }));

  const foundation = cycleSections.flatMap((section) => section.foundation);
  const words = cycleSections.flatMap((section) => section.words);
  const phrases = cycleSections.flatMap((section) => section.phrases);
  const review = [
    ...cycleSections.flatMap((section) => section.review),
    makeReview(
      "整轮复盘",
      "这一轮结束后，把整合句完整读一遍。",
      cycleDef.summary.ru,
      cycleDef.summary.ipa,
    ),
  ];

  const day = {
    day: globalDay,
    cycleNumber: cycleDef.number,
    cycleDay: 12,
    cycleLabel: cycleDef.label,
    title: `${cycleDef.label} · 整轮复盘`,
    stepNotes: reviewStepNotes,
    foundation,
    scene: { words, phrases },
    voice: cycleDef.summary,
    review,
    cycleSections,
  };

  day.exercises = makeCycleReviewExercises(day);

  return day;
}

function getScenePhrases(day) {
  if (Array.isArray(day.scene.phrases) && day.scene.phrases.length) {
    return day.scene.phrases;
  }

  return [day.scene.phrase];
}

const cycles = [
  cycle(
    1,
    "周期1 · 字母与发音 · 元音起步",
    ["Я читаю буквы.", "[ya chi-TA-yu BOOK-vy]", "我在读字母。"],
    [
      lesson(
        "А 与 О",
        [["А а", "[a]", "字母 a"], ["О о", "[o]", "字母 o"]],
        ["Это Анна.", "[E-ta AN-na]", "这是安娜。"],
        { words: [["Анна", "[AN-na]", "安娜"], ["окно", "[ak-NO]", "窗户"]] },
      ),
      lesson(
        "У 与 Э",
        [["У у", "[u]", "字母 u"], ["Э э", "[e]", "字母 e"]],
        ["Это утро.", "[E-ta OO-tra]", "这是早晨。"],
        { words: [["утро", "[OO-tra]", "早晨"], ["это", "[E-ta]", "这是"]] },
      ),
      lesson(
        "И 与 Ы",
        [["И и", "[i]", "字母 i"], ["Ы ы", "[y]", "字母 y"]],
        ["Это имя.", "[E-ta EE-mya]", "这是名字。"],
        { words: [["имя", "[EE-mya]", "名字"], ["мы", "[my]", "我们"]] },
      ),
      lesson(
        "Е 与 Ё",
        [["Е е", "[ye]", "字母 ye"], ["Ё ё", "[yo]", "字母 yo"]],
        ["Это ёлка.", "[E-ta YOL-ka]", "这是云杉树。"],
        { words: [["его", "[yi-VO]", "他的"], ["ёлка", "[YOL-ka]", "云杉树"]] },
      ),
      lesson(
        "Ю 与 Я",
        [["Ю ю", "[yu]", "字母 yu"], ["Я я", "[ya]", "字母 ya"]],
        ["Я Юля.", "[ya YU-lya]", "我是尤利娅。"],
        { words: [["Юля", "[YU-lya]", "尤利娅"], ["я", "[ya]", "我"]] },
      ),
      lesson(
        "М 与 Т",
        [["М м", "[m]", "字母 m"], ["Т т", "[t]", "字母 t"]],
        ["Мама тут.", "[MA-ma toot]", "妈妈在这里。"],
        { words: [["мама", "[MA-ma]", "妈妈"], ["тут", "[toot]", "这里"]] },
      ),
      lesson(
        "К 与 Л",
        [["К к", "[k]", "字母 k"], ["Л л", "[l]", "字母 l"]],
        ["Это кот.", "[E-ta kot]", "这是猫。"],
        { words: [["кот", "[kot]", "猫"], ["лампа", "[LAM-pa]", "灯"]] },
      ),
      lesson(
        "Н 与 Р",
        [["Н н", "[n]", "字母 n"], ["Р р", "[r]", "字母 r"]],
        ["Это нос.", "[E-ta nos]", "这是鼻子。"],
        { words: [["нос", "[nos]", "鼻子"], ["рот", "[rot]", "嘴"]] },
      ),
      lesson(
        "П 与 Б",
        [["П п", "[p]", "字母 p"], ["Б б", "[b]", "字母 b"]],
        ["Это папа.", "[E-ta PA-pa]", "这是爸爸。"],
        { words: [["папа", "[PA-pa]", "爸爸"], ["банк", "[bank]", "银行"]] },
      ),
      lesson(
        "С 与 Х",
        [["С с", "[s]", "字母 s"], ["Х х", "[kh]", "字母 kh"]],
        ["Это хлеб.", "[E-ta khlyep]", "这是面包。"],
        { words: [["сок", "[sok]", "果汁"], ["хлеб", "[khlyep]", "面包"]] },
      ),
      lesson(
        "Ч 与 Й",
        [["Ч ч", "[ch]", "字母 ch"], ["Й й", "[y]", "字母 y"]], 
        ["Это чай.", "[E-ta chai]", "这是茶。"],
        { words: [["чай", "[chai]", "茶"], ["мой", "[moy]", "我的"]] },
      ),
    ],
  ),
  cycle(
    2,
    "周期2 · 字母与发音 · 易混字母",
    ["Я знаю русские буквы.", "[ya ZNA-yu ROOS-kee-ye BOOK-vy]", "我认识俄语字母。"],
    [
      lesson(
        "В 与 Н",
        [["В в", "[v]", "字母 v"], ["Н н", "[n]", "字母 n"]],
        ["Это вода.", "[E-ta va-DA]", "这是水。"],
        { words: [["вода", "[va-DA]", "水"], ["нос", "[nos]", "鼻子"]] },
      ),
      lesson(
        "Р 与 С",
        [["Р р", "[r]", "字母 r"], ["С с", "[s]", "字母 s"]],
        ["Это сок.", "[E-ta sok]", "这是果汁。"],
        { words: [["рука", "[roo-KA]", "手"], ["сок", "[sok]", "果汁"]] },
      ),
      lesson(
        "Г 与 Д",
        [["Г г", "[g]", "字母 g"], ["Д д", "[d]", "字母 d"]],
        ["Это дом.", "[E-ta dom]", "这是房子。"],
        { words: [["город", "[GO-rat]", "城市"], ["дом", "[dom]", "房子"]] },
      ),
      lesson(
        "Ж 与 З",
        [["Ж ж", "[zh]", "字母 zh"], ["З з", "[z]", "字母 z"]],
        ["Это зонт.", "[E-ta zont]", "这是雨伞。"],
        { words: [["журнал", "[zhoor-NAL]", "杂志"], ["зонт", "[zont]", "雨伞"]] },
      ),
      lesson(
        "Ф 与 Ш",
        [["Ф ф", "[f]", "字母 f"], ["Ш ш", "[sh]", "字母 sh"]],
        ["Это школа.", "[E-ta SHKO-la]", "这是学校。"],
        { words: [["фильм", "[film]", "电影"], ["школа", "[SHKO-la]", "学校"]] },
      ),
      lesson(
        "Щ 与 Ц",
        [["Щ щ", "[shch]", "字母 shch"], ["Ц ц", "[ts]", "字母 ts"]],
        ["Это цирк.", "[E-ta TSIRK]", "这是马戏团。"],
        { words: [["щека", "[shche-KA]", "脸颊"], ["цирк", "[TSIRK]", "马戏团"]] },
      ),
      lesson(
        "Ъ 与 Ь",
        [["Ъ ъ", "[hard]", "硬音符号"], ["Ь ь", "[soft]", "软音符号"]],
        ["Сегодня день.", "[si-VOD-nya dyen']", "今天是白天。"],
        { words: [["объект", "[ab-YEKT]", "对象"], ["день", "[dyen']", "白天 / 日子"]] },
      ),
      lesson(
        "К / М / Т / А / О",
        [["К к", "[k]", "字母 k"], ["М м", "[m]", "字母 m"]],
        ["Это мама.", "[E-ta MA-ma]", "这是妈妈。"],
        { words: [["мама", "[MA-ma]", "妈妈"], ["кот", "[kot]", "猫"]] },
      ),
      lesson(
        "В / Н / Р / С / Х",
        [["В в", "[v]", "字母 v"], ["С с", "[s]", "字母 s"]],
        ["Это сок.", "[E-ta sok]", "这是果汁。"],
        { words: [["вино", "[vi-NO]", "葡萄酒"], ["сок", "[sok]", "果汁"]] },
      ),
      lesson(
        "Л / П / Б",
        [["Л л", "[l]", "字母 l"], ["П п", "[p]", "字母 p"]],
        ["Лампа тут.", "[LAM-pa toot]", "灯在这里。"],
        { words: [["лампа", "[LAM-pa]", "灯"], ["банк", "[bank]", "银行"]] },
      ),
      lesson(
        "全字母短读",
        [["буква", "[BOOK-va]", "字母"], ["слово", "[SLO-va]", "单词"]],
        ["Привет!", "[pri-VYET]", "你好！"],
        { words: [["привет", "[pri-VYET]", "你好"], ["метро", "[mi-TRO]", "地铁"]] },
      ),
    ],
  ),
  cycle(
    3,
    "周期3 · 字母与发音 · 从字母到词",
    ["Я немного читаю по-русски.", "[ya ni-MNO-ga chi-TA-yu pa-ROOS-kee]", "我会读一点俄语。"],
    [
      lesson(
        "привет 与 пока",
        [["привет", "[pri-VYET]", "你好"], ["пока", "[pa-KA]", "再见 / 回头见"]],
        ["Привет!", "[pri-VYET]", "你好！"],
      ),
      lesson(
        "здравствуйте 与 спасибо",
        [["здравствуйте", "[ZDRA-stvooy-tye]", "您好"], ["спасибо", "[spa-SEE-ba]", "谢谢"]],
        ["Здравствуйте.", "[ZDRA-stvooy-tye]", "您好。"],
      ),
      lesson(
        "мама 与 папа",
        [["мама", "[MA-ma]", "妈妈"], ["папа", "[PA-pa]", "爸爸"]],
        ["Это мама.", "[E-ta MA-ma]", "这是妈妈。"],
      ),
      lesson(
        "дом 与 окно",
        [["дом", "[dom]", "房子"], ["окно", "[ak-NO]", "窗户"]],
        ["Это окно.", "[E-ta ak-NO]", "这是窗户。"],
      ),
      lesson(
        "вода 与 чай",
        [["вода", "[va-DA]", "水"], ["чай", "[chai]", "茶"]],
        ["Это чай.", "[E-ta chai]", "这是茶。"],
      ),
      lesson(
        "метро 与 карта",
        [["метро", "[mi-TRO]", "地铁"], ["карта", "[KAR-ta]", "地图"]],
        ["Где метро?", "[gdye mi-TRO]", "地铁在哪？"],
      ),
      lesson(
        "суп 与 хлеб",
        [["суп", "[soop]", "汤"], ["хлеб", "[khlyep]", "面包"]],
        ["Я хочу суп.", "[ya kha-CHOO soop]", "我想要汤。"],
      ),
      lesson(
        "это 与 где",
        [["это", "[E-ta]", "这是"], ["где", "[gdye]", "哪里"]],
        ["Где это?", "[gdye E-ta]", "这在哪？"],
      ),
      lesson(
        "меня зовут 与 Ли",
        [["меня зовут", "[mi-NYA za-VOOT]", "我叫"], ["Ли", "[lee]", "李"]],
        ["Меня зовут Ли.", "[mi-NYA za-VOOT lee]", "我叫李。"],
      ),
      lesson(
        "пожалуйста 与 спасибо",
        [["пожалуйста", "[pa-ZHA-lus-ta]", "请 / 谢谢"], ["спасибо", "[spa-SEE-ba]", "谢谢"]],
        ["Спасибо большое.", "[spa-SEE-ba bal-SHO-ye]", "非常感谢。"],
      ),
      lesson(
        "我会读简单俄语",
        [["я читаю", "[ya chi-TA-yu]", "我在读"], ["по-русски", "[pa-ROOS-kee]", "用俄语"]],
        ["Я читаю по-русски.", "[ya chi-TA-yu pa-ROOS-kee]", "我在用俄语读。"],
      ),
    ],
  ),
  cycle(
    4,
    "周期4 · 礼貌表达",
    ["Здравствуйте, я немного говорю по-русски.", "[ZDRA-stvooy-tye ya ni-MNO-ga ga-va-RYOO pa-ROOS-kee]", "您好，我会说一点俄语。"],
    [
      lesson("正式问候", [["здравствуйте", "[ZDRA-stvooy-tye]", "您好"], ["добрый день", "[DOB-riy dyen']", "您好 / 日安"]], ["Здравствуйте.", "[ZDRA-stvooy-tye]", "您好。"]),
      lesson("口语问候", [["привет", "[pri-VYET]", "你好"], ["как дела", "[kak di-LA]", "你怎么样"]], ["Привет!", "[pri-VYET]", "你好！"]),
      lesson("早安", [["доброе утро", "[DOB-ra-ye OO-tra]", "早上好"], ["утро", "[OO-tra]", "早晨"]], ["Доброе утро.", "[DOB-ra-ye OO-tra]", "早上好。"]),
      lesson("晚上好", [["добрый вечер", "[DOB-riy VYE-cher]", "晚上好"], ["спокойной ночи", "[spa-KOY-nay NO-chee]", "晚安"]], ["Добрый вечер.", "[DOB-riy VYE-cher]", "晚上好。"]),
      lesson("告别", [["до свидания", "[da svi-DA-ni-ya]", "再见"], ["пока", "[pa-KA]", "拜拜"]], ["До свидания.", "[da svi-DA-ni-ya]", "再见。"]),
      lesson("谢谢与请", [["спасибо", "[spa-SEE-ba]", "谢谢"], ["пожалуйста", "[pa-ZHA-lus-ta]", "请 / 不客气"]], ["Спасибо.", "[spa-SEE-ba]", "谢谢。"]),
      lesson("抱歉", [["извините", "[iz-vi-NEE-tye]", "请原谅"], ["простите", "[pras-TEE-tye]", "抱歉"]], ["Извините, пожалуйста.", "[iz-vi-NEE-tye pa-ZHA-lus-ta]", "不好意思，请问。"]),
      lesson("是与否", [["да", "[da]", "是"], ["нет", "[nyet]", "不是 / 没有"]], ["Да, спасибо.", "[da spa-SEE-ba]", "好的，谢谢。"]),
      lesson("请说慢一点", [["медленнее", "[MYED-lyen-ni-ye]", "慢一点"], ["повторите", "[pafta-REE-tye]", "请重复"]], ["Повторите, пожалуйста.", "[pafta-REE-tye pa-ZHA-lus-ta]", "请重复一遍。"]),
      lesson("懂一点", [["я понимаю", "[ya pa-ni-MA-yu]", "我懂"], ["немного", "[ni-MNO-ga]", "一点"]], ["Я понимаю немного.", "[ya pa-ni-MA-yu ni-MNO-ga]", "我懂一点。"]),
      lesson("寒暄", [["как дела", "[kak di-LA]", "怎么样"], ["хорошо", "[kha-ra-SHO]", "很好"]], ["Как дела?", "[kak di-LA]", "你怎么样？"]),
    ],
  ),
  cycle(
    5,
    "周期5 · 自我介绍",
    ["Меня зовут Ли, я из Китая.", "[mi-NYA za-VOOT lee ya iz kee-TA-ya]", "我叫李，我来自中国。"],
    [
      lesson("我叫什么", [["меня зовут", "[mi-NYA za-VOOT]", "我叫"], ["Ли", "[lee]", "李"]], ["Меня зовут Ли.", "[mi-NYA za-VOOT lee]", "我叫李。"]),
      lesson("我来自哪里", [["я из", "[ya iz]", "我来自"], ["Китай", "[kee-TAI]", "中国"]], ["Я из Китая.", "[ya iz kee-TA-ya]", "我来自中国。"], { words: [["я из", "[ya iz]", "我来自"], ["Китая", "[kee-TA-ya]", "中国（来自）"]] }),
      lesson("我会英语", [["я говорю", "[ya ga-va-RYOO]", "我会说"], ["по-английски", "[pa-ang-LEE-skee]", "用英语"]], ["Я говорю по-английски.", "[ya ga-va-RYOO pa-ang-LEE-skee]", "我会说英语。"]),
      lesson("我会一点俄语", [["немного", "[ni-MNO-ga]", "一点"], ["по-русски", "[pa-ROOS-kee]", "用俄语"]], ["Я немного говорю по-русски.", "[ya ni-MNO-ga ga-va-RYOO pa-ROOS-kee]", "我会说一点俄语。"]),
      lesson("我是学生", [["я студент", "[ya stoo-DYENT]", "我是男学生"], ["я студентка", "[ya stoo-DYENT-ka]", "我是女学生"]], ["Я студент.", "[ya stoo-DYENT]", "我是学生。"]),
      lesson("我工作", [["я работаю", "[ya ra-BO-ta-yu]", "我工作"], ["в офисе", "[v O-fi-sye]", "在办公室"]], ["Я работаю в офисе.", "[ya ra-BO-ta-yu v O-fi-sye]", "我在办公室工作。"]),
      lesson("这是我的朋友", [["это мой", "[E-ta moy]", "这是我的"], ["друг", "[drook]", "朋友"]], ["Это мой друг.", "[E-ta moy droog]", "这是我的朋友。"]),
      lesson("这是我的家人", [["это моя", "[E-ta ma-YA]", "这是我的"], ["семья", "[sim-YA]", "家人 / 家庭"]], ["Это моя семья.", "[E-ta ma-YA sim-YA]", "这是我的家人。"]),
      lesson("我的年龄", [["мне", "[mnye]", "我（与格）"], ["лет", "[lyet]", "岁"]], ["Мне двадцать пять лет.", "[mnye DVA-tsat' pyat' lyet]", "我二十五岁。"]),
      lesson("很高兴认识你", [["очень приятно", "[O-chen' pri-YAT-na]", "很高兴"], ["рад", "[rat]", "高兴（男）"]], ["Очень приятно.", "[O-chen' pri-YAT-na]", "很高兴认识你。"]),
      lesson("你叫什么", [["как вас зовут", "[kak vas za-VOOT]", "您叫什么"], ["откуда вы", "[OT-ku-da vy]", "您来自哪里"]], ["Как вас зовут?", "[kak vas za-VOOT]", "您叫什么名字？"]),
    ],
  ),
  cycle(
    6,
    "周期6 · 数字时间日期",
    ["Сегодня я понимаю время и дату.", "[si-VOD-nya ya pa-ni-MA-yu VRYE-mya i DA-too]", "今天我能理解时间和日期。"],
    [
      lesson("一与二", [["один", "[a-DEEN]", "一"], ["два", "[dva]", "二"]], ["Один билет, пожалуйста.", "[a-DEEN bi-LYET pa-ZHA-lus-ta]", "一张票，谢谢。"]),
      lesson("三与五", [["три", "[tree]", "三"], ["пять", "[pyat']", "五"]], ["Пять минут.", "[pyat' mi-NOOT]", "五分钟。"]),
      lesson("六与十", [["шесть", "[shyest']", "六"], ["десять", "[DYE-syat']", "十"]], ["Десять часов.", "[DYE-syat' cha-SOF]", "十点钟。"]),
      lesson("问几点", [["который час", "[ka-TO-riy chas]", "几点了"], ["сейчас", "[si-CHAS]", "现在"]], ["Который час?", "[ka-TO-riy chas]", "几点了？"]),
      lesson("今天与明天", [["сегодня", "[si-VOD-nya]", "今天"], ["завтра", "[ZAF-tra]", "明天"]], ["Сегодня суббота.", "[si-VOD-nya soo-BO-ta]", "今天是星期六。"]),
      lesson("昨天与今天", [["вчера", "[fchi-RA]", "昨天"], ["сегодня", "[si-VOD-nya]", "今天"]], ["Сегодня я дома.", "[si-VOD-nya ya DO-ma]", "今天我在家。"]),
      lesson("星期一与星期日", [["понедельник", "[pa-ni-DYEL'-nik]", "星期一"], ["воскресенье", "[vas-krye-SYEN'-ye]", "星期日"]], ["Сегодня понедельник.", "[si-VOD-nya pa-ni-DYEL'-nik]", "今天星期一。"]),
      lesson("月份", [["январь", "[yan-VAR']", "一月"], ["май", "[mai]", "五月"]], ["Сейчас май.", "[si-CHAS mai]", "现在是五月。"]),
      lesson("上午与晚上", [["утром", "[OO-tram]", "在早上"], ["вечером", "[VYE-che-ram]", "在晚上"]], ["Я работаю утром.", "[ya ra-BO-ta-yu OO-tram]", "我上午工作。"]),
      lesson("火车几点", [["во сколько", "[va SKOL'-ka]", "几点"], ["поезд", "[PO-yezd]", "火车"]], ["Во сколько поезд?", "[va SKOL'-ka PO-yezd]", "火车几点？"]),
      lesson("今天几号", [["какое число", "[ka-KO-ye chis-LO]", "几号"], ["дата", "[DA-ta]", "日期"]], ["Какое сегодня число?", "[ka-KO-ye si-VOD-nya chis-LO]", "今天几号？"]),
    ],
  ),
  cycle(
    7,
    "周期7 · 食物与饮料",
    ["Я могу заказать еду и напитки.", "[ya ma-GOO za-ka-ZAT' ye-DOO i na-PIT-kee]", "我能点食物和饮料。"],
    [
      lesson("茶与咖啡", [["чай", "[chai]", "茶"], ["кофе", "[KO-fye]", "咖啡"]], ["Я хочу чай.", "[ya kha-CHOO chai]", "我想要茶。"]),
      lesson("水与果汁", [["вода", "[va-DA]", "水"], ["сок", "[sok]", "果汁"]], ["Вода, пожалуйста.", "[va-DA pa-ZHA-lus-ta]", "请给我水。"]),
      lesson("面包与奶酪", [["хлеб", "[khlyep]", "面包"], ["сыр", "[syr]", "奶酪"]], ["Я хочу сыр.", "[ya kha-CHOO syr]", "我想要奶酪。"]),
      lesson("汤与沙拉", [["суп", "[soop]", "汤"], ["салат", "[sa-LAT]", "沙拉"]], ["Я хочу суп.", "[ya kha-CHOO soop]", "我想要汤。"]),
      lesson("菜单与点单", [["меню", "[mi-NYOO]", "菜单"], ["заказ", "[za-KAS]", "点单 / 订单"]], ["Меню, пожалуйста.", "[mi-NYOO pa-ZHA-lus-ta]", "请给我菜单。"]),
      lesson("早餐与晚餐", [["завтрак", "[ZAF-trak]", "早餐"], ["ужин", "[OO-zhin]", "晚餐"]], ["Ужин в семь.", "[OO-zhin v syem']", "晚饭在七点。"]),
      lesson("热与冷", [["горячий", "[ga-RYA-chiy]", "热的"], ["холодный", "[kha-LOD-niy]", "冷的"]], ["Горячий чай, пожалуйста.", "[ga-RYA-chiy chai pa-ZHA-lus-ta]", "请给我热茶。"]),
      lesson("不加糖与加柠檬", [["без сахара", "[byez SA-kha-ra]", "不加糖"], ["с лимоном", "[s li-MO-nam]", "加柠檬"]], ["Чай с лимоном, пожалуйста.", "[chai s li-MO-nam pa-ZHA-lus-ta]", "请给我加柠檬的茶。"]),
      lesson("再来一点", [["ещё", "[ye-SHCHYO]", "再来一点"], ["достаточно", "[da-STA-tach-na]", "够了"]], ["Ещё воды, пожалуйста.", "[ye-SHCHYO va-DY pa-ZHA-lus-ta]", "请再来一点水。"]),
      lesson("买单", [["счёт", "[schyot]", "账单"], ["пожалуйста", "[pa-ZHA-lus-ta]", "请"]], ["Счёт, пожалуйста.", "[schyot pa-ZHA-lus-ta]", "请买单。"]),
      lesson("很好吃", [["очень вкусно", "[O-chen' FKOOS-na]", "很好吃"], ["спасибо", "[spa-SEE-ba]", "谢谢"]], ["Очень вкусно, спасибо.", "[O-chen' FKOOS-na spa-SEE-ba]", "很好吃，谢谢。"]),
    ],
  ),
  cycle(
    8,
    "周期8 · 购物与物品",
    ["Я могу купить нужную вещь.", "[ya ma-GOO ku-PEET' NOOZH-nu-yu vyesh']", "我能买到需要的东西。"],
    [
      lesson("这个与那个", [["это", "[E-ta]", "这个"], ["то", "[to]", "那个"]], ["Я возьму это.", "[ya vaz-MOO E-ta]", "我要这个。"]),
      lesson("尺寸与颜色", [["размер", "[raz-MYER]", "尺寸"], ["цвет", "[tsvyet]", "颜色"]], ["Какой размер?", "[ka-KOY raz-MYER]", "什么尺寸？"]),
      lesson("大与小", [["большой", "[bal-SHOY]", "大的"], ["маленький", "[MA-lin'-kiy]", "小的"]], ["Маленький размер, пожалуйста.", "[MA-lin'-kiy raz-MYER pa-ZHA-lus-ta]", "请给我小号。"]),
      lesson("贵与便宜", [["дорого", "[DO-ra-ga]", "贵"], ["дёшево", "[DYO-shi-va]", "便宜"]], ["Это дорого.", "[E-ta DO-ra-ga]", "这个很贵。"]),
      lesson("多少钱", [["сколько стоит", "[SKOL'-ka STO-it]", "多少钱"], ["цена", "[tsi-NA]", "价格"]], ["Сколько стоит это?", "[SKOL'-ka STO-it E-ta]", "这个多少钱？"]),
      lesson("刷卡与现金", [["карта", "[KAR-ta]", "卡"], ["наличные", "[na-LI-chni-ye]", "现金"]], ["Я плачу картой.", "[ya pla-CHOO KAR-tay]", "我刷卡。"]),
      lesson("袋子与小票", [["пакет", "[pa-KYET]", "袋子"], ["чек", "[chyek]", "小票"]], ["Мне нужен пакет.", "[mnye NOO-zhen pa-KYET]", "我需要一个袋子。"]),
      lesson("试穿", [["примерить", "[pri-MYER-it']", "试穿"], ["зеркало", "[ZER-ka-la]", "镜子"]], ["Можно примерить?", "[MOZH-na pri-MYER-it']", "可以试穿吗？"]),
      lesson("商店与收银台", [["магазин", "[ma-ga-ZEEN]", "商店"], ["касса", "[KAS-sa]", "收银台"]], ["Где касса?", "[gdye KAS-sa]", "收银台在哪？"]),
      lesson("折扣", [["скидка", "[SKEET-ka]", "折扣"], ["акция", "[AK-tsi-ya]", "活动"]], ["Есть скидка?", "[yest' SKEET-ka]", "有折扣吗？"]),
      lesson("我先看看", [["я просто смотрю", "[ya PRO-sta smat-RYOO]", "我先看看"], ["спасибо", "[spa-SEE-ba]", "谢谢"]], ["Я просто смотрю.", "[ya PRO-sta smat-RYOO]", "我先看看。"]),
    ],
  ),
  cycle(
    9,
    "周期9 · 问路与地点",
    ["Я могу спросить дорогу.", "[ya ma-GOO spa-SIT' da-RO-goo]", "我能问路。"],
    [
      lesson("哪里与地铁", [["где", "[gdye]", "哪里"], ["метро", "[mi-TRO]", "地铁"]], ["Где метро?", "[gdye mi-TRO]", "地铁在哪？"]),
      lesson("洗手间", [["туалет", "[too-a-LYET]", "洗手间"], ["здесь", "[zdyes']", "这里"]], ["Где туалет?", "[gdye too-a-LYET]", "洗手间在哪？"]),
      lesson("这里与那里", [["здесь", "[zdyes']", "这里"], ["там", "[tam]", "那里"]], ["Метро там.", "[mi-TRO tam]", "地铁在那边。"]),
      lesson("街道与广场", [["улица", "[OO-li-tsa]", "街道"], ["площадь", "[PLO-shchat']", "广场"]], ["Где эта улица?", "[gdye E-ta OO-li-tsa]", "这条街在哪？"]),
      lesson("直走与左转", [["прямо", "[PRYA-ma]", "直走"], ["налево", "[na-LYE-va]", "向左"]], ["Идите прямо.", "[ee-DEE-tye PRYA-ma]", "请直走。"]),
      lesson("右转与回来", [["направо", "[na-PRA-va]", "向右"], ["назад", "[na-ZAT]", "回去 / 向后"]], ["Потом направо.", "[pa-TOM na-PRA-va]", "然后向右。"]),
      lesson("近与远", [["близко", "[BLEES-ka]", "近"], ["далеко", "[da-li-KO]", "远"]], ["Это далеко?", "[E-ta da-li-KO]", "这个远吗？"]),
      lesson("地图与市中心", [["карта", "[KAR-ta]", "地图"], ["центр", "[TSEN-tr]", "市中心"]], ["Где центр?", "[gdye TSEN-tr]", "市中心在哪？"]),
      lesson("找地址", [["я ищу", "[ya i-SHCHOO]", "我在找"], ["адрес", "[A-dryes]", "地址"]], ["Я ищу этот адрес.", "[ya i-SHCHOO E-tat A-dryes]", "我在找这个地址。"]),
      lesson("怎么去火车站", [["как пройти", "[kak prai-TEE]", "怎么走"], ["вокзал", "[vag-ZAL]", "火车站"]], ["Как пройти к вокзалу?", "[kak prai-TEE k vag-ZA-loo]", "怎么去火车站？"]),
      lesson("请在地图上指给我", [["покажите", "[pa-ka-ZHEE-tye]", "请指给我看"], ["на карте", "[na KAR-tye]", "在地图上"]], ["Покажите на карте.", "[pa-ka-ZHEE-tye na KAR-tye]", "请在地图上指给我看。"]),
    ],
  ),
  cycle(
    10,
    "周期10 · 交通与出行",
    ["Я могу пользоваться транспортом.", "[ya ma-GOO pa-l'za-va-tsa TRAN-spar-tam]", "我能使用交通工具。"],
    [
      lesson("公交与电车", [["автобус", "[af-TO-boos]", "公交车"], ["трамвай", "[tram-VAI]", "电车"]], ["Где автобус?", "[gdye af-TO-boos]", "公交车在哪？"]),
      lesson("出租车", [["такси", "[tak-SEE]", "出租车"], ["машина", "[ma-SHEE-na]", "车"]], ["Мне нужно такси.", "[mnye NOOZH-na tak-SEE]", "我需要出租车。"]),
      lesson("车票", [["билет", "[bi-LYET]", "车票"], ["касса", "[KAS-sa]", "售票处"]], ["Один билет, пожалуйста.", "[a-DEEN bi-LYET pa-ZHA-lus-ta]", "一张票，谢谢。"]),
      lesson("火车站与机场", [["вокзал", "[vag-ZAL]", "火车站"], ["аэропорт", "[a-ye-ra-PORT]", "机场"]], ["Мне нужно в аэропорт.", "[mnye NOOZH-na v a-ye-ra-PORT]", "我需要去机场。"]),
      lesson("站台与出口", [["станция", "[STAN-tsi-ya]", "车站"], ["выход", "[VY-khat]", "出口"]], ["Где выход?", "[gdye VY-khat]", "出口在哪？"]),
      lesson("火车几点", [["поезд", "[PO-yezd]", "火车"], ["отправление", "[at-prav-LYE-ni-ye]", "发车"]], ["Во сколько поезд?", "[va SKOL'-ka PO-yezd]", "火车几点？"]),
      lesson("公交线路", [["номер", "[NO-myer]", "号码"], ["остановка", "[as-ta-NOF-ka]", "站点"]], ["Какой номер автобуса?", "[ka-KOY NO-myer af-TO-boo-sa]", "公交车几路？"]),
      lesson("换乘与线路", [["пересадка", "[pi-ri-SAT-ka]", "换乘"], ["линия", "[LEE-ni-ya]", "线路"]], ["Это красная линия.", "[E-ta KRAS-na-ya LEE-ni-ya]", "这是红线。"]),
      lesson("我去市中心", [["ехать", "[YE-khat']", "乘车去"], ["центр", "[TSEN-tr]", "中心"]], ["Я еду в центр.", "[ya YE-doo f TSEN-tr]", "我乘车去市中心。"]),
      lesson("请在这里停车", [["остановите", "[as-ta-na-VEE-tye]", "请停下"], ["здесь", "[zdyes']", "这里"]], ["Остановите здесь, пожалуйста.", "[as-ta-na-VEE-tye zdyes' pa-ZHA-lus-ta]", "请在这里停。"]),
      lesson("行李", [["багаж", "[ba-GAZH]", "行李"], ["место", "[MYES-ta]", "位置"]], ["Где мой багаж?", "[gdye moy ba-GAZH]", "我的行李在哪？"]),
    ],
  ),
  cycle(
    11,
    "周期11 · 酒店与入住",
    ["Я могу заселиться в отель.", "[ya ma-GOO za-se-LEET-sa v a-TYEL']", "我能办理入住。"],
    [
      lesson("预订与护照", [["бронь", "[bron']", "预订"], ["паспорт", "[PAS-part]", "护照"]], ["У меня бронь.", "[oo mi-NYA bron']", "我有预订。"]),
      lesson("房间与钥匙", [["номер", "[NO-myer]", "房间"], ["ключ", "[klyuch]", "钥匙"]], ["Где мой ключ?", "[gdye moy klyuch]", "我的钥匙在哪？"]),
      lesson("一晚与两晚", [["одна ночь", "[ad-NA noch']", "一晚"], ["две ночи", "[dvye NO-chee]", "两晚"]], ["На две ночи, пожалуйста.", "[na dvye NO-chee pa-ZHA-lus-ta]", "两晚，谢谢。"]),
      lesson("早餐", [["завтрак", "[ZAF-trak]", "早餐"], ["включён", "[f-klyu-CHYON]", "包含"]], ["Завтрак включён?", "[ZAF-trak f-klyu-CHYON]", "早餐包含吗？"]),
      lesson("网络与密码", [["интернет", "[in-tyer-NYET]", "网络"], ["пароль", "[pa-ROL']", "密码"]], ["Какой пароль от Wi-Fi?", "[ka-KOY pa-ROL' at wai-fai]", "Wi-Fi 密码是什么？"]),
      lesson("电梯与楼层", [["лифт", "[lift]", "电梯"], ["этаж", "[e-TAZH]", "楼层"]], ["Где лифт?", "[gdye lift]", "电梯在哪？"]),
      lesson("毛巾与水", [["полотенце", "[pa-la-TYEN-tsye]", "毛巾"], ["вода", "[va-DA]", "水"]], ["Мне нужно полотенце.", "[mnye NOOZH-na pa-la-TYEN-tsye]", "我需要一条毛巾。"]),
      lesson("安静与吵", [["тихо", "[TEE-kha]", "安静"], ["шумно", "[SHOOM-na]", "吵"]], ["В номере шумно.", "[v NO-mye-rye SHOOM-na]", "房间里很吵。"]),
      lesson("请帮忙", [["помогите", "[pa-ma-GHEE-tye]", "请帮忙"], ["пожалуйста", "[pa-ZHA-lus-ta]", "请"]], ["Помогите, пожалуйста.", "[pa-ma-GHEE-tye pa-ZHA-lus-ta]", "请帮帮我。"]),
      lesson("退房", [["я выезжаю", "[ya vy-i-ZHA-yu]", "我要退房"], ["сегодня", "[si-VOD-nya]", "今天"]], ["Я выезжаю сегодня.", "[ya vy-i-ZHA-yu si-VOD-nya]", "我今天退房。"]),
      lesson("礼貌结束", [["спасибо", "[spa-SEE-ba]", "谢谢"], ["до свидания", "[da svi-DA-ni-ya]", "再见"]], ["Спасибо, до свидания.", "[spa-SEE-ba da svi-DA-ni-ya]", "谢谢，再见。"]),
    ],
  ),
  cycle(
    12,
    "周期12 · 生存整合 · 第一轮综合",
    ["Я могу решать базовые бытовые задачи по-русски.", "[ya ma-GOO ri-SHAT' BA-za-vy-ye by-TO-vy-ye za-DA-chee pa-ROOS-kee]", "我能用俄语处理基础生活任务。"],
    [
      lesson("问候并介绍自己", [["здравствуйте", "[ZDRA-stvooy-tye]", "您好"], ["меня зовут", "[mi-NYA za-VOOT]", "我叫"]], ["Здравствуйте, меня зовут Ли.", "[ZDRA-stvooy-tye mi-NYA za-VOOT lee]", "您好，我叫李。"]),
      lesson("询问对方名字", [["как вас зовут", "[kak vas za-VOOT]", "您叫什么"], ["очень приятно", "[O-chen' pri-YAT-na]", "很高兴"]], ["Как вас зовут?", "[kak vas za-VOOT]", "您叫什么名字？"]),
      lesson("点咖啡", [["кофе", "[KO-fye]", "咖啡"], ["пожалуйста", "[pa-ZHA-lus-ta]", "请"]], ["Я хочу кофе, пожалуйста.", "[ya kha-CHOO KO-fye pa-ZHA-lus-ta]", "我想要咖啡，谢谢。"]),
      lesson("点简单餐", [["суп", "[soop]", "汤"], ["хлеб", "[khlyep]", "面包"]], ["Я хочу суп и хлеб.", "[ya kha-CHOO soop i khlyep]", "我想要汤和面包。"]),
      lesson("在店里买东西", [["я возьму", "[ya vaz-MOO]", "我要"], ["это", "[E-ta]", "这个"]], ["Я возьму это.", "[ya vaz-MOO E-ta]", "我要这个。"]),
      lesson("问价格", [["сколько", "[SKOL'-ka]", "多少"], ["стоит", "[STO-it]", "值 / 价格是"]], ["Сколько это стоит?", "[SKOL'-ka E-ta STO-it]", "这个多少钱？"]),
      lesson("找地铁", [["где", "[gdye]", "哪里"], ["метро", "[mi-TRO]", "地铁"]], ["Где метро?", "[gdye mi-TRO]", "地铁在哪？"]),
      lesson("打车去车站", [["мне нужно", "[mnye NOOZH-na]", "我需要"], ["вокзал", "[vag-ZAL]", "火车站"]], ["Мне нужно на вокзал.", "[mnye NOOZH-na na vag-ZAL]", "我需要去火车站。"]),
      lesson("酒店入住", [["бронь", "[bron']", "预订"], ["одна ночь", "[ad-NA noch']", "一晚"]], ["У меня бронь на одну ночь.", "[oo mi-NYA bron' na ad-NOO noch']", "我有一晚的预订。"]),
      lesson("问时间", [["во сколько", "[va SKOL'-ka]", "几点"], ["поезд", "[PO-yezd]", "火车"]], ["Во сколько поезд?", "[va SKOL'-ka PO-yezd]", "火车几点？"]),
      lesson("今天去中心", [["сегодня", "[si-VOD-nya]", "今天"], ["центр", "[TSEN-tr]", "市中心"]], ["Сегодня я еду в центр.", "[si-VOD-nya ya YE-doo f TSEN-tr]", "今天我要去市中心。"]),
    ],
  ),
  cycle(
    13,
    "周期13 · 家庭与关系",
    ["Я могу рассказать о семье.", "[ya ma-GOO ras-ska-ZAT' a sim-YE]", "我能介绍家庭。"],
    [
      lesson("妈妈与爸爸", [["мама", "[MA-ma]", "妈妈"], ["папа", "[PA-pa]", "爸爸"]], ["Это моя мама.", "[E-ta ma-YA MA-ma]", "这是我的妈妈。"]),
      lesson("哥哥弟弟与姐姐妹妹", [["брат", "[brat]", "兄弟"], ["сестра", "[sis-TRA]", "姐妹"]], ["Это мой брат.", "[E-ta moy brat]", "这是我的兄弟。"]),
      lesson("丈夫与妻子", [["муж", "[moozh]", "丈夫"], ["жена", "[zhi-NA]", "妻子"]], ["Это моя жена.", "[E-ta ma-YA zhi-NA]", "这是我的妻子。"]),
      lesson("儿子与女儿", [["сын", "[syn]", "儿子"], ["дочь", "[doch']", "女儿"]], ["Это моя дочь.", "[E-ta ma-YA doch']", "这是我的女儿。"]),
      lesson("家人与家", [["семья", "[sim-YA]", "家庭"], ["дом", "[dom]", "家 / 房子"]], ["У меня большая семья.", "[oo mi-NYA bal-SHA-ya sim-YA]", "我有一个大家庭。"]),
      lesson("我的与我的（阴）", [["мой", "[moy]", "我的（阳）"], ["моя", "[ma-YA]", "我的（阴）"]], ["Это моя семья.", "[E-ta ma-YA sim-YA]", "这是我的家庭。"]),
      lesson("他的与她的", [["его", "[yi-VO]", "他的"], ["её", "[yi-YO]", "她的"]], ["Это её дочь.", "[E-ta yi-YO doch']", "这是她的女儿。"]),
      lesson("兄弟是学生", [["брат", "[brat]", "兄弟"], ["студент", "[stoo-DYENT]", "学生"]], ["Мой брат студент.", "[moy brat stoo-DYENT]", "我的兄弟是学生。"]),
      lesson("和家人一起住", [["живу", "[zhi-VOO]", "住"], ["с семьёй", "[s sim-YOY]", "和家人一起"]], ["Я живу с семьёй.", "[ya zhi-VOO s sim-YOY]", "我和家人住在一起。"]),
      lesson("家庭朋友", [["друг семьи", "[drook sim-YEE]", "家庭朋友"], ["гости", "[GOS-ti]", "客人"]], ["Это друг семьи.", "[E-ta droog sim-YEE]", "这是家里的朋友。"]),
      lesson("我有一只猫", [["у меня есть", "[oo mi-NYA yest']", "我有"], ["кот", "[kot]", "猫"]], ["У меня есть кот.", "[oo mi-NYA yest' kot]", "我有一只猫。"]),
    ],
  ),
  cycle(
    14,
    "周期14 · 天气与日常安排",
    ["Я могу рассказать о своём дне.", "[ya ma-GOO ras-ska-ZAT' a sva-YOM dye-NYE]", "我能描述自己的一天。"],
    [
      lesson("今天很冷", [["сегодня", "[si-VOD-nya]", "今天"], ["холодно", "[kha-LOD-na]", "冷"]], ["Сегодня холодно.", "[si-VOD-nya kha-LOD-na]", "今天很冷。"]),
      lesson("暖和与热", [["тепло", "[ti-PLO]", "暖和"], ["жарко", "[ZHAR-ka]", "热"]], ["Сегодня тепло.", "[si-VOD-nya ti-PLO]", "今天很暖和。"]),
      lesson("下雨与下雪", [["дождь", "[dozhd']", "雨"], ["снег", "[snyeg]", "雪"]], ["Идёт дождь.", "[i-DYOT dozhd']", "正在下雨。"]),
      lesson("起床", [["утро", "[OO-tra]", "早晨"], ["просыпаюсь", "[pra-sy-PA-yus']", "我醒来"]], ["Я просыпаюсь рано.", "[ya pra-sy-PA-yus' RA-na]", "我起得很早。"]),
      lesson("早餐", [["завтрак", "[ZAF-trak]", "早餐"], ["чай", "[chai]", "茶"]], ["Утром я пью чай.", "[OO-tram ya pyu chai]", "早上我喝茶。"]),
      lesson("白天工作", [["днём", "[dnyom]", "白天"], ["работаю", "[ra-BO-ta-yu]", "我工作"]], ["Днём я работаю.", "[dnyom ya ra-BO-ta-yu]", "白天我工作。"]),
      lesson("晚上在家", [["вечером", "[VYE-che-ram]", "晚上"], ["дома", "[DO-ma]", "在家"]], ["Вечером я дома.", "[VYE-che-ram ya DO-ma]", "晚上我在家。"]),
      lesson("睡觉", [["спать", "[spat']", "睡觉"], ["поздно", "[POZD-na]", "晚"]], ["Я ложусь спать поздно.", "[ya la-ZHOOS' spat' POZD-na]", "我睡得晚。"]),
      lesson("休息日", [["выходной", "[vy-khad-NOY]", "休息日"], ["суббота", "[soo-BO-ta]", "星期六"]], ["Сегодня выходной.", "[si-VOD-nya vy-khad-NOY]", "今天休息。"]),
      lesson("明天去公园", [["завтра", "[ZAF-tra]", "明天"], ["парк", "[park]", "公园"]], ["Завтра я иду в парк.", "[ZAF-tra ya i-DOO f park]", "明天我要去公园。"]),
      lesson("今天你做什么", [["что ты делаешь", "[shto ty DYE-la-yesh']", "你在做什么"], ["сегодня", "[si-VOD-nya]", "今天"]], ["Что ты делаешь сегодня?", "[shto ty DYE-la-yesh' si-VOD-nya]", "你今天做什么？"]),
    ],
  ),
  cycle(
    15,
    "周期15 · 学习与工作",
    ["Я могу говорить о работе и учёбе.", "[ya ma-GOO ga-va-REET' a ra-BO-tye i u-CHYO-bye]", "我能谈论学习和工作。"],
    [
      lesson("大学", [["университет", "[oo-ni-vyer-si-TYET]", "大学"], ["учусь", "[oo-CHOOS']", "我学习"]], ["Я учусь в университете.", "[ya oo-CHOOS' v oo-ni-vyer-si-TYE-tye]", "我在大学学习。"]),
      lesson("课程", [["урок", "[oo-ROK]", "课"], ["занятие", "[za-NYA-ti-ye]", "课程 / 课次"]], ["У меня занятие в десять.", "[oo mi-NYA za-NYA-ti-ye f DYE-syat']", "我十点有课。"]),
      lesson("老师与学生", [["учитель", "[oo-CHEE-tyel']", "老师"], ["студент", "[stoo-DYENT]", "学生"]], ["Учитель здесь.", "[oo-CHEE-tyel' zdyes']", "老师在这里。"]),
      lesson("办公室", [["работа", "[ra-BO-ta]", "工作"], ["офис", "[O-fis]", "办公室"]], ["Я работаю в офисе.", "[ya ra-BO-ta-yu v O-fi-sye]", "我在办公室工作。"]),
      lesson("同事", [["коллега", "[ka-LYE-ga]", "同事"], ["начальник", "[na-CHAL'-nik]", "上司"]], ["Это мой коллега.", "[E-ta moy ka-LYE-ga]", "这是我的同事。"]),
      lesson("电脑与网络", [["компьютер", "[kam-PYU-tyer]", "电脑"], ["интернет", "[in-tyer-NYET]", "网络"]], ["Мне нужен интернет.", "[mnye NOO-zhen in-tyer-NYET]", "我需要网络。"]),
      lesson("读与写", [["читать", "[chi-TAT']", "读"], ["писать", "[pi-SAT']", "写"]], ["Я читаю текст.", "[ya chi-TA-yu tyekst]", "我在读文本。"]),
      lesson("听老师说", [["слушаю", "[SLOO-sha-yu]", "我听"], ["преподавателя", "[pri-pa-da-VA-tye-lya]", "老师"]], ["Я слушаю преподавателя.", "[ya SLOO-sha-yu pri-pa-da-VA-tye-lya]", "我在听老师讲话。"]),
      lesson("学俄语", [["учу", "[oo-CHOO]", "我学"], ["русский язык", "[ROOS-kee ya-ZYK]", "俄语"]], ["Я учу русский язык.", "[ya oo-CHOO ROOS-kee ya-ZYK]", "我在学俄语。"]),
      lesson("请帮帮我", [["помогите", "[pa-ma-GHEE-tye]", "请帮助"], ["пожалуйста", "[pa-ZHA-lus-ta]", "请"]], ["Помогите, пожалуйста.", "[pa-ma-GHEE-tye pa-ZHA-lus-ta]", "请帮帮我。"]),
      lesson("今天工作很多", [["много", "[MNO-ga]", "很多"], ["работы", "[ra-BO-ty]", "工作（属格）"]], ["Сегодня много работы.", "[si-VOD-nya MNO-ga ra-BO-ty]", "今天工作很多。"]),
    ],
  ),
  cycle(
    16,
    "周期16 · 城市生活",
    ["Я могу ориентироваться в городе.", "[ya ma-GOO a-ri-yin-ti-RA-va-tsa f GO-ra-dye]", "我能在城市里辨认地点。"],
    [
      lesson("银行", [["банк", "[bank]", "银行"], ["карта", "[KAR-ta]", "卡"]], ["Где банк?", "[gdye bank]", "银行在哪？"]),
      lesson("药店", [["аптека", "[ap-TYE-ka]", "药店"], ["лекарство", "[lye-KAR-stva]", "药"]], ["Мне нужна аптека.", "[mnye NOOZH-na ap-TYE-ka]", "我需要药店。"]),
      lesson("医院与医生", [["больница", "[bal'-NEE-tsa]", "医院"], ["врач", "[vrach]", "医生"]], ["Мне нужен врач.", "[mnye NOO-zhen vrach]", "我需要医生。"]),
      lesson("邮局", [["почта", "[POCH-ta]", "邮局"], ["письмо", "[pis'-MO]", "信"]], ["Где почта?", "[gdye POCH-ta]", "邮局在哪？"]),
      lesson("超市", [["супермаркет", "[soo-pyer-mar-KYET]", "超市"], ["магазин", "[ma-ga-ZEEN]", "商店"]], ["Супермаркет рядом.", "[soo-pyer-mar-KYET RYA-dam]", "超市就在附近。"]),
      lesson("公园与博物馆", [["парк", "[park]", "公园"], ["музей", "[moo-ZYEY]", "博物馆"]], ["Я иду в музей.", "[ya i-DOO v moo-ZYEY]", "我要去博物馆。"]),
      lesson("图书馆", [["библиотека", "[bib-li-a-TYE-ka]", "图书馆"], ["книга", "[KNEE-ga]", "书"]], ["Где библиотека?", "[gdye bib-li-a-TYE-ka]", "图书馆在哪？"]),
      lesson("警察", [["полиция", "[pa-LEE-tsi-ya]", "警察"], ["помощь", "[PO-mashch']", "帮助"]], ["Мне нужна полиция.", "[mnye NOOZH-na pa-LEE-tsi-ya]", "我需要警察。"]),
      lesson("售票处", [["билетная касса", "[bi-LYET-na-ya KAS-sa]", "售票处"], ["билет", "[bi-LYET]", "票"]], ["Где билетная касса?", "[gdye bi-LYET-na-ya KAS-sa]", "售票处在哪？"]),
      lesson("换汇", [["обмен валют", "[ab-MYEN va-LYUT]", "货币兑换"], ["деньги", "[DYEN'-gee]", "钱"]], ["Где обмен валют?", "[gdye ab-MYEN va-LYUT]", "换汇处在哪？"]),
      lesson("这里开门吗", [["открыто", "[at-KRY-ta]", "开门"], ["ближайший", "[bli-ZHAI-shiy]", "最近的"]], ["Что здесь открыто?", "[shto zdyes' at-KRY-ta]", "这里什么是开着的？"]),
    ],
  ),
  cycle(
    17,
    "周期17 · 社交聊天与爱好",
    ["Я могу говорить об интересах.", "[ya ma-GOO ga-va-REET' ab in-tye-RYE-sakh]", "我能谈论兴趣。"],
    [
      lesson("喜欢音乐", [["мне нравится", "[mnye NRA-vit-sa]", "我喜欢"], ["музыка", "[MOO-zy-ka]", "音乐"]], ["Мне нравится музыка.", "[mnye NRA-vit-sa MOO-zy-ka]", "我喜欢音乐。"]),
      lesson("喜欢电影", [["я люблю", "[ya lyu-BLYU]", "我喜爱"], ["кино", "[ki-NO]", "电影"]], ["Я люблю кино.", "[ya lyu-BLYU ki-NO]", "我喜欢电影。"]),
      lesson("读书", [["читаю", "[chi-TA-yu]", "我读"], ["книга", "[KNEE-ga]", "书"]], ["Я читаю книгу.", "[ya chi-TA-yu KNEE-goo]", "我在读书。"]),
      lesson("看电影", [["смотрю", "[sma-TRYU]", "我看"], ["фильм", "[film]", "电影"]], ["Я смотрю фильм.", "[ya sma-TRYU film]", "我在看电影。"]),
      lesson("运动", [["спорт", "[sport]", "运动"], ["бег", "[byeg]", "跑步"]], ["Я люблю спорт.", "[ya lyu-BLYU sport]", "我喜欢运动。"]),
      lesson("我的爱好", [["хобби", "[KHOB-bi]", "爱好"], ["фотография", "[fa-ta-GRA-fi-ya]", "摄影"]], ["Моё хобби - фотография.", "[ma-YO KHOB-bi fa-ta-GRA-fi-ya]", "我的爱好是摄影。"]),
      lesson("下棋", [["играю", "[i-GRA-yu]", "我玩"], ["шахматы", "[SHAKH-ma-ty]", "国际象棋"]], ["Я играю в шахматы.", "[ya i-GRA-yu v SHAKH-ma-ty]", "我下国际象棋。"]),
      lesson("散步", [["гулять", "[goo-LYAT']", "散步"], ["парк", "[park]", "公园"]], ["Я люблю гулять в парке.", "[ya lyu-BLYU goo-LYAT' f PAR-kye]", "我喜欢在公园散步。"]),
      lesson("你喜欢做什么", [["что вы любите", "[shto vy lyu-BEE-tye]", "您喜欢什么"], ["делать", "[DYE-lat']", "做"]], ["Что вы любите делать?", "[shto vy lyu-BEE-tye DYE-lat']", "您喜欢做什么？"]),
      lesson("周末休息", [["по выходным", "[pa vy-khad-NYM]", "在周末"], ["отдыхаю", "[at-dy-KHA-yu]", "我休息"]], ["По выходным я отдыхаю.", "[pa vy-khad-NYM ya at-dy-KHA-yu]", "周末我休息。"]),
      lesson("明天见面", [["давайте", "[da-VAI-tye]", "让我们"], ["встретимся", "[FSTRYE-tim-sya]", "见面"]], ["Давайте встретимся завтра.", "[da-VAI-tye FSTRYE-tim-sya ZAF-tra]", "我们明天见吧。"]),
    ],
  ),
  cycle(
    18,
    "周期18 · 日常整合 · 第二轮综合",
    ["Я могу поддержать простой разговор.", "[ya ma-GOO pad-dyer-ZHAT' PRO-stoy raz-ga-VOR]", "我能进行简单对话。"],
    [
      lesson("介绍家人与爱好", [["моя семья", "[ma-YA sim-YA]", "我的家庭"], ["музыка", "[MOO-zy-ka]", "音乐"]], ["Моя семья любит музыку.", "[ma-YA sim-YA LYU-bit MOO-zy-ku]", "我的家人喜欢音乐。"]),
      lesson("天气与计划", [["сегодня тепло", "[si-VOD-nya ti-PLO]", "今天暖和"], ["парк", "[park]", "公园"]], ["Сегодня тепло, я иду в парк.", "[si-VOD-nya ti-PLO ya i-DOO f park]", "今天很暖和，我要去公园。"]),
      lesson("工作与时间", [["работа", "[ra-BO-ta]", "工作"], ["в десять", "[f DYE-syat']", "在十点"]], ["У меня работа в десять.", "[oo mi-NYA ra-BO-ta f DYE-syat']", "我十点要工作。"]),
      lesson("城市与路线", [["музей", "[moo-ZYEY]", "博物馆"], ["центр", "[TSEN-tr]", "中心"]], ["Музей в центре.", "[moo-ZYEY f TSEN-trye]", "博物馆在市中心。"]),
      lesson("喝点什么", [["чай", "[chai]", "茶"], ["кофе", "[KO-fye]", "咖啡"]], ["Вы хотите чай или кофе?", "[vy kha-TEE-tye chai I-li KO-fye]", "您想要茶还是咖啡？"]),
      lesson("邀请一起去", [["давайте", "[da-VAI-tye]", "让我们"], ["вместе", "[VMYES-tye]", "一起"]], ["Давайте пойдём вместе.", "[da-VAI-tye pay-DYOM VMYES-tye]", "我们一起去吧。"]),
      lesson("打电话开场", [["алло", "[al-LO]", "喂"], ["это Ли", "[E-ta lee]", "我是李"]], ["Алло, это Ли.", "[al-LO E-ta lee]", "喂，我是李。"]),
      lesson("周末安排", [["в субботу", "[f soo-BO-too]", "在周六"], ["музей", "[moo-ZYEY]", "博物馆"]], ["В субботу я иду в музей.", "[f soo-BO-too ya i-DOO v moo-ZYEY]", "周六我要去博物馆。"]),
      lesson("学习上求助", [["помогите", "[pa-ma-GHEE-tye]", "请帮忙"], ["русский текст", "[ROOS-kee tyekst]", "俄语文本"]], ["Помогите мне с русским текстом.", "[pa-ma-GHEE-tye mnye s ROOS-keem TYEKS-tam]", "请帮我看这段俄语。"]),
      lesson("逛博物馆", [["билет", "[bi-LYET]", "票"], ["музей", "[moo-ZYEY]", "博物馆"]], ["У меня билет в музей.", "[oo mi-NYA bi-LYET v moo-ZYEY]", "我有一张博物馆门票。"]),
      lesson(
        "小对话整合",
        [["как дела", "[kak di-LA]", "你怎么样"], ["хорошо", "[kha-ra-SHO]", "很好"]],
        [
          ["Как дела?", "[kak di-LA]", "你怎么样？"],
          ["Хорошо, спасибо.", "[kha-ra-SHO spa-SEE-ba]", "很好，谢谢。"],
        ],
      ),
    ],
  ),
  cycle(
    19,
    "周期19 · 名词与形容词基础",
    ["Я понимаю базовые формы слов.", "[ya pa-ni-MA-yu BA-za-vy-ye FOR-my slov]", "我理解词的基础形式。"],
    [
      lesson("мой паспорт", [["мой", "[moy]", "我的（阳）"], ["паспорт", "[PAS-part]", "护照"]], ["Это мой паспорт.", "[E-ta moy PAS-part]", "这是我的护照。"]),
      lesson("моя карта", [["моя", "[ma-YA]", "我的（阴）"], ["карта", "[KAR-ta]", "卡"]], ["Это моя карта.", "[E-ta ma-YA KAR-ta]", "这是我的卡。"]),
      lesson("моё окно", [["моё", "[ma-YO]", "我的（中）"], ["окно", "[ak-NO]", "窗户"]], ["Это моё окно.", "[E-ta ma-YO ak-NO]", "这是我的窗户。"]),
      lesson("мои вещи", [["мои", "[ma-EE]", "我的（复）"], ["вещи", "[VYE-shchi]", "东西"]], ["Это мои вещи.", "[E-ta ma-EE VYE-shchi]", "这些是我的东西。"]),
      lesson("大房子", [["большой", "[bal-SHOY]", "大的（阳）"], ["дом", "[dom]", "房子"]], ["Это большой дом.", "[E-ta bal-SHOY dom]", "这是大房子。"]),
      lesson("小房间", [["маленькая", "[MA-lin'-ka-ya]", "小的（阴）"], ["комната", "[KOM-na-ta]", "房间"]], ["Это маленькая комната.", "[E-ta MA-lin'-ka-ya KOM-na-ta]", "这是小房间。"]),
      lesson("新菜单", [["новое", "[NO-va-ye]", "新的（中）"], ["меню", "[mi-NYOO]", "菜单"]], ["Это новое меню.", "[E-ta NO-va-ye mi-NYOO]", "这是新菜单。"]),
      lesson("哪一个号码", [["какой", "[ka-KOY]", "哪个（阳）"], ["номер", "[NO-myer]", "号码"]], ["Какой это номер?", "[ka-KOY E-ta NO-myer]", "这是几号？"]),
      lesson("哪一条街", [["какая", "[ka-KA-ya]", "哪一个（阴）"], ["улица", "[OO-li-tsa]", "街道"]], ["Какая это улица?", "[ka-KA-ya E-ta OO-li-tsa]", "这是什么街？"]),
      lesson("哪一个地方", [["какое", "[ka-KO-ye]", "哪一个（中）"], ["место", "[MYES-ta]", "地方"]], ["Какое это место?", "[ka-KO-ye E-ta MYES-ta]", "这是什么地方？"]),
      lesson("我的新书", [["новая", "[NO-va-ya]", "新的（阴）"], ["книга", "[KNEE-ga]", "书"]], ["Это моя новая книга.", "[E-ta ma-YA NO-va-ya KNEE-ga]", "这是我的新书。"]),
    ],
  ),
  cycle(
    20,
    "周期20 · 动词现在时入门",
    ["Я могу говорить о действиях.", "[ya ma-GOO ga-va-REET' a DYEY-stvi-yakh]", "我能描述动作。"],
    [
      lesson("我住在这里", [["живу", "[zhi-VOO]", "我住"], ["здесь", "[zdyes']", "这里"]], ["Я живу здесь.", "[ya zhi-VOO zdyes']", "我住在这里。"]),
      lesson("我工作", [["работаю", "[ra-BO-ta-yu]", "我工作"], ["дома", "[DO-ma]", "在家"]], ["Я работаю дома.", "[ya ra-BO-ta-yu DO-ma]", "我在家工作。"]),
      lesson("我学习", [["учусь", "[oo-CHOOS']", "我学习"], ["каждый день", "[KAZH-diy dyen']", "每天"]], ["Я учусь каждый день.", "[ya oo-CHOOS' KAZH-diy dyen']", "我每天学习。"]),
      lesson("我说俄语", [["говорю", "[ga-va-RYOO]", "我说"], ["по-русски", "[pa-ROOS-kee]", "用俄语"]], ["Я говорю по-русски.", "[ya ga-va-RYOO pa-ROOS-kee]", "我说俄语。"]),
      lesson("我懂一点", [["понимаю", "[pa-ni-MA-yu]", "我懂"], ["немного", "[ni-MNO-ga]", "一点"]], ["Я понимаю немного.", "[ya pa-ni-MA-yu ni-MNO-ga]", "我懂一点。"]),
      lesson("我想要咖啡", [["хочу", "[kha-CHOO]", "我想要"], ["кофе", "[KO-fye]", "咖啡"]], ["Я хочу кофе.", "[ya kha-CHOO KO-fye]", "我想要咖啡。"]),
      lesson("我去公园", [["иду", "[i-DOO]", "我走去"], ["парк", "[park]", "公园"]], ["Я иду в парк.", "[ya i-DOO f park]", "我步行去公园。"]),
      lesson("我坐车去中心", [["еду", "[YE-doo]", "我乘车去"], ["центр", "[TSEN-tr]", "中心"]], ["Я еду в центр.", "[ya YE-doo f TSEN-tr]", "我乘车去市中心。"]),
      lesson("我读书", [["читаю", "[chi-TA-yu]", "我读"], ["книга", "[KNEE-ga]", "书"]], ["Я читаю книгу.", "[ya chi-TA-yu KNEE-goo]", "我在读书。"]),
      lesson("我看电影", [["смотрю", "[sma-TRYU]", "我看"], ["фильм", "[film]", "电影"]], ["Я смотрю фильм.", "[ya sma-TRYU film]", "我在看电影。"]),
      lesson("我做作业", [["делаю", "[DYE-la-yu]", "我做"], ["урок", "[oo-ROK]", "作业 / 课"]], ["Я делаю урок.", "[ya DYE-la-yu oo-ROK]", "我在做作业。"]),
    ],
  ),
  cycle(
    21,
    "周期21 · 前置词与常见结构",
    ["Я понимаю основные предлоги.", "[ya pa-ni-MA-yu as-nav-NY-ye pred-LO-gee]", "我理解基础前置词。"],
    [
      lesson("在酒店里", [["в", "[v]", "在"], ["отеле", "[a-TYE-lye]", "酒店里"]], ["Я в отеле.", "[ya v a-TYE-lye]", "我在酒店里。"]),
      lesson("在火车站", [["на", "[na]", "在"], ["вокзале", "[vag-ZA-lye]", "火车站里"]], ["Я на вокзале.", "[ya na vag-ZA-lye]", "我在火车站。"]),
      lesson("来自中国", [["из", "[iz]", "来自"], ["Китая", "[kee-TA-ya]", "中国（来自）"]], ["Я из Китая.", "[ya iz kee-TA-ya]", "我来自中国。"]),
      lesson("和朋友一起", [["с", "[s]", "和"], ["другом", "[DROO-gam]", "朋友一起"]], ["Я с другом.", "[ya s DROO-gam]", "我和朋友在一起。"]),
      lesson("不加糖", [["без", "[byez]", "没有"], ["сахара", "[SA-kha-ra]", "糖"]], ["Кофе без сахара.", "[KO-fye byez SA-kha-ra]", "咖啡不加糖。"]),
      lesson("给您", [["для", "[dlya]", "给 / 为了"], ["вас", "[vas]", "您"]], ["Это для вас.", "[E-ta dlya vas]", "这是给您的。"]),
      lesson("在公园旁边", [["около", "[O-ka-la]", "在旁边"], ["парка", "[PAR-ka]", "公园旁"]], ["Метро около парка.", "[mi-TRO O-ka-la PAR-ka]", "地铁在公园旁边。"]),
      lesson("下班后", [["после", "[POS-lye]", "在……之后"], ["работы", "[ra-BO-ty]", "工作之后"]], ["После работы я дома.", "[POS-lye ra-BO-ty ya DO-ma]", "下班后我在家。"]),
      lesson("到晚上之前", [["до", "[do]", "直到"], ["вечера", "[VYE-che-ra]", "晚上"]], ["До вечера я занят.", "[do VYE-che-ra ya ZA-nyat]", "到晚上之前我都忙。"]),
      lesson("用俄语", [["по-русски", "[pa-ROOS-kee]", "用俄语"], ["говорю", "[ga-va-RYOO]", "我说"]], ["Я говорю по-русски.", "[ya ga-va-RYOO pa-ROOS-kee]", "我说俄语。"]),
      lesson("朝向地铁", [["к", "[k]", "朝向"], ["метро", "[mi-TRO]", "地铁"]], ["Мы идём к метро.", "[my i-DYOM k mi-TRO]", "我们朝地铁走去。"]),
    ],
  ),
  cycle(
    22,
    "周期22 · 短对话与听辨",
    ["Я могу понимать короткий диалог.", "[ya ma-GOO pa-ni-MAT' KA-rat-kiy di-a-LOG]", "我能理解简短对话。"],
    [
      lesson(
        "问候对话",
        [["здравствуйте", "[ZDRA-stvooy-tye]", "您好"], ["как вас зовут", "[kak vas za-VOOT]", "您叫什么"]],
        [
          ["Здравствуйте.", "[ZDRA-stvooy-tye]", "您好。"],
          ["Здравствуйте, как вас зовут?", "[ZDRA-stvooy-tye kak vas za-VOOT]", "您好，您叫什么？"],
        ],
        { words: [["здравствуйте", "[ZDRA-stvooy-tye]", "您好"], ["имя", "[EE-mya]", "名字"]] },
      ),
      lesson(
        "咖啡店对话",
        [["кофе", "[KO-fye]", "咖啡"], ["пожалуйста", "[pa-ZHA-lus-ta]", "请"]],
        [
          ["Кофе, пожалуйста.", "[KO-fye pa-ZHA-lus-ta]", "请给我咖啡。"],
          ["Да, сейчас.", "[da si-CHAS]", "好的，马上。"],
        ],
      ),
      lesson(
        "餐厅对话",
        [["суп", "[soop]", "汤"], ["меню", "[mi-NYOO]", "菜单"]],
        [
          ["Меню, пожалуйста.", "[mi-NYOO pa-ZHA-lus-ta]", "请给我菜单。"],
          ["Я хочу суп.", "[ya kha-CHOO soop]", "我想要汤。"],
        ],
      ),
      lesson(
        "商店对话",
        [["это", "[E-ta]", "这个"], ["сколько", "[SKOL'-ka]", "多少"]],
        [
          ["Я возьму это.", "[ya vaz-MOO E-ta]", "我要这个。"],
          ["Сколько это стоит?", "[SKOL'-ka E-ta STO-it]", "这个多少钱？"],
        ],
      ),
      lesson(
        "价格对话",
        [["дорого", "[DO-ra-ga]", "贵"], ["дёшево", "[DYO-shi-va]", "便宜"]],
        [
          ["Это дорого?", "[E-ta DO-ra-ga]", "这个贵吗？"],
          ["Нет, это дёшево.", "[nyet E-ta DYO-shi-va]", "不，这个很便宜。"],
        ],
      ),
      lesson(
        "地铁对话",
        [["метро", "[mi-TRO]", "地铁"], ["здесь", "[zdyes']", "这里"]],
        [
          ["Где метро?", "[gdye mi-TRO]", "地铁在哪？"],
          ["Метро здесь.", "[mi-TRO zdyes']", "地铁在这里。"],
        ],
      ),
      lesson(
        "出租车对话",
        [["такси", "[tak-SEE]", "出租车"], ["вокзал", "[vag-ZAL]", "火车站"]],
        [
          ["Мне нужно такси.", "[mnye NOOZH-na tak-SEE]", "我需要出租车。"],
          ["Мне нужно на вокзал.", "[mnye NOOZH-na na vag-ZAL]", "我需要去火车站。"],
        ],
      ),
      lesson(
        "酒店对话",
        [["бронь", "[bron']", "预订"], ["паспорт", "[PAS-part]", "护照"]],
        [
          ["У меня бронь.", "[oo mi-NYA bron']", "我有预订。"],
          ["Вот мой паспорт.", "[vot moy PAS-part]", "这是我的护照。"],
        ],
      ),
      lesson(
        "时间对话",
        [["который час", "[ka-TO-riy chas]", "几点了"], ["сейчас", "[si-CHAS]", "现在"]],
        [
          ["Который час?", "[ka-TO-riy chas]", "几点了？"],
          ["Сейчас десять.", "[si-CHAS DYE-syat']", "现在十点。"],
        ],
      ),
      lesson(
        "请重复一遍",
        [["повторите", "[pafta-REE-tye]", "请重复"], ["медленнее", "[MYED-lyen-ni-ye]", "慢一点"]],
        [
          ["Повторите, пожалуйста.", "[pafta-REE-tye pa-ZHA-lus-ta]", "请重复一遍。"],
          ["Говорите медленнее.", "[ga-va-REE-tye MYED-lyen-ni-ye]", "请说慢一点。"],
        ],
      ),
      lesson(
        "简单社交对话",
        [["как дела", "[kak di-LA]", "你怎么样"], ["хорошо", "[kha-ra-SHO]", "很好"]],
        [
          ["Как дела?", "[kak di-LA]", "你怎么样？"],
          ["Хорошо, спасибо.", "[kha-ra-SHO spa-SEE-ba]", "很好，谢谢。"],
        ],
      ),
    ],
  ),
  cycle(
    23,
    "周期23 · 阅读与信息识别",
    ["Я могу читать короткие сообщения и вывески.", "[ya ma-GOO chi-TAT' KA-rat-ki-ye sa-ab-SHCHYE-ni-ya i VY-ves-kee]", "我能读懂短消息和标识。"],
    [
      lesson("入口与出口", [["вход", "[fkhot]", "入口"], ["выход", "[VY-khat]", "出口"]], ["Выход направо.", "[VY-khat na-PRA-va]", "出口在右边。"]),
      lesson("营业与关闭", [["открыто", "[at-KRY-ta]", "营业"], ["закрыто", "[za-KRY-ta]", "关闭"]], ["Открыто с 9:00 до 21:00.", "[at-KRY-ta s dye-vi-TI da dva-tsa-ti a-DNOI]", "营业时间 9:00 到 21:00。"]),
      lesson("菜单与账单", [["меню", "[mi-NYOO]", "菜单"], ["счёт", "[schyot]", "账单"]], ["Меню на столе.", "[mi-NYOO na sta-LYE]", "菜单在桌上。"]),
      lesson("售票处与票", [["касса", "[KAS-sa]", "售票处"], ["билет", "[bi-LYET]", "票"]], ["Касса там.", "[KAS-sa tam]", "售票处在那边。"]),
      lesson("站台与火车", [["платформа", "[plat-FOR-ma]", "站台"], ["поезд", "[PO-yezd]", "火车"]], ["Поезд в 18:40.", "[PO-yezd v vo-sem-NAT-sat' sor-ak]", "火车 18:40 发车。"]),
      lesson("地址", [["улица", "[OO-li-tsa]", "街道"], ["дом", "[dom]", "楼号"]], ["Улица Абая, дом 10.", "[OO-li-tsa a-BA-ya dom DYE-syat']", "阿拜街 10 号。"]),
      lesson("房号", [["номер", "[NO-myer]", "房号"], ["ключ", "[klyuch]", "钥匙"]], ["Номер 204.", "[NO-myer dva-STI chi-TYI-rye]", "房间号 204。"]),
      lesson("网络密码", [["Wi-Fi", "[wai-fai]", "无线网络"], ["пароль", "[pa-ROL']", "密码"]], ["Пароль: метро2026.", "[pa-ROL' mi-TRO dva-nol' dva-shest']", "密码：metro2026。"]),
      lesson("折扣与价格", [["скидка", "[SKEET-ka]", "折扣"], ["цена", "[tsi-NA]", "价格"]], ["Скидка 20 процентов.", "[SKEET-ka dva-tsat' pra-TSEN-tav]", "打八折。"]),
      lesson("短信提醒", [["сообщение", "[sa-ab-SHCHYE-ni-ye]", "消息"], ["встреча", "[FSTRYE-cha]", "见面"]], ["Встреча в 7:30.", "[FSTRYE-cha f syem' trid-tsat']", "见面时间 7:30。"]),
      lesson("明天闭馆", [["сегодня", "[si-VOD-nya]", "今天"], ["завтра", "[ZAF-tra]", "明天"]], ["Завтра музей закрыт.", "[ZAF-tra moo-ZYEY za-KRYT]", "明天博物馆闭馆。"]),
    ],
  ),
  cycle(
    24,
    "周期24 · 全年整合",
    ["Здравствуйте, меня зовут Ли, я из Китая и немного говорю по-русски.", "[ZDRA-stvooy-tye mi-NYA za-VOOT lee ya iz kee-TA-ya i ni-MNO-ga ga-va-RYOO pa-ROOS-kee]", "您好，我叫李，我来自中国，也会说一点俄语。"],
    [
      lesson("完整自我介绍", [["меня зовут", "[mi-NYA za-VOOT]", "我叫"], ["я из Китая", "[ya iz kee-TA-ya]", "我来自中国"]], ["Здравствуйте, меня зовут Ли.", "[ZDRA-stvooy-tye mi-NYA za-VOOT lee]", "您好，我叫李。"]),
      lesson("点饮料", [["чай", "[chai]", "茶"], ["кофе", "[KO-fye]", "咖啡"]], ["Я хочу кофе, пожалуйста.", "[ya kha-CHOO KO-fye pa-ZHA-lus-ta]", "我想要咖啡，谢谢。"]),
      lesson("购物问价", [["это", "[E-ta]", "这个"], ["сколько стоит", "[SKOL'-ka STO-it]", "多少钱"]], ["Сколько стоит это?", "[SKOL'-ka STO-it E-ta]", "这个多少钱？"]),
      lesson("问路到地铁", [["где", "[gdye]", "哪里"], ["метро", "[mi-TRO]", "地铁"]], ["Где метро?", "[gdye mi-TRO]", "地铁在哪？"]),
      lesson("去火车站", [["мне нужно", "[mnye NOOZH-na]", "我需要"], ["вокзал", "[vag-ZAL]", "火车站"]], ["Мне нужно на вокзал.", "[mnye NOOZH-na na vag-ZAL]", "我需要去火车站。"]),
      lesson("酒店入住", [["бронь", "[bron']", "预订"], ["паспорт", "[PAS-part]", "护照"]], ["У меня бронь, вот мой паспорт.", "[oo mi-NYA bron' vot moy PAS-part]", "我有预订，这是我的护照。"]),
      lesson("谈家庭与日常", [["семья", "[sim-YA]", "家庭"], ["работаю", "[ra-BO-ta-yu]", "我工作"]], ["У меня большая семья, и я работаю дома.", "[oo mi-NYA bal-SHA-ya sim-YA i ya ra-BO-ta-yu DO-ma]", "我有一个大家庭，而且我在家工作。"]),
      lesson("谈兴趣", [["музыка", "[MOO-zy-ka]", "音乐"], ["фотография", "[fa-ta-GRA-fi-ya]", "摄影"]], ["Мне нравится музыка и фотография.", "[mnye NRA-vit-sa MOO-zy-ka i fa-ta-GRA-fi-ya]", "我喜欢音乐和摄影。"]),
      lesson("读懂提示", [["открыто", "[at-KRY-ta]", "营业"], ["выход", "[VY-khat]", "出口"]], ["Выход там, музей открыт.", "[VY-khat tam moo-ZYEY at-KRYT]", "出口在那边，博物馆开着。"]),
      lesson(
        "简短双句对话",
        [["как дела", "[kak di-LA]", "你怎么样"], ["очень приятно", "[O-chen' pri-YAT-na]", "很高兴"]],
        [
          ["Как дела?", "[kak di-LA]", "你怎么样？"],
          ["Очень приятно, всё хорошо.", "[O-chen' pri-YAT-na fsyo kha-ra-SHO]", "很高兴，一切都好。"],
        ],
      ),
      lesson(
        "全年总结句",
        [["по-русски", "[pa-ROOS-kee]", "用俄语"], ["немного", "[ni-MNO-ga]", "一点"]],
        ["Здравствуйте, меня зовут Ли, я из Китая и немного говорю по-русски.", "[ZDRA-stvooy-tye mi-NYA za-VOOT lee ya iz kee-TA-ya i ni-MNO-ga ga-va-RYOO pa-ROOS-kee]", "您好，我叫李，我来自中国，也会说一点俄语。"],
      ),
    ],
  ),
];

export const days = cycles.flatMap((cycleDef) => {
  const cycleDays = cycleDef.lessons.map((lessonDef, index) =>
    buildLessonDay(cycleDef, index + 1, lessonDef),
  );
  const reviewDay = buildCycleReviewDay(cycleDef, cycleDays);
  return [...cycleDays, reviewDay];
});
