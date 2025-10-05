import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");

      // Kullanıcı oturumu varsa → tablara
      onAuthStateChanged(auth, (user) => {
        if (user) {
          router.replace("/(tabs)");
        } else if (hasSeen === "true") {
          router.replace("/auth/login");
        } else {
          router.replace("/onboarding/onboarding1");
        }
        setLoading(false);
      });
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
