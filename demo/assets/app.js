import { days } from "./curriculum-year.js";

const storageKey = "russian-study-tool-demo-v8";

const learnSteps = [
  { key: "foundation", title: "part1 基础", short: "基础" },
  { key: "scene", title: "part2 场景", short: "场景" },
  { key: "voice", title: "part3 跟读", short: "跟读" },
];

const state = {
  progress: loadProgress(),
  lesson: createInitialLessonState(),
  ui: {
    foundationIndex: {},
    sceneIndex: {},
    cycleFoundationSection: {},
    cycleFoundationItem: {},
    cycleSceneSection: {},
    cycleSceneItem: {},
    reviewIndex: {},
    cycleReviewSection: {},
    cycleReviewItem: {},
  },
  russianVoice: null,
  recognition: null,
  voiceResult: createInitialVoiceResult(),
  voiceSelection: { day: 1, targetKey: "phrase-0" },
};

const els = {
  appShell: document.querySelector(".app-shell"),
  cycleTitle: document.querySelector("#cycle-title"),
  unitTitle: document.querySelector("#unit-title"),
  dayBadge: document.querySelector("#day-badge"),
  stepDots: document.querySelector("#step-dots"),
  progressLabel: document.querySelector("#progress-label"),
  progressNote: document.querySelector("#progress-note"),
  tabLearn: document.querySelector("#tab-learn"),
  tabReview: document.querySelector("#tab-review"),
  learnPanel: document.querySelector("#learn-panel"),
  reviewPanel: document.querySelector("#review-panel"),
  learnStepLabel: document.querySelector("#learn-step-label"),
  learnStepTitle: document.querySelector("#learn-step-title"),
  learnStepNote: document.querySelector("#learn-step-note"),
  learnStage: document.querySelector("#learn-stage"),
  reviewTitle: document.querySelector("#review-title"),
  reviewNote: document.querySelector("#review-note"),
  reviewList: document.querySelector("#review-list"),
  prevBtn: document.querySelector("#prev-btn"),
  nextBtn: document.querySelector("#next-btn"),
  footerNote: document.querySelector("#footer-note"),
};

init();

function init() {
  bindEvents();
  initVoices();
  registerPwa();
  render();
}

function registerPwa() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      return null;
    });
  });
}

function createInitialVoiceResult() {
  return {
    day: null,
    scoreText: "等待开始",
    recognizedText: "等待开始",
    feedback: "先听慢速，再跟读",
    status: "准备中",
    wordHits: [],
  };
}

function createInitialLessonState(dayNumber = null) {
  return {
    day: dayNumber,
    exerciseIndex: 0,
    checked: false,
    isCorrect: false,
    completed: false,
    selectedTokens: [],
    selectedChoices: [],
    selectedPair: null,
    matchedPairs: [],
    textInput: "",
    spoken: false,
  };
}

function loadProgress() {
  const initial = {
    dayIndex: 0,
    page: "learn",
    learnStepIndex: 0,
    reviewRemembered: {},
  };
  const saved = window.localStorage.getItem(storageKey);

  if (!saved) {
    return initial;
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      dayIndex: Number.isInteger(parsed.dayIndex) ? parsed.dayIndex : initial.dayIndex,
      page: parsed.page === "review" ? "review" : "learn",
      learnStepIndex: Number.isInteger(parsed.learnStepIndex)
        ? parsed.learnStepIndex
        : initial.learnStepIndex,
      reviewRemembered:
        parsed.reviewRemembered && typeof parsed.reviewRemembered === "object"
          ? parsed.reviewRemembered
          : initial.reviewRemembered,
    };
  } catch {
    return initial;
  }
}

function saveProgress() {
  window.localStorage.setItem(storageKey, JSON.stringify(state.progress));
}

function getCurrentDay() {
  return days[state.progress.dayIndex];
}

function getCurrentLearnStep() {
  return learnSteps[state.progress.learnStepIndex];
}

function bindEvents() {
  els.tabLearn.addEventListener("click", () => {
    state.progress.page = "learn";
    saveProgress();
    render();
  });

  els.tabReview.addEventListener("click", () => {
    state.progress.page = "review";
    saveProgress();
    render();
  });

  els.prevBtn.addEventListener("click", handlePrev);
  els.nextBtn.addEventListener("click", () => {
    if (hasLessonEngine(getCurrentDay())) {
      handleLessonPrimary();
      return;
    }

    handleNext();
  });
}

function render() {
  const day = getCurrentDay();

  if (hasLessonEngine(day)) {
    ensureLessonState(day);
    renderLessonMode(day);
    return;
  }

  els.appShell.classList.remove("is-lesson-mode");
  ensureVoiceSelectionForCurrentDay();
  ensureVoiceResultForCurrentDay();
  renderHeader();
  renderStepDots();
  renderTabs();
  renderLearnPage();
  renderReviewPage();
  renderFooter();
}

function hasLessonEngine(day) {
  return Array.isArray(day.exercises) && day.exercises.length > 0;
}

function ensureLessonState(day) {
  if (state.lesson.day === day.day) {
    return;
  }

  state.lesson = createInitialLessonState(day.day);
}

function getCurrentExercise(day) {
  return day.exercises[state.lesson.exerciseIndex];
}

