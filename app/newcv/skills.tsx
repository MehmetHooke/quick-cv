import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useCV } from "@/context/CVContext";
import { db, auth } from "@/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

type SkillItem = {
  name: string;
  level: string; // örnek: %80, İleri, Orta, Başlangıç
};

export default function SkillsScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();

  const [skills, setSkills] = useState<SkillItem[]>(cvData.skills || []);
  const [newSkill, setNewSkill] = useState<SkillItem>({ name: "", level: "" });
  const [loading, setLoading] = useState(false);

  // ➕ Yeni yetenek ekleme
  const addSkill = () => {
    if (!newSkill.name || !newSkill.level) {
      Alert.alert("Eksik bilgi", "Yetenek adı ve seviye boş olamaz.");
      return;
    }
    const updated = [...skills, newSkill];
    setSkills(updated);
    setNewSkill({ name: "", level: "" });
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

      // 🔥 Firestore güncelle
      const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
      await updateDoc(docRef, {
        skills,
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

      {/* Form Alanları */}
      <TextInput
        placeholder="Yetenek Adı (ör. React, Photoshop, Python)"
        value={newSkill.name}
        onChangeText={(t) => setNewSkill({ ...newSkill, name: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />

      <TextInput
        placeholder="Seviye (ör. Başlangıç, Orta, İleri, %80)"
        value={newSkill.level}
        onChangeText={(t) => setNewSkill({ ...newSkill, level: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />

      <TouchableOpacity
        onPress={addSkill}
        className="bg-cyan-700 py-3 rounded-xl mb-6"
      >
        <Text className="text-white text-center font-semibold">
          Yeni Yetenek Ekle
        </Text>
      </TouchableOpacity>

      {/* Liste */}
      {skills.length > 0 && (
        <FlatList
          data={skills}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View className="border border-gray-300 rounded-xl p-3 mb-3">
              <Text className="font-semibold text-cyan-700">{item.name}</Text>
              <Text className="text-gray-600 text-sm">Seviye: {item.level}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        disabled={loading}
        onPress={handleNext}
        className={`py-4 rounded-2xl mt-4 ${
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
