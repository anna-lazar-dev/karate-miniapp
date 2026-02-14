// js/dojokun.js

export async function initDojokun({ ui, onNavigate }) {
  if (!ui?.dojokunBtn || !ui?.dojokunCard) return;

  let data = null;

  async function load() {
    const res = await fetch("./data/dojokun.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Не удалось загрузить dojokun.json");
    data = await res.json();
  }

  function render() {
    if (!data || !ui.dojokunList) return;

    ui.dojokunTitle.textContent = data.title?.ru ?? "Додзё-кун";

    ui.dojokunList.innerHTML = "";

    (data.lines ?? []).forEach(item => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="dk-ja">${item.ja ?? ""}</div>
        <div class="dk-romaji">${item.romaji ?? ""}</div>
        <div class="dk-ru">${item.ru ?? ""}</div>
      `;

      ui.dojokunList.appendChild(li);
    });

    if (ui.dojokunFooter) {
      ui.dojokunFooter.textContent = data.footer?.ru ?? "";
    }
  }

  async function open() {
    if (!data) await load();
    render();
    onNavigate("dojokun");
  }

  function close() {
    onNavigate("menu");
  }

  // events
  ui.dojokunBtn.addEventListener("click", open);
  ui.closeDojokunBtn?.addEventListener("click", close);
  ui.closeDojokunBtn2?.addEventListener("click", close);
}
