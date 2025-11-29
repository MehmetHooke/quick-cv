import { usePremium } from "@/context/PremiumContext";
import { useTheme } from "@/context/ThemeContext";
import { auth, db, storage } from "@/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  photoURL?: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<UserData | null>(null);

  // 🔹 Tema & Şifre accordion state'leri
  const [isThemeOpen, setIsThemeOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // 🔹 Şifre alanları
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 🔹 Global tema
  const { themeName, theme, setThemeName } = useTheme();

  // Premium durumu
const { isPremium, pdfLimit, pdfUsageCount, refresh } = usePremium();

  const remaining = Math.max(pdfLimit - pdfUsageCount, 0);
  const planName = isPremium ? "Tema Paketi (Premium)" : "Ücretsiz Plan";

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

useFocusEffect(
  useCallback(() => {
    fetchUserData();
    refresh();
  }, [refresh])
);


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
      router.replace("../auth/login");
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  // 🌟 Tema seçeneği satırı
  const renderThemeOption = (label: string, value: "light" | "dark") => {
    const isActive = themeName === value;

    return (
      <Pressable
        key={value}
        onPress={() => setThemeName(value)}
        className="flex-row items-center justify-between py-2 px-3 rounded-xl"
        style={{ backgroundColor: theme.colors.inputBg }}
      >
        <Text
          className="text-base font-medium"
          style={{ color: theme.colors.text }}
        >
          {label}
        </Text>
        <View
          className="w-6 h-6 rounded-md border"
          style={{
            borderColor: isActive ? theme.colors.primary : theme.colors.inputBorder,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isActive ? theme.colors.buttonBg : "transparent",
          }}
        >
          {isActive && <Text className="text-white text-xs">✓</Text>}
        </View>
      </Pressable>
    );
  };

  // 🔐 Şifremi değiştir – GERÇEK UYGULAMA
  const handleChangePassword = async () => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      Alert.alert("Hata", "Kullanıcı oturumu bulunamadı.");
      return;
    }

    if (!oldPassword || !newPassword || !newPasswordAgain) {
      Alert.alert("Uyarı", "Lütfen tüm şifre alanlarını doldurun.");
      return;
    }

    if (newPassword !== newPasswordAgain) {
      Alert.alert("Uyarı", "Yeni şifre ve tekrarı birbiriyle eşleşmiyor.");
      return;
    }

    if (newPassword === oldPassword) {
      Alert.alert(
        "Uyarı",
        "Yeni şifre, eski şifrenizle aynı olamaz. Lütfen farklı bir şifre belirleyin."
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Uyarı", "Yeni şifreniz en az 6 karakter olmalıdır.");
      return;
    }

    try {
      setIsChangingPassword(true);

      const credential = EmailAuthProvider.credential(
        user.email,
        oldPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setOldPassword("");
      setNewPassword("");
      setNewPasswordAgain("");

      Alert.alert("Başarılı", "Şifreniz başarıyla güncellendi.");
    } catch (error: any) {
      console.log("Şifre değiştirme hatası:", error);

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        Alert.alert("Hata", "Eski şifrenizi hatalı girdiniz.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert(
          "Hata",
          "Yeni şifre çok zayıf. Lütfen daha güçlü bir şifre deneyin."
        );
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
      source={theme.bgImage}
      style={{ flex: 1, width: "100%", height: "100%" }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={{
              paddingBottom: insets.bottom + 120,
            }}
            keyboardShouldPersistTaps="handled"
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
                borderColor: theme.colors.primary,
              }}
            />
          </Pressable>

          {/* İsim & e-posta + plan rozeti */}
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text
              className="font-extrabold"
              style={{ fontSize: 24, color: theme.colors.text }}
              numberOfLines={1}
            >
              {userData?.firstName || ""} {userData?.lastName || ""}
            </Text>
            <Text
              className="font-medium mt-1"
              style={{ fontSize: 14, color: theme.colors.mutedText }}
              numberOfLines={1}
            >
              {userData?.email || ""}
            </Text>

            {/* Plan rozeti */}
            <View
              style={{
                marginTop: 8,
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                flexDirection: "row",
                
                alignItems: "center",
                backgroundColor: isPremium ? "#22c55e90" : "#6b728090",
                borderWidth: 1,
                borderColor: isPremium ? "#22f95e" : "#ffffff",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: isPremium ? "#fff" : "#ffffff",
                }}
              >
                {isPremium ? "PREMIUM PLAN" : "ÜCRETSİZ PLAN"}
              </Text>
            </View>
          </View>
        </View>

        {/* Alt içerik alanı (kartlar) */}
        <View
          style={{
            marginTop: 32,
            paddingHorizontal: 24,
          }}
        >
          {/* 📦 Plan Bilgisi Kartı */}
          <View
            style={{
              backgroundColor: theme.colors.card,
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
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.mutedText,
                marginBottom: 4,
              }}
            >
              Mevcut Planın
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: theme.colors.text,
                marginBottom: 12,
              }}
            >
              {planName}
            </Text>

            {/* PDF Kullanımı */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.mutedText,
                }}
              >
                Bu ay oluşturulan PDF:
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isPremium ? "#22c55e" : "#f97316",
                }}
              >
                {pdfUsageCount} / {pdfLimit}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 12,
                color: theme.colors.mutedText,
              }}
            >
              Kalan hakkın:{" "}
              <Text style={{ fontWeight: "700", color: theme.colors.text }}>
                {remaining} PDF
              </Text>
            </Text>

            {/* İstersen ileride buraya "Tema Paketini Satın Al" butonu da ekleyebiliriz */}
          </View>

          {/* Tema Modu Kartı */}
          <View
            style={{
              backgroundColor: theme.colors.card,
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
              <Text
                className="text-lg font-semibold"
                style={{ color: theme.colors.text }}
              >
                Tema Modu
              </Text>
              <Text
                className="text-xl"
                style={{ color: theme.colors.historythemeLabel }}
              >
                {isThemeOpen ? "▲" : "▼"}
              </Text>
            </Pressable>

            {isThemeOpen && (
              <View className="mt-4 space-y-4">
                <View>{renderThemeOption("Açık", "light")}</View>
                <View className="mt-3">
                  {renderThemeOption("Koyu", "dark")}
                </View>
              </View>
            )}
          </View>

          {/* Şifremi Değiştir Kartı */}
          <View
            style={{
              backgroundColor: theme.colors.card,
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
              <Text
                className="text-lg font-semibold"
                style={{ color: theme.colors.text }}
              >
                Şifremi Değiştir
              </Text>
              <Text
                className="text-xl"
                style={{ color: theme.colors.historythemeLabel }}
              >
                {isPasswordOpen ? "▲" : "▼"}
              </Text>
            </Pressable>

            {isPasswordOpen && (
              <View className="mt-4">
                {/* Eski Şifre */}
                <Text
                  className="text-sm mb-1"
                  style={{ color: theme.colors.mutedText }}
                >
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
                    borderColor: theme.colors.inputBorder,
                    paddingHorizontal: 12,
                    backgroundColor: theme.colors.inputBg,
                    marginBottom: 12,
                    color: theme.colors.text,
                  }}
                />

                {/* Yeni Şifre */}
                <Text
                  className="text-sm mb-1"
                  style={{ color: theme.colors.mutedText }}
                >
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
                    borderColor: theme.colors.inputBorder,
                    paddingHorizontal: 12,
                    backgroundColor: theme.colors.inputBg,
                    marginBottom: 12,
                    color: theme.colors.text,
                  }}
                />

                {/* Yeni Şifre Tekrar */}
                <Text
                  className="text-sm mb-1"
                  style={{ color: theme.colors.mutedText }}
                >
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
                    borderColor: theme.colors.inputBorder,
                    paddingHorizontal: 12,
                    backgroundColor: theme.colors.inputBg,
                    marginBottom: 16,
                    color: theme.colors.text,
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
                    backgroundColor: theme.colors.primary,
                    opacity: isChangingPassword ? 0.7 : 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text className="text-white text-[16px] font-medium mr-2">
                    {isChangingPassword
                      ? "Değiştiriliyor..."
                      : "Şifremi Değiştir"}
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
              backgroundColor: theme.colors.logoutButtonBg,
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
);
}
