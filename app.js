import { loadTerms, uniqueTopics, prettyTopic } from "./js/utils.js";
import { getSavedTheme, saveTheme } from "./js/storage.js";
import { initTelegramUI, setTelegramColors } from "./js/telegram.js";
import { initQuiz } from "./js/quiz.js";
import { initDictionary } from "./js/dictionary.js";
import { initDojokun } from "./js/dojokun.js";

function setTheme(theme, themeToggleEl) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  if (themeToggleEl) themeToggleEl.textContent = isDark ? "☀" : "🌙";
  saveTheme(theme);
  setTelegramColors(isDark);
}

function showScreen(screen, els) {
  const menu = els.menuCard();
  if (menu) menu.hidden = screen !== "menu";
  if (els.quizCard) els.quizCard.hidden = screen !== "quiz";
  if (els.resultCard) els.resultCard.hidden = screen !== "result";
  if (els.dictionaryCard) els.dictionaryCard.hidden = screen !== "dictionary";
  if (els.dojokunCard) els.dojokunCard.hidden = screen !== "dojokun";
}

(async function main() {
  const tgInfo = initTelegramUI();

  const els = {
    menuCard: () => document.querySelectorAll(".card")[0],

    // quiz/menu controls
    modeJpRu: document.getElementById("modeJpRu"),
    modeRuJp: document.getElementById("modeRuJp"),
    topicSelect: document.getElementById("topicSelect"),
    countSelect: document.getElementById("countSelect"),
    startBtn: document.getElementById("startBtn"),

    quizCard: document.getElementById("quizCard"),
    resultCard: document.getElementById("resultCard"),

    qIndex: document.getElementById("qIndex"),
    qTotal: document.getElementById("qTotal"),
    score: document.getElementById("score"),
    prompt: document.getElementById("prompt"),
    answers: document.getElementById("answers"),

    quitBtn: document.getElementById("quitBtn"),
    retryBtn: document.getElementById("retryBtn"),
    backBtn: document.getElementById("backBtn"),

    finalCorrect: document.getElementById("finalCorrect"),
    finalTotal: document.getElementById("finalTotal"),
    mistakesBox: document.getElementById("mistakesBox"),
    mistakesList: document.getElementById("mistakesList"),

    // telegram badge
    tgBadge: document.getElementById("tgBadge"),
    tgUser: document.getElementById("tgUser"),

    // theme
    themeToggle: document.getElementById("themeToggle"),

    // dojokun
    dojokunBtn: document.getElementById("dojokunBtn"),
    dojokunCard: document.getElementById("dojokunCard"),
    closeDojokunBtn: document.getElementById("closeDojokunBtn"),
    closeDojokunBtn2: document.getElementById("closeDojokunBtn2"),
    dojokunTitle: document.getElementById("dojokunTitle"),
    dojokunList: document.getElementById("dojokunList"),
    dojokunFooter: document.getElementById("dojokunFooter"),

    dictFilterAll: document.getElementById("dictFilterAll"),
    dictFilterFav: document.getElementById("dictFilterFav"),

    // dictionary
    dictionaryBtn: document.getElementById("dictionaryBtn"),
    dictionaryCard: document.getElementById("dictionaryCard"),
    closeDictionaryBtn: document.getElementById("closeDictionaryBtn"),
    closeDictionaryBtn2: document.getElementById("closeDictionaryBtn2"),
    dictionaryList: document.getElementById("dictionaryList"),
    searchInput: document.getElementById("searchInput"),
    dictTopicSelect: document.getElementById("dictTopicSelect"),
  };

  // Guard: required elements
  const required = ["topicSelect", "countSelect", "startBtn", "quizCard", "resultCard"];
  for (const k of required) {
    if (!els[k]) throw new Error(`Не найден элемент #${k}. Проверь index.html`);
  }

  // Theme init: saved -> Telegram -> system
  const saved = getSavedTheme();
  if (saved) setTheme(saved, els.themeToggle);
  else if (tgInfo.colorScheme) setTheme(tgInfo.colorScheme, els.themeToggle);
  else {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    setTheme(prefersDark ? "dark" : "light", els.themeToggle);
  }

  if (els.themeToggle) {
    els.themeToggle.addEventListener("click", () => {
      const current = document.body.classList.contains("dark") ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark", els.themeToggle);
    });
  }

  // Telegram badge
  if (tgInfo.inTelegram && tgInfo.user && els.tgBadge && els.tgUser) {
    els.tgBadge.hidden = false;
    els.tgUser.textContent = `@${tgInfo.user.username ?? "user"} • ${tgInfo.user.first_name ?? ""}`.trim();
  }

  // Load data
  const terms = await loadTerms();

  // Fill quiz topics dropdown
  els.topicSelect.innerHTML = "";
  uniqueTopics(terms).forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = prettyTopic(t);
    els.topicSelect.appendChild(opt);
  });

  // Navigation handler
  const onNavigate = (screen) => showScreen(screen, els);
  onNavigate("menu");

  // Init modules
  initQuiz({ terms, ui: els, onNavigate });
  initDictionary({ terms, ui: els, onNavigate });
  initDojokun({ ui: els, onNavigate });
})();
