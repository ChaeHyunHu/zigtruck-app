import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";

const SAF_DOWNLOAD_DIR_KEY = "@zigtruck/contract_download_saf_directory";

function sanitizeFileName(name: string) {
  const base = name.replace(/[^\w가-힣.-]/g, "_").slice(0, 80) || "contract";
  return base.toLowerCase().endsWith(".jpeg") || base.toLowerCase().endsWith(".jpg")
    ? base
    : `${base}.jpeg`;
}

async function writeContractJpegToCache(options: {
  dataUrl?: string;
  remoteUrl?: string;
  fileName: string;
}): Promise<{ localPath: string; displayName: string }> {
  const displayName = sanitizeFileName(options.fileName);
  const localPath = `${FileSystem.cacheDirectory}contract_${Date.now()}_${displayName}`;

  if (options.dataUrl) {
    const base64 = options.dataUrl.includes(",")
      ? options.dataUrl.split(",")[1]!
      : options.dataUrl;
    await FileSystem.writeAsStringAsync(localPath, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else if (options.remoteUrl) {
    const downloaded = await FileSystem.downloadAsync(options.remoteUrl, localPath);
    if (downloaded.status !== 200) {
      throw new Error("계약서 파일을 받지 못했습니다.");
    }
  } else {
    throw new Error("저장할 이미지가 없습니다.");
  }

  return { localPath, displayName };
}

async function resolveAndroidDownloadDirectory(): Promise<string> {
  const { StorageAccessFramework } = FileSystem;
  const cached = await AsyncStorage.getItem(SAF_DOWNLOAD_DIR_KEY);
  if (cached) return cached;

  const result = await StorageAccessFramework.requestDirectoryPermissionsAsync(
    StorageAccessFramework.getUriForDirectoryInRoot("Download"),
  );
  if (!result.granted || !result.directoryUri) {
    throw new Error(
      "다운로드 폴더 접근 권한이 필요합니다. 「다운로드」 폴더를 선택해 주세요.",
    );
  }

  await AsyncStorage.setItem(SAF_DOWNLOAD_DIR_KEY, result.directoryUri);
  return result.directoryUri;
}

async function saveContractJpegToAndroidDownloads(localPath: string, displayName: string) {
  const { StorageAccessFramework } = FileSystem;
  const nameWithoutExt = `${displayName.replace(/\.jpe?g$/i, "")}_${Date.now()}`;

  const trySave = async (directoryUri: string) => {
    const destUri = await StorageAccessFramework.createFileAsync(
      directoryUri,
      nameWithoutExt,
      "image/jpeg",
    );
    await StorageAccessFramework.copyAsync({
      from: localPath,
      to: destUri,
    });
  };

  try {
    await trySave(await resolveAndroidDownloadDirectory());
  } catch {
    await AsyncStorage.removeItem(SAF_DOWNLOAD_DIR_KEY);
    await trySave(await resolveAndroidDownloadDirectory());
  }
}

async function ensureIosPhotoPermission() {
  const current = await MediaLibrary.getPermissionsAsync();
  if (current.granted) return;

  const requested = await MediaLibrary.requestPermissionsAsync();
  if (!requested.granted) {
    throw new Error("사진 저장 권한이 필요합니다. 설정에서 권한을 허용해 주세요.");
  }
}

async function saveContractJpegToIosPhotos(localPath: string) {
  await ensureIosPhotoPermission();
  await MediaLibrary.createAssetAsync(localPath);
}

/** 계약서 JPEG 저장 — Android: 다운로드 폴더, iOS: 사진 앨범 */
export async function saveContractJpegToDevice(options: {
  dataUrl?: string;
  remoteUrl?: string;
  fileName: string;
}): Promise<{ message: string }> {
  const { localPath, displayName } = await writeContractJpegToCache(options);

  if (Platform.OS === "android") {
    await saveContractJpegToAndroidDownloads(localPath, displayName);
    return { message: "다운로드 폴더에 저장되었습니다." };
  }

  await saveContractJpegToIosPhotos(localPath);
  return { message: "사진 앨범에 저장되었습니다." };
}
