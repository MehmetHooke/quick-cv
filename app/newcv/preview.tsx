// app/newcv/preview.tsx
import { useCV } from "@/context/CVContext";
import { usePremium } from "@/context/PremiumContext";
import { useTheme } from "@/context/ThemeContext";
import { auth, db } from "@/firebaseConfig";
import { logEvent } from "app/utils/analytics";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,

  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { renderPdf, type Theme } from "@/app/lib/renderClient";
import { useAppAlert } from "@/components/common/AppAlertProvider";
import PreviewCV from "@/components/cvThemes/PreviewCV";
import * as Sharing from "expo-sharing";

const A4_RATIO = 210 / 297;

const ENDPOINT = process.env.EXPO_PUBLIC_SERVER_ENDPOINT;
const API_KEY = process.env.EXPO_PUBLIC_SERVER_API_KEY;

const LOADING_MESSAGES = [
  "Bilgilerinizi sayfaya yerleştiriyoruz...",
  "Başlıkları hizalıyoruz, satır sonlarını düzeltiyoruz...",
  "Fotoğrafınızı en iyi köşeye yerleştiriyoruz...",
  "Renk paletini parlatıyoruz, tasarımı cilalıyoruz...",
  "Son kontroller yapılıyor, CV'niz hazır olmak üzere...",
];

// 🔹 Bir sonraki ayın 1'ini hesapla (örn: 01.12.2025)
const getNextResetDateString = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const d = String(nextMonth.getDate()).padStart(2, "0");
  const m = String(nextMonth.getMonth() + 1).padStart(2, "0");
  const y = nextMonth.getFullYear();
  return `${d}.${m}.${y}`;
};

