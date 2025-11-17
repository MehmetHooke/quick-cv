// app/(tabs)/historycv.tsx
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { CVData, ThemeKey } from "@/context/CVContext";
import { useCV } from "@/context/CVContext";

type SavedCV = CVData & {
  firestoreId: string; // Firestore doküman id'si
  createdAt?: any;
  updatedAt?: any;
};

export default function HistoryCv() {
  const router = useRouter();
  const { updateCV } = useCV();

  const [items, setItems] = useState<SavedCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = auth.currentUser;

  //new
  const THEME_LABELS: Record<string, string> = {
  classic: "Classic Blue",
  modern: "Modern Minimalist CV",
  minimal: "Minimalist Sade",

  pinkModern: "Pembe Modern",
  navyBlueModern: "Açık Mavi Modern CV",
  tealWave: "Teal Wave",
};

  const formatDate = (ts: any) => {
    if (!ts) return "-";
    try {
      const d: Date = ts.toDate ? ts.toDate() : new Date(ts);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return "-";
    }
  };

  const fetchCVs = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cvsRef = collection(db, "users", user.uid, "cvs");
      const q = query(cvsRef, orderBy("updatedAt", "desc"));
      const snap = await getDocs(q);

      const data: SavedCV[] = snap.docs.map((doc) => {
        const raw = doc.data() as any;
        return {
          ...(raw as CVData),
          firestoreId: doc.id,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
        };
      });

      setItems(data);
    } catch (e) {
      console.error("Geçmiş CV'ler yüklenirken hata:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCVs();
    setRefreshing(false);
  }, []);

  const handleOpenCV = (item: SavedCV) => {
    // 🔥 Tüm context'i bu kayda göre doldur
    updateCV("id", item.firestoreId);
    updateCV("theme", (item.theme as ThemeKey) || "classic");
    updateCV("personalInfo", item.personalInfo || {});
    updateCV("education", item.education || []);
    updateCV("experiences", item.experiences || []);
    updateCV("certificates", item.certificates || []);
    updateCV("skills", item.skills || []);
    updateCV("languages", item.languages || []);
    updateCV("about", item.about || "");

    // Artık sanki yeni CV oluşturuyormuş gibi adımlara gidebiliriz
    // Ben direkt önizlemeye attım; istersen "/newcv/personal-info" yapabilirsin
    router.push("/newcv/personal-info");
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg font-semibold text-gray-800 text-center">
          Geçmiş CV'lerini görebilmek için lütfen önce giriş yap.
        </Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-gray-600">Geçmiş CV'lerin yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-8 ">
      <View className="px-5 pt-6 pb-3 border-b border-gray-200">
        <Text className="text-2xl font-bold text-[#0C94B9]">
          Benim CV'lerim
        </Text>
        <Text className="text-gray-500 mt-1">
          Geçmişte oluşturduğun CV'leri buradan görüntüleyip düzenleyebilirsin.
        </Text>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-gray-600 text-center">
            Henüz kayıtlı bir CV'n yok.{"\n"}
            Yeni bir CV oluşturduğunda burada görünecek.
          </Text>
        </View>
      ) : (
        <FlatList 
          data={items}
          keyExtractor={(item) => item.firestoreId}
          contentContainerStyle={{ padding: 16, paddingBottom: 122 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const fullName =
              (item.personalInfo?.firstName || "") +
              " " +
              (item.personalInfo?.lastName || "");
            const themeLabelMap: Record<string, string> = {
              classic: "Klasik",
              modern: "Modern",
              minimal: "Minimal",
              tealwave: "Teal Wawe",
              pinkModern: "Pembe Modern",
              navyBlueModern: "Açık Mavi Modern"
            };
            const themeLabel =
              themeLabelMap[item.theme] || item.theme || "Bilinmeyen Tema";

            return (
              <TouchableOpacity
                onPress={() => handleOpenCV(item)}
                className="mb-4 rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3"
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {fullName.trim() || "İsimsiz CV"}
                  </Text>
                  <Text className="text-xs px-2 py-1 rounded-full bg-cyan-50 text-cyan-700 font-semibold">
                    {themeLabel}
                  </Text>
                </View>

                {item.personalInfo?.headline ? (
                  <Text
                    className="text-sm text-gray-700"
                    numberOfLines={1}
                  >
                    {item.personalInfo.headline}
                  </Text>
                ) : null}

                {item.about ? (
                  <Text
                    className="text-xs text-gray-500 mt-1"
                    numberOfLines={2}
                  >
                    {item.about}
                  </Text>
                ) : null}

                <View className="flex-row justify-between items-center mt-3">
                  <Text className="text-xs text-gray-400">
                    Son güncelleme: {formatDate(item.updatedAt || item.createdAt)}
                  </Text>
                  <Text className="text-xs font-semibold text-cyan-700">
                    Düzenle / Görüntüle
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
