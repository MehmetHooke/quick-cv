import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  Pressable,
  Image,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Animatable from "react-native-animatable";
import { clamp } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
const { width, height } = useWindowDimensions();
    

  const logoSize= clamp(width * 0.8, 220, 360);    // logo kare


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurun.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Giriş Hatası", error.message);
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 40,
            }}
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
            <View className="mt-5 mb-5 w-[80%]">
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
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                secureTextEntry
                placeholderTextColor="#999"
                className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 py-2 text-[16px]"
              />
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

            {/* 🧾 Kayıt linki */}
            <Text className="text-[15px] text-[#1C1C1C] font-extrabold mb-5">
              Kayıtlı değil misin?{" "}
              <Text
                onPress={() => router.push("/auth/register")}
                className="text-[#0C94B9] underline"
              >
                Kayıt ol.
              </Text>
            </Text>

            {/* 🔹 Google Giriş */}
            <Pressable
              onPress={() => Alert.alert("Google girişi henüz aktif değil.")}
              style={{
                width: width * 0.5,
                height: 40,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowOffset: { width: 4, height: 4 },
                shadowRadius: 4,
              }}
              className="bg-[#0C94B9] rounded-lg flex-row items-center justify-center"
            >
              <Image
                source={require("@/assets/icons/google.png")}
                className="w-5 h-5 mr-2"
                resizeMode="contain"
              />
              <Text className="text-white text-[16px] font-medium">
                Google ile Giriş Yap
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
