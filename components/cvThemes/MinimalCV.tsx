import React from "react";
import { View, Text, Image } from "react-native";

// 🔹 Tip tanımları
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
  grade: number;

};

type Experience = {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
};

type Certificate = {
  name: string;
  issuer: string;
  date: string;
  description?: string;
};

type Skill = {
  name: string;
  level?: string;
};

type CVData = {
  personalInfo: PersonalInfo;
  education: Education[];
  experiences: Experience[];
  skills: Skill[];
  certificates?: Certificate[];
  about: string;
};

// 🔹 Ana bileşen
export default function MinimalCV({ data }: { data: CVData }) {
  const { personalInfo, education, experiences,certificates, skills, about } = data;

  return (
    <View className="bg-white p-6 rounded-2xl border border-gray-200">
      {personalInfo.photo && (
        <Image
          source={{ uri: personalInfo.photo }}
          className="w-24 h-24 rounded-full self-center mb-4"
        />
      )}

      <Text className="text-center text-2xl font-semibold text-gray-900 mb-1">
        {personalInfo.firstName} {personalInfo.lastName}
      </Text>

      <Text className="text-center text-gray-500 mb-4">
        {personalInfo.email} • {personalInfo.phone}
      </Text>

      <Text className="text-lg font-semibold text-gray-800 mb-1">Eğitim</Text>
      {education.map((e: Education, i: number) => (
        <Text key={i} className="text-gray-600 mb-1">
          {e.school} - {e.department} ({e.year} {e.grade})
        </Text>
      ))}

      <Text className="text-lg font-semibold text-gray-800 mt-4 mb-1">
        Deneyim
      </Text>
      {experiences.map((e: Experience, i: number) => (
        <Text key={i} className="text-gray-600 mb-1">
          {e.company} - {e.position}
        </Text>
      ))}

        <Text className="text-lg font-semibold text-cyan-700 mt-4 mb-1">
  Sertifikalar
</Text>

{Array.isArray(certificates) && certificates.length > 0 ? (
  certificates.map((c: Certificate, i: number) => (
    <View key={i} className="mt-1">
      <Text className="text-gray-800 font-semibold">
        {c.name}
      </Text>
      <Text className="text-gray-600">
        {c.issuer} — {c.date}
      </Text>
      {c.description ? (
        <Text className="text-gray-700">{c.description}</Text>
      ) : null}
    </View>
  ))
) : (
  <Text className="text-gray-500">Eklenmiş sertifika yok.</Text>
)}


      <Text className="text-lg font-semibold text-gray-800 mt-4 mb-1">
        Yetenekler
      </Text>
      <Text className="text-gray-600">
        {skills.map((s: Skill) => s.name).join(", ")}
      </Text>

      {about && (
        <>
          <Text className="text-lg font-semibold text-gray-800 mt-4 mb-1">
            Hakkımda
          </Text>
          <Text className="text-gray-600">{about}</Text>
        </>
      )}
    </View>
  );
}
