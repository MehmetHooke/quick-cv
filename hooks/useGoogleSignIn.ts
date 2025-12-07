import { auth } from "@/firebaseConfig";
import { createUserDocIfNotExists } from "@/services/userService";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect, useState } from "react";

export function useGoogleSignIn() {
  const [isProcessing, setIsProcessing] = useState(false);

  const [request, response, promptAsyncBase] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
  });

  async function promptAsync() {
    setIsProcessing(true);
    return promptAsyncBase();
  }

  useEffect(() => {
    let cancelled = false;

    const handleSignIn = async () => {
      if (!response) return;

      if (response.type !== "success") {
        return; // kullanıcı iptal etti veya hata oluştu
      }

      const id_token = (response as any)?.params?.id_token;
      if (!id_token) return;

      try {
        const credential = GoogleAuthProvider.credential(id_token);
        const result = await signInWithCredential(auth, credential);

        await createUserDocIfNotExists(result.user);

        router.replace("/(tabs)");
      } catch (err) {
        console.log("Google login error:", err);
      }
    };

    handleSignIn().finally(() => {
      if (!cancelled) setIsProcessing(false);
    });

    return () => {
      cancelled = true;
    };
  }, [response]);

  return {
    request,
    promptAsync,
    isProcessing,
  };
}
