import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function BackButton() {
  const router = useRouter(); 

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        position: "absolute",
        top: 40,
        left: 10,
        zIndex: 50,
        padding: 10,
        borderRadius: 17,
        backgroundColor: "rgba(0,0,0,0.2)"
      }}
    >
      <Ionicons name="chevron-back" size={28} color="#fff" />
    </TouchableOpacity>
  );
}
