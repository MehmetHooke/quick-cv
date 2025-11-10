import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PinchGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useCV } from "@/context/CVContext";
import CVCard from "@/components/CVCard";

const { width, height } = Dimensions.get("window");

// 🔹 Tema listesi
const templates = [
  {
    id: "classic",
    name: "Classic Blue",
    description: "Minimal, modern ve profesyonel CV şablonu.",
    image: require("@/assets/templates/classic-blue.png"),
  },
  {
    id: "modern",
    name: "Elegant Gray",
    description: "Kurumsal ve sade bir tasarım isteyenler için.",
    image: require("@/assets/templates/elegant-gray.png"),
  },
  {
    id: "minimal",
    name: "Creative Accent",
    description: "Renkli ve yaratıcı sektörlere uygun CV stili.",
    image: require("@/assets/templates/creative-accent.png"),
  },
];

export default function HomeScreen() {
  const [selected, setSelected] = useState<(typeof templates)[0] | null>(null);
  const router = useRouter();
  const { updateCV } = useCV();

  // 🧭 Modal kapandıktan sonra çalıştırılacak navigasyon fonksiyonunu tutar
  const pendingNavRef = useRef<null | (() => void)>(null);

  // 🔍 Zoom animasyonu
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPinchGesture = (event: any) => {
    scale.value = event.nativeEvent.scale;
  };

  // 🔹 Karttaki "Temayı Seç" (modal açmadan direkt)
  const handleUseThemeDirect = (item: (typeof templates)[0]) => {
    updateCV("theme", item.id);
    router.push("/newcv/personal-info");
  };

  // 🔹 Modal içindeki "Bu Temayı Kullan" (önce modalı kapa, sonra yönlendir)
  const handleUseThemeFromModal = () => {
    if (!selected) return;
    updateCV("theme", selected.id);
    // Modal kapandıktan sonra çalışması için fonksiyonu sakla
    pendingNavRef.current = () => router.push("/newcv/personal-info");
    setSelected(null); // modalı kapat → onDismiss tetiklenecek
  };

  const renderItem = ({ item }: { item: (typeof templates)[0] }) => (
    <CVCard item={item} onPreview={() => setSelected(item)} onUse={handleUseThemeDirect} />
  );

  return (
    <View className="flex-1 bg-[#f5f5f5]">
      {/* 🔹 Arka plan */}
      <Image
        source={require("@/assets/images/profile-bg.png")}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      {/* Başlık */}
      <Text className="text-2xl font-extrabold text-white text-center mt-16 mb-4">
        CV Tasarımları
      </Text>

      {/* CV Kartları */}
      <FlatList
        data={templates}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 10 }}
      />

      {/* Önizleme Modal */}
      <Modal
        visible={!!selected}
        animationType="fade"
        transparent
        onDismiss={() => {
          if (pendingNavRef.current) {
            pendingNavRef.current();
            pendingNavRef.current = null;
          }
        }}
      >
        <View className="flex-1 bg-black/85 justify-center items-center px-5">
          <View className="w-full items-end mb-4">
            <Pressable
              onPress={() => setSelected(null)}
              className="flex-row items-center bg-[#0C94B9] rounded-lg px-5 py-2"
            >
              <Ionicons name="close" size={22} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">Kapat</Text>
            </Pressable>
          </View>

          <PinchGestureHandler onGestureEvent={onPinchGesture}>
            <Animated.View style={[animatedStyle]}>
              <Image
                source={selected?.image}
                style={{ width: width * 0.9, height: height * 0.7, borderRadius: 12 }}
                resizeMode="contain"
              />
            </Animated.View>
          </PinchGestureHandler>

          <Pressable
            onPress={handleUseThemeFromModal}
            className="mt-6 bg-[#0C94B9] rounded-lg px-8 py-4"
            disabled={!selected}
          >
            <Text className="text-white text-lg font-semibold">Bu Temayı Kullan</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
