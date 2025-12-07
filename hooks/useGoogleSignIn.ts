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
  // ✅ Hem Android hem Expo (web) client id veriyoruz
  const [request, response, promptAsyncBase] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    // istersen scopes da ekleyebilirsin:
    // scopes: ["profile", "email"],
  });

  async function promptWithLog() {
    await logAuthEvent("promptAsync_called", {
      hasRequest: !!request,
    });
    return promptAsyncBase();
  }

  useEffect(() => {
    const handleSignIn = async () => {
      if (response) {
        const r: any = response;
        await logAuthEvent("received_response", {
          type: r.type,
          params: r.params,
          error: r.error,
        });
      }

      if (!response) return;

      if (response.type !== "success") {
        const r: any = response;
        await logAuthEvent("response_not_success", {
          type: r.type,
          error: r.error,
          params: r.params,
        });
        return;
      }

      const r: any = response;
      const id_token: string | undefined = r.params?.id_token;

      if (!id_token) {
        await logAuthEvent("no_id_token_returned", {
          params: r.params,
        });
        return;
      }

      try {
        await logAuthEvent("creating_credential");

        const credential = GoogleAuthProvider.credential(id_token);

        await logAuthEvent("signInWithCredential_started");
        const result = await signInWithCredential(auth, credential);

        await logAuthEvent("firebase_login_success", {
          uid: result.user.uid,
          email: result.user.email,
        });

        await createUserDocIfNotExists(result.user);

        await logAuthEvent("redirecting_to_tabs");
        router.replace("/(tabs)");
      } catch (err: any) {
        console.log("Google login error:", err);
        await logAuthEvent("signInWithCredential_error", {
          message: err?.message,
          code: err?.code,
        });
      }
    };

    handleSignIn().catch(async (err) => {
      await logAuthEvent("outer_catch", {
        message: (err as any)?.message,
      });
    });
  }, [response]);

  return {
    request,
    promptAsync: promptWithLog,
  };
}
