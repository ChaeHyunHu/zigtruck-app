import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

/** Android 에뮬레이터 등에서 PICK_IMAGES 미지원 시 legacy 피커로 폴백 */
export async function pickImageFromLibrary(options?: {
  quality?: number;
  allowsEditing?: boolean;
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
}): Promise<ImagePicker.ImagePickerResult | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: options?.quality ?? 0.8,
    allowsEditing: options?.allowsEditing,
    allowsMultipleSelection: options?.allowsMultipleSelection,
    selectionLimit: options?.selectionLimit,
    ...(Platform.OS === "android" ? { legacy: true } : {}),
  });
}
