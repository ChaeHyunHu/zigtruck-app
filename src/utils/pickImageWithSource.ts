import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

type PickOptions = {
  quality?: number;
  allowsEditing?: boolean;
};

/** 카메라/갤러리 선택 시트를 띄우고 선택한 소스로 단일 이미지를 가져온다. */
export async function pickImageWithSource(
  options?: PickOptions,
): Promise<ImagePicker.ImagePickerResult | null> {
  const source = await askSource();
  if (!source) return null;

  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
      return null;
    }
    return ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: options?.quality ?? 0.8,
      allowsEditing: options?.allowsEditing,
    });
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
    return null;
  }
  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: options?.quality ?? 0.8,
    allowsEditing: options?.allowsEditing,
    ...(Platform.OS === "android" ? { legacy: true } : {}),
  });
}

function askSource(): Promise<"camera" | "library" | null> {
  return new Promise((resolve) => {
    Alert.alert(
      "사진 첨부",
      "사진을 어떻게 추가할까요?",
      [
        { text: "카메라", onPress: () => resolve("camera") },
        { text: "갤러리", onPress: () => resolve("library") },
        { text: "취소", style: "cancel", onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}
