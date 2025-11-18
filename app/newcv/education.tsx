import { ContinueButton } from "@/components/form/ContinueButton";
import { useCV } from "@/context/CVContext";
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

import { useTheme } from "@/context/ThemeContext";

import { SafeAreaView } from "react-native-safe-area-context";

type EducationItem = {
  school: string;
  department: string;
  year: string;
  grade?: string;
};

export default function EducationScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();
  const { theme } = useTheme();


  const [educationList, setEducationList] = useState<EducationItem[]>(
    (cvData.education as EducationItem[]) || []
  );

  const [newEdu, setNewEdu] = useState<EducationItem>({
    school: "",
    department: "",
    year: "",
    grade: "",
  });

  const isFormValid = educationList.length > 0 ;

  

  const [loading, setLoading] = useState(false);
  const placeholderColor = "#9CA3AF";

  // 🎓 Yeni eğitim ekle
  const addEducation = () => {
    if (!newEdu.school.trim() || !newEdu.department.trim() || !newEdu.year.trim()) {
      Alert.alert("Eksik bilgi", "Lütfen okul adı, bölüm ve mezuniyet yılını doldurun.");
      return;
    }

    const cleaned: EducationItem = {
      school: newEdu.school.trim(),
      department: newEdu.department.trim(),
      year: newEdu.year.trim(),
      grade: newEdu.grade?.trim() || "",
    };

    setEducationList((prev) => [...prev, cleaned]);

    setNewEdu({
      school: "",
      department: "",
      year: "",
      grade: "",
    });
  };

  // ❌ Eğitim kaydı sil
  const removeEducation = (index: number) => {
    setEducationList((prev) => prev.filter((_, i) => i !== index));
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
      router.push("/newcv/experience"); // sonraki sayfa
    } catch (error) {
      console.error("Eğitim Kaydetme Hatası:", error);
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
        <Text className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          Eğitim Bilgileri
        </Text>
        <View className="h-1 w-1/3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
      </View>

      {/* Açıklama */}
      <Text className="text-sm" style={{ color: theme.colors.mutedText }}>
        Mezun olduğun veya devam ettiğin okulları ekleyebilirsin. Birden fazla
        eğitim bilgisi eklemek serbest.
      </Text>

      {/* Yeni eğitim ekleme alanı */}
      <View className="mb-6">
        <Text className="text-sm" style={{ color: theme.colors.mutedText, marginBottom: 8 }}>
          Yeni eğitim eklemek istiyorum
        </Text>

        <TextInput
          placeholder="Okul Adı"
          placeholderTextColor={placeholderColor}
          value={newEdu.school || ""}
          onChangeText={(t) => setNewEdu({ ...newEdu, school: t })}
          className="border rounded-xl p-3 mb-3 text-sm"
          style={{
            borderColor: theme.colors.inputBorder,
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.text,
          }}
        />

        <TextInput
          placeholder="Bölüm"
          placeholderTextColor={placeholderColor}
          value={newEdu.department || ""}
          onChangeText={(t) => setNewEdu({ ...newEdu, department: t })}
          className="border rounded-xl p-3 mb-3 text-sm"
          style={{
            borderColor: theme.colors.inputBorder,
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.text,
          }}
        />

        <TextInput
          placeholder="Mezuniyet Yılı (Örn: 2024)"
          placeholderTextColor={placeholderColor}
          value={newEdu.year || ""}
          onChangeText={(t) => setNewEdu({ ...newEdu, year: t })}
          className="border rounded-xl p-3 mb-3 text-sm"
          style={{
            borderColor: theme.colors.inputBorder,
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.text,
          }}
        />

        <TextInput
          placeholder="Ortalama (Opsiyonel)"
          placeholderTextColor={placeholderColor}
          value={newEdu.grade || ""}
          onChangeText={(t) => setNewEdu({ ...newEdu, grade: t })}
          className="border  rounded-xl p-3 mb-4 text-sm"
          style={{
            borderColor: theme.colors.inputBorder,
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.text,
          }}
        />

        <TouchableOpacity
          onPress={addEducation}
          style={{ backgroundColor: theme.colors.primary }}
          className="self-center  px-12 py-3 rounded-xl"
        >
          <Text className="text-white text-sm font-semibold">
            Yeni Eğitim Ekle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mevcut eğitimlerin listesi (dil sayfası stilinde) */}
      {educationList.map((item, index) => (
        <View
          key={`${item.school}-${item.department}-${index}`}
          style={{ backgroundColor: theme.colors.inputBg }}
          className={`flex-row items-center justify-between mb-2 rounded-xl px-3 py-2`}
        >
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
              {item.school} - {item.department}
            </Text>
            <Text className="text-xs" style={{ color: theme.colors.mutedText }}>
              Mezuniyet: {item.year}
              {item.grade ? `  |  Ortalama: ${item.grade}` : ""}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => removeEducation(index)}
            className="px-3 py-1 rounded-full px-3"
            style={{ backgroundColor: "#FEE2E2" }}
          >
            <Text className="text-xs font-semibold text-red-800">Sil</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Devam Et Butonu */}
      {/* ✅ Devam Et Butonu (zorunlu sayfa) */}
      <ContinueButton
        onPress={handleNext}
        loading={loading}
        isOptional={false}   // bu adım zorunlu
        isValid={isFormValid}
      />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
    </ImageBackground>
  );
}
