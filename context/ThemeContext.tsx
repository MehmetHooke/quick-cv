// context/ThemeContext.tsx
import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";
import { ImageSourcePropType } from "react-native";

export type ThemeName = "light" | "dark";

type ThemeConfig = {
  name: ThemeName;
  bgImage: ImageSourcePropType;
  colors: {
    background: string;
    card: string;
    text: string;
    mutedText: string;
    primary: string;
    inputBg: string;
    inputBorder: string;
    logoutButtonBg: string;
    borderStrong: string;
  };
};

const lightTheme: ThemeConfig = {
  name: "light",
  // Şu an Ayarlar sayfasında kullandığın background
  bgImage: require("@/assets/images/bg-light.png"),
  colors: {
    background: "#F3F4F6",
    card: "#FFFFFF",
    text: "#1E1E1E",
    mutedText: "#454545",
    primary: "#0C94B9",
    inputBg: "#F6F8FA",
    inputBorder: "#E3E6EA",
    logoutButtonBg: "#0C94B9",
    borderStrong: "#E3E6EA",
  },
};

const darkTheme: ThemeConfig = {
  name: "dark",
  // Senin hazırladığın koyu tema görseli
  bgImage: require("@/assets/images/bg-dark.png"),
  colors: {
    background: "#050608",
    card: "#111827",
    text: "#F9FAFB",
    mutedText: "#9CA3AF",
    primary: "#0C94B9", // istersen sonra #06B6D4 gibi daha canlı yaparız
    inputBg: "#020617",
    inputBorder: "#1F2937",
    logoutButtonBg: "#0C94B9",
    borderStrong: "#1F2937",
  },
};

type ThemeContextValue = {
  themeName: ThemeName;
  theme: ThemeConfig;
  setThemeName: (name: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("light");

  const theme = useMemo(
    () => (themeName === "light" ? lightTheme : darkTheme),
    [themeName]
  );

  const value: ThemeContextValue = useMemo(
    () => ({
      themeName,
      theme,
      setThemeName,
      toggleTheme: () =>
        setThemeName((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [themeName, theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return ctx;
}
