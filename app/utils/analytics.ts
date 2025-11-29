// utils/analytics.ts
// Şimdilik gerçek Firebase Analytics kullanmıyoruz.
// Bu fonksiyonlar sadece console.log yazar, app'i bozmadan çalışır.

export async function logEvent(
  name: string,
  params?: Record<string, any>
) {
  try {
    console.log("[Analytics] logEvent:", name, params ?? {});
  } catch (e) {
    console.log("Analytics log hata (stub):", e);
  }
}

export async function setUserId(userId: string | null) {
  try {
    console.log("[Analytics] setUserId:", userId);
  } catch (e) {
    console.log("Analytics setUserId hata (stub):", e);
  }
}

export async function setUserProperty(name: string, value: string) {
  try {
    console.log("[Analytics] setUserProperty:", name, value);
  } catch (e) {
    console.log("Analytics setUserProperty hata (stub):", e);
  }
}
