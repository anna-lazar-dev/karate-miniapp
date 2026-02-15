const THEME_KEY = "karate_theme";
const STATS_KEY = "karate_trainer_stats_v1";

export function getSavedTheme() {
  return localStorage.getItem(THEME_KEY);
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function getStats() {
  return JSON.parse(localStorage.getItem(STATS_KEY) ?? "{}");
}

export function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function updateStats({ correct, questions, lastMode, lastTopic }) {
  const prev = getStats();
  const next = {
    attempts: (prev.attempts ?? 0) + 1,
    correct: (prev.correct ?? 0) + correct,
    questions: (prev.questions ?? 0) + questions,
    lastMode,
    lastTopic
  };
  saveStats(next);
  return next;
}

const FAV_KEY = "karate_favorites_v1";

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveFavorites(favSet) {
  const arr = Array.from(favSet);
  localStorage.setItem(FAV_KEY, JSON.stringify(arr));
}

export function termKey(term) {
  // достаточно стабильно: jp + topic
  return `${term.jp}__${term.topic ?? ""}`;
}
