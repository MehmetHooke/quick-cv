// app/components/cvThemes/ClassicCV.tsx
import React from "react";
import { View, Text, Image } from "react-native";
import { tokens } from "@/constants/tokens";

// ---- Tipler
type PersonalInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  photo: string | null;
};

type Education = {
  school: string;
  department: string;
  year: string;
  grade?: number | string; // opsiyonel/serbest
};

type Experience = {
  company: string;
  position: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

type Skill = {
  name: string;
  level?: string;
};

type Certificate = {
  name: string;
  issuer?: string;
  date?: string;
  description?: string;
};

type CVData = {
  personalInfo: PersonalInfo;
  education: Education[];
  experiences: Experience[];
  skills: Skill[];
  certificates?: Certificate[];
  about?: string;
};

// ---- Yardımcılar
const hasArray = (arr?: unknown[]) => Array.isArray(arr) && arr.length > 0;
const safeText = (v?: string | number | null) => (v === undefined || v === null ? "" : String(v));

// ---- Bileşen
export default function ClassicCV({ data }: { data: CVData }) {
  const { personalInfo, education, experiences, skills, certificates, about } = data;

  return (
    <View
      // A4 canvas içinde dış padding vermeyelim; iç düzeni burada yapalım
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        paddingHorizontal: tokens.spacing.xl,
        paddingVertical: tokens.spacing.lg,
      }}
    >
      {/* Üst Başlık */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: tokens.spacing.lg }}>
        {personalInfo.photo ? (
          <Image
            source={{ uri: personalInfo.photo }}
            style={{ width: 72, height: 72, borderRadius: 36, marginRight: tokens.spacing.md }}
          />
        ) : null}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: tokens.fonts.h1,
              fontWeight: "700",
              color: tokens.colors.text,
            }}
            numberOfLines={1}
          >
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
          <Text
            style={{ color: tokens.colors.subtext, marginTop: 2, fontSize: tokens.fonts.body }}
            numberOfLines={1}
          >
            {personalInfo.email}
          </Text>
          <Text
            style={{ color: tokens.colors.subtext, marginTop: 2, fontSize: tokens.fonts.body }}
            numberOfLines={1}
          >
            {personalInfo.phone}
          </Text>
        </View>
      </View>

      {/* İnce çizgi */}
      <View
        style={{
          height: tokens.stroke.thin,
          backgroundColor: tokens.colors.line,
          marginBottom: tokens.spacing.lg,
        }}
      />

      {/* Eğitim */}
      {hasArray(education) && (
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              color: tokens.colors.primary,
              fontWeight: "700",
              fontSize: tokens.fonts.h2,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Eğitim
          </Text>

          {education.map((e, i) => {
            const grade =
              e.grade !== undefined && e.grade !== null && safeText(e.grade) !== ""
                ? ` • Ortalama: ${safeText(e.grade)}`
                : "";
            return (
              <Text
                key={`edu-${i}`}
                style={{ color: tokens.colors.text, fontSize: tokens.fonts.body, marginBottom: 4 }}
                numberOfLines={2}
              >
                {safeText(e.school)} — {safeText(e.department)} ({safeText(e.year)}){grade}
              </Text>
            );
          })}
        </View>
      )}

      {/* Deneyim */}
      {hasArray(experiences) && (
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              color: tokens.colors.primary,
              fontWeight: "700",
              fontSize: tokens.fonts.h2,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Deneyim
          </Text>
          {experiences.map((e, i) => {
            const date =
              e.startDate || e.endDate ? ` (${safeText(e.startDate)} → ${safeText(e.endDate)})` : "";
            return (
              <View key={`exp-${i}`} style={{ marginBottom: tokens.spacing.xs }}>
                <Text style={{ color: tokens.colors.text, fontSize: tokens.fonts.body }}>
                  {safeText(e.company)} — {safeText(e.position)}
                  {date}
                </Text>
                {e.description ? (
                  <Text
                    style={{
                      color: tokens.colors.subtext,
                      fontSize: tokens.fonts.small,
                      marginTop: 2,
                    }}
                    numberOfLines={2}
                  >
                    {e.description}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {/* Sertifikalar */}
      {hasArray(certificates) && (
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              color: tokens.colors.primary,
              fontWeight: "700",
              fontSize: tokens.fonts.h2,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Sertifikalar
          </Text>
          {certificates!.map((c, i) => (
            <View key={`cert-${i}`} style={{ marginBottom: tokens.spacing.xs }}>
              <Text style={{ color: tokens.colors.text, fontSize: tokens.fonts.body, fontWeight: "600" }}>
                {safeText(c.name)}
              </Text>
              {(c.issuer || c.date) && (
                <Text style={{ color: tokens.colors.subtext, fontSize: tokens.fonts.small }}>
                  {safeText(c.issuer)}
                  {c.issuer && c.date ? " — " : ""}
                  {safeText(c.date)}
                </Text>
              )}
              {c.description ? (
                <Text style={{ color: tokens.colors.subtext, fontSize: tokens.fonts.small, marginTop: 2 }}>
                  {c.description}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* Yetenekler */}
      {hasArray(skills) && (
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              color: tokens.colors.primary,
              fontWeight: "700",
              fontSize: tokens.fonts.h2,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Yetenekler
          </Text>
          <Text style={{ color: tokens.colors.text, fontSize: tokens.fonts.body }}>
            {skills.map((s) => s.name).join(", ")}
          </Text>
        </View>
      )}

      {/* Hakkımda */}
      {about ? (
        <View>
          <Text
            style={{
              color: tokens.colors.primary,
              fontWeight: "700",
              fontSize: tokens.fonts.h2,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Hakkımda
          </Text>
          <Text
            style={{ color: tokens.colors.text, fontSize: tokens.fonts.body }}
            numberOfLines={6} // tek sayfada taşmayı azalt
          >
            {about}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
