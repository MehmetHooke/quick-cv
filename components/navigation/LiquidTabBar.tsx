import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";

type TabLayoutItem = {
  key: string;
  x: number;
  width: number;
};

function getTabIcon(routeName: string, focused: boolean) {
  switch (routeName) {
    case "index":
      return focused ? "home" : "home-outline";

    case "historycv":
      return focused ? "document-text" : "document-text-outline";

    case "profile":
      return focused ? "person" : "person-outline";

    default:
      return focused ? "ellipse" : "ellipse-outline";
  }
}

function getTabLabel(routeName: string) {
  switch (routeName) {
    case "index":
      return "Anasayfa";

    case "historycv":
      return "Geçmiş CV";

    case "profile":
      return "Profil";

    default:
      return routeName;
  }
}

export function LiquidTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme, themeName } = useTheme();

  const isDark = themeName === "dark";
  const bottom = Math.max(insets.bottom, 14);

  const [tabLayouts, setTabLayouts] = useState<TabLayoutItem[]>([]);

  const x = useSharedValue(0);
  const w = useSharedValue(0);

  const visibleRoutes = useMemo(() => {
    return state.routes.filter((route) => {
      const options: any = descriptors[route.key]?.options;

      if (options?.href === null) return false;
      if (options?.tabBarItemStyle?.display === "none") return false;

      return true;
    });
  }, [state.routes, descriptors]);

  const focusedKey = state.routes[state.index]?.key;

  const navColors = {
    containerBg: isDark ? "rgba(2, 6, 23, 0.78)" : "rgba(255, 255, 255, 0.78)",
    border: isDark ? "rgba(255, 255, 255, 0.10)" : "rgba(12, 148, 185, 0.22)",
    shadow: isDark ? "#000000" : "#0C94B9",

    pillBg: isDark ? "rgba(12, 148, 185, 0.22)" : "rgba(12, 148, 185, 0.14)",
    pillBorder: isDark ? "rgba(12, 148, 185, 0.45)" : "rgba(12, 148, 185, 0.28)",

    activeIcon: isDark ? "#FFFFFF" : "#0C94B9",
    activeText: theme.colors.text,

    inactiveIcon: isDark ? "rgba(249, 250, 251, 0.55)" : "rgba(30, 30, 30, 0.45)",
    inactiveText: isDark ? "rgba(249, 250, 251, 0.55)" : "rgba(30, 30, 30, 0.50)",
  };

  const SPRING = {
    damping: 28,
    stiffness: 210,
    mass: 0.85,
    overshootClamping: false,
    restDisplacementThreshold: 0.4,
    restSpeedThreshold: 0.4,
  };

  useEffect(() => {
    const layout = tabLayouts.find((item) => item.key === focusedKey);
    if (!layout) return;

    x.value = withSpring(layout.x, SPRING);
    w.value = withSpring(layout.width, SPRING);
  }, [focusedKey, tabLayouts, x, w]);

  const pillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }],
      width: w.value,
    };
  });

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 18,
        right: 18,
        bottom,
        height: 76,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          height: 68,
          borderRadius: 28,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: navColors.border,
          backgroundColor: navColors.containerBg,
          shadowColor: navColors.shadow,
          shadowOpacity: isDark ? 0.35 : 0.18,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 12 },
          elevation: 18,
        }}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 38 : 22}
          tint={isDark ? "dark" : "light"}
          style={{
            flex: 1,
            backgroundColor: navColors.containerBg,
            paddingHorizontal: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: 8,
                  height: 52,
                  borderRadius: 22,
                  backgroundColor: navColors.pillBg,
                  borderWidth: 1,
                  borderColor: navColors.pillBorder,
                },
                pillStyle,
              ]}
            />

            {visibleRoutes.map((route) => {
              const isFocused = focusedKey === route.key;
              const iconName = getTabIcon(route.name, isFocused);
              const label = getTabLabel(route.name);

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  onLayout={(event) => {
                    const { x, width } = event.nativeEvent.layout;

                    setTabLayouts((prev) => {
                      const filtered = prev.filter(
                        (item) => item.key !== route.key
                      );

                      return [...filtered, { key: route.key, x, width }];
                    });
                  }}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 22,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <Ionicons
                    name={iconName as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={
                      isFocused
                        ? navColors.activeIcon
                        : navColors.inactiveIcon
                    }
                  />

                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 11,
                      fontWeight: isFocused ? "900" : "700",
                      color: isFocused
                        ? navColors.activeText
                        : navColors.inactiveText,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}