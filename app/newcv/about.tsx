import BackButton from "@/components/common/BackButton";
import { ContinueButton } from "@/components/form/ContinueButton";
import { useCV } from "@/context/CVContext";
import { useTheme } from "@/context/ThemeContext";
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "expo-router";

import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ABOUT_MAX_LENGTH = 800; // ✅ Hakkında kısmı için karakter limiti

export default function AboutScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();
  const [about, setAbout] = useState(cvData.about || "");
  const [loading, setLoading] = useState(false);
  //
  const isFormValid = about.trim().length > 0;
  const { theme } = useTheme();

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

      const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
      await updateDoc(docRef, {
        about,
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      router.push("/newcv/preview");
    } catch (error) {
      console.error("Hakkında kısmı kaydetme hatası:", error);
      Alert.alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={theme.bgImage}
      className="flex-1"
      resizeMode="cover"
    >
      <BackButton />
      <SafeAreaView className="flex-1 ">
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
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: theme.colors.primary }}
              >
                Kendini Tanıt
              </Text>
              <View className="h-1 w-1/3 bg-white rounded-full" />
            </View>

            <Text
              className="text-gray-500 text-base  mb-6 text-center"
              style={{ color: theme.colors.text }}
            >
              Bu bölümde kendini kısa ve etkili bir şekilde tanıt.{"\n"}
              CV’ni okuyan kişinin seni tanımasına yardımcı olacak birkaç cümle yaz.
            </Text>

            {/* ✅ TextInput + Canlı karakter sayacı */}
            <View className="mb-6  relative">
              <TextInput
                placeholder={`Örnek:\nKariyerine odaklı, öğrenmeye açık ve sorumluluk sahibi bir profesyonelim. Çalıştığım alanlarda kendimi sürekli geliştirmeyi, yeni teknolojileri takip etmeyi ve ekip çalışmasına katkı sağlamayı önemsiyorum. Problem çözme becerilerim ve analitik düşünme yeteneğim sayesinde verimli sonuçlar elde etmeyi hedeflerim.
\nHedefim, bulunduğum pozisyonda değer üretmek ve kariyerimde sürdürülebilir bir gelişim sağlamaktır.`}
                value={about}
                placeholderTextColor={theme.colors.mutedText}
                onChangeText={setAbout}
                multiline
                numberOfLines={12}
                textAlignVertical="top"
                maxLength={ABOUT_MAX_LENGTH}          // ✅ Hard limit
                className="shadow-xl shadow-white  rounded-2xl p-4 pb-8 pr-16"
                style={{
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                }}
              />

              {/* 🔢 Alt sağ köşede canlı karakter sayacı */}
              <Text
                className="text-xs"
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 12,
                  color: theme.colors.mutedText,
                }}
              >
                {about.length}/{ABOUT_MAX_LENGTH}
              </Text>
            </View>

            <ContinueButton
              onPress={handleNext}
              loading={loading}
              isOptional={false}
              isValid={isFormValid}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