function renderLessonMode(day) {
  const exercise = getCurrentExercise(day);
  const total = day.exercises.length;
  const current = state.lesson.exerciseIndex + 1;

  els.appShell.classList.add("is-lesson-mode");
  els.cycleTitle.textContent = `周期 ${day.cycleNumber} · 第 ${day.cycleDay} 天`;
  els.unitTitle.textContent = day.theme ?? day.title.replace(`${day.cycleLabel} · `, "");
  els.dayBadge.textContent = String(day.cycleDay);
  els.stepDots.innerHTML = `<div class="lesson-progress"><span style="width: ${state.lesson.completed ? 100 : (current - 1) / total * 100}%"></span></div>`;
  els.progressLabel.textContent = state.lesson.completed ? "今日完成" : `题 ${current} / ${total}`;
  els.progressNote.textContent = state.lesson.completed
    ? "今天的 Lesson 已完成。"
    : exercise.prompt;
  els.tabLearn.classList.add("is-active");
  els.tabReview.classList.remove("is-active");
  els.learnPanel.classList.add("is-active");
  els.reviewPanel.classList.remove("is-active");
  els.learnStepLabel.textContent = state.lesson.completed ? "Lesson Summary" : exercise.type;
  els.learnStepTitle.textContent = state.lesson.completed ? "今日总结" : exercise.prompt;
  els.learnStepNote.textContent = state.lesson.completed
    ? "可以进入下一天，也可以之后再回来复习。"
    : day.theme ?? "";
  els.learnStage.innerHTML = "";

  if (state.lesson.completed) {
    renderLessonSummary(day);
  } else {
    renderExercise(exercise);
  }

  renderLessonFooter(day);
}

function renderLessonFooter(day) {
  els.prevBtn.style.display = "none";
  els.footerNote.textContent = state.lesson.completed
    ? "Lesson 完成。继续下一天，或之后再回来复习。"
    : state.lesson.checked
      ? state.lesson.isCorrect
        ? "答对了，继续下一题。"
        : "可以修改后再检查。"
      : "完成当前题后点击检查。";
  els.nextBtn.textContent = state.lesson.completed
    ? "进入下一天"
    : state.lesson.checked && state.lesson.isCorrect
      ? "继续"
      : "检查";
}

function handleLessonPrimary() {
  const day = getCurrentDay();

  if (state.lesson.completed) {
    handleNext();
    return;
  }

  const exercise = getCurrentExercise(day);

  if (state.lesson.checked && state.lesson.isCorrect) {
    advanceLesson(day);
    return;
  }

  const result = evaluateExercise(exercise);
  state.lesson.checked = true;
  state.lesson.isCorrect = result;
  render();
}

function advanceLesson(day) {
  if (state.lesson.exerciseIndex >= day.exercises.length - 1) {
    state.lesson.completed = true;
  } else {
    state.lesson.exerciseIndex += 1;
    resetLessonAttempt();
  }

  render();
}

function resetLessonAttempt() {
  state.lesson.checked = false;
  state.lesson.isCorrect = false;
  state.lesson.selectedTokens = [];
  state.lesson.selectedChoices = [];
  state.lesson.selectedPair = null;
  state.lesson.matchedPairs = [];
  state.lesson.textInput = "";
  state.lesson.spoken = false;
}

function renderExercise(exercise) {
  if (exercise.type === "match_pairs") {
    renderMatchPairsExercise(exercise);
    return;
  }

  if (exercise.type === "listen_choose_words") {
    renderListenChooseWordsExercise(exercise);
    return;
  }

  if (exercise.type === "sentence_builder" || exercise.type === "listen_order") {
    renderTokenExercise(exercise);
    return;
  }

  if (exercise.type === "copy_or_type_ru") {
    renderCopyOrTypeExercise(exercise);
    return;
  }

  if (exercise.type === "repeat_after") {
    renderRepeatExercise(exercise);
    return;
  }

  renderUnsupportedExercise(exercise);
}

function renderMatchPairsExercise(exercise) {
  const card = document.createElement("article");
  card.className = "exercise-card";
  const ruOptions = exercise.pairs.map((pair, index) => ({ ...pair, side: "ru", key: `ru-${index}` }));
  const zhOptions = [...exercise.pairs]
    .reverse()
    .map((pair, index) => ({ ...pair, side: "zh", key: `zh-${index}` }));
  card.innerHTML = `
    <p class="exercise-prompt">点一个俄语，再点对应中文。</p>
    <div class="match-board">
      <div class="match-column" data-side="ru"></div>
      <div class="match-column" data-side="zh"></div>
    </div>
  `;

  const ruColumn = card.querySelector('[data-side="ru"]');
  const zhColumn = card.querySelector('[data-side="zh"]');
  ruOptions.forEach((option) => ruColumn.appendChild(createMatchButton(option)));
  zhOptions.forEach((option) => zhColumn.appendChild(createMatchButton(option)));
  appendFeedback(card, exercise);
  els.learnStage.appendChild(card);
}

function createMatchButton(option) {
  const button = document.createElement("button");
  const isMatched = state.lesson.matchedPairs.includes(option.ru);
  const isSelected =
    state.lesson.selectedPair &&
    state.lesson.selectedPair.side === option.side &&
    state.lesson.selectedPair.ru === option.ru;
  button.type = "button";
  button.className = `match-option${isMatched ? " match-option--matched" : ""}${isSelected ? " match-option--selected" : ""}`;
  button.disabled = isMatched;
  button.innerHTML =
    option.side === "ru"
      ? `<strong class="ru-text">${option.ru}</strong><span class="phonetic-text">${option.ipa}</span>`
      : `<strong>${option.zh}</strong>`;
  button.addEventListener("click", () => handleMatchSelect(option));
  return button;
}

function handleMatchSelect(option) {
  if (state.lesson.checked && state.lesson.isCorrect) {
    return;
  }

  const selected = state.lesson.selectedPair;

  if (!selected || selected.side === option.side) {
    state.lesson.selectedPair = option;
    state.lesson.checked = false;
    render();
    return;
  }

  if (selected.ru === option.ru) {
    state.lesson.matchedPairs = [...new Set([...state.lesson.matchedPairs, option.ru])];
  }

  state.lesson.selectedPair = null;
  state.lesson.checked = false;
  render();
}

