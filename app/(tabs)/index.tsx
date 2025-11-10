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
// 🔁 Yeni Gesture API
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
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

  // 🧭 Modal kapandıktan sonra çalıştırılacak navigasyon fonksiyonu
  const pendingNavRef = useRef<null | (() => void)>(null);

  // 🔍 Görüntü boyutu (modal içi)
  const IMG_W = width * 0.9;
  const IMG_H = height * 0.7;

  // 🔎 Zoom & Pan shared values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // clamp (worklet)
  const clamp = (v: number, min: number, max: number) => {
    "worklet";
    return Math.min(Math.max(v, min), max);
  };

  // Ölçeğe göre pan sınırı uygula (görüntü vizörden kaçmasın)
  const boundTranslations = () => {
    "worklet";
    const maxX = (IMG_W * (scale.value - 1)) / 2;
    const maxY = (IMG_H * (scale.value - 1)) / 2;
    translateX.value = clamp(translateX.value, -maxX, maxX);
    translateY.value = clamp(translateY.value, -maxY, maxY);
  };

  // Reset (çift tık / modal açılışı için)
  const resetTransform = () => {
    "worklet";
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // 🔹 Karttaki "Temayı Seç" (modal açmadan direkt)
  const handleUseThemeDirect = (item: (typeof templates)[0]) => {
    updateCV("theme", item.id);
    router.push("/newcv/personal-info");
  };

  // 🔹 Modal içindeki "Bu Temayı Kullan" (önce modal kapanacak → onDismiss sonra push)
  const handleUseThemeFromModal = () => {
    if (!selected) return;
    updateCV("theme", selected.id);
    pendingNavRef.current = () => router.push("/newcv/personal-info");
    setSelected(null); // modal kapanır → onDismiss tetiklenir
  };

  // ✋ Pan jesti
  const pan = Gesture.Pan()
    .onBegin(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
      boundTranslations();
    });

  // 🤏 Pinch jesti (focal odaklı)
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      const nextScale = clamp(savedScale.value * e.scale, 1, 4); // 1x–4x
      const cx = IMG_W / 2;
      const cy = IMG_H / 2;
      const dx = e.focalX - cx;
      const dy = e.focalY - cy;

      // Focal'e göre çeviri düzeltmesi
      translateX.value = savedTranslateX.value + dx - dx * (nextScale / savedScale.value);
      translateY.value = savedTranslateY.value + dy - dy * (nextScale / savedScale.value);

      scale.value = nextScale;
      boundTranslations();
    });

  // 👆 Double tap → reset
  const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
    resetTransform();
  });

  // 🤝 Aynı anda: pinch + pan + doubleTap
  const composedGesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  // Animated style
  const previewStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

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
        onShow={() => {
          // Her açılışta transform’u sıfırla
          resetTransform();
        }}
        onDismiss={() => {
          // Modal kapandıktan sonra gerekiyorsa yönlendir
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

          {/* 🔍 Pinch + Pan + Double-Tap */}
          <GestureDetector gesture={composedGesture}>
            <Animated.Image
              source={selected?.image}
              style={[{ width: IMG_W, height: IMG_H, borderRadius: 12 }, previewStyle]}
              resizeMode="contain"
            />
          </GestureDetector>

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
