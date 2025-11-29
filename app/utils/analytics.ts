// utils/analytics.ts
import * as Analytics from "expo-firebase-analytics";

// Küçük guard: fonksiyon var mı?
function canUseAnalytics() {
  // Expo Go / web / yanlış ortamda bazen native modül hazır olmuyor
  // __DEV__'de gerçek analytics'e gitmek istemiyorsan burada dev'i de kapatabilirsin
  // if (__DEV__) return false;
  // Şimdilik sadece fonksiyon var mı diye bakalım:
  // @ts-ignore
  return typeof Analytics.logEvent === "function";
}

export async function logEvent(
  name: string,
  params?: Record<string, any>
) {
  try {
    if (!canUseAnalytics()) return;

    if (params === undefined) {
      await Analytics.logEvent(name);
    } else {
      await Analytics.logEvent(name, params);
    }
  } catch (e) {
    console.log("Analytics log hata:", e);
  }
}

export async function setUserId(userId: string | null) {
  try {
    if (!canUseAnalytics()) return;
    await Analytics.setUserId(userId);
  } catch (e) {
    console.log("Analytics setUserId hata:", e);
  }
}

export async function setUserProperty(name: string, value?: string) {
  try {
    if (!canUseAnalytics()) return;
    if (value === undefined || value === null) return;

    const props: Record<string, string> = {};
    props[name] = value;

    await Analytics.setUserProperties(props);
  } catch (e) {
    console.log("Analytics setUserProperty hata:", e);
  }
}
