import React from "react";
import {
  View,
  Text,
  ImageBackground,
  Pressable,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Animatable from "react-native-animatable";

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

export default function Onboarding1() {
  const { width, height } = useWindowDimensions();

  const titleFont = clamp(width * 0.09, 28, 40);
  const subtitleFont = clamp(width * 0.045, 16, 20);
  const logoSize = clamp(width * 0.75, 220, 360);
  const buttonW = clamp(width * 0.5, 140, 220);
  const buttonH = clamp(height * 0.058, 44, 56);

  return (
    <ImageBackground
      source={require("@/assets/images/onboarding-1.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 justify-between items-center px-5">
          
          {/* 🎈 Hoş Geldiniz başlığı */}
          <Animatable.Text
            animation="fadeInDown"
            duration={900}
            delay={100}
            style={{
              fontSize: titleFont,
            }}
            className="text-white font-extrabold text-center tracking-tight mt-5"
          >
            Hoş Geldiniz !
          </Animatable.Text>

          {/* 🌟 Logo */}
          <Animatable.Image
            animation="zoomIn"
            duration={1000}
            delay={300}
            source={require("@/assets/icons/logo.png")}
            style={{
              width: logoSize,
              height: logoSize,
              resizeMode: "contain",
            }}
          />

          {/* 💬 Alt başlık */}
          <Animatable.Text
            animation="fadeInUp"
            duration={900}
            delay={500}
            style={{
              fontSize: subtitleFont,
              color: "#1C1C1C",
              textAlign: "center",
              fontWeight: "800",
              marginTop: 10,
            }}
          >
            Dakikalar içinde profesyonel CV hazırla!
          </Animatable.Text>

          {/* 🔵 Devam butonu */}
          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            delay={800}
            style={{ marginBottom: 50 }}
          >
            <Pressable
              onPress={() => router.push("/onboarding/onboarding2")}
              style={{
                width: buttonW,
                height: buttonH,
                backgroundColor: "#0C94B9",
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowOffset: { width: 4, height: 4 },
                shadowRadius: 4,
              }}
            >
              <Text className="text-white font-medium text-[16px] mr-2">
                Devam
              </Text>
              <Image
                source={require("@/assets/icons/chevron-right.png")}
                style={{ width: 16, height: 16 }}
                resizeMode="contain"
              />
            </Pressable>
          </Animatable.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
