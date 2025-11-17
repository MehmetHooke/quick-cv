import { auth } from "@/firebaseConfig";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
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
  useWindowDimensions,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { clamp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const logoSize = clamp(width * 0.8, 220, 360);

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
      Alert.alert("Giriş Hatası", "Kullanıcı Adı Veya Şifre Hatalı !");
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

            {/* // İLERİDE GOOGLE GİRİŞ İÇİN BURAYA BUTON EKLERİZ */}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
