import { auth } from "@/firebaseConfig";
import { logAuthEvent } from "@/services/authLogService";
import { createUserDocIfNotExists } from "@/services/userService";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  // 🔍 Debug: Expo'nun bu ortam için hesapladığı redirect
  const debugRedirectUri = makeRedirectUri({
    scheme: "quicklycv",
  });

  // Uygulama açılır açılmaz bir kez loglasın
  logAuthEvent("google_init", {
    debugRedirectUri,
    hasAndroidClientId: !!process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    hasWebClientId: !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  }).catch(() => {});

  // ✅ Google request'i oluştur
  const [request, response, promptAsyncBase] = Google.useIdTokenAuthRequest({
    // Web client (auth.expo.io için oluşturduğun)
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    // Android client (package + SHA-1 ile oluşturduğun)
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
  });

  // ▶️ Request ilk oluştuğunda logla
  useEffect(() => {
    if (!request) return;

    const anyReq: any = request;

    logAuthEvent("google_request_created", {
      requestRedirectUri: anyReq.redirectUri ?? null,
      clientId: anyReq.clientId ?? null,
      scopes: anyReq.scopes ? JSON.stringify(anyReq.scopes) : null,
    }).catch(() => {});
  }, [request]);

  // ▶️ Butona basıldığında logla
  async function promptWithLog() {
    const anyReq: any = request;

    await logAuthEvent("promptAsync_called", {
      hasRequest: !!request,
      requestRedirectUri: anyReq?.redirectUri ?? null,
    });

    return promptAsyncBase();
  }

  // ▶️ Google'dan dönen response'u işle
  useEffect(() => {
    const handleSignIn = async () => {
      const anyRes: any = response;

      if (response) {
        await logAuthEvent("received_response", {
          type: anyRes?.type ?? null,
          hasParams: !!anyRes?.params,
          params: anyRes?.params
            ? JSON.stringify(anyRes.params)
            : null,
          hasError: !!anyRes?.error,
          error: anyRes?.error
            ? JSON.stringify(anyRes.error)
            : null,
        });
      }

      if (!response) return;

      if (response.type !== "success") {
        await logAuthEvent("response_not_success", {
          type: anyRes?.type ?? null,
          hasError: !!anyRes?.error,
          error: anyRes?.error
            ? JSON.stringify(anyRes.error)
            : null,
        });
        return;
      }

      const id_token: string | undefined = anyRes.params?.id_token;

      if (!id_token) {
        await logAuthEvent("no_id_token_returned", {
          params: anyRes?.params
            ? JSON.stringify(anyRes.params)
            : null,
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
          email: result.user.email ?? null,
        });

        await createUserDocIfNotExists(result.user);

        await logAuthEvent("redirecting_to_tabs");
        router.replace("/(tabs)");
      } catch (err: any) {
        console.log("Google login error:", err);
        await logAuthEvent("signInWithCredential_error", {
          message: err?.message ?? null,
          code: err?.code ?? null,
        });
      }
    };

    handleSignIn().catch(async (err) => {
      await logAuthEvent("outer_catch", {
        message: (err as any)?.message ?? null,
      });
    });
  }, [response]);

  return {
    request,
    promptAsync: promptWithLog,
  };
}
