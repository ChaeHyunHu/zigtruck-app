import { Platform } from "react-native";

import { getAccessToken } from "@/src/api/authStorage";

const BASE_URL = process.env.EXPO_PUBLIC_NEW_SERVER_URL;

const extractImageUrl = (payload: unknown): string | undefined => {
  if (!payload) return undefined;
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    const first = payload[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const item = first as Record<string, unknown>;
      return (
        (item.url as string | undefined) ??
        (item.imageUrl as string | undefined) ??
        (item.fileUrl as string | undefined)
      );
    }
    return undefined;
  }
  if (typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
      return data.imageUrls[0] as string;
    }
    // { data: [...] } 또는 { data: { ... } } 등 중첩 응답도 재귀적으로 처리
    if (data.data && data.data !== payload) {
      const nested = extractImageUrl(data.data);
      if (nested) return nested;
    }
    return (
      (data.url as string | undefined) ??
      (data.imageUrl as string | undefined) ??
      (data.fileUrl as string | undefined)
    );
  }
  return undefined;
};

const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  // HEIC/HEIF는 서버 미지원 가능성이 높아 jpeg로 취급 (quality 옵션으로 jpeg 재인코딩됨)
  heic: "image/jpeg",
  heif: "image/jpeg",
};

/** 파일명/URI/mimeType 문자열에서 소문자 확장자를 추출한다. */
const getExtension = (value?: string | null): string | null => {
  if (!value) return null;
  const clean = value.split("?")[0].split("#")[0];
  const match = /\.([a-zA-Z0-9]+)$/.exec(clean);
  return match ? match[1].toLowerCase() : null;
};

const buildUploadFile = (params: {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}) => {
  // 카메라 정보/확장자가 없는 이미지도 항상 유효한 확장자+타입을 갖도록 보정.
  // 우선순위: 파일명 확장자 > URI 확장자 > mimeType 하위 타입 > jpg
  const mimeExt = params.mimeType?.includes("/")
    ? params.mimeType.split("/")[1]?.toLowerCase() ?? null
    : null;
  let ext =
    getExtension(params.fileName) ??
    getExtension(params.uri) ??
    mimeExt ??
    "jpg";
  if (ext === "jpeg" || ext === "heic" || ext === "heif") ext = "jpg";

  const type = EXT_TO_MIME[ext] ?? params.mimeType ?? "image/jpeg";
  // 원본 파일명에 확장자가 없을 수 있으므로 항상 확장자를 붙여 새 이름을 생성
  const name = `upload-${Date.now()}.${ext}`;

  return {
    uri: Platform.OS === "ios" ? params.uri.replace("file://", "") : params.uri,
    name,
    type,
  };
};

const postMultipart = async (path: string, formData: FormData) => {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/json",
    },
    body: formData,
  });

  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!response.ok) {
    const message =
      typeof json === "object" && json && "message" in json
        ? String((json as { message?: string }).message)
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return json;
};

export const uploadProductImage = async (params: {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  truckNumber?: string;
}) => {
  const buildFormData = () => {
    const formData = new FormData();
    formData.append(
      "uploadFile",
      buildUploadFile(params) as unknown as Blob,
    );
    formData.append("truckNumber", params.truckNumber ?? "");
    return formData;
  };

  const tryUpload = async (path: string) => {
    const json = await postMultipart(path, buildFormData());
    const url = extractImageUrl(json);
    if (!url) throw new Error("IMAGE_UPLOAD_FAILED");
    return url;
  };

  try {
    return await tryUpload("/api/v1/products-images/multi");
  } catch (multiError) {
    try {
      return await tryUpload("/api/v1/products-images");
    } catch {
      // 폴백 엔드포인트는 imageType 등 다른 파라미터를 요구해 혼란스러운 오류를
      // 낼 수 있으므로, 사용자에게는 기본(multi) 업로드 오류를 그대로 전달한다.
      throw multiError instanceof Error
        ? multiError
        : new Error("IMAGE_UPLOAD_FAILED");
    }
  }
};