function renderTokenExercise(exercise) {
  const card = document.createElement("article");
  card.className = "exercise-card";
  const isListening = exercise.type === "listen_order";
  card.innerHTML = `
    <div class="exercise-audio-row">
      ${isListening ? '<button class="listen-btn" data-audio="slow" type="button">慢速</button>' : ""}
      <button class="listen-btn" data-audio="normal" type="button">${isListening ? "正常" : "听"}</button>
    </div>
    <div class="answer-slots">${state.lesson.selectedTokens.map((token) => `<button class="answer-token ru-text" type="button">${token}</button>`).join("") || '<span class="slot-placeholder">点下面词块组成答案</span>'}</div>
    <div class="token-bank"></div>
    <p class="exercise-meaning">${exercise.zh}</p>
    <p class="phonetic-text">${exercise.ipa}</p>
  `;

  card.querySelectorAll("[data-audio]").forEach((button) => {
    button.addEventListener("click", () => {
      speakText(exercise.answer, button.dataset.audio === "slow" ? 0.68 : 0.92);
    });
  });

  card.querySelector(".answer-slots").addEventListener("click", (event) => {
    if (!event.target.classList.contains("answer-token")) {
      return;
    }

    state.lesson.selectedTokens = state.lesson.selectedTokens.slice(0, -1);
    state.lesson.checked = false;
    render();
  });

  const bank = card.querySelector(".token-bank");
  exercise.tokens.forEach((token) => {
    const usedCount = state.lesson.selectedTokens.filter((item) => item === token).length;
    const availableCount = exercise.tokens.filter((item) => item === token).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "token-option ru-text";
    button.textContent = token;
    button.disabled = usedCount >= availableCount;
    button.addEventListener("click", () => {
      state.lesson.selectedTokens.push(token);
      state.lesson.checked = false;
      render();
    });
    bank.appendChild(button);
  });

  appendFeedback(card, exercise);
  els.learnStage.appendChild(card);
}

function renderListenChooseWordsExercise(exercise) {
  const card = document.createElement("article");
  card.className = "exercise-card";
  card.innerHTML = `
    <div class="exercise-audio-row">
      <button class="listen-btn" data-audio="slow" type="button">慢速</button>
      <button class="listen-btn" data-audio="normal" type="button">正常</button>
    </div>
    <p class="exercise-prompt">听整句后，点出真正听到的词。</p>
    <div class="choice-bank"></div>
    <p class="exercise-meaning">${exercise.zh}</p>
    <p class="phonetic-text">${exercise.ipa}</p>
  `;

  card.querySelectorAll("[data-audio]").forEach((button) => {
    button.addEventListener("click", () => {
      speakText(exercise.audioText, button.dataset.audio === "slow" ? 0.68 : 0.92);
    });
  });

  const bank = card.querySelector(".choice-bank");
  exercise.choices.forEach((choice) => {
    const button = document.createElement("button");
    const selected = state.lesson.selectedChoices.includes(choice);
    button.type = "button";
    button.className = `choice-option ru-text${selected ? " choice-option--selected" : ""}`;
    button.textContent = choice;
    button.addEventListener("click", () => {
      toggleChoice(choice);
    });
    bank.appendChild(button);
  });

  appendFeedback(card, exercise);
  els.learnStage.appendChild(card);
}

function toggleChoice(choice) {
  if (state.lesson.checked && state.lesson.isCorrect) {
    return;
  }

  if (state.lesson.selectedChoices.includes(choice)) {
    state.lesson.selectedChoices = state.lesson.selectedChoices.filter((item) => item !== choice);
  } else {
    state.lesson.selectedChoices = [...state.lesson.selectedChoices, choice];
  }

  state.lesson.checked = false;
  render();
}

function renderCopyOrTypeExercise(exercise) {
  const card = document.createElement("article");
  card.className = "exercise-card";
  card.innerHTML = `
    ${exercise.showAnswerBeforeTyping ? `<p class="copy-source ru-text">${exercise.answer}</p>` : ""}
    <p class="exercise-prompt">看着上面的俄语，完整输入一遍。</p>
    <textarea class="type-input" rows="4" placeholder="在这里输入俄语"></textarea>
    <p class="exercise-meaning">${exercise.zh}</p>
    <p class="phonetic-text">${exercise.ipa}</p>
  `;

  const input = card.querySelector(".type-input");
  input.value = state.lesson.textInput;
  input.addEventListener("input", () => {
    state.lesson.textInput = input.value;
    state.lesson.checked = false;
  });

  appendFeedback(card, exercise);
  els.learnStage.appendChild(card);
}

function renderRepeatExercise(exercise) {
  const card = document.createElement("article");
  card.className = "exercise-card";
  card.innerHTML = `
    <p class="voice-target ru-text">${exercise.answer}</p>
    <p class="voice-hint"><span class="phonetic-text">${exercise.ipa}</span> · ${exercise.zh}</p>
    <div class="stage-actions">
      <button class="primary-btn" data-audio="slow" type="button">慢速</button>
      <button class="soft-btn" data-audio="normal" type="button">正常</button>
      <button class="listen-btn" data-repeat="start" type="button">开始跟读</button>
      <button class="ghost-btn" data-repeat="skip" type="button">现在不方便说</button>
    </div>
  `;

  card.querySelector('[data-audio="slow"]').addEventListener("click", () => {
    speakText(exercise.answer, 0.68);
  });
  card.querySelector('[data-audio="normal"]').addEventListener("click", () => {
    speakText(exercise.answer, 0.92);
  });
  card.querySelector('[data-repeat="start"]').addEventListener("click", () => {
    state.lesson.spoken = true;
    state.lesson.checked = true;
    state.lesson.isCorrect = true;
    startRecognition(exercise.answer);
    render();
  });
  card.querySelector('[data-repeat="skip"]').addEventListener("click", () => {
    state.lesson.spoken = true;
    state.lesson.checked = true;
    state.lesson.isCorrect = true;
    render();
  });

  appendFeedback(card, exercise);
  els.learnStage.appendChild(card);
}

