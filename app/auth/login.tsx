import { auth } from "@/firebaseConfig";
import { router } from "expo-router";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
//new analytics import
import { useAppAlert } from "@/components/common/AppAlertProvider";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { Ionicons } from "@expo/vector-icons";
import { logEvent, setUserId } from "app/utils/analytics";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import * as Animatable from "react-native-animatable";
import { clamp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const logoSize = clamp(width * 0.8, 220, 360);

  const { alert } = useAppAlert();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // 🔹 İlk açılışta auth state kontrolü yaparken loader göstermek için
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { request, promptAsync, isProcessing } = useGoogleSignIn();

  // ✅ Uygulama açılır açılmaz: Eğer kullanıcı zaten giriş yapmışsa login ekranını atla
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Kullanıcı zaten giriş yapmış → direkt tab'lara gönder
        router.replace("/(tabs)");
      } else {
        // Kullanıcı yok → login ekranını göster
        setCheckingAuth(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Uyarı", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      await setUserId(user.uid);
      await logEvent("login_success", {
        method: "password",
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      await logEvent("login_error", {
        code: error?.code ?? "unknown",
      });
      alert("Giriş Hatası", "Kullanıcı Adı Veya Şifre Hatalı !");
    }
  };

  // ⏳ Auth durumu kontrol edilirken sade bir loader göster
  if (checkingAuth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
              paddingTop: 50,
              paddingBottom: 50,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 🔹 LOGO */}
            <Animatable.Image
              animation="zoomIn"
              duration={1000}
              delay={300}
              source={require("@/assets/icons/logo.png")}
              style={{
                width: logoSize,
                height: logoSize,
                resizeMode: "contain",
              }}
            />

            {/* 📧 E-posta */}
            <View className=" mb-5 w-[80%]">
              <Text className="text-[#1E1E1E] font-extrabold text-[16px] mb-1">
                E-posta
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@gmail.com"
                keyboardType="email-address"
                placeholderTextColor="#999"
                className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 py-2 text-[16px]"
              />
            </View>

            {/* 🔒 Şifre */}
            <View className="mb-8 w-[80%]">
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
                  className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 py-2 text-[16px]"
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

            {/* 🔵 Giriş Yap */}
            <Pressable
              onPress={handleLogin}
              style={{
                width: width * 0.3,
                height: 40,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowOffset: { width: 4, height: 4 },
                shadowRadius: 4,
              }}
              className="bg-[#0C94B9] rounded-lg flex-row items-center justify-center mb-5"
            >
              <Text className="text-white text-[16px] font-medium mr-2">
                Giriş Yap
              </Text>
              <Image
                source={require("@/assets/icons/chevron-right.png")}
                className="w-4 h-4"
                resizeMode="contain"
              />
            </Pressable>

            {/* 🔴 Google ile giriş */}
            <TouchableOpacity
              onPress={() => {
                if (!request || isProcessing) return;
                promptAsync();
              }}
              disabled={!request || isProcessing}
              style={{
                width: width * 0.45,
                height: 40,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowOffset: { width: 4, height: 4 },
                shadowRadius: 4,
              }}
              className="bg-[#0C94B9] rounded-lg flex-row p-2 items-center justify-center mb-3"
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-[16px] font-medium ">
                  Google ile giriş yap
                </Text>
              )}
            </TouchableOpacity>

            {/* 🧾 Kayıt linki */}
            <Text className="text-xl mt-6 text-[#1C1C1C] font-extrabold mb-5">
              Kayıtlı değil misin?{" "}
              <Text
                onPress={() => router.push("/auth/register")}
                className="text-[#0C94B9] underline"
              >
                Kayıt olmak için tıkla.
              </Text>
            </Text>

            <Text
              onPress={() => router.push("/auth/forgotpassword")}
              className="text-[#0C94B9] underline text-xl font-extrabold"
            >
              Şifremi Unuttum
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
