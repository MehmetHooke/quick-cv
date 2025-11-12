// app/newcv/preview.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useCV } from "@/context/CVContext";
import { db, auth } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Tema bileşenleri
import ClassicCV from "@/components/cvThemes/ClassicCV";
import ModernCV from "@/components/cvThemes/ModernCV";
import MinimalCV from "@/components/cvThemes/MinimalCV";

// Paylaşım ve render istemcisi
import * as Sharing from "expo-sharing";
import { renderPdf, type Theme } from "@/app/lib/renderClient";

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
        if (snapshot.exists()) setCv(snapshot.data());
        else Alert.alert("Hata", "CV verisi bulunamadı.");
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
      const fileUri = await renderPdf({
        endpoint: ENDPOINT,
        apiKey: API_KEY,
        data: cv,     // Firestore’dan gelen CV objesi
        theme
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: "application/pdf", dialogTitle: "PDF Paylaş" });
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

  const renderCV = () => {
    if (!cv) return null;
    switch (cv.theme) {
      case "classic": return <ClassicCV data={cv} />;
      case "modern":  return <ModernCV data={cv} />;
      case "minimal": return <MinimalCV data={cv} />;
      default:
        return (
          <View className="items-center justify-center">
            <Text className="text-gray-500">Tema seçilmemiş veya bulunamadı.</Text>
          </View>
        );
    }
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
    <View className="flex-1 bg-white px-5 py-6 mt-5">
      <Text className="text-2xl font-bold text-cyan-700 text-center mb-4">CV Önizlemesi</Text>

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
          className={`px-5 py-3 rounded-xl ${generating ? "bg-cyan-400" : "bg-cyan-600"}`}
          onPress={handleGeneratePDF}
        >
          <Text className="text-white font-semibold">
            {generating ? "Hazırlanıyor..." : "PDF İndir"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={generating}
          className={`px-5 py-3 rounded-xl ${generating ? "bg-cyan-400" : "bg-cyan-600"}`}
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
