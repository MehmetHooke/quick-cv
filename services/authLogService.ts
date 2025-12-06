// services/authLogService.ts
import { db } from "@/firebaseConfig";
import Constants from "expo-constants";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Platform } from "react-native";

type AuthLogLevel = "info" | "warn" | "error";

export async function logAuthEvent(
  level: AuthLogLevel,
  source: string,
  payload: Record<string, any>
) {
  try {
    await addDoc(collection(db, "authLogs"), {
      level,
      source,                 // "google_response", "google_signIn_error" vs.
      payload,
      platform: Platform.OS,  // "android" | "ios"
      appVersion: Constants.expoConfig?.version ?? null,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.log("Auth log yazılamadı:", e);
  }
}
