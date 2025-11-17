// app/lib/renderClient.ts
import * as FileSystem from "expo-file-system/legacy";

export type Theme =
  | "classic"
  | "modern"
  | "minimal"
  | "pinkModern"
  | "navyBlueModern";

// Mobil tarafta güvenli dosya adı üretici
function makeSafeFilename(input: string, fallback: string) {
  if (!input) return fallback;

  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")   // aksanları sil
    .replace(/\s+/g, "_")              // boşluk -> _
    .replace(/[^a-zA-Z0-9_-]+/g, "")   // diğer karakterleri temizle
    .replace(/^_+|_+$/g, "")           // baş/son alt çizgileri temizle
    .slice(0, 50);                     // çok uzunsa kısalt

  return base || fallback;
}

export async function renderPdf({
  endpoint,
  apiKey,
  data,
  theme,
}: {
  endpoint: string;
  apiKey: string;
  data: any;      // personalInfo'ya erişebilmek için any
  theme: Theme;
}) {
  const res = await fetch(`${endpoint}/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/pdf",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ data, theme }),
  });

  if (!res.ok) {
    let info = "";
    try {
      info = await res.text();
    } catch {}
    throw new Error(`HTTP_${res.status}: ${info || "render_failed"}`);
  }

  // RN/Expo uyumluluğu: arrayBuffer() ile oku
  const arrayBuffer = await res.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // 🔹 Kullanıcı adından dosya adı üret
  const pi = (data as any)?.personalInfo ?? {};
  const fullName = [pi.firstName, pi.lastName].filter(Boolean).join(" ");
  const rawBaseName = fullName || `cv-${theme}`;
  const safeFileName = makeSafeFilename(rawBaseName, `cv-${theme}`);

  const uri = FileSystem.cacheDirectory! + `${safeFileName}.pdf`;

  // Buffer polyfill’i app/_layout.tsx’te:
  // import { Buffer } from "buffer"; (global as any).Buffer = Buffer;
  // @ts-ignore
  await FileSystem.writeAsStringAsync(
    uri,
    Buffer.from(bytes).toString("base64"),
    {
      encoding: "base64" as any,
    }
  );

  return uri;
}
