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
    (cvData.experiences as ExperienceItem[]) || []
  );

  const [newExp, setNewExp] = useState<ExperienceItem>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const placeholderColor = "#9CA3AF";

  // 🏢 Yeni deneyim ekleme
  const addExperience = () => {
    if (!newExp.company.trim() || !newExp.position.trim() || !newExp.startDate.trim()) {
      Alert.alert("Eksik bilgi", "Lütfen şirket adı, pozisyon ve başlangıç tarihini doldurun.");
      return;
    }

    const cleaned: ExperienceItem = {
      company: newExp.company.trim(),
      position: newExp.position.trim(),
      startDate: newExp.startDate.trim(),
      endDate: newExp.endDate.trim(),
      description: newExp.description?.trim() || "",
    };

    setExperienceList((prev) => [...prev, cleaned]);

    setNewExp({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  // ❌ Deneyim kaydı sil
  const removeExperience = (index: number) => {
    setExperienceList((prev) => prev.filter((_, i) => i !== index));
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

      <Text className="text-sm text-gray-700 mb-4">
        İş ve staj deneyimlerini buraya ekleyebilirsin. Birden fazla deneyim
        eklemek serbest.
      </Text>

      {/* Yeni deneyim ekleme alanı */}
      <View className="mb-6">
        <Text className="text-sm text-gray-700 mb-2">
          Yeni deneyim eklemek istiyorum
        </Text>

        <TextInput
          placeholder="Şirket Adı"
          placeholderTextColor={placeholderColor}
          value={newExp.company || ""}
          onChangeText={(t) => setNewExp({ ...newExp, company: t })}
          className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
        />

        <TextInput
          placeholder="Pozisyon"
          placeholderTextColor={placeholderColor}
          value={newExp.position || ""}
          onChangeText={(t) => setNewExp({ ...newExp, position: t })}
          className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
        />

        <TextInput
          placeholder="Başlangıç Tarihi (Örn: 2023-06)"
          placeholderTextColor={placeholderColor}
          value={newExp.startDate || ""}
          onChangeText={(t) => setNewExp({ ...newExp, startDate: t })}
          className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
        />

        <TextInput
          placeholder="Bitiş Tarihi (Örn: 2024-01 veya 'Devam Ediyor')"
          placeholderTextColor={placeholderColor}
          value={newExp.endDate || ""}
          onChangeText={(t) => setNewExp({ ...newExp, endDate: t })}
          className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
        />

        <TextInput
          placeholder="Açıklama (opsiyonel)"
          placeholderTextColor={placeholderColor}
          multiline
          numberOfLines={3}
          value={newExp.description || ""}
          onChangeText={(t) => setNewExp({ ...newExp, description: t })}
          className="border border-gray-300 rounded-xl p-3 mb-4 text-sm"
        />

        <TouchableOpacity
          onPress={addExperience}
          className="self-start px-4 py-3 rounded-xl bg-cyan-700"
        >
          <Text className="text-white text-sm font-semibold">
            Yeni Deneyim Ekle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mevcut deneyimlerin listesi – languages/education stilinde */}
      {experienceList.map((item, index) => (
        <View
          key={`${item.company}-${item.position}-${index}`}
          className="flex-row items-center justify-between mb-2 bg-gray-100 rounded-xl px-3 py-2"
        >
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-gray-800">
              {item.company} - {item.position}
            </Text>
            <Text className="text-xs text-gray-600">
              {item.startDate} → {item.endDate || "Devam Ediyor"}
            </Text>
            {!!item.description && (
              <Text className="text-xs text-gray-500 mt-1">
                {item.description}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => removeExperience(index)}
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
