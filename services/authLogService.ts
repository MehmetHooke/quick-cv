// services/authLogService.ts
import { db } from "@/firebaseConfig";
import Constants from "expo-constants";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Platform } from "react-native";

export async function logAuthEvent(
  step: string,
  data: Record<string, any> = {}
) {
  try {
    await addDoc(collection(db, "authLogs"), {
      step,                  // Hangi aşamada olduğumuzu gösterir
      data,                  // Detaylı payload
      platform: Platform.OS, // ios / android
      version: Constants.expoConfig?.version ?? null,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.log("🔥 Auth log yazılamadı:", error);
  }
}
