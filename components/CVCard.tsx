import { isPremiumTemplate } from "@/app/lib/themes";
import { usePremium } from "@/context/PremiumContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  item: { id: string; name: string; description: string; image: any };
  onPreview?: (item: any) => void;
  onUse?: (item: any) => void;
  variant?: "full" | "grid"; // full = tek sütun, grid = 2 sütun
};

export default function CVCard({
  item,
  onPreview,
  onUse,
  variant = "full",
}: Props) {
  // 🔹 Global tema
  const { theme } = useTheme();
  const { isPremium } = usePremium();
  const router = useRouter();

  // 🔹 Kart genişliği hesaplama
  const horizontalPadding = 20; // FlatList columnWrapperStyle ile uyumlu
  const gap = 12;

  const fullWidth = width * 0.9;
  const gridWidth = (width - horizontalPadding * 2 - gap) / 2;

  const cardWidth = variant === "grid" ? gridWidth : fullWidth;

  // 🔹 Görsel oranı — biraz daha kompakt yapalım ki boşluk hissi azalsın
  const imageHeight = cardWidth * (variant === "grid" ? 1.2 : 1.3);

  // 🔹 Grid kartları için biraz daha kısa minHeight
  const minHeight = variant === "grid" ? 280 : 350;

  const isUsable = !!onUse;

  // 🔹 Bu tema premium mu?
  const premiumTemplate = isPremiumTemplate(item.id);
  // Kullanıcı premium DEĞİLSE ve tema premium ise badge gözüksün
  const showPremiumBadge = premiumTemplate && !isPremium;

  const handleUsePress = () => {
    if (!isUsable) return;

    // Kullanıcı premium değil ve premium tema seçti → Paywall'a yönlendir
    if (premiumTemplate && !isPremium) {
      router.push("./paywall");//burasında replace kullanılabilir düzgün göndermiyor app altında olunca
      return;
    }

    // Normal davranış
    onUse?.(item);
  };

  return (
    <View
      className="rounded-2xl mb-6 flex-col justify-between"
      style={{
        width: cardWidth,
        alignSelf: variant === "grid" ? "auto" : "center",
        minHeight,
        // Tema uyumlu kart stili
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
        padding: 12,
        position: "relative", // 🔹 Badge için gerekli
      }}
    >
      {/* 🔸 PREMIUM Badge (sağ üst köşe) */}
      {showPremiumBadge && (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: "#f59e0b",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              color: "#111827",
              fontWeight: "700",
              fontSize: 10,
            }}
          >
            PREMIUM
          </Text>
        </View>
      )}

      {/* CV Görseli */}
      <Pressable onPress={() => onPreview?.(item)}>
        <View
          style={{
            width: "100%",
            height: imageHeight,
            borderRadius: 8,
            overflow: "hidden", // 🔥 Kenarlardaki boşluk algısını azaltmak için crop
            backgroundColor: theme.colors.inputBg,
          }}
        >
          <Image
            source={item.image}
            style={{ width: "100%", height: "100%" }}
            // Daha dolu görünmesi için cover — detay için zaten modalda büyük önizleme var
            resizeMode="cover"
          />
        </View>
      </Pressable>

      {/* CV Adı */}
      <Text
        className="font-extrabold text-md mt-3 text-center"
        style={{ color: theme.colors.text }}
        numberOfLines={2}
      >
        {item.name}
      </Text>

      {/* Açıklama */}
      <Text
        className="text-xs text-center mt-1"
        style={{ color: theme.colors.mutedText }}
        numberOfLines={3}
      >
        {item.description}
      </Text>

      {/* Buton */}
      <Pressable
        onPress={handleUsePress}
        disabled={!isUsable}
        style={{
          marginTop: 10,
          borderRadius: 999,
          paddingVertical: 8,
          paddingHorizontal: 16,
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isUsable
            ? theme.colors.buttonBg
            : theme.colors.inputBorder,
          opacity: isUsable ? 1 : 0.7,
        }}
      >
        <Text className="text-white text-sm font-semibold mr-2">
          Temayı Seç
        </Text>
        <Image
          source={require("@/assets/icons/chevron-right.png")}
          style={{ width: 16, height: 16 }}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}
