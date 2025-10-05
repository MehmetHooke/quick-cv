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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { app } from "@/firebaseConfig";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen() {
  const auth = getAuth(app);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      Alert.alert("Başarılı", "Kayıt işlemi tamamlandı!");
      router.replace("/(tabs)");
    } catch (error: any) {
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              paddingVertical: 40,
            }}
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
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  secureTextEntry
                  placeholderTextColor="#999"
                  className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 py-2 text-[16px]"
                />
              </View>

              {/* Şifre Tekrar */}
              <View className="mb-6">
                <Text className="text-[#1E1E1E] font-extrabold text-[16px] mb-1">
                  Şifre Tekrar
                </Text>
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="********"
                  secureTextEntry
                  placeholderTextColor="#999"
                  className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 py-2 text-[16px]"
                />
              </View>

              {/* 🔵 Kayıt Ol Butonu */}
              <Pressable
                onPress={handleRegister}
                style={{
                  width: "60%",
                  alignSelf: "center",
                  height: 44,
                  shadowColor: "#000",
                  shadowOpacity: 0.25,
                  shadowOffset: { width: 4, height: 4 },
                  shadowRadius: 4,
                }}
                className="bg-[#0C94B9] rounded-lg flex-row items-center justify-center"
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
