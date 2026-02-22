// app/(tabs)/historycv.tsx
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useAppAlert } from "@/components/common/AppAlertProvider";
import type { CVData, ThemeKey } from "@/context/CVContext";
import { useCV } from "@/context/CVContext";
import { useTheme } from "@/context/ThemeContext";

type SavedCV = CVData & {
  firestoreId: string; // Firestore doküman id'si
  createdAt?: any;
  updatedAt?: any;
};

export default function HistoryCv() {
  const router = useRouter();
  const { updateCV } = useCV();
  const { theme } = useTheme();
  const { alert, confirm } = useAppAlert();
  const [items, setItems] = useState<SavedCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = auth.currentUser;

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

    router.push("/newcv/personal-info");
  };

  // 🔹 Kullanıcı yoksa
  if (!user) {
    return (
      <ImageBackground
        source={theme.bgImage}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-lg font-semibold text-center"
            style={{ color: theme.colors.text }}
          >
            Geçmiş CV'lerini görebilmek için lütfen önce giriş yap.
          </Text>
        </View>
      </ImageBackground>
    );
  }
  // Silme fonksiyonu

  const handleDelete = (firestoreId: string) => {

    confirm({
      title: "Emin misiniz?",
      message: "Bu CV kalıcı olarak silinecek.",
      variant: "warning",
      dismissible: false,
      cancelText: "Vazgeç",
      confirmText: "Sil",
      onConfirm: async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          await deleteDoc(doc(db, "users", user.uid, "cvs", firestoreId));

          setItems((prev) => prev.filter((item) => item.firestoreId !== firestoreId));

          // confirm'in kapanmasına 1 tick ver
          setTimeout(() => {
            alert("Başarılı!", "Başarıyla geçmişte oluşturduğunuz CV silindi.", { variant: "success" });
          }, 0);
        } catch (error) {
          console.log("Silme hatası:", error);
          setTimeout(() => {
            alert("Hata", "Silinirken bir problem oluştu.", { variant: "danger" });
          }, 0);
        }
      },
    });


  };




  // 🔹 İlk yükleme
  if (loading && !refreshing) {
    return (
      <ImageBackground
        source={theme.bgImage}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            className="mt-3"
            style={{ color: theme.colors.mutedText }}
          >
            Geçmiş CV'lerin yükleniyor...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={theme.bgImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 pt-8">
        {/* Header */}
        <View
          className="px-5 pt-6 pb-3 border-b"
          style={{ borderColor: theme.colors.inputBorder }}
        >
          <Text
            className="text-3xl font-extrabold  text-center mt-4 mb-7"
            style={{ color: theme.colors.primary }}
          >
            Benim CV'lerim
          </Text>
          <Text
            className="mt-1 font-bold"
            style={{ color: theme.colors.text }}
          >
            Geçmişte oluşturduğun CV'leri buradan görüntüleyip düzenleyebilirsin.
          </Text>
        </View>

        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text
              className="text-base text-center"
              style={{ color: theme.colors.mutedText }}
            >
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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
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
                pinkModern: "Pembe Modern",
                tealWave: "Teal Wave",
                navyBlueModern: "Açık Mavi Modern",
                amberRibbon: "Amber Ribbon",
                graphiteGrid: "Graphite Grid",
                auroraSplit: "Aurora Split",
              };
              const themeLabel =
                themeLabelMap[item.theme] || item.theme || "Bilinmeyen Tema";

              return (
                <TouchableOpacity
                  onPress={() => handleOpenCV(item)}
                  className="mb-4 rounded-2xl shadow-sm px-4 py-3"
                  style={{
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.inputBorder,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className="text-lg font-semibold"
                      style={{ color: theme.colors.text }}
                    >
                      {fullName.trim() || "İsimsiz CV"}
                    </Text>
                    <Text
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{
                        backgroundColor: theme.colors.inputBg,
                        color: theme.colors.historythemeLabel,
                      }}
                    >
                      {themeLabel}
                    </Text>
                  </View>

                  {item.personalInfo?.headline ? (
                    <Text
                      className="text-sm"
                      style={{ color: theme.colors.text }}
                      numberOfLines={1}
                    >
                      {item.personalInfo.headline}
                    </Text>
                  ) : null}

                  {item.about ? (
                    <Text
                      className="text-xs mt-1"
                      style={{ color: theme.colors.mutedText }}
                      numberOfLines={2}
                    >
                      {item.about}
                    </Text>
                  ) : null}

                  <View className="flex-row justify-between items-center mt-3">
                    <Text
                      className="text-xs"
                      style={{ color: theme.colors.mutedText }}
                    >
                      Son güncelleme:{" "}
                      {formatDate(item.updatedAt || item.createdAt)}
                    </Text>


                    {/* Sil butonu */}
                    <TouchableOpacity
                      onPress={(e: any) => {
                        // Kartın onPress'inin tetiklenmesini engelle
                        e?.stopPropagation?.();
                        handleDelete(item.firestoreId);
                      }}
                      className="ml-3 px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: "#fee2e2",
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: "#b91c1c" }}
                      >
                        Sil
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </ImageBackground>
  );
}
