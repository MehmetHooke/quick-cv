// app/(tabs)/index.tsx
import CVCard from "@/components/CVCard";
import { useCV } from "@/context/CVContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

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
    name: "Modern Minimalist CV",
    description: "Sade ve Modern bir tasarım isteyenler için",
    image: require("@/assets/templates/modern.png"),
  },
  {
    id: "minimal",
    name: "Minimalist Sade",
    description: "Kurumsal ve sade bir tasarım isteyenler için.",
    image: require("@/assets/templates/minimal.png"),
  },
  {
    id: "pinkModern",
    name: "Pembe Modern",
    description: "Pembe, modern ve profesyonel CV şablonu.",
    image: require("@/assets/templates/pinkModernCV.png"),
  },
  {
    id: "navyBlueModern",
    name: "Açık Mavi Modern CV",
    description:
      "Kurumsal ve sade mavi temada bir tasarım isteyenler için.",
    image: require("@/assets/templates/navybluemodern.png"),
  },
  {
    id: "tealWave",
    name: "Teal Wave",
    description:
      "Sol tarafta pastel mavi panel, sağda dalgalı başlık alanı ile modern ve sade satır aralığı yüksek bir CV tasarımı. Özellikle teknik ve kreatif adaylar için şık bir görünüm sunar",
    image: require("@/assets/templates/tealwave.png"),
  },
];

export default function HomeScreen() {
  const [selected, setSelected] = useState<(typeof templates)[0] | null>(null);
  const router = useRouter();
  const { updateCV } = useCV();
  const { theme } = useTheme();

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
    updateCV("theme", item.id as any);
    router.push("/newcv/personal-info");
  };

  // 🔹 Modal içindeki "Bu Temayı Kullan"
  const handleUseThemeFromModal = () => {
    if (!selected) return;
    updateCV("theme", selected.id as any);
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

      translateX.value =
        savedTranslateX.value + dx - dx * (nextScale / savedScale.value);
      translateY.value =
        savedTranslateY.value + dy - dy * (nextScale / savedScale.value);

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
    <CVCard
      item={item}
      variant="grid"
      onPreview={() => setSelected(item)}
      onUse={handleUseThemeDirect}
    />
  );

  return (
    <ImageBackground
      source={theme.bgImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1">
        {/* Başlık */}
        <Text
          className="text-2xl font-extrabold text-white text-center mt-16 mb-7"
          
        >
          CV Tasarımları
        </Text>

        {/* CV Kartları */}
        <FlatList
          data={templates}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 10,
          }}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingHorizontal: 10,
          }}
        />

        {/* Önizleme Modal */}
        <Modal
          visible={!!selected}
          animationType="fade"
          transparent
          onShow={() => {
            resetTransform();
          }}
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
                className="flex-row items-center rounded-lg px-5 py-2"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Ionicons name="close" size={22} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  Kapat
                </Text>
              </Pressable>
            </View>

            {/* 🔍 Pinch + Pan + Double-Tap */}
            <GestureDetector gesture={composedGesture}>
              <Animated.Image
                source={selected?.image}
                style={[
                  {
                    width: IMG_W,
                    height: IMG_H,
                    borderRadius: 12,
                  },
                  previewStyle,
                ]}
                resizeMode="contain"
              />
            </GestureDetector>

            <Pressable
              onPress={handleUseThemeFromModal}
              className="mt-6 rounded-lg px-8 py-4"
              style={{ backgroundColor: theme.colors.primary }}
              disabled={!selected}
            >
              <Text className="text-white text-lg font-semibold">
                Bu Temayı Kullan
              </Text>
            </Pressable>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}
