// app/newcv/skills.tsx
import { useCV } from "@/context/CVContext";
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SkillItem = {
  name: string;
  level: string; // Örn: Başlangıç, Orta, İleri
};

export default function SkillsScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();

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
      if (skills.length === 0) {
        Alert.alert("Uyarı", "En az bir yetenek eklemelisiniz.");
        return;
      }

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
    <ScrollView className="flex-1 bg-white px-5 py-8 mt-5">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-cyan-700 mb-1">
          Yetenekler
        </Text>
        <View className="h-1 w-1/3 bg-cyan-500 rounded-full" />
      </View>

      <Text className="text-sm text-gray-700 mb-4">
        Teknik ve kişisel yeteneklerini buraya ekleyebilirsin. Örn: React
        Native, Flutter, İletişim, Takım Çalışması...
      </Text>

      {/* Yeni yetenek ekleme alanı */}
      <View className="mb-6">
        <Text className="text-sm text-gray-700 mb-2">
          Yeni yetenek eklemek istiyorum
        </Text>

        <TextInput
          placeholder="Yetenek Adı (Örn: React Native, Python)"
          placeholderTextColor={placeholderColor}
          value={newSkill.name || ""}
          onChangeText={(t) => setNewSkill({ ...newSkill, name: t })}
          className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
        />

        <TextInput
          placeholder="Seviye (Örn: Başlangıç, Orta, İleri)"
          placeholderTextColor={placeholderColor}
          value={newSkill.level || ""}
          onChangeText={(t) => setNewSkill({ ...newSkill, level: t })}
          className="border border-gray-300 rounded-xl p-3 mb-4 text-sm"
        />

        <TouchableOpacity
          onPress={addSkill}
          className="self-start px-4 py-3 rounded-xl bg-cyan-700"
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
          className="flex-row items-center justify-between mb-2 bg-gray-100 rounded-xl px-3 py-2"
        >
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-gray-800">
              {item.name}
            </Text>
            <Text className="text-xs text-gray-600">{item.level}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeSkill(index)}
            className="px-3 py-1 rounded-full bg-red-100"
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
  );
}
