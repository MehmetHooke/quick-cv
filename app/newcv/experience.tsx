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

type ExperienceItem = {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description?: string;
};

export default function ExperienceScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();

  const [experienceList, setExperienceList] = useState<ExperienceItem[]>(
    cvData.experiences || []
  );

  const [newExp, setNewExp] = useState<ExperienceItem>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // 🏢 Yeni deneyim ekleme
  const addExperience = () => {
    if (!newExp.company || !newExp.position || !newExp.startDate) {
      Alert.alert("Eksik bilgi", "Lütfen gerekli alanları doldurun.");
      return;
    }

    const updatedList = [...experienceList, newExp];
    setExperienceList(updatedList);
    setNewExp({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  // 💾 Kaydet ve devam et
  const handleNext = async () => {
    try {
      if (experienceList.length === 0) {
        Alert.alert("Uyarı", "En az bir iş/staj deneyimi eklemelisiniz.");
        return;
      }

      setLoading(true);
      updateCV("experiences", experienceList);

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

      // 🔥 Firestore güncelleme
      const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
      await updateDoc(docRef, {
        experiences: experienceList,
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      router.push("/newcv/certificates"); // 🔜 sonraki adım
    } catch (error) {
      console.error("Deneyim Kaydetme Hatası:", error);
      Alert.alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-5 py-8 mt-5">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-cyan-700 mb-1">
          Deneyim Bilgileri
        </Text>
        <View className="h-1 w-1/3 bg-cyan-500 rounded-full" />
      </View>

      {/* Form Alanları */}
      <TextInput
        placeholder="Şirket Adı"
        value={newExp.company}
        onChangeText={(t) => setNewExp({ ...newExp, company: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />

      <TextInput
        placeholder="Pozisyon"
        value={newExp.position}
        onChangeText={(t) => setNewExp({ ...newExp, position: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />

      <TextInput
        placeholder="Başlangıç Tarihi (ör. 2023-06)"
        value={newExp.startDate}
        onChangeText={(t) => setNewExp({ ...newExp, startDate: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />

      <TextInput
        placeholder="Bitiş Tarihi (ör. 2024-01 veya 'Devam Ediyor')"
        value={newExp.endDate}
        onChangeText={(t) => setNewExp({ ...newExp, endDate: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />

      <TextInput
        placeholder="Açıklama (opsiyonel)"
        multiline
        numberOfLines={3}
        value={newExp.description}
        onChangeText={(t) => setNewExp({ ...newExp, description: t })}
        className="border border-gray-300 rounded-xl p-3 mb-5"
      />

      <TouchableOpacity
        onPress={addExperience}
        className="bg-cyan-700 py-3 rounded-xl mb-6"
      >
        <Text className="text-white text-center font-semibold">
          Yeni Deneyim Ekle
        </Text>
      </TouchableOpacity>

      {/* Liste */}
      {experienceList.length > 0 && (
        <FlatList
          data={experienceList}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View className="border border-gray-300 rounded-xl p-3 mb-3">
              <Text className="font-semibold text-cyan-700">
                {item.company} - {item.position}
              </Text>
              <Text className="text-gray-600 text-sm">
                {item.startDate} → {item.endDate || "Devam Ediyor"}
              </Text>
              {item.description ? (
                <Text className="text-gray-500 mt-1 text-xs">
                  {item.description}
                </Text>
              ) : null}
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
