import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useCV } from "@/context/CVContext";
import { db, auth } from "@/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

type EducationItem = {
  school: string;
  department: string;
  year: string;
  grade?: string;
};

export default function EducationScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();

  const [educationList, setEducationList] = useState<EducationItem[]>(
    cvData.education || []
  );

  const [newEdu, setNewEdu] = useState<EducationItem>({
    school: "",
    department: "",
    year: "",
    grade: "",
  });

  const [loading, setLoading] = useState(false);

  // 🎓 Yeni eğitim ekle
  const addEducation = () => {
    if (!newEdu.school || !newEdu.department || !newEdu.year) {
      Alert.alert("Eksik bilgi", "Lütfen gerekli alanları doldurun.");
      return;
    }
    const updatedList = [...educationList, newEdu];
    setEducationList(updatedList);
    setNewEdu({ school: "", department: "", year: "", grade: "" });
  };

  // 💾 Kaydet ve devam et
  const handleNext = async () => {
    try {
      if (educationList.length === 0) {
        Alert.alert("Uyarı", "En az bir eğitim bilgisi eklemelisiniz.");
        return;
      }

      setLoading(true);
      updateCV("education", educationList);

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Uyarı", "Lütfen giriş yaptıktan sonra devam edin.");
        setLoading(false);
        return;
      }

      if (!cvData.id) {
        Alert.alert("Hata", "CV kimliği bulunamadı. Lütfen baştan deneyiniz.");
        setLoading(false);
        return;
      }

      // 🔥 Mevcut belgeyi güncelle
      const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
      await updateDoc(docRef, {
        education: educationList,
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      router.push("/newcv/experience"); // sonraki sayfa (henüz oluşturmadık)
    } catch (error) {
      console.error("Eğitim Kaydetme Hatası:", error);
      Alert.alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-5 py-8 mt-5">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-cyan-700 mb-1">
          Eğitim Bilgileri
        </Text>
        <View className="h-1 w-1/3 bg-cyan-500 rounded-full" />
      </View>

      {/* Form Alanları */}
      <TextInput
        placeholder="Okul Adı"
        value={newEdu.school}
        onChangeText={(t) => setNewEdu({ ...newEdu, school: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />
      <TextInput
        placeholder="Bölüm"
        value={newEdu.department}
        onChangeText={(t) => setNewEdu({ ...newEdu, department: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />
      <TextInput
        placeholder="Mezuniyet Yılı"
        value={newEdu.year}
        onChangeText={(t) => setNewEdu({ ...newEdu, year: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />
      <TextInput
        placeholder="Ortalama (opsiyonel)"
        value={newEdu.grade}
        onChangeText={(t) => setNewEdu({ ...newEdu, grade: t })}
        className="border border-gray-300 rounded-xl p-3 mb-5"
      />

      <TouchableOpacity
        onPress={addEducation}
        className="bg-cyan-700 py-3 rounded-xl mb-6"
      >
        <Text className="text-white text-center font-semibold">
          Yeni Eğitim Ekle
        </Text>
      </TouchableOpacity>

      {/* Liste */}
      {educationList.length > 0 && (
        <FlatList
          data={educationList}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View className="border border-gray-300 rounded-xl p-3 mb-3">
              <Text className="font-semibold text-cyan-700">
                {item.school} - {item.department}
              </Text>
              <Text className="text-gray-600 text-sm">
                Mezuniyet: {item.year}{" "}
                {item.grade ? `| Ortalama: ${item.grade}` : ""}
              </Text>
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
