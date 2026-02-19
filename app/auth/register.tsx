import { app, db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { logEvent, setUserId } from "app/utils/analytics";
import { router } from "expo-router";

import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image, ImageBackground,
  KeyboardAvoidingView, Linking, Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const PRIVACY_URL = "https://mehmethooke.github.io/quickcv-privacy-policy.html";

export default function RegisterScreen() {
  const auth = getAuth(app);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const openPrivacy = async () => {
    const supported = await Linking.canOpenURL(PRIVACY_URL);
    if (supported) await Linking.openURL(PRIVACY_URL);
  };
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirm) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurun.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Hata", "Şifreler eşleşmiyor.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firebase displayName ayarla
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // 🔥 Firestore’a kullanıcı bilgisi ekle
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        photoURL: "",
        createdAt: serverTimestamp(),
      });
      //--
      await setUserId(user.uid);
      await logEvent("sign_up_success");
      //--
      Alert.alert("Başarılı", "Kayıt işlemi tamamlandı!");
      router.replace("/(tabs)");
    } catch (error: any) {
      //--
      await logEvent("sign_up_error");
      //--
      Alert.alert("Kayıt Hatası", error.message);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/onboarding-2.png")}
      style={{ flex: 1, width: "100%", height: "100%" }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              paddingTop: 40,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 🔹 Logo */}
            <Image
              source={require("@/assets/icons/logo.png")}
              style={{
                width: width * 0.5,
                height: width * 0.5,
                marginTop: 30,
                resizeMode: "contain",
              }}
            />

            {/* 🧾 Form Alanları */}
            <View className="w-[80%] mt-4">
              {/* İsim */}
              <View className="mb-4">
                <Text className="text-[#1E1E1E] font-extrabold text-[16px] mb-1">
                  İsim
                </Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Adınız"
                  placeholderTextColor="#999"
                  className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 py-2 text-[16px]"
                />
              </View>

              {/* Soyisim */}
              <View className="mb-4">
                <Text className="text-[#1E1E1E] font-extrabold text-[16px] mb-1">
                  Soyisim
                </Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Soyadınız"
                  placeholderTextColor="#999"
                  className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 py-2 text-[16px]"
                />
              </View>

              {/* E-posta */}
              <View className="mb-4">
                <Text className="text-[#1E1E1E] font-extrabold text-[16px] mb-1">
                  E-posta
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@gmail.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 py-2 text-[16px]"
                />
              </View>

              {/* Şifre */}
              <View className="mb-4">
                <Text className="text-[#1E1E1E] font-extrabold text-[16px] mb-1">
                  Şifre
                </Text>

                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="********"
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#999"
                    className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 pr-12 py-2 text-[16px]"
                  />

                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#0C94B9"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Şifre Tekrar */}
              <View className="mb-6">
                <Text className="text-[#1E1E1E] font-extrabold text-[16px] mb-1">
                  Şifre Tekrar
                </Text>

                <View className="relative">
                  <TextInput
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="********"
                    secureTextEntry={!showConfirm}
                    placeholderTextColor="#999"
                    className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 pr-12 py-2 text-[16px]"
                  />

                  <Pressable
                    onPress={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off" : "eye"}
                      size={22}
                      color="#0C94B9"
                    />
                  </Pressable>
                </View>
              </View>

              {/* ✅ Kullanım koşulları onayı */}
              <Pressable
                onPress={() => setAcceptedTerms((p) => !p)}
                hitSlop={10}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedTerms }}
                className="flex-row items-start mb-5"
              >
                {/* Checkbox */}
                <View
                  className={[
                    "w-5 h-5 rounded-md border mr-3 mt-[2px] items-center justify-center",
                    acceptedTerms ? "border-[#1E1E1E]" : "border-[#999]",
                  ].join(" ")}
                >
                  {acceptedTerms ? (
                    <View className="w-[10px] h-[10px] rounded bg-[#1E1E1E]" />
                  ) : null}
                </View>

                {/* Text + link */}
                <Text className="flex-1 text-[#1E1E1E] font-semibold leading-5">
                  Kullanım koşullarını kabul ediyorum ve{" "}
                  <Text
                    onPress={openPrivacy}
                    suppressHighlighting
                    className="underline font-extrabold text-[#0C94B9]"
                  >
                    Gizlilik Politikası’nı
                  </Text>{" "}
                  okudum.
                </Text>
              </Pressable>

            </View>

            {/* 🔵 Kayıt Ol Butonu */}
            <Pressable
              onPress={handleRegister}
              disabled={!acceptedTerms}
              style={{
                width: "60%",
                alignSelf: "center",
                height: 44,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowOffset: { width: 4, height: 4 },
                shadowRadius: 4,
                opacity: acceptedTerms ? 1 : 0.5, // ✅ disabled görünümü
              }}
              className={[
                "rounded-lg flex-row items-center justify-center",
                acceptedTerms ? "bg-[#0C94B9]" : "bg-[#0C94B9]",
              ].join(" ")}
            >
              <Text className="text-white text-[16px] font-medium mr-2">
                Kayıt Ol
              </Text>
              <Image
                source={require("@/assets/icons/chevron-right.png")}
                className="w-4 h-4"
                resizeMode="contain"
              />
            </Pressable>


            {/* 🔙 Geri Dön Linki */}
            <Text className="text-center text-[15px] text-[#1C1C1C] font-extrabold mt-6">
              Zaten hesabın var mı?{" "}
              <Text
                onPress={() => router.push("/auth/login")}
                className="text-[#0C94B9] underline"
              >
                Giriş yap.
              </Text>
            </Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground >
  );
}
