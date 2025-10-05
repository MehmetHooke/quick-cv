import React from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

export default function Onboarding2() {
  const fontSizeTitle = width * 0.05;
  const buttonWidth = width * 0.32;
  const buttonHeight = height * 0.047;

  return (
    <Animatable.View animation="fadeInRight" duration={800} style={{ flex: 1 }}>
      <ImageBackground
        source={require("@/assets/images/onboarding-2.png")}
        className="flex-1 w-full h-full"
        resizeMode="cover"
      >
        {/* Geri butonu */}
        <Animatable.View animation="fadeInDown" delay={200}>
          <Pressable
            onPress={() => router.back()}
            className="absolute left-6 top-10 bg-[#ffffff55] rounded-full w-[35px] h-[35px] items-center justify-center"
          >
            <Image
              source={require("@/assets/icons/arrow_back.png")}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </Pressable>
        </Animatable.View>

        {/* Başlık */}
        <Animatable.Text
          animation="fadeInDown"
          delay={400}
          style={{
            top: height * 0.28,
            fontSize: fontSizeTitle,
          }}
          className="absolute w-full text-center text-[#1C1C1C] font-extrabold"
        >
          Modern tasarımlar arasından seç
        </Animatable.Text>

        {/* Grup resmi */}
        <Animatable.View
          animation="zoomIn"
          delay={600}
          style={{
            position: "absolute",
            top: height * 0.4,
            width: width * 0.96,
            alignItems: "center",
          }}
        >
          <Image
            source={require("@/assets/images/cv-preview.png")}
            style={{
              width: width * 0.9,
              height: height * 0.33,
              resizeMode: "contain",
            }}
          />
        </Animatable.View>

        {/* Devam butonu */}
        <Animatable.View animation="fadeInUp" delay={800}>
          <Pressable
            onPress={() => router.push("/onboarding/onboarding3")}
            style={{
              position: "absolute",
              top: height * 0.87,
              left: (width - buttonWidth) / 2,
              width: buttonWidth,
              height: buttonHeight,
            }}
            className="bg-[#0C94B9] border border-[rgba(44,44,44,0.19)] rounded-lg 
                       flex-row items-center justify-center shadow-md"
          >
            <Text className="text-[#F5F5F5] text-[16px] font-normal mr-2">
              Devam
            </Text>
            <Image
              source={require("@/assets/icons/chevron-right.png")}
              className="w-4 h-4"
              resizeMode="contain"
            />
          </Pressable>
        </Animatable.View>
      </ImageBackground>
    </Animatable.View>
  );
}
