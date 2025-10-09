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
};

type Experience = {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
};

type Skill = {
  name: string;
  level?: string;
};

type Certificate = {
  name: string;
  issuer?: string;
  date?: string;
};

type CVData = {
  personalInfo: PersonalInfo;
  education: Education[];
  experiences: Experience[];
  skills: Skill[];
  certificates?: Certificate[];
  about: string;
};

// 🔹 Bileşen tipi
export default function ClassicCV({ data }: { data: CVData }) {
  const { personalInfo, education, experiences, skills, certificates, about } =
    data;

  return (
    <View className="bg-white p-6 rounded-2xl border border-gray-300">
      <View className="flex-row items-center mb-5">
        {personalInfo.photo && (
          <Image
            source={{ uri: personalInfo.photo }}
            className="w-20 h-20 rounded-full mr-4"
          />
        )}
        <View>
          <Text className="text-xl font-bold text-gray-800">
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
          <Text className="text-gray-500">{personalInfo.email}</Text>
          <Text className="text-gray-500">{personalInfo.phone}</Text>
        </View>
      </View>

      <Text className="text-lg font-semibold text-cyan-700 mb-1">Eğitim</Text>
      {education.map((e: Education, i: number) => (
        <Text key={i} className="text-gray-700">
          {e.school} - {e.department} ({e.year})
        </Text>
      ))}

      <Text className="text-lg font-semibold text-cyan-700 mt-4 mb-1">
        Deneyim
      </Text>
      {experiences.map((e: Experience, i: number) => (
        <Text key={i} className="text-gray-700">
          {e.company} - {e.position} ({e.startDate} → {e.endDate})
        </Text>
      ))}

      <Text className="text-lg font-semibold text-cyan-700 mt-4 mb-1">
        Yetenekler
      </Text>
      <Text className="text-gray-700">
        {skills.map((s: Skill) => s.name).join(", ")}
      </Text>

      {about && (
        <>
          <Text className="text-lg font-semibold text-cyan-700 mt-4 mb-1">
            Hakkımda
          </Text>
          <Text className="text-gray-700">{about}</Text>
        </>
      )}
    </View>
  );
}
