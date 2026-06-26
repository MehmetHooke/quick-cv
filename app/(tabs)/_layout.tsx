// app/(tabs)/_layout.tsx

import { LiquidTabBar } from "@/components/navigation/LiquidTabBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Anasayfa",
        }}
      />

      <Tabs.Screen
        name="historycv"
        options={{
          title: "Geçmiş CV",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
        }}
      />
    </Tabs>
  );
}