function renderUnsupportedExercise(exercise) {
  const card = document.createElement("article");
  card.className = "exercise-card";
  card.innerHTML = `<p>暂不支持题型：${exercise.type}</p>`;
  els.learnStage.appendChild(card);
}

function appendFeedback(card, exercise) {
  if (!state.lesson.checked) {
    return;
  }

  const feedback = document.createElement("div");
  feedback.className = `lesson-feedback${state.lesson.isCorrect ? " lesson-feedback--ok" : " lesson-feedback--retry"}`;
  feedback.innerHTML = `
    <strong>${state.lesson.isCorrect ? "正确" : "再试一次"}</strong>
    <span>Meaning: ${exercise.feedback?.meaning ?? exercise.zh ?? ""}</span>
    <small>${exercise.feedback?.explanation ?? ""}</small>
  `;
  card.appendChild(feedback);
}

function evaluateExercise(exercise) {
  if (exercise.type === "match_pairs") {
    return state.lesson.matchedPairs.length === exercise.pairs.length;
  }

  if (exercise.type === "listen_choose_words") {
    return compareChoiceSets(state.lesson.selectedChoices, exercise.correctTokens);
  }

  if (exercise.type === "sentence_builder" || exercise.type === "listen_order") {
    return normalizeAnswer(state.lesson.selectedTokens.join(" ")) === normalizeAnswer(exercise.answer);
  }

  if (exercise.type === "copy_or_type_ru") {
    return normalizeAnswer(state.lesson.textInput) === normalizeAnswer(exercise.answer);
  }

  if (exercise.type === "repeat_after") {
    return state.lesson.spoken;
  }

  return false;
}

function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function compareChoiceSets(actual, expected) {
  const actualSorted = [...actual].map(normalizeAnswer).sort();
  const expectedSorted = [...expected].map(normalizeAnswer).sort();

  return JSON.stringify(actualSorted) === JSON.stringify(expectedSorted);
}

function renderLessonSummary(day) {
  const card = document.createElement("article");
  card.className = "exercise-card lesson-summary";
  card.innerHTML = `
    <span class="focus-card__label">今日完成</span>
    <strong>${day.theme ?? day.title}</strong>
    <p>完成 ${day.exercises.length} 道题。今天的重点是：</p>
    <div class="summary-list">
      <span>认识 А / О</span>
      <span>听懂 Это Анна.</span>
      <span>完成单词和整句跟读</span>
    </div>
  `;
  els.learnStage.appendChild(card);
}

function renderHeader() {
  const day = getCurrentDay();
  const isCycleDay = day.cycleDay === 12;
  const cycleText = `周期 ${day.cycleNumber} · 第 ${day.cycleDay} 天`;
  const unitText = day.title.replace(`${day.cycleLabel} · `, "");

  els.cycleTitle.textContent = cycleText;
  els.unitTitle.textContent = unitText;
  els.dayBadge.textContent = String(day.cycleDay);
  els.progressLabel.textContent = state.progress.page === "learn" ? "学习页" : "复习检查";
  els.progressNote.textContent =
    state.progress.page === "learn"
      ? isCycleDay
        ? "今天把本轮前 11 天内容整体再过一遍。"
        : `当前在 ${getCurrentLearnStep().title}`
      : isCycleDay
        ? "这是本轮整轮复盘；未确认默认未记住。"
        : "逐项确认是否记住；未确认默认未记住。";
}

function renderStepDots() {
  els.stepDots.innerHTML = "";

  learnSteps.forEach((step, index) => {
    const button = document.createElement("button");
    const isDone = index < state.progress.learnStepIndex || state.progress.page === "review";
    const isActive = state.progress.page === "learn" && index === state.progress.learnStepIndex;
    button.type = "button";
    button.className = `step-dot${isDone ? " step-dot--done" : ""}${isActive ? " step-dot--active" : ""}`;
    button.innerHTML = `<span>part${index + 1}</span><small>${step.short}</small>`;
    button.addEventListener("click", () => {
      state.progress.page = "learn";
      state.progress.learnStepIndex = index;
      saveProgress();
      render();
    });
    els.stepDots.appendChild(button);
  });
}

function renderTabs() {
  const isLearn = state.progress.page === "learn";
  els.tabLearn.classList.toggle("is-active", isLearn);
  els.tabReview.classList.toggle("is-active", !isLearn);
  els.learnPanel.classList.toggle("is-active", isLearn);
  els.reviewPanel.classList.toggle("is-active", !isLearn);
}

function renderLearnPage() {
  const day = getCurrentDay();
  const step = getCurrentLearnStep();

  els.learnStepLabel.textContent = `part${state.progress.learnStepIndex + 1}`;
  els.learnStepTitle.textContent = step.title;
  els.learnStepNote.textContent = day.stepNotes[state.progress.learnStepIndex];
  els.learnStage.innerHTML = "";

  if (step.key === "foundation") {
    renderFoundation(day);
    return;
  }

  if (step.key === "scene") {
    renderScene(day);
    return;
  }

  renderVoice(day);
}

function clampIndex(index, max) {
  if (max <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), max - 1);
}

function getUiIndex(bucket, key, max) {
  const store = state.ui[bucket];
  const current = clampIndex(store[key] ?? 0, max);
  store[key] = current;
  return current;
}

function setUiIndex(bucket, key, index, max) {
  state.ui[bucket][key] = clampIndex(index, max);
  render();
}

function createChipRow(items, index, onSelect, getLabel) {
  const row = document.createElement("div");
  row.className = "focus-chip-row";

  items.forEach((item, itemIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `focus-chip${itemIndex === index ? " focus-chip--active" : ""}`;
    button.textContent = getLabel(item, itemIndex);
    button.addEventListener("click", () => onSelect(itemIndex));
    row.appendChild(button);
  });

  return row;
}

