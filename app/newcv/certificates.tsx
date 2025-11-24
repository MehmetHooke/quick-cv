import BackButton from "@/components/common/BackButton";
import { ContinueButton } from "@/components/form/ContinueButton";
import { useCV } from "@/context/CVContext";
import { useTheme } from "@/context/ThemeContext";
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "expo-router";

import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

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

  // ➕ Yeni sertifika ekleme
  const addCertificate = () => {
    if (!newCert.name.trim() || !newCert.issuer.trim() || !newCert.date.trim()) {
      Alert.alert("Eksik bilgi", "Lütfen sertifika adı, kurum ve tarihi doldurun.");
      return;
    }

    const cleaned: CertificateItem = {
      name: newCert.name.trim(),
      issuer: newCert.issuer.trim(),
      date: newCert.date.trim(),
      description: newCert.description?.trim() || "",
    };

    setCertificateList((prev) => [...prev, cleaned]);

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
        certificates: certificateList,
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      router.push("/newcv/skills"); // sonraki ekran
    } catch (error) {
      console.error("Sertifika Kaydetme Hatası:", error);
      Alert.alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
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
    <ScrollView className="flex-1 px-5 py-8 mt-5">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold  mb-1" style={{ color: theme.colors.primary }}>
          Sertifikalar
        </Text>
        <View className="h-1 w-1/3" style={{ backgroundColor: theme.colors.primary, borderRadius: 9999 }}  />
      </View>

      <Text className="text-base mb-4" style={{ color: theme.colors.text }}>
        Katıldığın eğitim ve aldığın sertifikaları ekleyebilirsin. Birden fazla
        sertifika eklemek serbest.
      </Text>

      {/* Yeni sertifika ekleme alanı */}
      <View className="mb-6">
        <Text className="text-base mb-2"
        style={{ color: theme.colors.text }}>
          Yeni sertifika eklemek istiyorum
        </Text>

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
          className="self-center  px-12 py-3 rounded-xl bg-cyan-600"
        >
          <Text className="text-white text-sm font-semibold">
            Yeni Sertifika Ekle
          </Text>
        </TouchableOpacity>
      </View>

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
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: "#FEE2E2" }}
            
          >
            <Text className="text-xs font-semibold text-red-600">Sil</Text>
          </TouchableOpacity>
        </View>
      ))}


      {/* ✅ Devam Et Butonu (zorunlu olmayan) */}
      <ContinueButton
        onPress={handleNext}
        loading={loading}
        isOptional={true}   // bu adım zorunlu
        
      />
    </ScrollView>
    </ImageBackground>
  );
}
