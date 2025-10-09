import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/app/global.css";
import { CVProvider } from "../context/CVContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CVProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Onboarding ekranları */}
          <Stack.Screen name="onboarding" />

          {/* Auth (login/register) ekranları */}
          <Stack.Screen name="auth" />

          {/* Tab navigasyonu */}
          <Stack.Screen name="(tabs)" />

          {/* 💡 newcv adım adım CV oluşturma sayfaları */}
          <Stack.Screen name="newcv" />
        </Stack>
      </CVProvider>
    </GestureHandlerRootView>
  );
}