function createPager(items, index, onSelect, getLabel, renderCard, options = {}) {
  const wrapper = document.createElement("section");
  wrapper.className = "focus-stack";
  const { showNav = true } = options;

  if (items.length > 1) {
    wrapper.appendChild(createChipRow(items, index, onSelect, getLabel));
  }

  const viewport = document.createElement("div");
  viewport.className = "focus-viewport";
  viewport.appendChild(renderCard(items[index], index));
  wrapper.appendChild(viewport);

  if (showNav && items.length > 1) {
    const nav = document.createElement("div");
    nav.className = "focus-nav";

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "soft-btn";
    prev.textContent = "上一项";
    prev.disabled = index === 0;
    prev.addEventListener("click", () => onSelect(index - 1));

    const status = document.createElement("span");
    status.className = "focus-nav__status";
    status.textContent = `${index + 1} / ${items.length}`;

    const next = document.createElement("button");
    next.type = "button";
    next.className = "primary-btn";
    next.textContent = "下一项";
    next.disabled = index === items.length - 1;
    next.addEventListener("click", () => onSelect(index + 1));

    nav.append(prev, status, next);
    wrapper.appendChild(nav);
  }

  return wrapper;
}

function createFoundationCard(item) {
  const card = document.createElement("article");
  card.className = "focus-card learn-card";
  card.innerHTML = `
    <span class="focus-card__label">场景基础</span>
    <strong class="learn-card__title ru-text">${item.ru}</strong>
    <div class="learn-card__meta"><span class="phonetic-text">${item.ipa}</span> · ${item.zh}</div>
    <p class="learn-card__note">
      <span class="learn-card__usage">part2 会用到</span>
      <span class="ru-text">${item.exampleRu}</span>
    </p>
    <div class="focus-card__translation">
      <span class="phonetic-text">${item.exampleIpa}</span>
      <span>${item.exampleZh}</span>
    </div>
    <button class="listen-btn" type="button">听</button>
  `;
  card.querySelector("button").addEventListener("click", () => {
    speakText(item.exampleRu, 0.78);
  });
  return card;
}

function buildSceneItems(day) {
  return [
    ...day.scene.words.map((word, index) => ({
      key: `word-${index}`,
      label: `单词 ${index + 1}`,
      kind: "单词",
      ru: word.ru,
      ipa: word.ipa,
      zh: word.zh,
      speakText: word.ru,
    })),
    ...getScenePhrases(day).map((phrase, index) => ({
      key: `phrase-${index}`,
      label: index === 0 ? "整句" : `整句 ${index + 1}`,
      kind: "整句",
      ru: phrase.ru,
      ipa: phrase.ipa,
      zh: phrase.zh,
      speakText: phrase.ru,
    })),
  ];
}

function createSceneCard(item) {
  const card = document.createElement("article");
  card.className = "focus-card learn-card";
  card.innerHTML = `
    <span class="focus-card__label">${item.kind}</span>
    <strong class="learn-card__title ru-text">${item.ru}</strong>
    <div class="focus-card__translation">
      <span class="phonetic-text">${item.ipa}</span>
      <span>${item.zh}</span>
    </div>
    <button class="listen-btn" type="button">听</button>
  `;
  card.querySelector("button").addEventListener("click", () => {
    speakText(item.speakText, 0.82);
  });
  return card;
}

function createCycleSectionIntro(section, countLabel) {
  const intro = document.createElement("article");
  intro.className = "section-intro";
  intro.innerHTML = `
    <span class="section-intro__label">复盘分组</span>
    <strong>第 ${section.day} 天 · ${section.title}</strong>
    <span>${countLabel}</span>
  `;
  return intro;
}

function renderFoundation(day) {
  if (day.cycleSections) {
    renderCycleFoundation(day);
    return;
  }

  const key = String(day.day);
  const index = getUiIndex("foundationIndex", key, day.foundation.length);
  const pager = createPager(
    day.foundation,
    index,
    (nextIndex) => setUiIndex("foundationIndex", key, nextIndex, day.foundation.length),
    (_, itemIndex) => `核心 ${itemIndex + 1}`,
    (item) => createFoundationCard(item),
    { showNav: false },
  );
  els.learnStage.appendChild(pager);
}

function renderScene(day) {
  if (day.cycleSections) {
    renderCycleScene(day);
    return;
  }

  const items = buildSceneItems(day);
  const key = String(day.day);
  const index = getUiIndex("sceneIndex", key, items.length);
  const pager = createPager(
    items,
    index,
    (nextIndex) => setUiIndex("sceneIndex", key, nextIndex, items.length),
    (item) => item.label,
    (item) => createSceneCard(item),
    { showNav: false },
  );
  els.learnStage.appendChild(pager);
}

function renderCycleFoundation(day) {
  const sectionKey = String(day.day);
  const sectionIndex = getUiIndex(
    "cycleFoundationSection",
    sectionKey,
    day.cycleSections.length,
  );
  const section = day.cycleSections[sectionIndex];
  const itemKey = `${day.day}-${section.day}`;
  const itemIndex = getUiIndex(
    "cycleFoundationItem",
    itemKey,
    section.foundation.length,
  );
  const wrapper = document.createElement("div");
  wrapper.className = "cycle-focus";
  wrapper.appendChild(
    createChipRow(
      day.cycleSections,
      sectionIndex,
      (nextIndex) =>
        setUiIndex(
          "cycleFoundationSection",
          sectionKey,
          nextIndex,
          day.cycleSections.length,
        ),
      (item) => `第 ${item.day} 天`,
    ),
  );
  wrapper.appendChild(
    createCycleSectionIntro(section, `${section.foundation.length} 个基础词块`),
  );
  wrapper.appendChild(
    createPager(
      section.foundation,
      itemIndex,
      (nextIndex) =>
        setUiIndex(
          "cycleFoundationItem",
          itemKey,
          nextIndex,
          section.foundation.length,
      ),
      (_, index) => `核心 ${index + 1}`,
      (item) => createFoundationCard(item),
      { showNav: false },
    ),
  );
  els.learnStage.appendChild(wrapper);
}

