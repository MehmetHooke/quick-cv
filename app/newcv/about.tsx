import { ContinueButton } from "@/components/form/ContinueButton";
import { useCV } from "@/context/CVContext";
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();
  const [about, setAbout] = useState(cvData.about || "");
  const [loading, setLoading] = useState(false);
  //
  const isFormValid = about.trim().length > 0;


  const handleNext = async () => {
    try {
      if (!about.trim()) {
        Alert.alert("Uyarı", "Kendini tanıtan kısa bir yazı girmelisin.");
        return;
      }

      setLoading(true);
      // Context içini güncelle
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
        about,                          // Hakkında
        languages: cvData.languages ?? [], // ✅ Dil bilgilerini de kaydet
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
    <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          >
            <ScrollView
              className="flex-1 px-5 py-8 mt-5"
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-cyan-700 mb-1">
          Kendini Tanıt
        </Text>
        <View className="h-1 w-1/3 bg-cyan-500 rounded-full" />
      </View>

      <Text className="text-gray-500 text-sm mb-4 text-center">
        Bu bölümde kendini kısa ve etkili bir şekilde tanıt.{"\n"}
        CV’ni okuyan kişinin seni tanımasına yardımcı olacak birkaç cümle yaz.
      </Text>

      <TextInput
        placeholder={`Örnek:\nMerhaba, ben Mehmet. Bilgisayar mühendisliği mezunuyum ve mobil uygulama geliştirme konusunda tutkuluyum. React Native ve Firebase kullanarak projeler geliştiriyorum. Hedefim, kullanıcı deneyimini ön planda tutan yenilikçi yazılımlar üretmek.`}
        value={about}
        onChangeText={setAbout}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
        className="border p-3 border-gray-300 rounded-2xl p4 text-gray-700 mb-6"
      />

      {/* ✅ Devam Et Butonu (zorunlu sayfa) */}
      <ContinueButton
        onPress={handleNext}
        loading={loading}
        isOptional={false}   // bu adım zorunlu
        isValid={isFormValid}
      />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}
