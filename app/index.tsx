// app/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default function Index() {
  const [checking, setChecking] = useState(true);
  const routedRef = useRef(false); // çifte yönlendirmeyi engeller

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        // 1) Onboarding
        const seen = await AsyncStorage.getItem("onboardingSeen");
        if (!seen) {
          if (!routedRef.current) {
            routedRef.current = true;
            router.replace("/onboarding/onboarding1");
          }
          setChecking(false);
          return;
        }

        // 2) Auth
        unsub = onAuthStateChanged(auth, (user) => {
          if (routedRef.current) return; // zaten yönlendirdiysen dur
          routedRef.current = true;

          if (user) {
            router.replace("/(tabs)");
          } else {
            router.replace("/auth/login");
          }
          setChecking(false);
        });
      } catch (e) {
        console.error("Bootstrap error:", e);
        if (!routedRef.current) {
          routedRef.current = true;
          router.replace("/auth/login");
        }
        setChecking(false);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (checking) {
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
