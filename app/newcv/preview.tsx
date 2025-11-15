// app/newcv/preview.tsx
import { useCV } from "@/context/CVContext";
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

// 🔁 Artık tek bir preview component'i kullanıyoruz
import PreviewCV from "@/components/cvThemes/PreviewCV";

// Paylaşım ve render istemcisi
import { renderPdf, type Theme } from "@/app/lib/renderClient";
import * as Sharing from "expo-sharing";

// --------- Sabitler ---------
const A4_RATIO = 210 / 297; // sadece önizleme oranı
const ENDPOINT = "https://cv-render-service-jrxoy76crq-ey.a.run.app"; // ← kendi Cloud Run URL’in
const API_KEY  = "MY_API_KEY"; // ← kendi gizli anahtarın

export default function PreviewScreen() {
  const router = useRouter();
  const { cvData } = useCV();
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Uyarı", "Giriş yapılmadı. Lütfen oturum açın.");
          router.push("/(tabs)");
          return;
        }
        if (!cvData?.id) {
          Alert.alert("Hata", "CV kimliği bulunamadı. Lütfen yeniden deneyin.");
          router.push("/(tabs)");
          return;
        }

        const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          // 🔹 Eskiden ne alıyorsan aynen onu alıyoruz
          setCv(snapshot.data());
        } else {
          Alert.alert("Hata", "CV verisi bulunamadı.");
        }
      } catch (error) {
        console.error("CV çekme hatası:", error);
        Alert.alert("Hata", "CV verisi alınırken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, []);

  const handleGeneratePDF = async () => {
    if (!cv || generating) return;
    setGenerating(true);

    try {
      const theme = (cv.theme ?? "classic") as Theme;

      // 🔹 PDF tarafı: SENİN ORİJİNAL MANTIK AYNEN DURUYOR
      const serverData = {
        personalInfo: {
          ...cv.personalInfo,
          // modern.html.ts'te kullandığımız alanlara fallback:
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

      const fileUri = await renderPdf({
        endpoint: ENDPOINT,
        apiKey: API_KEY,
        data: serverData,   // ✅ Backend’in alıştığı veri formatı
        theme,              // "classic" | "modern" | "minimal"
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "PDF Paylaş",
        });
      } else {
        Alert.alert("PDF Hazır", fileUri);
      }
    } catch (e: any) {
      console.error("Render error:", e);
      if (e.message === "ERR_401") {
        Alert.alert("Hata", "Uygulama anahtarı geçersiz.");
      } else if (e.name === "AbortError") {
        Alert.alert("Zaman Aşımı", "Sunucu yanıt vermedi (30 sn).");
      } else {
        Alert.alert("Hata", `Render başarısız: ${e?.message ?? e}`);
      }
    } finally {
      setGenerating(false);
    }
  };

  // 🔁 Artık tema switch yok, tek PreviewCV
  const renderCV = () => {
    if (!cv) return null;
    return <PreviewCV data={cv} />;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text className="text-gray-500 mt-3">Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-current px-5 py-6 mt-6">
      <Text className="text-3xl font-bold color-primary text-center mb-4">
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
      <View className="flex-row justify-around mt-6">
        <TouchableOpacity
          disabled={generating}
          className={`px-5 py-3 rounded-xl ${
            generating ? "bg-cyan-400" : "bg-cyan-600"
          }`}
          onPress={handleGeneratePDF}
        >
          <Text className="text-white font-semibold">
            {generating ? "Hazırlanıyor..." : "PDF İndir"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={generating}
          className={`px-5 py-3 rounded-xl ${
            generating ? "bg-cyan-400" : "bg-cyan-600"
          }`}
          onPress={handleGeneratePDF}
        >
          <Text className="text-white font-semibold">
            {generating ? "Hazırlanıyor..." : "Paylaş"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
