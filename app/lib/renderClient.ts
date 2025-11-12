// app/lib/renderClient.ts
import * as FileSystem from "expo-file-system/legacy";

export type Theme = "classic" | "modern" | "minimal";

export async function renderPdf({
  endpoint, apiKey, data, theme
}: { endpoint: string; apiKey: string; data: unknown; theme: Theme; }) {
  const res = await fetch(`${endpoint}/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/pdf",
      "x-api-key": apiKey
    },
    body: JSON.stringify({ data, theme })
  });

  if (!res.ok) {
    let info = "";
    try { info = await res.text(); } catch {}
    throw new Error(`HTTP_${res.status}: ${info || "render_failed"}`);
  }

  // RN/Expo uyumluluğu: arrayBuffer() ile oku
  const arrayBuffer = await res.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const uri = FileSystem.cacheDirectory! + `cv-${theme}-${Date.now()}.pdf`;

  // Buffer polyfill’i app/_layout.tsx’te ekledin:
  // import { Buffer } from "buffer"; (global as any).Buffer = Buffer;
  // Legacy API’de EncodingType çalışır; yine de string "base64" veriyoruz.
  // @ts-ignore
  await FileSystem.writeAsStringAsync(uri, Buffer.from(bytes).toString("base64"), {
    encoding: "base64" as any
  });

  return uri;
}
