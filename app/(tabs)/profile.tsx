import { auth, db, storage } from "@/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  photoURL?: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);

  // 🔹 Tema & Şifre accordion state'leri
  const [isThemeOpen, setIsThemeOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // 🔹 Sadece tasarım için local tema seçimi
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("light");

  // 🔹 Şifre alanları
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 🔹 Firestore'dan kullanıcı bilgilerini çek
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error: any) {
      console.error("Kullanıcı bilgileri alınamadı:", error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // 📸 Profil fotoğrafı yükleme
  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Hata", "Kullanıcı oturumu bulunamadı.");
        return;
      }

      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const imageRef = ref(storage, `profile_photos/${user.uid}.jpg`);
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });

      setUserData((prev) => ({ ...prev, photoURL: downloadURL }));
      Alert.alert("Başarılı", "Profil fotoğrafınız güncellendi!");
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  // 🚪 Çıkış
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Çıkış yapıldı", "Tekrar görüşmek üzere!");
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  // 🌟 Tema seçeneği satırı (sadece UI)
  const renderThemeOption = (
    label: string,
    value: "light" | "dark"
  ) => (
    <Pressable
      key={value}
      onPress={() => setSelectedTheme(value)}
      className="flex-row items-center justify-between py-2 px-3 rounded-xl"
      style={{ backgroundColor: "#F6F8FA" }}
    >
      <Text className="text-base text-[#1E1E1E] font-medium">{label}</Text>
      <View
        className="w-6 h-6 rounded-md border"
        style={{
          borderColor: selectedTheme === value ? "#0C94B9" : "#C4C4C4",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: selectedTheme === value ? "#0C94B9" : "white",
        }}
      >
        {selectedTheme === value && (
          <Text className="text-white text-xs">✓</Text>
        )}
      </View>
    </Pressable>
  );

  // 🔐 Şifremi değiştir – GERÇEK UYGULAMA
  const handleChangePassword = async () => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      Alert.alert("Hata", "Kullanıcı oturumu bulunamadı.");
      return;
    }

    // Boş alan kontrolü
    if (!oldPassword || !newPassword || !newPasswordAgain) {
      Alert.alert("Uyarı", "Lütfen tüm şifre alanlarını doldurun.");
      return;
    }

    // Yeni şifre ile tekrar aynı mı?
    if (newPassword !== newPasswordAgain) {
      Alert.alert("Uyarı", "Yeni şifre ve tekrarı birbiriyle eşleşmiyor.");
      return;
    }

    // Eski şifre ile aynı olamaz
    if (newPassword === oldPassword) {
      Alert.alert(
        "Uyarı",
        "Yeni şifre, eski şifrenizle aynı olamaz. Lütfen farklı bir şifre belirleyin."
      );
      return;
    }

    // Min. uzunluk vs (Firebase auth/weak-password da yakalar ama UX için)
    if (newPassword.length < 6) {
      Alert.alert(
        "Uyarı",
        "Yeni şifreniz en az 6 karakter olmalıdır."
      );
      return;
    }

    try {
      setIsChangingPassword(true);

      // 1️⃣ Eski şifreyle yeniden kimlik doğrulama (reauthenticate)
      const credential = EmailAuthProvider.credential(
        user.email,
        oldPassword
      );
      await reauthenticateWithCredential(user, credential);

      // 2️⃣ Şifreyi güncelle
      await updatePassword(user, newPassword);

      // 3️⃣ Inputları temizle
      setOldPassword("");
      setNewPassword("");
      setNewPasswordAgain("");

      Alert.alert("Başarılı", "Şifreniz başarıyla güncellendi.");
    } catch (error: any) {
      console.log("Şifre değiştirme hatası:", error);

      // Firebase hata kodlarına göre mesaj
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        Alert.alert("Hata", "Eski şifrenizi hatalı girdiniz.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Hata", "Yeni şifre çok zayıf. Lütfen daha güçlü bir şifre deneyin.");
      } else if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Güvenlik Uyarısı",
          "Şifre değiştirmek için yeniden giriş yapmanız gerekiyor. Lütfen tekrar giriş yapıp deneyin."
        );
      } else {
        Alert.alert(
          "Hata",
          "Şifreniz değiştirilirken bir sorun oluştu: " + error.message
        );
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/profile-bg.png")}
      style={{ flex: 1, width: "100%", height: "100%" }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={{
              marginTop: height * 0.04,
              paddingHorizontal: 24,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* Profil resmi */}
            <Pressable onPress={handleImageUpload}>
              <Image
                source={
                  userData?.photoURL
                    ? { uri: userData.photoURL }
                    : require("@/assets/images/react-logo.png")
                }
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  borderWidth: 2,
                  borderColor: "#0C94B9",
                }}
              />
            </Pressable>

            {/* İsim & e-posta */}
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text
                className="font-extrabold text-[#000]"
                style={{ fontSize: 24 }}
                numberOfLines={1}
              >
                {userData?.firstName || ""} {userData?.lastName || ""}
              </Text>
              <Text
                className="text-[#1E1E1E] font-medium mt-1"
                style={{ fontSize: 14 }}
                numberOfLines={1}
              >
                {userData?.email || ""}
              </Text>
            </View>
          </View>

          {/* Alt içerik alanı (kartlar) */}
          <View
            style={{
              marginTop: 32,
              paddingHorizontal: 24,
            }}
          >
            {/* Tema Modu Kartı */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                paddingVertical: 16,
                paddingHorizontal: 16,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
                marginBottom: 16,
              }}
            >
              <Pressable
                onPress={() => setIsThemeOpen((prev) => !prev)}
                className="flex-row items-center justify-between"
              >
                <Text className="text-lg font-semibold text-[#1E1E1E]">
                  Tema Modu
                </Text>
                <Text className="text-xl text-[#0C94B9]">
                  {isThemeOpen ? "▲" : "▼"}
                </Text>
              </Pressable>

              {isThemeOpen && (
                <View className="mt-4 space-y-4">
                  <View className="">
                    {renderThemeOption("Açık", "light")}
                  </View>
                  <View className="mt-3">
                    {renderThemeOption("Koyu", "dark")}
                  </View>
                </View>
                
              )}
            </View>

            {/* Şifremi Değiştir Kartı */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                paddingVertical: 16,
                paddingHorizontal: 16,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Pressable
                onPress={() => setIsPasswordOpen((prev) => !prev)}
                className="flex-row items-center justify-between"
              >
                <Text className="text-lg font-semibold text-[#1E1E1E]">
                  Şifremi Değiştir
                </Text>
                <Text className="text-xl text-[#0C94B9]">
                  {isPasswordOpen ? "▲" : "▼"}
                </Text>
              </Pressable>

              {isPasswordOpen && (
                <View className="mt-4">
                  {/* Eski Şifre */}
                  <Text className="text-sm text-[#454545] mb-1">
                    Eski Şifre
                  </Text>
                  <TextInput
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry
                    placeholder="Eski şifrenizi girin"
                    placeholderTextColor="#A0A0A0"
                    style={{
                      height: 44,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E3E6EA",
                      paddingHorizontal: 12,
                      backgroundColor: "#F6F8FA",
                      marginBottom: 12,
                    }}
                  />

                  {/* Yeni Şifre */}
                  <Text className="text-sm text-[#454545] mb-1">
                    Yeni Şifre
                  </Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="Yeni şifrenizi girin"
                    placeholderTextColor="#A0A0A0"
                    style={{
                      height: 44,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E3E6EA",
                      paddingHorizontal: 12,
                      backgroundColor: "#F6F8FA",
                      marginBottom: 12,
                    }}
                  />

                  {/* Yeni Şifre Tekrar */}
                  <Text className="text-sm text-[#454545] mb-1">
                    Yeni Şifre Tekrar
                  </Text>
                  <TextInput
                    value={newPasswordAgain}
                    onChangeText={setNewPasswordAgain}
                    secureTextEntry
                    placeholder="Yeni şifrenizi tekrar girin"
                    placeholderTextColor="#A0A0A0"
                    style={{
                      height: 44,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E3E6EA",
                      paddingHorizontal: 12,
                      backgroundColor: "#F6F8FA",
                      marginBottom: 16,
                    }}
                  />

                  {/* Şifremi Değiştir Butonu */}
                  <Pressable
                    onPress={handleChangePassword}
                    disabled={isChangingPassword}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: "#0C94B9",
                      opacity: isChangingPassword ? 0.7 : 1,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text className="text-white text-[16px] font-medium mr-2">
                      {isChangingPassword ? "Değiştiriliyor..." : "Şifremi Değiştir"}
                    </Text>
                    {!isChangingPassword && (
                      <Text className="text-white text-lg">✓</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            {/* Çıkış Yap */}
            <Pressable
              onPress={handleLogout}
              style={{
                width: width * 0.6,
                height: 52,
                marginTop: 32,
                borderRadius: 26,
                backgroundColor: "#0C94B9",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Text className="text-white text-[16px] font-medium mr-2">
                Çıkış Yap
              </Text>
              <Image
                source={require("@/assets/icons/chevron-right.png")}
                style={{ width: 16, height: 16 }}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
