import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCV } from "@/context/CVContext";
import { db, auth } from "@/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();
  const [personalInfo, setPersonalInfo] = useState(cvData.personalInfo);
  const [loading, setLoading] = useState(false);

  // 📸 Fotoğraf seçme fonksiyonu
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPersonalInfo({ ...personalInfo, photo: result.assets[0].uri });
    }
  };

  // 👉 Devam Et butonu
  const handleNext = async () => {
    try {
      if (
        !personalInfo.firstName ||
        !personalInfo.lastName ||
        !personalInfo.email
      ) {
        Alert.alert("Eksik bilgi", "Lütfen gerekli alanları doldurun.");
        return;
      }

      setLoading(true);
      updateCV("personalInfo", personalInfo);

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Uyarı", "Lütfen giriş yaptıktan sonra devam edin.");
        setLoading(false);
        return;
      }

      // Firestore’da kullanıcı altına CV koleksiyonu oluştur
      const cvRef = collection(db, "users", user.uid, "cvs");
      const docRef = await addDoc(cvRef, {
        ...cvData,
        personalInfo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 🎯 Oluşan belge kimliğini context'e kaydet
      updateCV("id", docRef.id);

      setLoading(false);
      router.push("/newcv/education");
    } catch (error) {
      console.error("CV Kaydetme Hatası:", error);
      Alert.alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-5 py-8 mt-5">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-cyan-700 mb-1">
          Kişisel Bilgiler
        </Text>
        <View className="h-1 w-1/3 bg-cyan-500 rounded-full" />
      </View>

      {/* 🧍‍♂️ Form Alanları */}
      <TextInput
        placeholder="İsim"
        value={personalInfo.firstName}
        onChangeText={(t) => setPersonalInfo({ ...personalInfo, firstName: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />

      <TextInput
        placeholder="Soyisim"
        value={personalInfo.lastName}
        onChangeText={(t) => setPersonalInfo({ ...personalInfo, lastName: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />

      <TextInput
        placeholder="Telefon"
        keyboardType="phone-pad"
        value={personalInfo.phone}
        onChangeText={(t) => setPersonalInfo({ ...personalInfo, phone: t })}
        className="border border-gray-300 rounded-xl p-3 mb-3"
      />

      <TextInput
        placeholder="E-posta"
        keyboardType="email-address"
        value={personalInfo.email}
        onChangeText={(t) => setPersonalInfo({ ...personalInfo, email: t })}
        className="border border-gray-300 rounded-xl p-3 mb-5"
      />

      {/* 📷 Fotoğraf */}
      <TouchableOpacity
        onPress={pickImage}
        className="border-2 border-dashed border-gray-400 rounded-2xl py-6 items-center mb-5"
      >
        {personalInfo.photo ? (
          <Image
            source={{ uri: personalInfo.photo }}
            className="w-24 h-24 rounded-full"
          />
        ) : (
          <Text className="text-gray-400 font-medium">
            Fotoğraf Yükle veya Çek
          </Text>
        )}
      </TouchableOpacity>

      {/* ✅ Devam Et Butonu */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleNext}
        className={`py-4 rounded-2xl mb-10 ${
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
