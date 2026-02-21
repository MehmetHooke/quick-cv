// app/index.tsx
import { useTheme } from "@/context/ThemeContext";
import { auth } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const [checking, setChecking] = useState(true);
  const routedRef = useRef(false); // çifte yönlendirmeyi engeller

  const { themeLoading } = useTheme();

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        // 1) Önce onboarding bak
        const seen = await AsyncStorage.getItem("onboardingSeen");
        if (!seen) {
          if (!routedRef.current) {
            routedRef.current = true;
            router.replace("/onboarding/onboarding1");
          }
          setChecking(false);
          return;
        }

        // 2) Kullanıcı oturumunu dinle
        unsub = onAuthStateChanged(auth, (user) => {
          if (routedRef.current) return;

          if (user) {
            // ✅ Kullanıcı zaten giriş yapmış → otomatik olarak ana sekmelere
            routedRef.current = true;
            router.replace("/(tabs)");
          } else {
            // ❌ Kullanıcı yok → login ekranına
            routedRef.current = true;
            router.replace("/auth/login");
          }
          setChecking(false);
        });
      } catch (e) {
        console.log("Index kontrol hatası:", e);
        routedRef.current = true;
        router.replace("/auth/login");
        setChecking(false);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (checking|| themeLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0C94B9" />
        <Text className="mt-4 text-lg font-bold text-[#0C94B9]">
          QuickCV Yükleniyor...
        </Text>
      </View>
    );
  }

  return null;
}
