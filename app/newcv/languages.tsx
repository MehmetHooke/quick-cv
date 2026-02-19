// app/newcv/languages.tsx
import BackButton from "@/components/common/BackButton";
import { Language, useCV } from "@/context/CVContext";
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
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function LanguagesScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();
  const { theme } = useTheme();

  const [languages, setLanguages] = useState<Language[]>(
    cvData.languages || []
  );
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");

  const placeholderColor = "#9CA3AF";

  //new for skipping without adding language
  const [skipLanguages, setSkipLanguages] = useState(false);
  // Devam butonu aktif mi?
  const canProceed = languages.length > 0 || skipLanguages;


  const handleAddLanguage = () => {
    const trimmedName = name.trim();
    const trimmedLevel = level.trim();


    if (!trimmedName || !trimmedLevel) {
      Alert.alert(
        "Eksik bilgi",
        "Lütfen hem dil adını hem de seviyesini doldurun."
      );
      return;
    }

    setLanguages((prev) => [
      ...prev,
      { name: trimmedName, level: trimmedLevel },
    ]);
    setSkipLanguages(false);
    setName("");
    setLevel("");
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    try {
      // Context'i güncelle
      updateCV("languages", languages);

      const user = auth.currentUser;

      // Kullanıcı ve cvData.id varsa Firestore'a da yaz
      if (user && cvData.id) {
        const docRef = doc(db, "users", user.uid, "cvs", cvData.id);

        await updateDoc(docRef, {
          languages: languages,          // boşsa [] olarak gider
          updatedAt: serverTimestamp(),  // son güncelleme tarihi
        });
      }

      router.push("/newcv/education");
    } catch (error) {
      console.error("Dil bilgileri kaydedilirken hata:", error);
      Alert.alert(
        "Hata",
        "Dil bilgileri kaydedilirken bir hata oluştu. Lütfen tekrar deneyin."
      );
      // Hata olsa bile istersen burada navigate etmeyi engelleyebilirsin;
      // şu an hata olursa ekranda kalıyor.
    }
  };


  return (
    <ImageBackground
      source={theme.bgImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BackButton />
      <SafeAreaView className="flex-1">
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
                Dil Bilgileri
              </Text>
              <View
                className="h-1 w-1/3 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
            </View>

            <Text
              className="text-base mb-4"
              style={{ color: theme.colors.text }}
            >
              Bu adımı isteğe bağlı olarak doldurabilirsin. Hiç dil eklemezsen,
              CV'de dil bölümü görünmez.
            </Text>
            <Text className="text-base mb-4"
              style={{ color: theme.colors.text }}>
                Seviye kısmı için isterseniz A1,B2 seviye şekli ile isterseniz yazı ile belirtebilirsiniz.</Text>

            {/* Mevcut diller listesi */}
            {languages.map((lang, index) => (
              <View
                key={`${lang.name}-${index}`}
                className="flex-row items-center justify-between mb-2 rounded-xl px-3 py-2"
                style={{ backgroundColor: theme.colors.card }}
              >
                <View className="flex-1 mr-2">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: theme.colors.text }}
                  >
                    {lang.name}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: theme.colors.mutedText }}
                  >
                    {lang.level}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveLanguage(index)}
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#FEE2E2" }}
                >
                  <Text className="text-xs font-semibold text-red-600">
                    Sil
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Yeni dil ekleme alanı */}
            <View className="mt-4 mb-8">
              <Text
                className="text-base mb-2"
                style={{ color: theme.colors.text }}
              >
                Yeni dil eklemek istiyorum
              </Text>

              <TextInput
                placeholder="Dil (Örneğin: İngilizce,Almanca...)"
                placeholderTextColor={placeholderColor}
                value={name}
                onChangeText={setName}
                className="rounded-xl p-3 mb-2 text-sm"
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.inputBorder,
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                }}
              />

              <TextInput
                placeholder="Seviye "
                placeholderTextColor={placeholderColor}
                value={level}
                onChangeText={setLevel}
                className="rounded-xl p-3 mb-2 text-sm"
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.inputBorder,
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                }}
              />

              <TouchableOpacity
                onPress={handleAddLanguage}
                className="py-4 rounded-2xl mt-2"
              >
                <Text className="text-center text-white font-semibold text-lg">
                  Dil Ekle
                </Text>
              </TouchableOpacity>

            </View>

            {/* ✅ Hiç dil yoksa: bilinçli atlama checkbox */}
            {languages.length === 0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSkipLanguages((p) => !p)}
                className="flex-row items-start mb-6"
              >
                <View
                  className={[
                    "w-5 h-5 rounded-md border mr-3 mt-[2px] items-center justify-center",
                    skipLanguages ? "border-white" : "border-white/60",
                  ].join(" ")}
                  style={{
                    borderColor: skipLanguages ? theme.colors.primary : theme.colors.mutedText,
                    backgroundColor: skipLanguages ? theme.colors.primary : "transparent",
                  }}
                >
                  {skipLanguages ? (
                    <View className="w-2.5 h-2.5 rounded-sm bg-white" />
                  ) : null}
                </View>

                <Text
                  className="flex-1 text-sm leading-5"
                  style={{ color: theme.colors.text }}
                >
                  Dil bölümünü boş bırakmak istiyorum
                </Text>
              </TouchableOpacity>
            )}



            {/* Devam Et Butonu */}
            <TouchableOpacity
              onPress={handleNext}
              disabled={!canProceed}
              className="py-4 rounded-2xl mb-10"
              style={{
                backgroundColor: theme.colors.buttonBg,
                opacity: canProceed ? 1 : 0.45,
              }}
            >
              <Text className="text-center text-white font-semibold text-lg">
                Devam Et
              </Text>
            </TouchableOpacity>

            {!canProceed && (
              <Text
                className="text-center text-sm -mt-7 mb-8"
                style={{ color: theme.colors.mutedText }}
              >
                Devam etmek için en az 1 dil ekle veya “boş bırakmak istiyorum” seçeneğini işaretle.
              </Text>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
