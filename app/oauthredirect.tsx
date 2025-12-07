// app/oauthredirect.tsx
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function OAuthRedirectScreen() {
  useEffect(() => {
    // Google AuthSession zaten URL'i yakalayıp response'u set ediyor.
    // Biz burada sadece kullanıcıyı anlamlı bir yere geri atabiliriz.
    router.replace("/(tabs)"); // veya "/(tabs)" – hangisini istersen
  }, []);

  // Boş bir view; kullanıcı bu ekranı görse bile siyah bir flash olarak görür maksimum.
  return <View style={{ flex: 1 }} />;
}
