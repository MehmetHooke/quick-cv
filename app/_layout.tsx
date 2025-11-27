// app/_layout.tsx
import "@/app/global.css";
import { CVProvider } from "@/context/CVContext";
import { PremiumProvider } from "@/context/PremiumContext"; // 🔹 EKLENDİ
import { ThemeProvider } from "@/context/ThemeContext";
import { Buffer } from "buffer";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

(global as any).Buffer = Buffer;

export default function RootLayout() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PremiumProvider> 
          <CVProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="newcv" />
            </Stack>
          </CVProvider>
        </PremiumProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
