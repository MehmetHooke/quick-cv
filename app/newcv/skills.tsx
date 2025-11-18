// app/newcv/skills.tsx
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
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SkillItem = {
  name: string;
  level: string; // Örn: Başlangıç, Orta, İleri
};

export default function SkillsScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();
  const { theme } = useTheme();

  const [skills, setSkills] = useState<SkillItem[]>(
    (cvData.skills as SkillItem[]) || []
  );

  const [newSkill, setNewSkill] = useState<SkillItem>({
    name: "",
    level: "",
  });

  const [loading, setLoading] = useState(false);
  const placeholderColor = "#9CA3AF";

  // ➕ Yeni yetenek ekle
  const addSkill = () => {
    if (!newSkill.name.trim() || !newSkill.level.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Lütfen hem yetenek adını hem de seviyesini doldurun."
      );
      return;
    }

    const cleaned: SkillItem = {
      name: newSkill.name.trim(),
      level: newSkill.level.trim(),
    };

    setSkills((prev) => [...prev, cleaned]);

    setNewSkill({
      name: "",
      level: "",
    });
  };

  // ❌ Yetenek sil
  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // 💾 Kaydet ve devam et
  const handleNext = async () => {
    try {


      setLoading(true);
      updateCV("skills", skills);

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

      // 🔥 Mevcut belgeyi güncelle
      const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
      await updateDoc(docRef, {
        skills: skills,
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      router.push("/newcv/about");
    } catch (error) {
      console.error("Yetenek Kaydetme Hatası:", error);
      Alert.alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
   <ImageBackground
    source={theme.bgImage}
    style={{ flex: 1 }}
    resizeMode="cover"
    >
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
        <Text className="text-2xl font-bold  mb-1" style={{ color: theme.colors.primary }}>
          Yetenekler
        </Text>
        <View className="h-1 w-1/3  rounded-full" style={{ backgroundColor: theme.colors.primary }} />
      </View>

      <Text className="text-sm  mb-4" style={{ color: theme.colors.text }}>
        Teknik ve kişisel yeteneklerini buraya ekleyebilirsin. Örn: React
        Native, Flutter, İletişim, Takım Çalışması...
      </Text>

      {/* Yeni yetenek ekleme alanı */}
      <View className="mb-6">
        <Text className="text-sm  mb-2" style={{ color: theme.colors.text }}>
          Yeni yetenek eklemek istiyorum
        </Text>

        <TextInput
          placeholder="Yetenek Adı (Örn: React Native, Python)"
          placeholderTextColor={placeholderColor}
          value={newSkill.name || ""}
          onChangeText={(t) => setNewSkill({ ...newSkill, name: t })}
          style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
          className="border   rounded-xl p-3 mb-3 text-sm"
        />

        <TextInput
          placeholder="Seviye (Örn: Başlangıç, Orta, İleri)"
          placeholderTextColor={placeholderColor}
          value={newSkill.level || ""}
          onChangeText={(t) => setNewSkill({ ...newSkill, level: t })}
          style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
          className="border  rounded-xl p-3 mb-4 text-sm"
        />

        <TouchableOpacity
          onPress={addSkill}
          className="self-center  px-12 py-3 rounded-xl bg-cyan-600"
        >
          <Text className="text-white text-sm font-semibold">
            Yeni Yetenek Ekle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mevcut yeteneklerin listesi – aynı kart + Sil tasarımı */}
      {skills.map((item, index) => (
        <View
          key={`${item.name}-${index}`}
          style={{ backgroundColor: theme.colors.inputBg }}
          className="flex-row items-center justify-between mb-2  rounded-xl px-3 py-2"
        >
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
              {item.name}
            </Text>
            <Text className="text-xs" style={{ color: theme.colors.mutedText }}>{item.level}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeSkill(index)}
            className="px-3 py-1 rounded-full "
            style={{ backgroundColor: "#FEE2E2" }}
          >
            <Text className="text-xs font-semibold text-red-600">Sil</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Devam Et Butonu */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleNext}
        className={`py-4 rounded-2xl mt-6 ${
          loading ? "bg-cyan-400" : "bg-cyan-600"
        }`}
      >
        <Text className="text-center text-white font-semibold text-lg">
          {loading ? "Kaydediliyor..." : "Devam Et →"}
        </Text>
      </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
    </ImageBackground>
  );
}
