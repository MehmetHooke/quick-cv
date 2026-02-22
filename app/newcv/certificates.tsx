import { useAppAlert } from "@/components/common/AppAlertProvider";
import BackButton from "@/components/common/BackButton";
import { useCV } from "@/context/CVContext";
import { useTheme } from "@/context/ThemeContext";
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
import { SafeAreaView } from "react-native-safe-area-context";

type CertificateItem = {
  name: string;
  issuer: string;
  date: string;
  description?: string;
};

export default function CertificatesScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();
  const { theme } = useTheme();
  const [certificateList, setCertificateList] = useState<CertificateItem[]>(
    (cvData.certificates as CertificateItem[]) || []
  );

  const [newCert, setNewCert] = useState<CertificateItem>({
    name: "",
    issuer: "",
    date: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const placeholderColor = "#9CA3AF";
  const [skipCertificates, setSkipCertificates] = useState(false);
  const hasAnyDraftInput =
    newCert.name.trim().length > 0 ||
    newCert.issuer.trim().length > 0 ||
    newCert.date.trim().length > 0 ||
    (newCert.description?.trim().length ?? 0) > 0;

  // Opsiyonel adım mantığı:
  // - Draft varsa asla devam ettirme (kullanıcı yarım bıraktı)
  // - Draft yoksa: ya liste doluysa devam, ya da "boş bırakmak istiyorum" seçiliyse devam
  const canProceed = !hasAnyDraftInput && (certificateList.length > 0 || skipCertificates);

  const { alert } = useAppAlert();
  // ➕ Yeni sertifika ekleme
  const addCertificate = () => {
    if (!newCert.name.trim() || !newCert.issuer.trim() || !newCert.date.trim()) {
      alert("Eksik bilgi", "Lütfen sertifika adı, kurum ve tarihi doldurun.");
      return;
    }

    const cleaned: CertificateItem = {
      name: newCert.name.trim(),
      issuer: newCert.issuer.trim(),
      date: newCert.date.trim(),
      description: newCert.description?.trim() || "",
    };

    setCertificateList((prev) => [...prev, cleaned]);
    setSkipCertificates(false);

    setNewCert({
      name: "",
      issuer: "",
      date: "",
      description: "",
    });
  };

  // ❌ Sertifika sil
  const removeCertificate = (index: number) => {
    setCertificateList((prev) => prev.filter((_, i) => i !== index));
  };

  // 💾 Kaydet ve devam et
  const handleNext = async () => {
    try {


      setLoading(true);
      updateCV("certificates", certificateList);

      const user = auth.currentUser;
      if (!user) {
        alert("Uyarı", "Lütfen giriş yaptıktan sonra devam edin.");
        setLoading(false);
        return;
      }

      if (!cvData.id) {
        alert("Hata", "CV kimliği bulunamadı. Lütfen baştan deneyin.");
        setLoading(false);
        return;
      }

      // 🔥 Mevcut belgeyi güncelle
      const docRef = doc(db, "users", user.uid, "cvs", cvData.id);
      await updateDoc(docRef, {
        certificates: certificateList,
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      router.push("/newcv/skills"); // sonraki ekran
    } catch (error) {
      console.error("Sertifika Kaydetme Hatası:", error);
      alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      source={theme.bgImage}
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
              <Text className="text-2xl font-bold  mb-1" style={{ color: theme.colors.primary }}>
                Sertifikalar
              </Text>
              <View className="h-1 w-1/3" style={{ backgroundColor: theme.colors.primary, borderRadius: 9999 }} />
            </View>

            <Text className="text-base mb-4" style={{ color: theme.colors.text }}>
              Katıldığın eğitim ve aldığın sertifikaları ekleyebilirsin. Birden fazla
              sertifika ekleyebilirsin.Tarih formatını istediğin gibi yapabilirsin. Açıklama girmediğin takdirde gözükmez. Sertifika içeriğindeki yazıyı açıklamaya ekleyebilirsin.
            </Text>

            {/* Yeni sertifika ekleme alanı */}
            <View className="mb-6">


              <TextInput
                placeholder="Sertifika Adı"
                placeholderTextColor={placeholderColor}
                value={newCert.name || ""}
                onChangeText={(t) => setNewCert({ ...newCert, name: t })}
                style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
                className="  rounded-xl p-3 mb-3 text-sm"
              />

              <TextInput
                placeholder="Kurum / Veren Kuruluş"
                placeholderTextColor={placeholderColor}
                value={newCert.issuer || ""}
                onChangeText={(t) => setNewCert({ ...newCert, issuer: t })}
                style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
                className="  rounded-xl p-3 mb-3 text-sm"
              />

              <TextInput
                placeholder="Tarih (Örn: 2024-05)"
                placeholderTextColor={placeholderColor}
                value={newCert.date || ""}
                onChangeText={(t) => setNewCert({ ...newCert, date: t })}
                style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
                className="  rounded-xl p-3 mb-3 text-sm"
              />

              <TextInput
                placeholder="Açıklama (Opsiyonel)"
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={3}
                value={newCert.description || ""}
                onChangeText={(t) => setNewCert({ ...newCert, description: t })}
                style={{ backgroundColor: theme.colors.inputBg, color: theme.colors.text }}
                className="  rounded-xl p-3 mb-4 text-sm"
              />

              <TouchableOpacity
                onPress={addCertificate}
                className="py-4 rounded-2xl mt-2"
                style={{ backgroundColor: theme.colors.buttonBg }}
              >
                <Text className="text-center text-white font-semibold text-lg">
                  Yeni Sertifika Ekle
                </Text>
              </TouchableOpacity>
            </View>
            {/* ✅ Hiç sertifika yoksa: bilinçli atlama checkbox */}
            {certificateList.length === 0 && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSkipCertificates((p) => !p)}
                className="flex-row items-start mt-2 mb-4"
                disabled={hasAnyDraftInput} // draft varken checkbox kilit
              >
                <View
                  className="w-5 h-5 rounded-md border mr-3 mt-[2px] items-center justify-center"
                  style={{
                    borderColor: skipCertificates ? theme.colors.primary : theme.colors.mutedText,
                    backgroundColor: skipCertificates ? theme.colors.buttonBg : "transparent",
                    opacity: hasAnyDraftInput ? 0.5 : 1,
                  }}
                >
                  {skipCertificates ? <View className="w-2.5 h-2.5 rounded-sm " /> : null}
                </View>

                <Text
                  className="flex-1 text-sm leading-5"
                  style={{ color: theme.colors.text, opacity: hasAnyDraftInput ? 0.6 : 1 }}
                >
                  Sertifika bölümünü boş bırakmak istiyorum
                </Text>
              </TouchableOpacity>
            )}

            {/* Mevcut sertifikaların listesi – diğer sayfalarla aynı stil */}
            {certificateList.map((item, index) => (
              <View
                key={`${item.name}-${item.issuer}-${index}`}
                style={{ backgroundColor: theme.colors.inputBg }}
                className="flex-row items-center justify-between mb-2  rounded-xl px-3 py-2"
              >
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                    {item.name}
                  </Text>
                  <Text className="text-xs" style={{ color: theme.colors.mutedText }}>
                    {item.issuer} • {item.date}
                  </Text>
                  {!!item.description && (
                    <Text className="text-xs mt-1" style={{ color: theme.colors.mutedText }}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => removeCertificate(index)}
                  className="px-3 py-1 rounded-xl"
                  style={{ backgroundColor: "#FEE2E2" }}

                >
                  <Text className="text-xs font-semibold text-red-600">Sil</Text>
                </TouchableOpacity>
              </View>
            ))}


            {/* ✅ Devam Et Butonu (zorunlu olmayan) */}
            <TouchableOpacity
              onPress={handleNext}
              disabled={!canProceed}
              className="py-4 rounded-2xl "
              style={{
                backgroundColor: theme.colors.buttonBg,
                opacity: canProceed ? 1 : 0.45,
              }}
            >
              <Text className="text-center text-white font-semibold text-lg">
                Devam Et
              </Text>
            </TouchableOpacity>


            {hasAnyDraftInput && (
              <Text
                className="text-center text-xs mt-2 mb-2"
                style={{ color: theme.colors.mutedText }}
              >
                Devam etmek için “Yeni Sertifika Ekle” butonuna basarak kaydı ekleyin veya
                alanları temizleyin.
              </Text>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
