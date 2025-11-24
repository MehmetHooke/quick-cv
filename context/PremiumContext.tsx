// context/PremiumContext.tsx
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

type PremiumState = {
  loading: boolean;
  isPremium: boolean;
  pdfLimit: number;
  refresh: () => Promise<void>;
};

const PremiumContext = createContext<PremiumState | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [pdfLimit, setPdfLimit] = useState(10);

  const loadEntitlements = async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsPremium(false);
      setPdfLimit(10);
      setLoading(false);
      return;
    }

    try {
      const ref = doc(db, "users", user.uid, "entitlements", "main");
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // Yeni kullanıcı → entitlements oluştur
        await setDoc(ref, {
          themePack: false,
          purchasedAt: null,
          pdfLimit: 10,
          lastPdfReset: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setIsPremium(false);
        setPdfLimit(10);
      } else {
        const data = snap.data();
        setIsPremium(data.themePack === true);
        setPdfLimit(typeof data.pdfLimit === "number" ? data.pdfLimit : 10);
      }
    } catch (err) {
      console.error("Entitlements yüklenirken hata:", err);
      setIsPremium(false);
      setPdfLimit(10);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(() => {
      loadEntitlements();
    });
    return () => unsub();
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        loading,
        isPremium,
        pdfLimit,
        refresh: loadEntitlements,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
};
