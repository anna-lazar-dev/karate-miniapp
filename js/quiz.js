import { pickRandom, shuffle } from "./utils.js";
import { updateStats, getStats } from "./storage.js";

function termToPrompt(term, mode) {
  return mode === "jp_ru" ? term.jp : term.ru;
}
function termToCorrectAnswer(term, mode) {
  return mode === "jp_ru" ? term.ru : term.jp;
}
function termToDistractor(term, mode) {
  return mode === "jp_ru" ? term.ru : term.jp;
}

export function initQuiz({ terms, ui, onNavigate }) {
  let mode = "jp_ru";
  let currentTopic = "all";
  let quiz = [];
  let idx = 0;
  let score = 0;
  let locked = false;
  let mistakes = [];

  function setMode(newMode) {
    mode = newMode;
    ui.modeJpRu.classList.toggle("active", mode === "jp_ru");
    ui.modeRuJp.classList.toggle("active", mode === "ru_jp");
  }

  function filteredTerms() {
    if (currentTopic === "all") return terms;
    return terms.filter(t => t.topic === currentTopic);
  }

  function buildQuestion(term, pool) {
    const correct = termToCorrectAnswer(term, mode);
    const distractors = shuffle(
      pool.map(t => termToDistractor(t, mode)).filter(a => a && a !== correct)
    );
    const options = shuffle([correct, ...distractors.slice(0, 3)]);
    return { term, correct, options };
  }

  function renderQuestion() {
    const q = quiz[idx];
    locked = false;

    ui.qIndex.textContent = String(idx + 1);
    ui.qTotal.textContent = String(quiz.length);
    ui.score.textContent = String(score);

    ui.prompt.textContent = termToPrompt(q.term, mode);
    ui.answers.innerHTML = "";

    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "answer";
      btn.type = "button";
      btn.textContent = opt;
      btn.addEventListener("click", () => onAnswer(btn, opt));
      ui.answers.appendChild(btn);
    });
  }

  function onAnswer(btn, chosen) {
    if (locked) return;
    locked = true;

    const q = quiz[idx];
    const isCorrect = chosen === q.correct;

    [...ui.answers.children].forEach(b => {
      if (b.textContent === q.correct) b.classList.add("correct");
    });
    if (!isCorrect) btn.classList.add("wrong");

    if (isCorrect) {
      score += 1;
      ui.score.textContent = String(score);
    } else {
      mistakes.push({
        prompt: termToPrompt(q.term, mode),
        correct: q.correct,
        chosen
      });
    }

    setTimeout(() => {
      idx += 1;
      if (idx >= quiz.length) finishQuiz();
      else renderQuestion();
    }, 650);
  }

  function finishQuiz() {
    ui.finalCorrect.textContent = String(score);
    ui.finalTotal.textContent = String(quiz.length);

    if (mistakes.length > 0) {
      ui.mistakesBox.hidden = false;
      ui.mistakesList.innerHTML = "";
      mistakes.slice(0, 50).forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.prompt} → правильно: ${m.correct} (выбрано: ${m.chosen})`;
        ui.mistakesList.appendChild(li);
      });
    } else {
      ui.mistakesBox.hidden = true;
      ui.mistakesList.innerHTML = "";
    }

    updateStats({
      correct: score,
      questions: quiz.length,
      lastMode: mode,
      lastTopic: currentTopic
    });

    onNavigate("result");
  }

  function startQuiz() {
    const pool = filteredTerms();
    const count = Number(ui.countSelect.value);

    if (pool.length < 4) {
      alert("Для квиза нужно минимум 4 термина в выбранной теме 🙏");
      return;
    }

    const picked = pickRandom(pool, count);
    quiz = picked.map(term => buildQuestion(term, pool));
    idx = 0;
    score = 0;
    mistakes = [];

    onNavigate("quiz");
    renderQuestion();
  }

  function initFromStorage() {
    const s = getStats();
    if (s.lastTopic && [...ui.topicSelect.options].some(o => o.value === s.lastTopic)) {
      ui.topicSelect.value = s.lastTopic;
      currentTopic = s.lastTopic;
    }
    if (s.lastMode) setMode(s.lastMode);
    else setMode(mode);
  }

  // events
  ui.modeJpRu.addEventListener("click", () => setMode("jp_ru"));
  ui.modeRuJp.addEventListener("click", () => setMode("ru_jp"));

  ui.topicSelect.addEventListener("change", () => {
    currentTopic = ui.topicSelect.value;
  });

  ui.startBtn.addEventListener("click", startQuiz);
  ui.retryBtn.addEventListener("click", startQuiz);
  ui.quitBtn.addEventListener("click", () => onNavigate("menu"));
  ui.backBtn.addEventListener("click", () => onNavigate("menu"));

  initFromStorage();

  return { startQuiz };
}
