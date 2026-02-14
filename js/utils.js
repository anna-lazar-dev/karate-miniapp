export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRandom(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

export function uniqueTopics(terms) {
  const set = new Set(terms.map(t => t.topic));
  return ["all", ...Array.from(set).sort()];
}

export function prettyTopic(topic) {
  const map = {
    all: "Все темы",
    dojo: "Додзё и этикет",
    dachi: "Стойки (dachi)",
    tsuki: "Удары руками (tsuki)",
    uke: "Блоки (uke)",
    geri: "Удары ногами (geri)",
    count: "Счёт",
    direction: "Стороны и направления"
  };
  return map[topic] ?? topic;
}

export async function loadTerms() {
  const res = await fetch("./data/terms.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Не удалось загрузить data/terms.json");
  const data = await res.json();
  return data.filter(t => t.jp && t.ru);
}
