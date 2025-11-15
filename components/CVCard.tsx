import React from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  item: { id: string; name: string; description: string; image: any };
  onPreview?: (item: any) => void;
  onUse?: (item: any) => void;
  variant?: "full" | "grid"; // 🔹 full = tek sütun, grid = 2 sütun
};


export default function CVCard({
  item,
  onPreview,
  onUse,
  variant = "full",
}: Props) {

  const { width } = Dimensions.get("window");

  // 🔹 Tek sütun görünümde eski davranış:
  const fullWidth = width * 0.9;

  // 🔹 Grid görünüm için (2 sütun, kenarlarda padding ve arada gap varmış gibi düşünelim)
  const horizontalPadding = 20; // FlatList columnWrapperStyle ile uyumlu
  const gap = 12;
  const gridWidth = (width - horizontalPadding * 2 - gap) / 2;

  const cardWidth = variant === "grid" ? gridWidth : fullWidth;
  const imageHeight = cardWidth * 1.4;
  return (
      <View
        className="bg-white rounded-2xl shadow-sm shadow-primary p-4 mb-6 flex-col justify-between"
        style={{
          width: cardWidth,
          alignSelf: variant === "grid" ? "auto" : "center",
          minHeight: 350, // 🔥 butonu sabit aşağıda tutar
        }}
      >

      {/* CV Görseli */}
      <Pressable onPress={() => onPreview?.(item)}>
        <Image
          source={item.image}
          style={{ width: "100%", height: imageHeight, borderRadius: 12 }}
          resizeMode="contain"
        />
      </Pressable>

      {/* CV Adı */}
      <Text className="text-[#0C94B9] font-extrabold text-md mt-3 text-center">
        {item.name}
      </Text>

      {/* Açıklama */}
      <Text className="text-gray-600 text-xs text-center mt-1">
        {item.description}
      </Text>

      {/* Buton */}
      <Pressable
        onPress={() => onUse?.(item)}          // ✅ çalıştır
        disabled={!onUse}                      // (opsiyonel güvenlik)
        className={`mt-4 rounded-lg py-2 px-4 self-center flex-row items-center
          ${onUse ? "bg-[#0C94B9]" : "bg-gray-300"}`}
      >
        <Text className="text-white text-sm font-semibold mr-2">
          Temayı Seç
        </Text>
        <Image
          source={require("@/assets/icons/chevron-right.png")}
          className="w-4 h-4"
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}
