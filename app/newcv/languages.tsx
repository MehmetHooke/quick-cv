import { Language, useCV } from "@/context/CVContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LanguagesScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();

  const [languages, setLanguages] = useState<Language[]>(
    cvData.languages || []
  );
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");

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
    router.push("/newcv/education"); // İstersen başka adıma yönlendirebilirsin
  };

  return (
    <ScrollView className="flex-1 bg-white px-5 py-8 mt-5">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-cyan-700 mb-1">
          Dil Bilgileri
        </Text>
        <View className="h-1 w-1/3 bg-cyan-500 rounded-full" />
      </View>

      <Text className="text-sm text-gray-700 mb-4">
        Bu adımı isteğe bağlı olarak doldurabilirsin. Hiç dil eklemezsen, CV'de
        dil bölümü görünmez.
      </Text>

      {/* Mevcut diller listesi */}
      {languages.map((lang, index) => (
        <View
          key={`${lang.name}-${index}`}
          className="flex-row items-center justify-between mb-2 bg-gray-100 rounded-xl px-3 py-2"
        >
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-gray-800">
              {lang.name}
            </Text>
            <Text className="text-xs text-gray-600">{lang.level}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveLanguage(index)}
            className="px-3 py-1 rounded-full bg-red-100"
          >
            <Text className="text-xs font-semibold text-red-600">Sil</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Yeni dil ekleme alanı */}
      <View className="mt-4 mb-8">
        <Text className="text-sm text-gray-700 mb-2">
          Yeni dil eklemek istiyorum
        </Text>

        <TextInput
          placeholder="Dil Adı (Örn: İngilizce, Almanca)"
          value={name}
          onChangeText={setName}
          className="border border-gray-300 rounded-xl p-3 mb-2 text-sm"
        />

        <TextInput
          placeholder="Seviye (Örn: Ana dil, İleri, Orta, Başlangıç)"
          value={level}
          onChangeText={setLevel}
          className="border border-gray-300 rounded-xl p-3 mb-2 text-sm"
        />

        <TouchableOpacity
          onPress={handleAddLanguage}
          className="self-center  px-12 py-3 rounded-xl bg-cyan-600"
        >
          <Text className="text-white text-sm font-semibold">
            Dil Ekle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Devam Et Butonu */}
      <TouchableOpacity
        onPress={handleNext}
        className="py-4 rounded-2xl mb-10 bg-cyan-600"
      >
        <Text className="text-center text-white font-semibold text-lg">
          Devam Et
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
