import BackButton from "@/components/common/BackButton";
import { ContinueButton } from "@/components/form/ContinueButton";

import { useCV } from "@/context/CVContext";
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
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

import { useAppAlert } from "@/components/common/AppAlertProvider";
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
  const { alert } = useAppAlert();

  const [educationList, setEducationList] = useState<EducationItem[]>(
    (cvData.education as EducationItem[]) || []
  );

  const [newEdu, setNewEdu] = useState<EducationItem>({
    school: "",
    department: "",
    year: "",
    grade: "",
  });



  const hasAnyDraftInput =
    newEdu.school.trim().length > 0 ||
    newEdu.department.trim().length > 0 ||
    newEdu.year.trim().length > 0 ||
    (newEdu.grade?.trim().length ?? 0) > 0;

  // Devam edebilmek için:
  // - en az 1 eğitim olmalı
  // - ve taslak inputlar boş olmalı (yani kullanıcı yeni eğitim yazıp eklemeyi unutmamalı)
  const canProceed = educationList.length > 0 && !hasAnyDraftInput;

  // ContinueButton'ın isValid'i artık buna göre olmalı
  const isFormValid = canProceed;


  const [loading, setLoading] = useState(false);
  const placeholderColor = "#9CA3AF";

  // 🎓 Yeni eğitim ekle
  const addEducation = () => {
    if (!newEdu.school.trim() || !newEdu.department.trim() || !newEdu.year.trim()) {
      alert("Eksik bilgi", "Lütfen okul adı, bölüm ve mezuniyet yılını doldurun.");
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
        alert("Uyarı", "En az bir eğitim bilgisi eklemelisiniz.");
        return;
      }

      setLoading(true);
      updateCV("education", educationList);

      const user = auth.currentUser;
      if (!user) {
        alert("Uyarı", "Lütfen giriş yaptıktan sonra devam edin.");
        setLoading(false);
        return;
      }

      if (!cvData.id) {
        alert("Hata", "CV kimliği bulunamadı. Lütfen baştan deneyiniz.");
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
      alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
      setLoading(false);
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
              <Text className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                Eğitim Bilgileri
              </Text>
              <View className="h-1 w-1/3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
            </View>

            {/* Açıklama */}
            <Text className="text-base" style={{ color: theme.colors.text }}>
              Mezun olduğun veya devam ettiğin okulları ekleyebilirsin. Birden fazla
              eğitim bilgisi eklemek serbest.
            </Text>

            {/* Yeni eğitim ekleme alanı */}
            <View className="mt-4 mb-8">
              <Text className="text-base mt-2" style={{ color: theme.colors.text, marginBottom: 8 }}>
                Yeni eğitim eklemek için lütfen eğitim ekle butonuna basınız. aksi takdirde değişiklikler kaydolmayacaktır.
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
                className="py-4 rounded-2xl mt-2"
                style={{ backgroundColor: theme.colors.buttonBg }}
              >
                <Text className="text-center text-white font-semibold text-lg">
                  Eğitim ekle
                </Text>
              </TouchableOpacity>
            </View>


            {educationList.length > 0 && (
              <View className="mt-5 mb-2">
                <Text className="text-white font-semibold text-lg">
                  Mevcut eğitimlerin listesi
                </Text>
              </View>
            )}


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
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#FEE2E2" }}
                >
                  <Text className="text-xs font-semibold text-red-800">Sil</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Devam Et Butonu */}
            {/* ✅ Devam Et Butonu (zorunlu sayfa) */}
            {/* Devam Et Butonu / Uyarı */}
            {hasAnyDraftInput ? (
              <View className="mb-10">
                {/* Devam butonu yerine pasif görünüm */}
                <View
                  className="py-4 rounded-2xl"
                  style={{
                    backgroundColor: theme.colors.buttonBg,
                    opacity: 0.45,
                  }}
                >
                  <Text className="text-center text-white font-semibold text-lg">
                    Devam Et
                  </Text>
                </View>

                <Text
                  className="text-center text-xs mt-3"
                  style={{ color: theme.colors.mutedText }}
                >
                  Devam etmek için ya “Eğitim ekle” butonuna basarak bu kaydı ekleyin,
                  ya da alanları temizleyin.
                </Text>
              </View>
            ) : (
              <ContinueButton
                onPress={handleNext}
                loading={loading}
                isOptional={false} // bu adım zorunlu
                isValid={isFormValid}
              />
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
