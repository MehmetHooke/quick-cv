import { useCV } from "@/context/CVContext";
import { auth, db, storage } from "@/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ContinueButton } from "@/components/form/ContinueButton";
import { useTheme } from "@/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { cvData, updateCV } = useCV();
  const [personalInfo, setPersonalInfo] = useState(cvData.personalInfo);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const isFormValid =
    personalInfo.firstName?.trim().length > 0 &&
    personalInfo.lastName?.trim().length > 0 &&
    personalInfo.phone?.trim().length > 0 &&
    personalInfo.email?.trim().length > 0;

  // Ekstra iletişim ekleme için lokalde kullanılan inputlar
  const [newContactLabel, setNewContactLabel] = useState("");
  const [newContactValue, setNewContactValue] = useState("");
  const [showExtraContacts, setShowExtraContacts] = useState(false);

  // 🔼 Lokal dosya URI'sini Firebase Storage'a yükleyip HTTPS URL döndürür
  const uploadImageAsync = async (localUri: string, uid: string) => {
    const resp = await fetch(localUri);
    const blob = await resp.blob();
    const fileName = `profile_${Date.now()}.jpg`;
    const storagePath = `users/${uid}/photos/${fileName}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL; // https link
  };

  // 📸 Fotoğraf seçme
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      // Önce ekranda anında önizleme
      setPersonalInfo((p: any) => ({ ...p, photo: uri }));

      const user = auth.currentUser;
      if (user) {
        try {
          const url = await uploadImageAsync(uri, user.uid);
          setPersonalInfo((p: any) => ({ ...p, photo: url }));
        } catch (e) {
          console.error("Fotoğraf yükleme hatası:", e);
          Alert.alert(
            "Uyarı",
            "Fotoğraf yüklenemedi. İnternetinizi kontrol edin."
          );
        }
      }
    }
  };

  // ➕ Ekstra iletişim bilgisi ekle
  const handleAddExtraContact = () => {
    const label = newContactLabel.trim();
    const value = newContactValue.trim();

    if (!label || !value) {
      Alert.alert(
        "Eksik bilgi",
        "Lütfen hem iletişim adını hem de bilgisini doldurun."
      );
      return;
    }

    setPersonalInfo((prev: any) => ({
      ...prev,
      extraContacts: [...(prev.extraContacts || []), { label, value }],
    }));

    setNewContactLabel("");
    setNewContactValue("");
  };

  // ❌ Ekstra iletişim sil
  const handleRemoveExtraContact = (index: number) => {
    setPersonalInfo((prev: any) => ({
      ...prev,
      extraContacts: (prev.extraContacts || []).filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  // 👉 Devam Et butonu
  const handleNext = async () => {
    try {
      if (
        !personalInfo.firstName ||
        !personalInfo.lastName ||
        !personalInfo.email
      ) {
        Alert.alert(
          "Eksik bilgi",
          "Lütfen isim, soyisim ve e-posta alanlarını doldurun."
        );
        return;
      }

      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Uyarı", "Lütfen giriş yaptıktan sonra devam edin.");
        setLoading(false);
        return;
      }

      // Eğer foto değerimiz hâlâ lokal uri ise (https ile başlamıyorsa), burada yüklemeyi tamamla
      let photo = personalInfo.photo;
      if (photo && !/^https?:\/\//i.test(photo)) {
        try {
          photo = await uploadImageAsync(photo, user.uid);
        } catch (e) {
          console.error("Foto (gecikmeli) yükleme hatası:", e);
        }
      }

      const finalPersonalInfo = {
        ...personalInfo,
        photo,
        extraContacts: personalInfo.extraContacts || [],
      };

      updateCV("personalInfo", finalPersonalInfo);

      // Firestore’da kullanıcı altına CV kaydı
      const cvRef = collection(db, "users", user.uid, "cvs");
      const docRef = await addDoc(cvRef, {
        ...cvData,
        personalInfo: finalPersonalInfo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      updateCV("id", docRef.id);

      setLoading(false);
      router.push("/newcv/languages");
    } catch (error) {
      console.error("CV Kaydetme Hatası:", error);
      Alert.alert("Hata", "Bilgiler kaydedilirken bir hata oluştu.");
      setLoading(false);
    }
  };

  const placeholderColor = "#9CA3AF";

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
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: theme.colors.primary }}
              >
                Kişisel Bilgiler
              </Text>
              <View
                className="h-1 w-1/3 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
            </View>

            {/* 📷 Fotoğraf */}
{personalInfo.photo ? (
  // 📌 Fotoğraf varsa → sadece yuvarlak fotoğraf göster + tıklanabilir
  <TouchableOpacity
    onPress={pickImage}
    className="self-center mb-6"
  >
    <View
      style={{
        width: 140,
        height: 140,
        borderRadius: 70,
        overflow: "hidden",
        borderWidth: 3,
        borderColor: theme.colors.primary,
      }}
    >
      <Image
        source={{ uri: personalInfo.photo }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </View>

    <Text
      style={{
        textAlign: "center",
        marginTop: 8,
        color: theme.colors.mutedText,
        fontSize: 12,
      }}
    >
      Değiştir
    </Text>
  </TouchableOpacity>
) : (
  // 📌 Fotoğraf yok → dashed border görünür
  <TouchableOpacity
    onPress={pickImage}
    className="rounded-2xl p-10 items-center mb-6 border-2 border-dashed"
    style={{
      borderColor: theme.colors.inputBorder,
      backgroundColor: theme.colors.card,
    }}
  >
    <Text
      className="font-medium"
      style={{ color: theme.colors.mutedText }}
    >
      Fotoğraf Yükle veya Çek
    </Text>
  </TouchableOpacity>
)}


            {/* Form alanları */}
            <TextInput
              placeholder="İsim"
              placeholderTextColor={placeholderColor}
              value={personalInfo.firstName || ""}
              onChangeText={(t) =>
                setPersonalInfo({ ...personalInfo, firstName: t })
              }
              className="rounded-xl p-3 mb-3"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.text,
              }}
            />

            <TextInput
              placeholder="Soyisim"
              placeholderTextColor={placeholderColor}
              value={personalInfo.lastName || ""}
              onChangeText={(t) =>
                setPersonalInfo({ ...personalInfo, lastName: t })
              }
              className="rounded-xl p-3 mb-3"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.text,
              }}
            />

            <TextInput
              placeholder="Telefon"
              placeholderTextColor={placeholderColor}
              keyboardType="phone-pad"
              value={personalInfo.phone || ""}
              onChangeText={(t) =>
                setPersonalInfo({ ...personalInfo, phone: t })
              }
              className="rounded-xl p-3 mb-3"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.text,
              }}
            />

            <TextInput
              placeholder="E-posta"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              value={personalInfo.email || ""}
              onChangeText={(t) =>
                setPersonalInfo({ ...personalInfo, email: t })
              }
              className="rounded-xl p-3 mb-3"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.text,
              }}
            />

            {/* 💼 Meslek / Başlık (headline) */}
            <TextInput
              placeholder="Mesleğin / Başlığın (Örn: Full Stack Mobil & Web Geliştirici)"
              placeholderTextColor={placeholderColor}
              value={personalInfo.headline || ""}
              onChangeText={(t) =>
                setPersonalInfo({ ...personalInfo, headline: t })
              }
              className="rounded-xl p-3 mb-3"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.text,
              }}
            />

            {/* 📍 Konum */}
            <TextInput
              placeholder="Konum (Örn: İstanbul, Türkiye)"
              placeholderTextColor={placeholderColor}
              value={personalInfo.location || ""}
              onChangeText={(t) =>
                setPersonalInfo({ ...personalInfo, location: t })
              }
              className="rounded-xl p-3 mb-5"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.text,
              }}
            />

            {/* 🔗 Ekstra İletişim Bilgileri */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setShowExtraContacts((prev) => !prev)}
                className="flex-row items-center justify-between mb-2"
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: theme.colors.text }}
                >
                  Ek İletişim Bilgileri (İsteğe bağlı)
                </Text>
                <Text
                  className="text-xl"
                  style={{ color: theme.colors.mutedText }}
                >
                  {showExtraContacts ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {showExtraContacts && (
                <>
                  {(personalInfo.extraContacts || []).map(
                    (item: any, index: number) => (
                      <View
                        key={`${item.label}-${index}`}
                        className="flex-row items-center justify-between mb-2 rounded-xl px-3 py-2"
                        style={{ backgroundColor: theme.colors.card }}
                      >
                        <View className="flex-1 mr-2">
                          <Text
                            className="text-sm font-semibold"
                            style={{ color: theme.colors.text }}
                          >
                            {item.label}
                          </Text>
                          <Text
                            className="text-xs"
                            numberOfLines={1}
                            style={{ color: theme.colors.mutedText }}
                          >
                            {item.value}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveExtraContact(index)}
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: "#FEE2E2" }}
                        >
                          <Text className="text-xs font-semibold text-red-600">
                            Sil
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )
                  )}

                  <Text
                    className="text-sm mt-3 mb-1"
                    style={{ color: theme.colors.mutedText }}
                  >
                    Farklı bir iletişim eklemek istiyorum
                  </Text>

                  <TextInput
                    placeholder="İletişim Adı (Örn: Telegram, Kişisel Site, Behance)"
                    placeholderTextColor={placeholderColor}
                    value={newContactLabel}
                    onChangeText={setNewContactLabel}
                    className="rounded-xl p-3 mb-2 text-sm"
                    style={{
                      borderWidth: 1,
                      borderColor: theme.colors.inputBorder,
                      backgroundColor: theme.colors.inputBg,
                      color: theme.colors.text,
                    }}
                  />

                  <TextInput
                    placeholder="Bağlantı veya bilgi (Örn: https://t.me/kullanici)"
                    placeholderTextColor={placeholderColor}
                    value={newContactValue}
                    onChangeText={setNewContactValue}
                    className="rounded-xl p-3 mb-2 text-sm"
                    style={{
                      borderWidth: 1,
                      borderColor: theme.colors.inputBorder,
                      backgroundColor: theme.colors.inputBg,
                      color: theme.colors.text,
                    }}
                  />

                  <TouchableOpacity
                    onPress={handleAddExtraContact}
                    className="self-start px-4 py-2 rounded-xl mt-1"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <Text className="text-white text-sm font-semibold">
                      Ekstra İletişim Ekle
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* ✅ Devam Et Butonu */}
            <ContinueButton
              onPress={handleNext}
              loading={loading}
              isOptional={false}
              isValid={isFormValid}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
