// app/auth/forgotpassword.tsx (örnek path)

import { auth } from "@/firebaseConfig";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
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
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendResetEmail = async () => {
    const trimmed = email.trim();

    if (!trimmed) {
      Alert.alert("Uyarı", "Lütfen e-posta adresinizi girin.");
      return;
    }

    setSending(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);

      // Güvenlik / gizlilik için hep aynı mesaj:
      Alert.alert(
        "E-posta Gönderildi",
        "Girdiğiniz e-posta adresine ait bir hesap varsa, bu adrese şifre sıfırlama bağlantısı gönderildi. Lütfen e-posta gelen kutunuzu (ve spam klasörünü) kontrol edin."
      );

      // İstersen başarıdan sonra login sayfasına yönlendirebiliriz:
      router.push("/auth/login");
    } catch (error: any) {
      console.log("Şifre sıfırlama hatası:", error);

      // kullanıcıya yine de genel bir mesaj verelim
      Alert.alert(
        "Bilgilendirme",
        "Girdiğiniz e-posta adresine ait bir hesap varsa, şifre sıfırlama bağlantısı gönderildi. Eğer e-posta göremiyorsanız adresi kontrol edip tekrar deneyebilirsiniz."
      );
    } finally {
      setSending(false);
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

            {/* 📝 Açıklama */}
            <View className="w-[80%] mt-4 mb-6">
              <Text className="text-[#1E1E1E] font-extrabold text-[20px] mb-2">
                Şifreni mi unuttun?
              </Text>
              <Text className="text-[#1E1E1E] text-[14px] leading-5">
                Aşağıya kayıt olurken kullandığın e-posta adresini yaz.
                Bu e-posta adresine ait bir hesabın varsa,{" "}
                <Text className="font-semibold">QuicklyCV</Text> tarafından
                şifre sıfırlama bağlantısı gönderilecek. Gelen e-postadaki
                linke tıklayarak yeni parolanı oluşturabilirsin.
              </Text>
            </View>

            {/* 📧 E-posta input */}
            <View className="w-[80%] mb-6">
              <Text className="text-[#1E1E1E] font-extrabold text-[16px] mb-1">
                E-posta adresin
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@gmail.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white border-[3px] border-[#0C94B9] rounded-lg px-4 py-2 text-[16px]"
              />
            </View>

            {/* 🔵 Şifre sıfırlama butonu */}
            <Pressable
              onPress={handleSendResetEmail}
              disabled={sending}
              style={{
                width: "70%",
                height: 44,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowOffset: { width: 4, height: 4 },
                shadowRadius: 4,
                opacity: sending ? 0.7 : 1,
              }}
              className="bg-[#0C94B9] rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-white text-[16px] font-medium mr-2">
                {sending ? "Gönderiliyor..." : "Şifre sıfırlama maili gönder"}
              </Text>
              {!sending && (
                <Image
                  source={require("@/assets/icons/chevron-right.png")}
                  className="w-4 h-4"
                  resizeMode="contain"
                />
              )}
            </Pressable>

            {/* 🔙 Geri dön (Giriş ekranına) */}
            <Text className="text-center text-[15px] text-[#1C1C1C] font-extrabold mt-6">
              Şifreni hatırladın mı?{" "}
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
    </ImageBackground>
  );
};

export default ForgotPasswordScreen;
