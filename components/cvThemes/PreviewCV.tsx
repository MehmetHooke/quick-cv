// app/components/cvThemes/PreviewCV.tsx
import { tokens } from "@/constants/tokens";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

// ---- Tipler (daha esnek, her şey opsiyonel ki eksik alanlarda hata vermesin)
type PersonalInfo = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  photo?: string | null;

  location?: string;
  headline?: string;
  extraContacts?: { label?: string; value?: string }[];
};

type Education = {
  school?: string;
  department?: string;
  year?: string;
  grade?: number | string; // opsiyonel/serbest
};

type Experience = {
  company?: string;
  position?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

type SkillObj = {
  name?: string;
  level?: string;
};
type Skill = SkillObj | string;

type Certificate = {
  name?: string;
  issuer?: string;
  date?: string;
  description?: string;
};

type LanguageObj = {
  name?: string;
  level?: string;
};
type Language = LanguageObj | string;

type CVData = {
  personalInfo?: PersonalInfo;
  education?: Education[];
  experiences?: Experience[];
  skills?: Skill[];
  certificates?: Certificate[];
  languages?: Language[];
  about?: string;
};

// ---- Yardımcılar
const hasArray = (arr?: unknown[]) => Array.isArray(arr) && arr.length > 0;
const safeText = (v?: string | number | null) =>
  v === undefined || v === null ? "" : String(v);

// ---- Bileşen
export default function PreviewCV({ data }: { data: CVData | any }) {
  const {
    personalInfo = {},
    education = [],
    experiences = [],
    skills = [],
    certificates = [],
    languages = [],
    about,
  } = data || {};

  const extraContacts = Array.isArray(personalInfo.extraContacts)
    ? (personalInfo.extraContacts as { label?: string; value?: string }[])
    : [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      contentContainerStyle={{
        paddingHorizontal: tokens.spacing.xl,
        paddingVertical: tokens.spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Üst Başlık */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: tokens.spacing.lg,
        }}
      >
        {personalInfo.photo ? (
          <Image
            source={{ uri: personalInfo.photo }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              marginRight: tokens.spacing.md,
            }}
          />
        ) : null}

        <View style={{ flex: 1 }}>
          {/* İsim */}
          <Text
            style={{
              fontSize: tokens.fonts.h1,
              fontWeight: "700",
              color: tokens.colors.text,
            }}
            numberOfLines={1}
          >
            {safeText(personalInfo.firstName)}{" "}
            {safeText(personalInfo.lastName)}
          </Text>

          {/* Ana iletişim */}
          {personalInfo.email ? (
            <Text
              style={{
                color: tokens.colors.subtext,
                marginTop: 2,
                fontSize: tokens.fonts.body,
              }}
              numberOfLines={1}
            >
              {safeText(personalInfo.email)}
            </Text>
          ) : null}
          {personalInfo.phone ? (
            <Text
              style={{
                color: tokens.colors.subtext,
                marginTop: 2,
                fontSize: tokens.fonts.body,
              }}
              numberOfLines={1}
            >
              {safeText(personalInfo.phone)}
            </Text>
          ) : null}

          {/* Konum & Headline */}
          {personalInfo.location ? (
            <Text
              style={{
                color: tokens.colors.subtext,
                marginTop: 2,
                fontSize: tokens.fonts.body,
              }}
              numberOfLines={1}
            >
              {safeText(personalInfo.location)}
            </Text>
          ) : null}
          {personalInfo.headline ? (
            <Text
              style={{
                color: tokens.colors.primary,
                marginTop: 2,
                fontSize: tokens.fonts.body,
                fontWeight: "600",
              }}
              numberOfLines={1}
            >
              {safeText(personalInfo.headline)}
            </Text>
          ) : null}

          {/* Ek iletişim alanları */}
          {extraContacts.length > 0 && (
            <View style={{ marginTop: tokens.spacing.sm }}>
              {extraContacts.map((item, idx) => {
                const label = safeText(item.label);
                const value = safeText(item.value);
                if (!label && !value) return null;
                return (
                  <Text
                    key={`extra-${idx}`}
                    style={{
                      color: tokens.colors.subtext,
                      fontSize: tokens.fonts.small,
                    }}
                    numberOfLines={1}
                  >
                    {label}: {value}
                  </Text>
                );
              })}
            </View>
          )}
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

          {education.map((e: Education, i: number) => {
            const grade =
              e?.grade !== undefined &&
              e?.grade !== null &&
              safeText(e?.grade) !== ""
                ? ` • Ortalama: ${safeText(e?.grade)}`
                : "";
            return (
              <Text
                key={`edu-${i}`}
                style={{
                  color: tokens.colors.text,
                  fontSize: tokens.fonts.body,
                  marginBottom: 4,
                }}
                // ❌ numberOfLines kaldırıldı, tam gözüksün
              >
                {safeText(e?.school)} — {safeText(e?.department)} (
                {safeText(e?.year)})
                {grade}
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
          {experiences.map((e: Experience, i: number) => {
            const date =
              e?.startDate || e?.endDate
                ? ` (${safeText(e?.startDate)} → ${safeText(e?.endDate)})`
                : "";
            return (
              <View key={`exp-${i}`} style={{ marginBottom: tokens.spacing.xs }}>
                <Text
                  style={{
                    color: tokens.colors.text,
                    fontSize: tokens.fonts.body,
                  }}
                >
                  {safeText(e?.company)} — {safeText(e?.position)}
                  {date}
                </Text>
                {e?.description ? (
                  <Text
                    style={{
                      color: tokens.colors.subtext,
                      fontSize: tokens.fonts.small,
                      marginTop: 2,
                    }}
                    // ❌ numberOfLines={2} kaldırıldı
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
          {certificates!.map((c: Certificate, i: number) => (
            <View key={`cert-${i}`} style={{ marginBottom: tokens.spacing.xs }}>
              <Text
                style={{
                  color: tokens.colors.text,
                  fontSize: tokens.fonts.body,
                  fontWeight: "600",
                }}
              >
                {safeText(c?.name)}
              </Text>
              {(c?.issuer || c?.date) && (
                <Text
                  style={{
                    color: tokens.colors.subtext,
                    fontSize: tokens.fonts.small,
                  }}
                >
                  {safeText(c?.issuer)}
                  {c?.issuer && c?.date ? " — " : ""}
                  {safeText(c?.date)}
                </Text>
              )}
              {c?.description ? (
                <Text
                  style={{
                    color: tokens.colors.subtext,
                    fontSize: tokens.fonts.small,
                    marginTop: 2,
                  }}
                >
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
          {skills.map((s: Skill, idx: number) => {
            const name =
              typeof s === "string" ? s : safeText((s as SkillObj).name);
            const level =
              typeof s === "string" ? "" : safeText((s as SkillObj).level);
            if (!name) return null;
            return (
              <Text
                key={`skill-${idx}`}
                style={{
                  color: tokens.colors.text,
                  fontSize: tokens.fonts.body,
                }}
              >
                {name}
                {level ? ` — ${level}` : ""}
              </Text>
            );
          })}
        </View>
      )}

      {/* Diller */}
      {hasArray(languages) && (
        <View style={{ marginBottom: tokens.spacing.lg }}>
          <Text
            style={{
              color: tokens.colors.primary,
              fontWeight: "700",
              fontSize: tokens.fonts.h2,
              marginBottom: tokens.spacing.sm,
            }}
          >
            Diller
          </Text>
          {languages.map((lang: Language, idx: number) => {
            const name =
              typeof lang === "string"
                ? lang
                : safeText((lang as LanguageObj).name);
            const level =
              typeof lang === "string"
                ? ""
                : safeText((lang as LanguageObj).level);
            if (!name) return null;
            return (
              <Text
                key={`lang-${idx}`}
                style={{
                  color: tokens.colors.text,
                  fontSize: tokens.fonts.body,
                }}
              >
                {name}
                {level ? ` — ${level}` : ""}
              </Text>
            );
          })}
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
            
          >
            {about}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
