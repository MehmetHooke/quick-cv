import BackButton from "@/components/common/BackButton";
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
  const { theme } = useTheme();
  const [skipExperience, setSkipExperience] = useState(false);


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

  const hasAnyDraftInput =
    newExp.company.trim().length > 0 ||
    newExp.position.trim().length > 0 ||
    newExp.startDate.trim().length > 0 ||
    newExp.endDate.trim().length > 0 ||
    (newExp.description?.trim().length ?? 0) > 0;

  // Devam edebilme koşulu:
  // - Draft yok olacak (yani kullanıcı yarım bırakmayacak)
  // - ve ya en az 1 deneyim eklemiş olacak
  // - ya da "boş bırakmak istiyorum" checkbox'ı seçili olacak (sadece liste boşken anlamlı)
  const canProceed = !hasAnyDraftInput && (experienceList.length > 0 || skipExperience);

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
    setSkipExperience(false);

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
    <ImageBackground
      source={theme.bgImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <BackButton />
      <SafeAreaView style={{ flex: 1 }}>
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
              <Text
                style={{ color: theme.colors.primary }}
                className="text-2xl font-bold  mb-1">
                Deneyim Bilgileri
              </Text>
              <View className="h-1 w-1/3 bg-white rounded-full" />
            </View>

            <Text
              style={{ color: theme.colors.text }}
              className="text-base mt-5 mb-4">
              İş ve staj deneyimlerini buraya ekleyebilirsin. Birden fazla deneyim
              ekleyebilirsin. Açıklama bölümüne ilgili yerde edindiğin bilgileri kullandığın teknolojileri,neler yaptığını anlattığın bölüm olacak
            </Text>

            {/* Yeni deneyim ekleme alanı */}
            <View className="mb-6">


              <TextInput
                placeholder="Şirket Adı"
                placeholderTextColor={placeholderColor}
                value={newExp.company || ""}
                onChangeText={(t) => setNewExp({ ...newExp, company: t })}
                style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
                className=" rounded-xl p-3 mb-3 text-sm"
              />

              <TextInput
                placeholder="Pozisyon"
                placeholderTextColor={placeholderColor}
                value={newExp.position || ""}
                onChangeText={(t) => setNewExp({ ...newExp, position: t })}
                style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
                className="  rounded-xl p-3 mb-3 text-sm"
              />

              <TextInput
                placeholder="Başlangıç Tarihi (Örn: 2023-06)"
                placeholderTextColor={placeholderColor}
                value={newExp.startDate || ""}
                onChangeText={(t) => setNewExp({ ...newExp, startDate: t })}
                style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
                className=" rounded-xl p-3 mb-3 text-sm"
              />

              <TextInput
                placeholder="Bitiş Tarihi (Örn: 2024-01 veya 'Devam Ediyor')"
                placeholderTextColor={placeholderColor}
                value={newExp.endDate || ""}
                onChangeText={(t) => setNewExp({ ...newExp, endDate: t })}
                style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
                className=" rounded-xl p-3 mb-3 text-sm"
              />

              <TextInput
                placeholder="Açıklama (Bu kısıma edindiğiniz deneyimleri açıklamanız için ayrılmıştır. )"
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={3}
                value={newExp.description || ""}
                onChangeText={(t) => setNewExp({ ...newExp, description: t })}
                style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
                className="  rounded-xl p-3 mb-4 text-sm"
              />

              <TouchableOpacity
                onPress={addExperience}
                className="py-4 rounded-2xl mt-2"
                style={{ backgroundColor: theme.colors.buttonBg }}
              >
                <Text className="text-center text-white font-semibold text-lg">
                  Yeni Deneyim Ekle
                </Text>
              </TouchableOpacity>
            </View>
            {/* ✅ Hiç deneyim yoksa: bilinçli atlama checkbox */}
            {experienceList.length === 0 && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSkipExperience((p) => !p)}
                className="flex-row items-start mt-2 mb-4"
                disabled={hasAnyDraftInput} // draft varken checkbox'ı kilitle (daha net UX)
              >
                <View
                  className="w-5 h-5 rounded-md border mr-3 mt-[2px] items-center justify-center"
                  style={{
                    borderColor: skipExperience ? theme.colors.primary : theme.colors.mutedText,
                    backgroundColor: skipExperience ? theme.colors.primary : "transparent",
                    opacity: hasAnyDraftInput ? 0.5 : 1,
                  }}
                >
                  {skipExperience ? <View className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                </View>

                <Text
                  className="flex-1 text-sm leading-5"
                  style={{ color: theme.colors.text, opacity: hasAnyDraftInput ? 0.6 : 1 }}
                >
                  Deneyim bölümünü boş bırakmak istiyorum
                </Text>
              </TouchableOpacity>
            )}


            {/* Mevcut deneyimlerin listesi – languages/education stilinde */}
            {experienceList.map((item, index) => (
              <View
                key={`${item.company}-${item.position}-${index}`}
                style={{ backgroundColor: theme.colors.inputBg }}
                className="flex-row items-center justify-between mb-2  rounded-xl px-3 py-2"
              >
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-semibold " style={{ color: theme.colors.text }}>
                    {item.company} - {item.position}
                  </Text>
                  <Text className="text-xs " style={{ color: theme.colors.mutedText }}>
                    {item.startDate} → {item.endDate || "Devam Ediyor"}
                  </Text>
                  {!!item.description && (
                    <Text className="text-xs  mt-1" style={{ color: theme.colors.mutedText }}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => removeExperience(index)}
                  style={{ backgroundColor: "#FEE2E2" }}
                  className="px-3 py-1 rounded-full "
                >
                  <Text className="text-xs font-semibold text-red-600">Sil</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Devam Et Butonu */}
            {/* Devam Et Butonu */}
            <TouchableOpacity
              disabled={loading || !canProceed}
              onPress={handleNext}
              className="py-4 rounded-2xl mt-6"
              style={{
                backgroundColor: theme.colors.buttonBg,
                opacity: loading || !canProceed ? 0.45 : 1,
              }}
            >
              <Text className="text-center text-white font-semibold text-lg">
                {loading ? "Kaydediliyor..." : "Devam Et →"}
              </Text>
            </TouchableOpacity>

            {hasAnyDraftInput && (
              <Text
                className="text-center text-xs mt-2"
                style={{ color: theme.colors.mutedText }}
              >
                Devam etmek için “Yeni Deneyim Ekle” butonuna basarak kaydı ekleyin veya
                alanları temizleyin.
              </Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
