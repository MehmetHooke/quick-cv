// hooks/useThemePackPurchase.ts
import { THEME_PACK_PRODUCT_ID } from "@/constants/iap";
import { usePremium } from "@/context/PremiumContext";
import { auth, db } from "@/firebaseConfig";
import { logEvent } from "app/utils/analytics";
import { useIAP } from "expo-iap";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function useThemePackPurchase() {
  const { refresh } = usePremium();
  const [loading, setLoading] = useState(false);

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    // Satın alma başarılı olduğunda çağrılır
    onPurchaseSuccess: async (purchase) => {
      try {
        logEvent("purchase_success_iap", { platform: Platform.OS });

        const user = auth.currentUser;
        if (!user) {
          Alert.alert(
            "Giriş gerekli",
            "Satın alma tamamlandı ama kullanıcı oturumu bulunamadı."
          );
          return;
        }

        const ref = doc(db, "users", user.uid, "entitlements", "main");
        const monthKey = getCurrentMonthKey();

        await updateDoc(ref, {
          themePack: true,
          purchasedAt: serverTimestamp(),
          pdfLimit: 50,
          pdfUsageMonthKey: monthKey,
          pdfUsageCount: 0,
          updatedAt: serverTimestamp(),
        });

        await refresh();

        await finishTransaction({
          purchase,
          isConsumable: false, // tek seferlik ürün
        });

        Alert.alert(
          "Başarılı 🎉",
          "Tema Paketin ve PDF limitin başarıyla aktifleştirildi."
        );
      } catch (error) {
        console.error("onPurchaseSuccess error:", error);
        Alert.alert(
          "Hata",
          "Satın alma tamamlandı ama Premium hakları tanımlanırken bir hata oluştu."
        );
      }
    },
    onPurchaseError: (error) => {
      console.error("purchase failed:", error);
      Alert.alert(
        "Satın alma iptal",
        "Satın alma işlemi iptal edildi veya başarısız oldu."
      );
    },
  });

  // Mağazaya bağlandıktan sonra ürün bilgisini çek
  useEffect(() => {
    if (connected) {
      fetchProducts({
        skus: [THEME_PACK_PRODUCT_ID],
        type: "in-app",
      });
    }
  }, [connected, fetchProducts]);

  const buyThemePack = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Giriş gerekli", "Premium satın almak için önce giriş yapmalısın.");
      return;
    }

    if (!connected) {
      Alert.alert(
        "Bağlantı yok",
        "Mağazaya bağlanılamadı. İnternetini kontrol edip tekrar dene."
      );
      return;
    }

    if (!products.length) {
      Alert.alert(
        "Ürün bulunamadı",
        "Premium ürün bilgisi henüz yüklenmedi. Biraz sonra tekrar dene."
      );
      return;
    }

    try {
      setLoading(true);
      logEvent("purchase_attempt_iap");

      const purchaseArgs = {
        request: {
          ios: {
            sku: THEME_PACK_PRODUCT_ID,
          },
          android: {
            skus: [THEME_PACK_PRODUCT_ID],
          },
        },
      } as const;

      // TS burada union tip yüzünden kafayı yiyor, o yüzden küçük bir cast ile susturuyoruz
      await requestPurchase(purchaseArgs as any);
      // Devamını onPurchaseSuccess halledecek


      // Devamını onPurchaseSuccess halledecek
    } catch (error) {
      console.error("requestPurchase error:", error);
      Alert.alert(
        "Hata",
        "Satın alma başlatılırken bir hata oluştu. Lütfen tekrar dene."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    connected,
    products,
    buyThemePack,
  };
}
