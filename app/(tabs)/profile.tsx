import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db, storage } from "@/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const { width, height } = Dimensions.get("window");

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  photoURL?: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);

  // 🔹 Firestore'dan kullanıcı bilgilerini çek
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error: any) {
      console.error("Kullanıcı bilgileri alınamadı:", error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // 📸 Profil fotoğrafı yükleme
  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Hata", "Kullanıcı oturumu bulunamadı.");
        return;
      }

      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const imageRef = ref(storage, `profile_photos/${user.uid}.jpg`);
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });

      setUserData((prev) => ({ ...prev, photoURL: downloadURL }));
      Alert.alert("Başarılı", "Profil fotoğrafınız güncellendi!");
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  // 🚪 Çıkış
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Çıkış yapıldı", "Tekrar görüşmek üzere!");
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/profile-bg.png")}
      style={{ flex: 1 , width: "100%", height: "100%" }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 items-center">
        <View style={{ marginTop: height * 0.05, alignItems: "center" }}>
          {/* Profil resmi */}
          <Pressable onPress={handleImageUpload} className="items-center mb-4">
            <Image
              source={
                userData?.photoURL
                  ? { uri: userData.photoURL }
                  : require("@/assets/images/react-logo.png")
              }
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 2,
                borderColor: "#0C94B9",
              }}
            />
            <Text className="text-[#454545] text-sm font-semibold mt-2">
              Fotoğrafı Değiştir
            </Text>
          </Pressable>

          <Text className="text-4xl font-extrabold text-[#000] mt-4">
            {userData?.firstName || ""} {userData?.lastName || ""}
          </Text>
          <Text className="text-xl text-[#1E1E1E] font-medium mt-1">
            {userData?.email || ""}
          </Text>
        </View>

        {/* Çıkış Yap */}
        <Pressable
          onPress={handleLogout}
          style={{
            width: width * 0.5,
            height: 52,
            marginTop: 60,
            borderRadius: 26,
            backgroundColor: "#0C94B9",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text className="text-white text-[16px] font-medium mr-2">
            Çıkış Yap
          </Text>
          <Image
            source={require("@/assets/icons/chevron-right.png")}
            style={{ width: 16, height: 16 }}
            resizeMode="contain"
          />
        </Pressable>
      </SafeAreaView>
    </ImageBackground>
  );
}
