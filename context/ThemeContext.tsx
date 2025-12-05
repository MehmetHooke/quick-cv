// context/ThemeContext.tsx
import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
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
    navigationbar: string;
    primary: string;
    historythemeLabel: string;
    inputBg: string;
    buttonBg: string;
    inputBorder: string;
    logoutButtonBg: string;
    borderStrong: string;
  };
};

const lightTheme: ThemeConfig = {
  name: "light",
  bgImage: require("@/assets/images/bg-light.png"),
  colors: {
    background: "#F3F4F6",
    card: "#FFFFFF",
    text: "#1E1E1E",
    mutedText: "#454545",
    historythemeLabel: "#000",
    navigationbar: "#0C94B9",
    primary: "#FFFFFF",
    buttonBg: "#0C94B9",
    inputBg: "#F6F8FA",
    inputBorder: "#E3E6EA",
    logoutButtonBg: "#0C94B9",
    borderStrong: "#E3E6EA",
  },
};

const darkTheme: ThemeConfig = {
  name: "dark",
  bgImage: require("@/assets/images/bg-dark.png"),
  colors: {
    background: "#050608",
    card: "#111827",
    text: "#F9FAFB",
    navigationbar: "#020617",
    mutedText: "#9CA3AF",
    historythemeLabel: "#FFFFFF",
    primary: "#0C94B9",
    buttonBg: "#0C94B9",
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
  themeLoading: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("light");
  const [themeLoading, setThemeLoading] = useState(true);

  const theme = useMemo(
    () => (themeName === "light" ? lightTheme : darkTheme),
    [themeName]
  );

  useEffect(() => {
    // Kullanıcı değiştiğinde Firestore'dan theme alanını çek
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const snap = await getDoc(doc(db, "users", user.uid));
          const data = snap.data() as { theme?: ThemeName } | undefined;
          const remoteTheme = data?.theme;

          if (remoteTheme === "light" || remoteTheme === "dark") {
            setThemeName(remoteTheme);
          } else {
            setThemeName("light");
          }
        } else {
          // Kullanıcı yoksa default light
          setThemeName("light");
        }
      } catch (error) {
        console.log("Tema bilgisi alınırken hata:", error);
        // Hata olsa da app çökmemesi için default tema
        setThemeName("light");
      } finally {
        setThemeLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: ThemeContextValue = useMemo(
    () => ({
      themeName,
      theme,
      setThemeName,
      toggleTheme: () =>
        setThemeName((prev) => (prev === "light" ? "dark" : "light")),
      themeLoading,
    }),
    [themeName, theme, themeLoading]
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
