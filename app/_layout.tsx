// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/app/global.css";
import { CVProvider } from "@/context/CVContext";

import { Buffer } from "buffer";
(global as any).Buffer = Buffer;


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CVProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="newcv" />
        </Stack>
      </CVProvider>
    </GestureHandlerRootView>
  );
}