function renderCycleScene(day) {
  const sectionKey = String(day.day);
  const sectionIndex = getUiIndex("cycleSceneSection", sectionKey, day.cycleSections.length);
  const section = day.cycleSections[sectionIndex];
  const items = [
    ...section.words.map((word, index) => ({
      key: `word-${section.day}-${index}`,
      label: `单词 ${index + 1}`,
      kind: "单词",
      ru: word.ru,
      ipa: word.ipa,
      zh: word.zh,
      speakText: word.ru,
    })),
    ...section.phrases.map((phrase, index) => ({
      key: `phrase-${section.day}-${index}`,
      label: index === 0 ? "整句" : `整句 ${index + 1}`,
      kind: "整句",
      ru: phrase.ru,
      ipa: phrase.ipa,
      zh: phrase.zh,
      speakText: phrase.ru,
    })),
  ];
  const itemKey = `${day.day}-${section.day}`;
  const itemIndex = getUiIndex("cycleSceneItem", itemKey, items.length);
  const wrapper = document.createElement("div");
  wrapper.className = "cycle-focus";
  wrapper.appendChild(
    createChipRow(
      day.cycleSections,
      sectionIndex,
      (nextIndex) =>
        setUiIndex("cycleSceneSection", sectionKey, nextIndex, day.cycleSections.length),
      (item) => `第 ${item.day} 天`,
    ),
  );
  wrapper.appendChild(createCycleSectionIntro(section, `${items.length} 项场景内容`));
  wrapper.appendChild(
    createPager(
      items,
      itemIndex,
      (nextIndex) => setUiIndex("cycleSceneItem", itemKey, nextIndex, items.length),
      (item) => item.label,
      (item) => createSceneCard(item),
      { showNav: false },
    ),
  );
  els.learnStage.appendChild(wrapper);
}

function renderVoice(day) {
  const targets = getVoiceTargets(day);
  const selectedTarget = getSelectedVoiceTarget(day);
  const card = document.createElement("article");
  card.className = "voice-box";
  const selector = targets
    .map((target) => {
      const active = target.key === selectedTarget.key;
      return `<button class="voice-target-chip${active ? " voice-target-chip--active" : ""}" data-voice-target="${target.key}" type="button">${target.label}</button>`;
    })
    .join("");
  card.innerHTML = `
    <div class="voice-target-switch">${selector}</div>
    <p class="voice-target ru-text">${selectedTarget.ru}</p>
    <p class="voice-hint"><span class="phonetic-text">${selectedTarget.ipa}</span> · ${selectedTarget.zh}</p>
    <div class="stage-actions">
      <button class="primary-btn" id="voice-slow" type="button">慢速</button>
      <button class="soft-btn" id="voice-normal" type="button">正常</button>
      <button class="listen-btn" id="voice-start" type="button">开始跟读</button>
    </div>
    <div class="feedback-grid">
      <div class="feedback-card">
        <span>总分</span>
        <strong>${state.voiceResult.scoreText}</strong>
      </div>
      <div class="feedback-card">
        <span>识别</span>
        <strong>${state.voiceResult.recognizedText}</strong>
      </div>
      <div class="feedback-card">
        <span>反馈</span>
        <strong>${state.voiceResult.feedback}</strong>
      </div>
      <div class="feedback-card">
        <span>状态</span>
        <strong>${state.voiceResult.status}</strong>
      </div>
    </div>
    <div class="word-hit-list" id="voice-word-list"></div>
  `;

  card.querySelectorAll("[data-voice-target]").forEach((button) => {
    button.addEventListener("click", () => {
      selectVoiceTarget(day.day, button.dataset.voiceTarget);
    });
  });

  card.querySelector("#voice-slow").addEventListener("click", () => {
    speakText(selectedTarget.ru, 0.68);
  });

  card.querySelector("#voice-normal").addEventListener("click", () => {
    speakText(selectedTarget.ru, 0.92);
  });

  card.querySelector("#voice-start").addEventListener("click", () => {
    startRecognition(selectedTarget.ru);
  });

  const list = card.querySelector("#voice-word-list");
  renderVoiceWordHits(list, state.voiceResult.wordHits);
  els.learnStage.appendChild(card);
}

function renderReviewPage() {
  const day = getCurrentDay();
  els.reviewTitle.textContent =
    day.cycleDay === 12
      ? `周期 ${day.cycleNumber} · 整轮复习检查`
      : `周期 ${day.cycleNumber} · 第 ${day.cycleDay} 天复习检查`;
  els.reviewNote.textContent = "每一项都确认一次；如果没点确认，就默认还没记住。";
  els.reviewList.innerHTML = "";

  if (day.cycleSections) {
    renderCycleReview(day);
    return;
  }

  const key = String(day.day);
  const index = getUiIndex("reviewIndex", key, day.review.length);
  const pager = createPager(
    day.review,
    index,
    (nextIndex) => setUiIndex("reviewIndex", key, nextIndex, day.review.length),
    (item) => item.label,
    (item, itemIndex) => createReviewCard(day.day, item, `${day.day}-${itemIndex}`),
  );
  els.reviewList.appendChild(pager);
}

