// app/paywall.tsx
import { Ionicons } from "@expo/vector-icons";
import { logEvent } from "app/utils/analytics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { usePremium } from "@/context/PremiumContext";
import { useTheme } from "@/context/ThemeContext";
import { auth, db } from "@/firebaseConfig";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

// 🔹 Ay anahtarı (PremiumContext ile tutarlı)
const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export default function PaywallScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { refresh } = usePremium();

  const [loading, setLoading] = useState(false);

      setLoading(true);
      useEffect(() => {
  logEvent("paywall_opened");
}, []);

  const handleFakePurchase = async () => {
    logEvent("purchase_attempt");
    const user = auth.currentUser;
    if (!user) {
      alert("Premium satın almak için önce giriş yapmalısın.");
      return;
    }

    try {

      const ref = doc(db, "users", user.uid, "entitlements", "main");
      const monthKey = getCurrentMonthKey();

      await updateDoc(ref, {
        themePack: true,
        purchasedAt: serverTimestamp(),
        pdfLimit: 50, // 🔹 Premium aylık PDF limiti
        pdfUsageMonthKey: monthKey,
        pdfUsageCount: 0,
        updatedAt: serverTimestamp(),
      });

      await refresh(); // PremiumContext'i güncelle

      alert("Tema Paketin ve genişletilmiş PDF hakkın başarıyla aktifleştirildi 🎉");
      logEvent("purchase_success");
      router.back();
    } catch (err) {
      console.error("Fake purchase error:", err);
      alert("Satın alma işlemi sırasında bir hata oluştu. Lütfen tekrar dene.");
      logEvent("purchase_failed", { reason: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={theme.bgImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(15,23,42,0.65)", // hafif karartma
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 24,
        }}
      >
        {/* Üst kısım: Geri butonu */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              backgroundColor: "rgba(15,23,42,0.7)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#e5e7eb",
              fontSize: 18,
              fontWeight: "600",
              marginLeft: 8,
            }}
          >
            Geri
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}
        >
          {/* Ana kart */}
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 24,
              padding: 20,
              backgroundColor: "#0f172aee",
              borderWidth: 1,
              borderColor: "rgba(148,163,184,0.6)",
            }}
          >
            {/* Premium rozet + başlık */}
            <View
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: "#fbbf24",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="star" size={14} color="#1f2937" />
              <Text
                style={{
                  color: "#1f2937",
                  fontWeight: "700",
                  fontSize: 12,
                  marginLeft: 4,
                }}
              >
                QUICKCV PREMIUM
              </Text>
            </View>

            <Text
              style={{
                color: "#e5e7eb",
                fontSize: 24,
                fontWeight: "800",
                marginBottom: 6,
              }}
            >
              Tema Paketi + Geniş PDF Limiti
            </Text>

            <Text
              style={{
                color: "#9ca3af",
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              Tüm premium CV temalarının kilidini aç, ayda daha fazla PDF oluştur ve
              başvurularında öne çıkan, profesyonel tasarımlarla fark yarat.
            </Text>

            {/* Fiyat bölümü */}
{/* Fiyat Bölümü */}
<View style={{ marginTop: 20, alignItems: "center" }}>

  {/* Üst açıklama */}
  <Text
    style={{
      color: "#9ca3af",
      fontSize: 13,
      marginBottom: 6,
    }}
  >
    Lansmana Özel Fiyat
  </Text>

  {/* Eski fiyat + yeni fiyat satırı */}
  <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
    {/* Eski fiyat */}
    <Text
      style={{
        color: "#ef4444",
        fontSize: 22,
        fontWeight: "700",
        textDecorationLine: "line-through",
        marginRight: 10,
        opacity: 0.8,
      }}
    >
      199₺
    </Text>

    {/* Yeni fiyat */}
    <Text
      style={{
        color: "#ffffff",
        fontSize: 36,
        fontWeight: "800",
      }}
    >
      139₺
    </Text>
  </View>

  {/* Alt açıklama */}
  <Text
    style={{
      color: "#9ca3af",
      marginTop: 4,
      fontSize: 12,
    }}
  >
    Ömür boyu erişim
  </Text>
</View>


            {/* Avantaj listesi */}
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  color: "#e5e7eb",
                  fontWeight: "700",
                  fontSize: 15,
                  marginBottom: 8,
                }}
              >
                Neler Dahil?
              </Text>

              {[
                "Tüm premium CV temalarının kilidini aç (Teal Wave, Aurora Split, Amber Ribbon ve daha fazlası)",
                "Ücretsiz 10 PDF yerine, ayda 50 PDF oluşturma hakkı",
                "Profesyonel, işe alımcı dostu tasarımlar",
                "Gelecekte eklenecek yeni premium temalara erişim",
                "Tek cihaz değil, hesabınla giriş yaptığın her cihazda Premium",
              ].map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#22c55e"
                    style={{ marginTop: 2, marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "#d1d5db",
                      fontSize: 13,
                      flex: 1,
                    }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            {/* Limit karşılaştırma kutusu */}
            <View
              style={{
                borderRadius: 16,
                padding: 12,
                backgroundColor: "rgba(15,23,42,0.9)",
                borderWidth: 1,
                borderColor: "rgba(75,85,99,0.9)",
                marginBottom: 18,
              }}
            >
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                  marginBottom: 6,
                  fontWeight: "600",
                }}
              >
                PDF Limit Karşılaştırması
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: "#9ca3af", fontSize: 13 }}>Ücretsiz Plan</Text>
                <Text style={{ color: "#f97316", fontSize: 13, fontWeight: "700" }}>
                  Aylık 10 PDF
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "#9ca3af", fontSize: 13 }}>Tema Paketi</Text>
                <Text style={{ color: "#22c55e", fontSize: 13, fontWeight: "700" }}>
                  Aylık 50 PDF
                </Text>
              </View>
            </View>

            {/* Bilgilendirme notu (fake purchase için istersen debug dönemi notu ekleyebilirsin) */}
            <Text
              style={{
                color: "#6b7280",
                fontSize: 11,
                marginBottom: 16,
              }}
            >
              Şu anki sürümde satın alma işlemi test amaçlıdır ve Google Play faturalandırma
              entegrasyonu tamamlandığında gerçek ödeme akışı devreye alınacaktır.
            </Text>

            {/* Satın alma butonu */}
            <TouchableOpacity
              disabled={loading}
              onPress={handleFakePurchase}
              style={{
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: loading ? "#22c55eaa" : "#22c55e",
                flexDirection: "row",
                marginBottom: 10,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#f9fafb" />
              ) : (
                <>
                  <Text
                    style={{
                      color: "#f9fafb",
                      fontWeight: "700",
                      fontSize: 15,
                      marginRight: 6,
                    }}
                  >
                    139₺ – Tema Paketini Aktifleştir
                  </Text>
                  <Ionicons name="lock-open" size={18} color="#f9fafb" />
                </>
              )}
            </TouchableOpacity>

            {/* Daha sonra bakacağım butonu */}
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={loading}
              style={{
                borderRadius: 999,
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#4b5563",
              }}
            >
              <Text
                style={{
                  color: "#d1d5db",
                  fontWeight: "500",
                  fontSize: 13,
                }}
              >
                Şimdilik Atla
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
