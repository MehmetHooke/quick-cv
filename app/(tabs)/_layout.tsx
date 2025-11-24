// app/(tabs)/_layout.tsx
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { ImageBackground, Text, View } from "react-native";



const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={require("../../assets/images/navigation-bg.png")}
        className="flex flex-row w-full min-w-[142px] min-h-[64px] mt-6 justify-center items-center rounded-full overflow-hidden"
        resizeMode="stretch"
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
        <Text className="text-white text-base font-semibold ml-2">
          {title}
        </Text>
      </ImageBackground>
    );
  }

  return (
    <View className="justify-center items-center mt-2 rounded-full">
      <Ionicons name={icon} size={20} color="#E0E0E0" />
    </View>
  );
};

export default function TabsLayout() {

  const { theme } = useTheme();
  return (

    
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: theme.colors.navigationbar,
          borderRadius: 17,
          marginHorizontal: 20,
          marginBottom: 40,
          height: 55,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#0C94B9",
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Anasayfa",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="home-outline" title="Anasayfa" />
          ),
        }}
      />

      <Tabs.Screen
        name="historycv"
        options={{
          title: "Geçmiş CV",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="document-text-outline"
              title="Geçmiş CV"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="person-outline" title="Profil" />
          ),
        }}
      />
    </Tabs>
  );
}
