import React, { createContext, ReactNode, useContext, useState } from "react";

/* -------------------------
 *  TYPES
 * ------------------------- */

export type ThemeKey = "classic" | "modern" | "minimal";

export type ExtraContact = {
  label: string; // Örn: "Twitter"
  value: string; // Örn: "https://x.me/kullanici"
};

export type Language = {
  name: string;  // Örn: "İngilizce"
  level: string; // Örn: "İleri (C1)"
};

// Kişisel bilgiler
export type PersonalInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  photo: string | null;

  // Yeni alanlar:
  location?: string; // "İstanbul, Türkiye"
  headline?: string; // "Full Stack Mobil & Web Geliştirici"

  extraContacts?: ExtraContact[];
};

// Tüm CV verisi
export type CVData = {
  id?: string;
  theme: ThemeKey;             // 🔥 string yerine union tipi

  personalInfo: PersonalInfo;

  education: any[];
  experiences: any[];
  certificates: any[];
  skills: any[];

  languages: Language[];       // boş array olsun, optional olmasına gerek yok

  about: string;
};

// Context API Type
export type CVContextType = {
  cvData: CVData;
  updateCV: <K extends keyof CVData>(section: K, data: CVData[K]) => void;
};


/* -------------------------
 *  CONTEXT
 * ------------------------- */

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider = ({ children }: { children: ReactNode }) => {
  const [cvData, setCvData] = useState<CVData>({
    id: "",
    theme: "classic",   // varsayılan tema

    personalInfo: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      photo: null,
      location: "",
      headline: "",
      extraContacts: [],
    },

    education: [],
    experiences: [],
    certificates: [],
    skills: [],

    languages: [],

    about: "",
  });

  // Genel, type-safe güncelleme fonksiyonu
  const updateCV: CVContextType["updateCV"] = (section, data) => {
    setCvData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  return (
    <CVContext.Provider value={{ cvData, updateCV }}>
      {children}
    </CVContext.Provider>
  );
};


/* -------------------------
 *  HOOK
 * ------------------------- */

export const useCV = () => {
  const context = useContext(CVContext);
  if (!context) throw new Error("useCV must be used within a CVProvider");
  return context;
};
