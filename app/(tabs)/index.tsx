import { View, Text, Pressable, Alert } from "react-native";
import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { router } from "expo-router";

export default function HomeScreen() {

    const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/login"); // giriş ekranına dön
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl font-bold text-[#0C94B9]">
        Ana Sayfa (Tabs)
      </Text>




          <Pressable
        onPress={handleLogout}
        className="bg-[#0C94B9] rounded-lg px-6 py-3 shadow-md"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowOffset: { width: 2, height: 4 },
          shadowRadius: 4,
        }}
      >
        <Text className="text-white text-[16px] font-semibold">Çıkış Yap</Text>
      </Pressable>

    </View>

    
  );
}
