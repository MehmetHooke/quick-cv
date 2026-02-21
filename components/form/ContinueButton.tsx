import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";

type ContinueButtonProps = {
  onPress: () => void;
  loading?: boolean;
  isOptional?: boolean; // deneyim / yetenek gibi opsiyonel sayfalar için
  isValid?: boolean;    // zorunlu sayfalarda form dolu mu?
};

export function ContinueButton({
  onPress,
  loading = false,
  isOptional = false,
  isValid = false,
}: ContinueButtonProps) {
  // 🔑 KURAL:
  // - isOptional === true  -> her zaman göster
  // - isOptional === false -> sadece isValid === true iken göster
  const shouldShow = isOptional || isValid;
  const { theme } = useTheme();
  if (!shouldShow) return null;

  return (
    <Animatable.View animation="fadeIn" duration={1500}
>
      <TouchableOpacity
        disabled={loading}
        onPress={onPress}
        className={`py-4 rounded-2xl mb-10 ${
          loading ? "bg-cyan-400" : "bg-cyan-600"
        }`}
      >
        <Text className="text-center text-white font-semibold text-lg">
          {loading ? "Kaydediliyor..." : "Devam Et"}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
}
