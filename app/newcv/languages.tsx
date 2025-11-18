// app/newcv/languages.tsx
import { Language, useCV } from "@/context/CVContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
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

    setName("");
    setLevel("");
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    // Boş geçilebilir, sorun yok
    updateCV("languages", languages);
    router.push("/newcv/education");
  };

  return (
    <ImageBackground
      source={theme.bgImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
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
            className="text-sm mb-4"
            style={{ color: theme.colors.mutedText }}
          >
            Bu adımı isteğe bağlı olarak doldurabilirsin. Hiç dil eklemezsen,
            CV'de dil bölümü görünmez.
          </Text>

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
              className="text-sm mb-2"
              style={{ color: theme.colors.mutedText }}
            >
              Yeni dil eklemek istiyorum
            </Text>

            <TextInput
              placeholder="Dil Adı (Örn: İngilizce, Almanca)"
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
              placeholder="Seviye (Örn: Ana dil, İleri, Orta, Başlangıç)"
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
              className="self-center px-12 py-3 rounded-xl mt-1"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Text className="text-white text-sm font-semibold">Dil Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Devam Et Butonu */}
          <TouchableOpacity
            onPress={handleNext}
            className="py-4 rounded-2xl mb-10"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Text className="text-center text-white font-semibold text-lg">
              Devam Et
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
