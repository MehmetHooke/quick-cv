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
    cvData.certificates || []
  );

  const [newCert, setNewCert] = useState<CertificateItem>({
    name: "",
    issuer: "",
    date: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // ➕ Yeni sertifika ekleme
  const addCertificate = () => {
    if (!newCert.name || !newCert.issuer || !newCert.date) {
      Alert.alert("Eksik bilgi", "Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    const updatedList = [...certificateList, newCert];
    setCertificateList(updatedList);
    setNewCert({ name: "", issuer: "", date: "", description: "" });
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

      {/* Form Alanları */}
      <TextInput
        placeholder="Sertifika Adı"
        value={newCert.name}
        onChangeText={(t) => setNewCert({ ...newCert, name: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />
      <TextInput
        placeholder="Kurum / Veren Kuruluş"
        value={newCert.issuer}
        onChangeText={(t) => setNewCert({ ...newCert, issuer: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />
      <TextInput
        placeholder="Tarih (ör. 2024-05)"
        value={newCert.date}
        onChangeText={(t) => setNewCert({ ...newCert, date: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />
      <TextInput
        placeholder="Açıklama (opsiyonel)"
        multiline
        numberOfLines={3}
        value={newCert.description}
        onChangeText={(t) => setNewCert({ ...newCert, description: t })}
        className="border border-gray-300 rounded-xl p-3 mb-5"
      />

      <TouchableOpacity
        onPress={addCertificate}
        className="bg-cyan-700 py-3 rounded-xl mb-6"
      >
        <Text className="text-white text-center font-semibold">
          Yeni Sertifika Ekle
        </Text>
      </TouchableOpacity>

      {/* Liste */}
      {certificateList.length > 0 && (
        <FlatList
          data={certificateList}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View className="border border-gray-300 rounded-xl p-3 mb-3">
              <Text className="font-semibold text-cyan-700">{item.name}</Text>
              <Text className="text-gray-600 text-sm">
                {item.issuer} • {item.date}
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
