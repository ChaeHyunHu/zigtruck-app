import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

import { showAppAlert } from "@/src/providers/appDialog";

export type ImageSource = "camera" | "library";

type PickOptions = {
  quality?: number;
  allowsEditing?: boolean;
};

/** 선택한 소스(카메라/갤러리)로 단일 이미지를 가져온다. */
export async function launchImagePickerForSource(
  source: ImageSource,
  options?: PickOptions,
): Promise<ImagePicker.ImagePickerResult | null> {
  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAppAlert({ title: "권한 필요", message: "카메라 접근 권한이 필요합니다." });
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
    showAppAlert({ title: "권한 필요", message: "사진 라이브러리 접근 권한이 필요합니다." });
    return null;
  }
  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: options?.quality ?? 0.8,
    allowsEditing: options?.allowsEditing,
    ...(Platform.OS === "android" ? { legacy: true } : {}),
  });
}
