import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function Onboarding3() {
  const fontSizeTitle = width * 0.04;
  const iconSize = width * 0.05;
  const buttonWidth = width * 0.42;
  const buttonHeight = height * 0.047;

  const handleStart = async () => {
  await AsyncStorage.setItem("onboardingSeen", "true");
  router.replace("/auth/login");
};

  return (
    <ImageBackground
      source={require("@/assets/images/onboarding-3.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        {/* Geri butonu */}
        <Animatable.View animation="fadeInDown" delay={150}>
          <Pressable
            onPress={() => router.push("/onboarding/onboarding2")}
            style={{
              marginLeft: 24,
              marginTop: 12,
              backgroundColor: "#ffffff55",
              borderRadius: 999,
              width: 35,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("@/assets/icons/arrow_back.png")}
              style={{ width: 16, height: 16 }}
              resizeMode="contain"
            />
          </Pressable>
        </Animatable.View>

        {/* Metin grubu */}
        <Animatable.View
          animation="fadeInUp"
          delay={300}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: height * 0.05, // metinler arası boşluk
            marginTop: -40, // küçük yukarı kaydırma
          }}
        >
          {/* 1️⃣ */}
          <View className="relative items-center">
            <Text
              style={{ fontSize: fontSizeTitle }}
              className="text-[#1C1C1C] font-extrabold text-center leading-tight"
            >
              Dakikalar içinde CV hazır
            </Text>
            <Image
              source={require("@/assets/icons/check.png")}
              style={{
                width: iconSize,
                height: iconSize,
                position: "absolute",
                right: -iconSize * 1.4,
                top: "10%",
              }}
              resizeMode="contain"
            />
          </View>

          {/* 2️⃣ */}
          <View className="relative items-center">
            <Text
              style={{ fontSize: fontSizeTitle }}
              className="text-[#1C1C1C] font-extrabold text-center leading-tight"
            >
              İster PDF olarak indir
            </Text>
            <Image
              source={require("@/assets/icons/download.png")}
              style={{
                width: iconSize,
                height: iconSize,
                position: "absolute",
                right: -iconSize * 1.4,
                top: "10%",
              }}
              resizeMode="contain"
            />
          </View>

          {/* 3️⃣ */}
          <View className="relative items-center">
            <Text
              style={{ fontSize: fontSizeTitle }}
              className="text-[#1C1C1C] font-extrabold text-center leading-tight pr-5"
            >
              İstersen PDF olarak paylaş
            </Text>
            <Image
              source={require("@/assets/icons/share.png")}
              style={{
                width: iconSize,
                height: iconSize,
                position: "absolute",
                right: -iconSize * 1,
                top: "10%",
              }}
              resizeMode="contain"
            />
          </View>
        </Animatable.View>

        {/* Başla butonu */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <Pressable
            onPress={handleStart}
            style={{
              alignSelf: "center",
              marginBottom: 40,
              width: buttonWidth,
              height: buttonHeight,
              backgroundColor: "#0C94B9",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "rgba(44,44,44,0.19)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowOffset: { width: 4, height: 4 },
              shadowRadius: 4,
            }}
          >
            <Text className="text-[#F5F5F5] text-[16px] font-normal mr-2">
              Başla
            </Text>
            <Image
              source={require("@/assets/icons/chevron-right.png")}
              style={{ width: 16, height: 16 }}
              resizeMode="contain"
            />
          </Pressable>
        </Animatable.View>
      </SafeAreaView>
    </ImageBackground>
  );
}
