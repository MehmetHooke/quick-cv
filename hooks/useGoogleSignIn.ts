import { auth } from "@/firebaseConfig";
import { createUserDocIfNotExists } from "@/services/userService";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  // 🔗 Standalone Android için beklenen redirect:
  // quicklycv://redirect
  const redirectUri = makeRedirectUri({
    scheme: "quicklycv", // app.json'daki scheme ile AYNI
    path: "redirect",
  });

  console.log("🔗 redirectUri:", redirectUri);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    redirectUri,
  });

  useEffect(() => {
    const handleSignIn = async () => {
      console.log("🔍 Google response:", response);

      if (response?.type !== "success") return;

      const { id_token } = response.params;
      if (!id_token) {
        console.log("Google login: id_token gelmedi");
        return;
      }

      const credential = GoogleAuthProvider.credential(id_token);
      const result = await signInWithCredential(auth, credential);

      await createUserDocIfNotExists(result.user);

      router.replace("/(tabs)");
    };

    handleSignIn().catch((err) => {
      console.log("Google login error:", err);
    });
  }, [response]);

  return {
    request,
    promptAsync,
  };
}
