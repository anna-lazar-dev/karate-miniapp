// js/dictionary.js
import { uniqueTopics, prettyTopic } from "./utils.js";

export function initDictionary({ terms, ui, onNavigate }) {
  // если словаря нет в HTML — просто выходим без ошибок
  if (!ui?.dictionaryBtn || !ui?.dictionaryCard) return;

  function fillTopics() {
    if (!ui.dictTopicSelect) return;

    ui.dictTopicSelect.innerHTML = "";
    uniqueTopics(terms).forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = prettyTopic(t);
      ui.dictTopicSelect.appendChild(opt);
    });
    ui.dictTopicSelect.value = "all";
  }

  function render() {
    if (!ui.dictionaryList) return;

    const q = (ui.searchInput?.value ?? "").trim().toLowerCase();
    const topic = ui.dictTopicSelect?.value ?? "all";

    const items = terms
      .filter(t => topic === "all" || t.topic === topic)
      .filter(t => {
        if (!q) return true;
        return (t.jp ?? "").toLowerCase().includes(q)
          || (t.ru ?? "").toLowerCase().includes(q)
          || (t.ja ?? "").includes(q); // иероглифы
      })
      .sort((a, b) => (a.jp ?? "").localeCompare(b.jp ?? "", "ru"));

    ui.dictionaryList.innerHTML = "";

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "dict-item";
      empty.textContent = "Ничего не найдено.";
      ui.dictionaryList.appendChild(empty);
      return;
    }

    items.forEach(term => {
      const div = document.createElement("div");
      div.className = "dict-item";
      div.innerHTML = `
        <div class="dict-topline">
          <div class="dict-romaji">${term.jp}</div>
          ${term.ja ? `<div class="dict-ja">${term.ja}</div>` : ""}
        </div>
        <div class="dict-ru">${term.ru}</div>
        <div class="dict-meta">${prettyTopic(term.topic)} • lvl ${term.level ?? 1}</div>
      `;
      ui.dictionaryList.appendChild(div);
    });
  }

  function open() {
    if (ui.searchInput) ui.searchInput.value = "";
    if (ui.dictTopicSelect) ui.dictTopicSelect.value = "all";
    render();
    onNavigate("dictionary");
  }

  function close() {
    onNavigate("menu");
  }

  // events
  ui.dictionaryBtn.addEventListener("click", open);
  ui.closeDictionaryBtn?.addEventListener("click", close);
  ui.closeDictionaryBtn2?.addEventListener("click", close);
  ui.searchInput?.addEventListener("input", render);
  ui.dictTopicSelect?.addEventListener("change", render);

  fillTopics();
}
