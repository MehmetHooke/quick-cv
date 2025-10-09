import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useCV } from "@/context/CVContext";
import { db, auth } from "@/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function AboutScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();
  const [about, setAbout] = useState(cvData.about || "");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    try {
      if (!about.trim()) {
        Alert.alert("Uyarı", "Kendini tanıtan kısa bir yazı girmelisin.");
        return;
      }

      setLoading(true);
      updateCV("about", about);

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Uyarı", "Lütfen giriş yaptıktan sonra devam edin.");
        setLoading(false);
        return;
      }

      if (!cvData.id) {
        Alert.alert("Hata", "CV kimliği bulunamadı. Lütfen baştan deneyin.");
        setLoading(false);
        return;
      }

      // 🔥 Firestore güncelle
      const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
      await updateDoc(docRef, {
        about,
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      router.push("/newcv/preview"); // 🚀 CV önizleme sayfası
    } catch (error) {
      console.error("Hakkında kısmı kaydetme hatası:", error);
      Alert.alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-5 py-8 mt-5">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-cyan-700 mb-1">
          Kendini Tanıt
        </Text>
        <View className="h-1 w-1/3 bg-cyan-500 rounded-full" />
      </View>

      <Text className="text-gray-500 text-sm mb-4 text-center">
        Bu bölümde kendini kısa ve etkili bir şekilde tanıt.  
        CV’ni okuyan kişinin seni tanımasına yardımcı olacak birkaç cümle yaz.
      </Text>

      <TextInput
        placeholder={`Örnek:\nMerhaba, ben Mehmet. Bilgisayar mühendisliği mezunuyum ve mobil uygulama geliştirme konusunda tutkuluyum. React Native ve Firebase kullanarak projeler geliştiriyorum. Hedefim, kullanıcı deneyimini ön planda tutan yenilikçi yazılımlar üretmek.`}
        value={about}
        onChangeText={setAbout}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
        className="border border-gray-300 rounded-2xl p-4 text-gray-700 mb-6"
      />

      <TouchableOpacity
        disabled={loading}
        onPress={handleNext}
        className={`py-4 rounded-2xl ${
          loading ? "bg-cyan-400" : "bg-cyan-600"
        }`}
      >
        <Text className="text-center text-white font-semibold text-lg">
          {loading ? "Kaydediliyor..." : "CV'yi Önizle →"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
