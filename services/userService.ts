import { db } from "@/firebaseConfig";
import { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export async function createUserDocIfNotExists(user: User) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    // Kullanıcı zaten varsa hiçbir şey yapma
    return;
  }

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    provider: user.providerData[0]?.providerId ?? "google",

    // 🔥 QuickCV özel alanları
    premium: false,
    plan: "free",

    // PDF limit sistemi
    pdfLimit: 10,          // aylık toplam hakkı
    usedPdfThisMonth: 0,   // şu ana kadar kullanılan

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
