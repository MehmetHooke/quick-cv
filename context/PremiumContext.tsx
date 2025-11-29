// context/PremiumContext.tsx
import { auth, db } from "@/firebaseConfig";
import { logEvent, setUserProperty } from "app/utils/analytics";

import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type PremiumState = {
  loading: boolean;
  isPremium: boolean;
  pdfLimit: number;
  pdfUsageCount: number;
  refresh: () => Promise<void>;
  registerPdfCreated: () => Promise<void>;
};

const PremiumContext = createContext<PremiumState | undefined>(undefined);

type PremiumProviderProps = {
  children: ReactNode;
};

const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`; // örn: "2025-11"
};

export const PremiumProvider = ({ children }: PremiumProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [pdfLimit, setPdfLimit] = useState(10);
  const [pdfUsageCount, setPdfUsageCount] = useState(0);

  const loadEntitlements = async () => {
    const user = auth.currentUser;

    if (!user) {
      setIsPremium(false);
      setPdfLimit(10);
      setPdfUsageCount(0);
      setLoading(false);
      return;
    }

    try {
      const ref = doc(db, "users", user.uid, "entitlements", "main");
      const snap = await getDoc(ref);

      const currentMonthKey = getCurrentMonthKey();

      if (!snap.exists()) {
        // Yeni kullanıcı → entitlements oluştur
        await setDoc(ref, {
          themePack: false,
          purchasedAt: null,
          pdfLimit: 10, // free başlangıç
          pdfUsageMonthKey: currentMonthKey,
          pdfUsageCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setIsPremium(false);
        setPdfLimit(10);
        setPdfUsageCount(0);
      } else {
        const data = snap.data();



        const themePack = data.themePack === true;
        // 🔹 Limit tamamen themePack'e göre belirlensin
        const limit = themePack ? 50 : 10;

        // İstersen Firestore'daki pdfLimit alanını da normalize edebiliriz:
        if (data.pdfLimit !== limit) {
          await updateDoc(ref, {
            pdfLimit: limit,
            updatedAt: serverTimestamp(),
          });
        }

        let usageCount =
          typeof data.pdfUsageCount === "number" ? data.pdfUsageCount : 0;
        const monthKey =
          typeof data.pdfUsageMonthKey === "string"
            ? data.pdfUsageMonthKey
            : currentMonthKey;

        // Ay değişmişse usage resetle
        if (monthKey !== currentMonthKey) {
          await updateDoc(ref, {
            pdfUsageMonthKey: currentMonthKey,
            pdfUsageCount: 0,
            updatedAt: serverTimestamp(),
          });
          usageCount = 0;
        }

        setIsPremium(themePack);
        setPdfLimit(limit);
        setPdfUsageCount(usageCount);
      }
    } catch (err) {
      console.error("Entitlements yüklenirken hata:", err);
      setIsPremium(false);
      setPdfLimit(10);
      setPdfUsageCount(0);
    } finally {
      setLoading(false);
    }
  };

  // PDF başarıyla oluşturulduğunda çağırılacak
  const registerPdfCreated = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const ref = doc(db, "users", user.uid, "entitlements", "main");
      const currentMonthKey = getCurrentMonthKey();

      setPdfUsageCount((prev) => prev + 1);

      await updateDoc(ref, {
        pdfUsageMonthKey: currentMonthKey,
        pdfUsageCount: increment(1),
        updatedAt: serverTimestamp(),
      });

            // 🔹 Analytics event: her PDF'de logla
      logEvent("pdf_generated", {
        plan_type: isPremium ? "premium" : "free",
      });
    } catch (err) {
      console.error("PDF usage artırılırken hata:", err);
    }

    
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(() => {
      loadEntitlements();
    });

    return () => unsub();
  }, []);
    // 🔹 Analytics: premium bilgilerini user property olarak yaz
useEffect(() => {
  if (loading) return;

  setUserProperty("plan_type", isPremium ? "premium" : "free");
  setUserProperty("pdf_limit", String(pdfLimit ?? ""));
  setUserProperty("pdf_usage_count", String(pdfUsageCount ?? ""));
}, [loading, isPremium, pdfLimit, pdfUsageCount]);
  return (
    <PremiumContext.Provider
      value={{
        loading,
        isPremium,
        pdfLimit,
        pdfUsageCount,
        refresh: loadEntitlements,
        registerPdfCreated,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error("usePremium must be used within PremiumProvider");
  }
  return ctx;
};