function renderCycleReview(day) {
  const sections = [
    ...day.cycleSections.map((section) => ({
      key: `day-${section.day}`,
      day: section.day,
      title: section.title,
      countLabel: `${section.review.length} 项复习`,
      reviewItems: section.review.map((item, itemIndex) => ({
        item,
        rememberKey: `${day.day}-cycle-${section.day}-${itemIndex}`,
      })),
    })),
    {
      key: "final",
      day: 12,
      title: "整轮复盘",
      countLabel: "最后 1 项整合复习",
      reviewItems: [
        {
          item: {
            label: "整轮复盘",
            prompt: "这一轮结束后，把整合句完整读一遍。",
            answerRu: "Я из Китая и немного говорю по-русски.",
            answerIpa: "[ya iz kee-TA-ya i ni-MNO-ga ga-va-RYOO pa-ROOS-kee]",
          },
          rememberKey: `${day.day}-cycle-final`,
        },
      ],
    },
  ];
  const sectionKey = String(day.day);
  const sectionIndex = getUiIndex("cycleReviewSection", sectionKey, sections.length);
  const section = sections[sectionIndex];
  const itemKey = `${day.day}-${section.key}`;
  const itemIndex = getUiIndex("cycleReviewItem", itemKey, section.reviewItems.length);

  const wrapper = document.createElement("div");
  wrapper.className = "cycle-focus";
  wrapper.appendChild(
    createChipRow(
      sections,
      sectionIndex,
      (nextIndex) => setUiIndex("cycleReviewSection", sectionKey, nextIndex, sections.length),
      (item) => (item.key === "final" ? "整轮" : `第 ${item.day} 天`),
    ),
  );
  wrapper.appendChild(createCycleSectionIntro(section, section.countLabel));
  wrapper.appendChild(
    createPager(
      section.reviewItems,
      itemIndex,
      (nextIndex) =>
        setUiIndex("cycleReviewItem", itemKey, nextIndex, section.reviewItems.length),
      (entry) => entry.item.label,
      (entry) => createReviewCard(day.day, entry.item, entry.rememberKey),
    ),
  );
  els.reviewList.appendChild(wrapper);
}

function createReviewCard(dayNumber, item, rememberKey) {
  const remembered = state.progress.reviewRemembered[rememberKey] ?? null;
  const statusText =
    remembered === true
      ? "已确认：记住了"
      : remembered === false
        ? "已确认：还没记住"
        : "未确认，默认未记住";
  const card = document.createElement("article");
  card.className = `focus-card review-card${item.label === "整轮复盘" ? " review-card--final" : ""}`;
  card.innerHTML = `
    <span class="review-card__label">${item.label}</span>
    <p class="review-card__prompt">${item.prompt}</p>
    <div class="review-answer">
      <span class="ru-text">${item.answerRu}</span>
      <span class="phonetic-text">${item.answerIpa}</span>
    </div>
    <div class="review-check">
      <span class="review-status${remembered === true ? " review-status--yes" : remembered === false ? " review-status--no" : ""}">${statusText}</span>
      <button class="answer-btn" data-review="yes" type="button">记住了</button>
      <button class="ghost-btn" data-review="no" type="button">还没记住</button>
    </div>
  `;

  card.querySelector('[data-review="yes"]').addEventListener("click", () => {
    state.progress.reviewRemembered[rememberKey] = true;
    saveProgress();
    renderReviewPage();
  });

  card.querySelector('[data-review="no"]').addEventListener("click", () => {
    state.progress.reviewRemembered[rememberKey] = false;
    saveProgress();
    renderReviewPage();
  });

  return card;
}

function renderFooter() {
  const lastDay = state.progress.dayIndex === days.length - 1;
  const day = getCurrentDay();
  const isCycleDay = day.cycleDay === 12;
  els.prevBtn.style.display = "";
  els.prevBtn.disabled = state.progress.dayIndex === 0;
  els.nextBtn.textContent = lastDay ? "回到第一天" : "下一天";
  els.footerNote.textContent =
    state.progress.page === "learn"
      ? lastDay
        ? "全年最后一天；点回到第一天可重新开始。"
        : isCycleDay
          ? "这是本轮复盘；点下一天进入下一轮。"
        : "底部只切换整天；当天请点上面的 part1 / part2 / part3。"
      : lastDay
        ? "全年复盘完成后，可回到第一天重新开始。"
        : isCycleDay
          ? "本轮复习完成后，点下一天进入下一轮。"
          : "复习页里不确认就默认未记住。";
}

function handlePrev() {
  if (state.progress.dayIndex === 0) {
    return;
  }

  state.progress.dayIndex -= 1;
  state.progress.page = "learn";
  state.progress.learnStepIndex = 0;
  resetVoiceSelection();
  resetVoiceFeedback();
  state.lesson = createInitialLessonState();
  saveProgress();
  render();
}

function handleNext() {
  if (state.progress.dayIndex < days.length - 1) {
    state.progress.dayIndex += 1;
  } else {
    state.progress.dayIndex = 0;
  }

  state.progress.page = "learn";
  state.progress.learnStepIndex = 0;
  state.lesson = createInitialLessonState();
  resetVoiceSelection();
  resetVoiceFeedback();
  saveProgress();
  render();
}

function getVoiceTargets(day) {
  const phrases = getScenePhrases(day);

  return [
    ...day.scene.words.map((word, index) => ({
      key: `word-${index}`,
      label: `单词 ${index + 1}`,
      ru: word.ru,
      ipa: word.ipa,
      zh: word.zh,
    })),
    ...phrases.map((phrase, index) => ({
      key: `phrase-${index}`,
      label: phrases.length === 1 ? "整句" : `整句 ${index + 1}`,
      ru: phrase.ru,
      ipa: phrase.ipa,
      zh: phrase.zh,
    })),
  ];
}

function getScenePhrases(day) {
  if (Array.isArray(day.scene.phrases) && day.scene.phrases.length) {
    return day.scene.phrases;
  }

  return [day.scene.phrase];
}

