import React from "react";
import { View, Text, Image, Pressable, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  item: { id: string; name: string; description: string; image: any };
  onPreview?: (item: any) => void;
  onUse?: (item: any) => void;   // ✅ yeni
};

export default function CVCard({ item, onPreview, onUse }: Props) {
  const cardWidth = width * 0.9;
  const imageHeight = cardWidth * 1.4;

  return (
    <View
      className="bg-white rounded-2xl shadow-md shadow-sky-700 p-4 mb-6"
      style={{ width: cardWidth, alignSelf: "center" }}
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
      <Text className="text-[#0C94B9] font-extrabold text-lg mt-3 text-center">
        {item.name}
      </Text>

      {/* Açıklama */}
      <Text className="text-gray-600 text-sm text-center mt-1">
        {item.description}
      </Text>

      {/* Buton */}
      <Pressable
        onPress={() => onUse?.(item)}          // ✅ çalıştır
        disabled={!onUse}                      // (opsiyonel güvenlik)
        className={`mt-4 rounded-lg py-2 px-4 self-center flex-row items-center
          ${onUse ? "bg-[#0C94B9]" : "bg-gray-300"}`}
      >
        <Text className="text-white text-[15px] font-semibold mr-2">
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
