export function initTelegramUI() {
  const tg = window.Telegram?.WebApp;
  if (!tg || typeof tg.initData !== "string") return { inTelegram: false };

  tg.ready();
  tg.expand();

  return {
    inTelegram: true,
    tg,
    user: tg.initDataUnsafe?.user ?? null,
    colorScheme: tg.colorScheme ?? null, // "dark" | "light" (может быть null)
  };
}

export function setTelegramColors(isDark) {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  try {
    tg.setHeaderColor(isDark ? "#0f1115" : "#f5f7fb");
    tg.setBackgroundColor(isDark ? "#0f1115" : "#f5f7fb");
  } catch (_) {}
}
