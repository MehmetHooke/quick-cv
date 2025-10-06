import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/app/global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar  style="auto"  />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Onboarding ekranları */}
        <Stack.Screen name="onboarding" />

        {/* Auth (login/register) ekranları */}
        <Stack.Screen name="auth" />

        {/* Tab navigasyonu */}
        <Stack.Screen name="(tabs)"/>
      </Stack>
    </GestureHandlerRootView>
  );
}
