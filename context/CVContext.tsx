import React, { createContext, useContext, useState, ReactNode } from "react";

type PersonalInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  photo: string | null;
};

type CVData = {
  id?: string; 
  theme: string;
  personalInfo: PersonalInfo;
  education: any[];
  experiences: any[];
  certificates: any[];
  skills: any[];
  about: string;
};

type CVContextType = {
  cvData: CVData;
  updateCV: (section: keyof CVData, data: any) => void;
};

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider = ({ children }: { children: ReactNode }) => {
  const [cvData, setCvData] = useState<CVData>({
    id: "",
    theme: "",
    personalInfo: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      photo: null,
    },
    education: [],
    experiences: [],
    certificates: [],
    skills: [],
    about: "",
  });

  const updateCV = (section: keyof CVData, data: any) => {
    setCvData((prev) => ({ ...prev, [section]: data }));
  };

  return (
    <CVContext.Provider value={{ cvData, updateCV }}>
      {children}
    </CVContext.Provider>
  );
};

export const useCV = () => {
  const context = useContext(CVContext);
  if (!context) throw new Error("useCV must be used within a CVProvider");
  return context;
};