function ensureVoiceSelectionForCurrentDay() {
  const day = getCurrentDay();

  if (state.voiceSelection.day === day.day) {
    return;
  }

  resetVoiceSelection();
}

function resetVoiceSelection() {
  const day = getCurrentDay();
  state.voiceSelection = {
    day: day.day,
    targetKey: "phrase-0",
  };
}

function getSelectedVoiceTarget(day) {
  const targets = getVoiceTargets(day);
  return (
    targets.find((target) => target.key === state.voiceSelection.targetKey) ??
    targets.at(-1)
  );
}

function selectVoiceTarget(dayNumber, targetKey) {
  state.voiceSelection = {
    day: dayNumber,
    targetKey,
  };
  resetVoiceFeedback();
  render();
}

function ensureVoiceResultForCurrentDay() {
  const day = getCurrentDay();

  if (state.voiceResult.day === day.day) {
    return;
  }

  resetVoiceFeedback();
}

function resetVoiceFeedback() {
  const day = getCurrentDay();
  const target = getSelectedVoiceTarget(day);
  state.voiceResult = {
    day: day.day,
    scoreText: "等待开始",
    recognizedText: "等待开始",
    feedback: `先听慢速，再读${state.voiceSelection.targetKey.startsWith("phrase") ? "整句" : "单词"}`,
    status: "准备中",
    wordHits: [],
    targetLabel: target.label,
  };
}

function initVoices() {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    state.russianVoice =
      voices.find((voice) => voice.lang.toLowerCase().startsWith("ru")) ?? null;
  };

  pickVoice();
  window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
}

function speakText(text, rate) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ru-RU";
  utterance.rate = rate;

  if (state.russianVoice) {
    utterance.voice = state.russianVoice;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function startRecognition(targetText) {
  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  if (!Recognition) {
    state.voiceResult = {
      day: getCurrentDay().day,
      scoreText: "不可用",
      recognizedText: "浏览器不支持",
      feedback: "当前设备没有跟读识别能力",
      status: "可先听慢速和正常语音",
      wordHits: [],
      targetLabel: getSelectedVoiceTarget(getCurrentDay()).label,
    };
    render();
    return;
  }

  if (state.recognition) {
    state.recognition.abort();
  }

  const recognition = new Recognition();
  state.recognition = recognition;
  recognition.lang = "ru-RU";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  state.voiceResult = {
    day: getCurrentDay().day,
    scoreText: "识别中",
    recognizedText: "请开始读",
    feedback: `读完整${state.voiceSelection.targetKey.startsWith("phrase") ? "句" : "词"}`,
    status: "正在听",
    wordHits: [],
    targetLabel: getSelectedVoiceTarget(getCurrentDay()).label,
  };
  render();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    const evaluation = evaluateVoiceAttempt(transcript, targetText);
    state.voiceResult = {
      day: getCurrentDay().day,
      scoreText: `${evaluation.score} 分`,
      recognizedText: transcript || "未识别到",
      feedback: evaluation.feedback,
      status: evaluation.status,
      wordHits: evaluation.wordHits,
      targetLabel: getSelectedVoiceTarget(getCurrentDay()).label,
    };
    render();
  };

  recognition.onerror = () => {
    state.voiceResult = {
      day: getCurrentDay().day,
      scoreText: "0 分",
      recognizedText: "未识别到",
      feedback: "再读一遍",
      status: "没有听清",
      wordHits: [],
      targetLabel: getSelectedVoiceTarget(getCurrentDay()).label,
    };
    render();
  };

  recognition.start();
}

function renderVoiceWordHits(container, wordHits) {
  container.innerHTML = "";

  if (!wordHits.length) {
    const placeholder = document.createElement("span");
    placeholder.className = "word-hit-chip";
    placeholder.textContent = "等待识别";
    container.appendChild(placeholder);
    return;
  }

  wordHits.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = `word-hit-chip word-hit-chip--${item.level}`;
    chip.textContent = item.target;
    container.appendChild(chip);
  });
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeText(text) {
  return normalizeText(text)
    .split(" ")
    .filter(Boolean);
}

function evaluateVoiceAttempt(transcript, targetText) {
  const normalizedTranscript = normalizeText(transcript);
  const normalizedTarget = normalizeText(targetText);
  const charScore = similarityScore(normalizedTranscript, normalizedTarget);
  const wordHits = buildWordHits(
    tokenizeText(normalizedTranscript),
    tokenizeText(normalizedTarget),
  );
  const wordCoverage = wordHits.length
    ? Math.round(
        wordHits.reduce((sum, item) => sum + item.score, 0) / wordHits.length,
      )
    : 0;
  const score = Math.round(charScore * 0.6 + wordCoverage * 0.4);

  return {
    score,
    wordHits,
    feedback: score >= 85 ? "已经比较顺了" : "再慢一点，先模仿重音",
    status: `${score} 分 · ${wordHits.filter((item) => item.level === "good").length}/${wordHits.length} 个词较稳`,
  };
}

function buildWordHits(spokenWords, targetWords) {
  return targetWords.map((targetWord, index) => {
    const candidates = [
      spokenWords[index - 1] ?? "",
      spokenWords[index] ?? "",
      spokenWords[index + 1] ?? "",
    ];
    const bestScore = candidates.reduce((max, candidate) => {
      return Math.max(max, similarityScore(candidate, targetWord));
    }, 0);

    return {
      target: targetWord,
      score: bestScore,
      level: bestScore >= 85 ? "good" : bestScore >= 60 ? "mid" : "low",
    };
  });
}

function similarityScore(a, b) {
  if (!a || !b) {
    return 0;
  }

  const distance = levenshtein(a, b);
  const maxLength = Math.max(a.length, b.length);
  return Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
}

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    dp[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    dp[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
}
