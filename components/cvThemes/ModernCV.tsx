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

type CVData = {
  personalInfo: PersonalInfo;
  education: Education[];
  experiences: Experience[];
  skills: Skill[];
  about: string;
};

// 🔹 Ana bileşen
export default function ModernCV({ data }: { data: CVData }) {
  const { personalInfo, education, experiences, skills, about } = data;

  return (
    <View className="bg-cyan-50 p-6 rounded-2xl shadow-lg">
      <View className="items-center mb-6">
        {personalInfo.photo && (
          <Image
            source={{ uri: personalInfo.photo }}
            className="w-24 h-24 rounded-full border-4 border-cyan-600 mb-3"
          />
        )}
        <Text className="text-2xl font-bold text-cyan-700">
          {personalInfo.firstName} {personalInfo.lastName}
        </Text>
        <Text className="text-gray-500">{personalInfo.email}</Text>
        <Text className="text-gray-500">{personalInfo.phone}</Text>
      </View>

      <Text className="text-lg font-semibold text-cyan-800 mb-1">Eğitim</Text>
      {education.map((e: Education, i: number) => (
        <View key={i} className="border-l-4 border-cyan-500 pl-3 mb-2">
          <Text className="text-gray-800 font-medium">
            {e.school} - {e.department}
          </Text>
          <Text className="text-gray-600 text-sm">{e.year}</Text>
        </View>
      ))}

      <Text className="text-lg font-semibold text-cyan-800 mt-4 mb-1">
        Deneyim
      </Text>
      {experiences.map((e: Experience, i: number) => (
        <View key={i} className="border-l-4 border-cyan-500 pl-3 mb-2">
          <Text className="text-gray-800 font-medium">
            {e.company} - {e.position}
          </Text>
          <Text className="text-gray-600 text-sm">
            {e.startDate} → {e.endDate}
          </Text>
        </View>
      ))}

      <Text className="text-lg font-semibold text-cyan-800 mt-4 mb-1">
        Yetenekler
      </Text>
      <View className="flex-row flex-wrap">
        {skills.map((s: Skill, i: number) => (
          <View
            key={i}
            className="bg-cyan-200 px-3 py-1 rounded-full m-1"
          >
            <Text className="text-cyan-800 text-sm font-medium">{s.name}</Text>
          </View>
        ))}
      </View>

      {about && (
        <>
          <Text className="text-lg font-semibold text-cyan-800 mt-4 mb-1">
            Hakkımda
          </Text>
          <Text className="text-gray-700">{about}</Text>
        </>
      )}
    </View>
  );
}