export default function PreviewScreen() {
  const router = useRouter();
  const { cvData } = useCV();
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const { theme } = useTheme();
  const { alert, confirm } = useAppAlert();
  const {
    isPremium,
    pdfLimit,
    pdfUsageCount,
    registerPdfCreated,
  } = usePremium();

  const [premiumLimitModalVisible, setPremiumLimitModalVisible] =
    useState(false);
  const nextResetDate = getNextResetDateString();

  // 🔁 PDF oluşturma sırasında mesaj + progress simülasyonu
  useEffect(() => {
    if (!generating) return;

    setMessageIndex(0);
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1000);

    const progInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 3;
      });
    }, 200);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [generating]);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("Uyarı", "Giriş yapılmadı. Lütfen oturum açın.");
          router.push("/(tabs)");
          return;
        }
        if (!cvData?.id) {
          alert(
            "Hata",
            "CV kimliği bulunamadı. Lütfen yeniden deneyin."
          );
          router.push("/(tabs)");
          return;
        }

        const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setCv(snapshot.data());
        } else {
          alert("Hata", "CV verisi bulunamadı.");
        }
      } catch (error) {
        console.error("CV çekme hatası:", error);
        alert("Hata", "CV verisi alınırken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, []);

  const handleGeneratePDF = async () => {
    if (!cv || generating) return;

    // 🔍 Debug için istersen şunu aç:
    // console.log("PDF limit check:", { isPremium, pdfLimit, pdfUsageCount });

    // 🔹 1) Önce PDF limit kontrolü
    if (pdfUsageCount >= pdfLimit) {
      if (isPremium) {
        // Premium kullanıcı → özel limit doldu ekranı
        setPremiumLimitModalVisible(true);
        console.log("PREVIEW LIMIT CHECK:", {
          isPremium,
          pdfLimit,
          pdfUsageCount,
        });

      } else {
        // Ücretsiz kullanıcı → Tema Paketine yönlendiren uyarı
        confirm({
          title: "PDF Limitine Ulaştın",
          message:
            "Bu ayki ücretsiz PDF hakkını doldurdun. Tema Paketini satın alarak hem tüm premium temaların hem de genişletilmiş PDF limitinin kilidini açabilirsin.",
          variant: "warning",
          cancelText: "Vazgeç",
          confirmText: "Tema Paketini Gör",
          onConfirm: () => router.push("/paywall"),
          dismissible: false,
        });
      }
      return;
    }

    // 🔹 Yeni işlem için progress'i sıfırla
    setProgress(0);
    setGenerating(true);

    try {
      const theme = (cv.theme ?? "classic") as Theme;

      const serverData = {
        personalInfo: {
          ...cv.personalInfo,
          title: cv.personalInfo?.headline ?? cv.personalInfo?.title ?? "",
          city: cv.personalInfo?.city ?? cv.personalInfo?.location ?? "",
        },
        education: cv.education ?? [],
        experiences: cv.experiences ?? [],
        certificates: cv.certificates ?? [],
        skills: cv.skills ?? [],
        languages: cv.languages ?? [],
        about: cv.about ?? "",
      };

      if (!ENDPOINT || !API_KEY) {
        throw new Error(
          "EXPO_PUBLIC_SERVER_ENDPOINT veya EXPO_PUBLIC_SERVER_API_KEY tanımlı değil"
        );
      }

      const fileUri = await renderPdf({
        endpoint: ENDPOINT,
        apiKey: API_KEY,
        data: serverData,
        theme,
      });

      // ✅ İş başarılıysa usage counter'ı artır
      await registerPdfCreated();

      setProgress(100);
      setCompleted(true);
      //- analytics log event
      await logEvent("pdf_generated", {
        theme: cvData.theme,
        is_premium_user: isPremium,
      });
      //---
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "PDF Paylaş",
        });
      } else {
        alert("PDF Hazır", fileUri);
      }
    } catch (e: any) {
      console.error("Render error:", e);
      if (e.message === "ERR_401") {
        alert("Hata", "Uygulama anahtarı geçersiz.");
      } else if (e.name === "AbortError") {
       alert("Zaman Aşımı", "Sunucu yanıt vermedi (30 sn).");
      } else {
        alert("Hata", `Render başarısız: ${e?.message ?? e}`);
      }
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
        setCompleted(false);
      }, 900);
    }
  };

  const renderCV = () => {
    if (!cv) return null;
    return <PreviewCV data={cv} />;
  };

  if (loading) {
    return (
      <ImageBackground
        source={theme.bgImage}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="flex-1 items-center justify-center ">
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text
            style={{ color: theme.colors.text }}
            className=" mt-3 text-2xl"
          >
            Yükleniyor...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={theme.bgImage}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1 bg-current px-5 py-6 mt-6">
        <Text
          style={{ color: theme.colors.primary }}
          className="text-3xl font-bold text-center mb-4"
        >
          Bilgi Önizleme
        </Text>

        {/* A4 oranlı tek sayfa önizleme alanı */}
        <View
          style={{
            width: "100%",
            aspectRatio: A4_RATIO,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {renderCV()}
        </View>

        {/* Alt butonlar */}
        <View className="flex-col items-center  justify-between mt-6">
          <TouchableOpacity
            disabled={generating}
            className={` self-center px-12 py-4 rounded-full ${generating ? "bg-cyan-400" : "bg-cyan-600"
              }`}
            onPress={handleGeneratePDF}
          >
            <Text className="text-white font-semibold">
              {generating ? "Hazırlanıyor..." : "Pdf Oluştur & Paylaş"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={
              "self-center mt-10  px-12 py-4 rounded-full bg-cyan-600 "
            }
            onPress={() => router.replace("/(tabs)")}
          >
            <Text className="text-white font-semibold">AnaSayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔥 PDF oluşturulurken tam ekran overlay */}
      {generating && (
        <View style={StyleSheet.absoluteFillObject} className="bg-black/60">
          <View className="flex-1 items-center justify-center px-8 mb-20">
            <View className="bg-white rounded-3xl px-6 py-8 w-full max-w-md items-center shadow-lg">
              {completed ? (
                <>
                  <View className="w-20 h-20 rounded-full bg-green-500 items-center justify-center">
                    <Text className="text-white text-4xl">✓</Text>
                  </View>

                  <Text className="mt-4 text-xl font-bold text-green-600">
                    Tamamlandı!
                  </Text>

                  <Text className="mt-1 text-sm text-gray-500">
                    PDF başarıyla oluşturuldu.
                  </Text>
                </>
              ) : (
                <>
                  <ActivityIndicator size="large" color="#06b6d4" />

                  <Text className="mt-4 text-lg font-semibold text-gray-800">
                    CV&apos;n Hazırlanıyor...
                  </Text>

                  <Text className="mt-2 text-sm text-gray-500 text-center">
                    {LOADING_MESSAGES[messageIndex]}
                  </Text>

                  <View className="w-full mt-4 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <View
                      className="h-full"
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                  <Text className="mt-2 text-sm  text-white text-center">
                    %{progress} tamamlandı
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      )}

      {/* 🔒 Premium aylık limit dolduğunda uyarı modali */}
      {premiumLimitModalVisible && (
        <View style={StyleSheet.absoluteFillObject} className="bg-black/70">
          <View className="flex-1 items-center justify-center px-8">
            <View className="bg-white rounded-3xl px-6 py-8 w-full max-w-md items-center shadow-lg">
              <Text className="text-xl font-bold text-gray-900 text-center">
                Aylık PDF Limitine Ulaştın
              </Text>
              <Text className="mt-3 text-sm text-gray-600 text-center">
                Bu ay için tanımlanan premium PDF hakkını doldurdun.
              </Text>
              <Text className="mt-2 text-sm text-gray-600 text-center">
                Limit her ayın başında otomatik olarak yenilenir.
              </Text>
              <Text className="mt-2 text-sm font-semibold text-cyan-700 text-center">
                Bir sonraki yenileme tarihi: {nextResetDate}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setPremiumLimitModalVisible(false);
                  router.replace("/(tabs)");
                }}
                className="mt-6 px-8 py-3 rounded-full bg-cyan-600"
              >
                <Text className="text-white font-semibold">
                  Anasayfaya Dön
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}
