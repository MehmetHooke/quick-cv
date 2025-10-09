import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useCV } from "@/context/CVContext";
import { db, auth } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// 🔹 Tema bileşenleri
import ClassicCV from "@/components/cvThemes/ClassicCV";
import ModernCV from "@/components/cvThemes/ModernCV";
import MinimalCV from "@/components/cvThemes/MinimalCV";

// 📄 PDF için
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

// 📄 PDF HTML şablonları
import { getPdfTemplate } from "../utils/pdfTemplates";

export default function PreviewScreen() {
  const router = useRouter();
  const { cvData } = useCV();
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Uyarı", "Giriş yapılmadı. Lütfen oturum açın.");
          router.push("/(tabs)");
          return;
        }

        if (!cvData.id) {
          Alert.alert("Hata", "CV kimliği bulunamadı. Lütfen yeniden deneyin.");
          router.push("/(tabs)");
          return;
        }

        const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
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

  // 🔹 PDF oluşturma fonksiyonu
  const handleGeneratePDF = async () => {
    if (!cv) return;

    try {
      const html = getPdfTemplate(cv); // 🔥 Tema bazlı PDF tasarımı

      const { uri } = await Print.printToFileAsync({ html });

      // 🔧 TS tipi genişletme için güvenli fallback
      // @ts-ignore
      const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory || "";
      const fileName = `${dir}${cv.personalInfo.firstName}_${cv.personalInfo.lastName}_CV.pdf`;

      // @ts-ignore
      await FileSystem.moveAsync({
        from: uri,
        to: fileName,
      });

      Alert.alert("Başarılı", "CV başarıyla PDF olarak kaydedildi.");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileName);
      } else {
        Alert.alert("Bilgi", "Bu cihazda paylaşım desteklenmiyor.");
      }
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      Alert.alert("Hata", "PDF oluşturulurken bir hata oluştu.");
    }
  };

  // 🔹 Tema seçimine göre uygun bileşeni getir
  const renderCV = () => {
    if (!cv) return null;

    switch (cv.theme) {
      case "classic":
        return <ClassicCV data={cv} />;
      case "modern":
        return <ModernCV data={cv} />;
      case "minimal":
        return <MinimalCV data={cv} />;
      default:
        return (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-500">
              Tema seçilmemiş veya bulunamadı.
            </Text>
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
      <Text className="text-2xl font-bold text-cyan-700 text-center mb-4">
        CV Önizlemesi
      </Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {renderCV()}
      </ScrollView>

      {/* 🔹 Alt butonlar */}
      <View className="flex-row justify-around mt-4">
        <TouchableOpacity
          className="bg-cyan-600 px-5 py-3 rounded-xl"
          onPress={handleGeneratePDF}
        >
          <Text className="text-white font-semibold">PDF İndir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-cyan-600 px-5 py-3 rounded-xl"
          onPress={handleGeneratePDF}
        >
          <Text className="text-white font-semibold">Paylaş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
