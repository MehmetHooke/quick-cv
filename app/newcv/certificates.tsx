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

type CertificateItem = {
  name: string;
  issuer: string;
  date: string;
  description?: string;
};

export default function CertificatesScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();

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
      if (certificateList.length === 0) {
        Alert.alert("Uyarı", "En az bir sertifika eklemelisiniz.");
        return;
      }

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
    <ScrollView className="flex-1 bg-white px-5 py-8 mt-5">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-cyan-700 mb-1">
          Sertifikalar
        </Text>
        <View className="h-1 w-1/3 bg-cyan-500 rounded-full" />
      </View>

      <Text className="text-sm text-gray-700 mb-4">
        Katıldığın eğitim ve aldığın sertifikaları ekleyebilirsin. Birden fazla
        sertifika eklemek serbest.
      </Text>

      {/* Yeni sertifika ekleme alanı */}
      <View className="mb-6">
        <Text className="text-sm text-gray-700 mb-2">
          Yeni sertifika eklemek istiyorum
        </Text>

        <TextInput
          placeholder="Sertifika Adı"
          placeholderTextColor={placeholderColor}
          value={newCert.name || ""}
          onChangeText={(t) => setNewCert({ ...newCert, name: t })}
          className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
        />

        <TextInput
          placeholder="Kurum / Veren Kuruluş"
          placeholderTextColor={placeholderColor}
          value={newCert.issuer || ""}
          onChangeText={(t) => setNewCert({ ...newCert, issuer: t })}
          className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
        />

        <TextInput
          placeholder="Tarih (Örn: 2024-05)"
          placeholderTextColor={placeholderColor}
          value={newCert.date || ""}
          onChangeText={(t) => setNewCert({ ...newCert, date: t })}
          className="border border-gray-300 rounded-xl p-3 mb-3 text-sm"
        />

        <TextInput
          placeholder="Açıklama (Opsiyonel)"
          placeholderTextColor={placeholderColor}
          multiline
          numberOfLines={3}
          value={newCert.description || ""}
          onChangeText={(t) => setNewCert({ ...newCert, description: t })}
          className="border border-gray-300 rounded-xl p-3 mb-4 text-sm"
        />

        <TouchableOpacity
          onPress={addCertificate}
          className="self-start px-4 py-3 rounded-xl bg-cyan-700"
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
          className="flex-row items-center justify-between mb-2 bg-gray-100 rounded-xl px-3 py-2"
        >
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-gray-800">
              {item.name}
            </Text>
            <Text className="text-xs text-gray-600">
              {item.issuer} • {item.date}
            </Text>
            {!!item.description && (
              <Text className="text-xs text-gray-500 mt-1">
                {item.description}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => removeCertificate(index)}
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
