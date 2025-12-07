import { db } from "@/firebaseConfig";
import { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export async function createUserDocIfNotExists(user: User) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // ---------- 🟦 displayName'i parçala ----------
  const displayName = user.displayName || "";
  const nameParts = displayName.trim().split(" ");

  const firstName = nameParts.length > 0 ? nameParts[0] : null;
  const lastName =
    nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  // =====================================================
  // 1) Kullanıcı zaten varsa → eksik alanları tamamla
  // =====================================================
  if (snap.exists()) {
    const data = snap.data() || {};
    const updates: any = {};

    // İlk kayıt sırasında olmayan ad-soyad alanlarını doldur
    if (!data.firstName && firstName) updates.firstName = firstName;
    if (!data.lastName && lastName) updates.lastName = lastName;

    // Google profil fotoğrafı varsa ve kayıtlı değilse ekle
    if (!data.photoURL && user.photoURL)
      updates.photoURL = user.photoURL;

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp();
      await updateDoc(userRef, updates);
    }

    return;
  }

  // =====================================================
  // 2) Kullanıcı dokümanı yok → Yeni kullanıcı oluştur
  // =====================================================
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email ?? null,

    // 👇 Yeni eklenen alanlar:
    firstName,
    lastName,

    // Profil bilgileri
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    provider: user.providerData[0]?.providerId ?? "google",

    // QuickCV alanları
    premium: false,
    plan: "free",

    // PDF limit sistemi
    pdfLimit: 10, // aylık total
    usedPdfThisMonth: 0,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
