import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "@/app/global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Onboarding ekranları */}
        <Stack.Screen name="onboarding" />

        {/* Tab navigasyonu */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
