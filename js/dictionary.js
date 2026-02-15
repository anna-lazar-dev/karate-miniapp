// js/dictionary.js
import { uniqueTopics, prettyTopic } from "./utils.js";
import { loadFavorites, saveFavorites, termKey } from "./storage.js";

export function initDictionary({ terms, ui, onNavigate }) {
  // required UI for dictionary
  if (!ui?.dictionaryBtn || !ui?.dictionaryCard) return;

  // optional UI inside dictionary screen
  const closeBtn = ui.closeDictionaryBtn;
  const backBtn = ui.closeDictionaryBtn2;
  const listEl = ui.dictionaryList;
  const searchEl = ui.searchInput;
  const topicEl = ui.dictTopicSelect;

  const filterAllBtn = ui.dictFilterAll;
  const filterFavBtn = ui.dictFilterFav;

  let fav = loadFavorites();         // Set<string>
  let filterMode = "all";            // "all" | "fav"

  function fillTopics() {
    if (!topicEl) return;
    topicEl.innerHTML = "";

    uniqueTopics(terms).forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = prettyTopic(t);
      topicEl.appendChild(opt);
    });

    topicEl.value = "all";
  }

  function setFilter(mode) {
    filterMode = mode;

    if (filterAllBtn && filterFavBtn) {
      filterAllBtn.classList.toggle("active", filterMode === "all");
      filterFavBtn.classList.toggle("active", filterMode === "fav");
    }

    render();
  }

  function show() {
  fav = loadFavorites();

  if (searchEl) searchEl.value = "";
  if (topicEl) topicEl.value = "all";

  filterMode = "all";
  if (filterAllBtn && filterFavBtn) {
    filterAllBtn.classList.add("active");
    filterFavBtn.classList.remove("active");
  }

  onNavigate("dictionary");
  render();
}

  function hide() {
    onNavigate("menu");
  }

  function matchesSearch(t, q) {
    if (!q) return true;
    const qq = q.toLowerCase();
    return (
      (t.jp ?? "").toLowerCase().includes(qq) ||
      (t.ru ?? "").toLowerCase().includes(qq) ||
      (t.ja ?? "").toLowerCase().includes(qq)
    );
  }

  function render() {
    if (!listEl) return;

    const q = (searchEl?.value ?? "").trim();
    const topic = topicEl?.value ?? "all";

    let items = terms
      .filter(t => (topic === "all" ? true : t.topic === topic))
      .filter(t => matchesSearch(t, q));

    if (filterMode === "fav") {
      items = items.filter(t => fav.has(termKey(t)));
    }

    items.sort((a, b) => (a.jp ?? "").localeCompare(b.jp ?? "", "ru"));

    listEl.innerHTML = "";

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "dict-item";
      empty.textContent = filterMode === "fav" ? "В избранном пока пусто ⭐" : "Ничего не найдено.";
      listEl.appendChild(empty);
      return;
    }

    items.forEach(term => {
      const row = document.createElement("div");
      row.className = "dict-item dict-row";

      const left = document.createElement("div");

      // top line: romaji + kanji (if present)
      const jaPart = term.ja ? `<div class="dict-ja">${term.ja}</div>` : "";
      left.innerHTML = `
        <div class="dict-topline">
          <div class="dict-romaji">${term.jp ?? ""}</div>
          ${jaPart}
        </div>
        <div class="dict-ru">${term.ru ?? ""}</div>
        <div class="dict-meta">${prettyTopic(term.topic)} • lvl ${term.level ?? 1}</div>
      `;

      const star = document.createElement("button");
      star.type = "button";
      star.className = "star-btn";
      star.setAttribute("aria-label", "В избранное");

      const key = termKey(term);
      const isFav = fav.has(key);
      star.classList.toggle("active", isFav);
      star.textContent = isFav ? "⭐" : "☆";

      star.addEventListener("click", () => {
        if (fav.has(key)) fav.delete(key);
        else fav.add(key);

        saveFavorites(fav);

        const nowFav = fav.has(key);
        star.classList.toggle("active", nowFav);
        star.textContent = nowFav ? "⭐" : "☆";

        // if viewing favorites, removing should hide the item
        if (filterMode === "fav" && !nowFav) render();
      });

      row.appendChild(left);
      row.appendChild(star);
      listEl.appendChild(row);
    });
  }

  // --- wire events ---
  ui.dictionaryBtn.addEventListener("click", show);
  closeBtn?.addEventListener("click", hide);
  backBtn?.addEventListener("click", hide);

  searchEl?.addEventListener("input", render);
  topicEl?.addEventListener("change", render);

  filterAllBtn?.addEventListener("click", () => setFilter("all"));
  filterFavBtn?.addEventListener("click", () => setFilter("fav"));

  // initial setup
  fillTopics();
}
