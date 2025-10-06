import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // ✅ 1. Onboarding durumu kontrol et
        const seen = await AsyncStorage.getItem("onboardingSeen");

        if (!seen) {
          // onboarding hiç görülmediyse
          router.replace("/onboarding/onboarding1");
          return;
        }

        // ✅ 2. Kullanıcı oturumunu kontrol et
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            router.replace("/(tabs)");
          } else {
            router.replace("/auth/login");
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (e) {
        console.error(e);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0C94B9" />
        <Text className="mt-4 text-lg font-bold text-[#0C94B9]">
          QuicklyCV Yükleniyor...
        </Text>
      </View>
    );
  }

  return null;
}
