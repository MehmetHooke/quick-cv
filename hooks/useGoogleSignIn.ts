import { auth } from "@/firebaseConfig";
import { logAuthEvent } from "@/services/authLogService";
import { createUserDocIfNotExists } from "@/services/userService";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
  });

  useEffect(() => {
    const handleSignIn = async () => {
      // response geldiğinde ama success değilse logla
      if (response && response.type !== "success") {
        await logAuthEvent("warn", "google_response_not_success", {
          type: response.type,
          error: (response as any).error,
          params: (response as any).params,
        });
        return;
      }

      if (response?.type !== "success") return;

      const { id_token } = response.params;
      if (!id_token) {
        await logAuthEvent("error", "google_no_id_token", {
          params: response.params,
        });
        return;
      }

      try {
        const credential = GoogleAuthProvider.credential(id_token);
        const result = await signInWithCredential(auth, credential);

        await createUserDocIfNotExists(result.user);

        await logAuthEvent("info", "google_login_success", {
          uid: result.user.uid,
          providerId: result.user.providerData[0]?.providerId,
        });

        router.replace("/(tabs)");
      } catch (err: any) {
        console.log("Google login error:", err);
        await logAuthEvent("error", "google_signInWithCredential_error", {
          message: err?.message,
          code: err?.code,
        });
      }
    };

    handleSignIn().catch(async (err) => {
      console.log("Google login outer error:", err);
      await logAuthEvent("error", "google_handleSignIn_outer_catch", {
        message: (err as any)?.message,
      });
    });
  }, [response]);

  return {
    request,
    promptAsync,
  };
}
