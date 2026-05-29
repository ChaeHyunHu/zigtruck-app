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
    if (Array.isArray(data.imageUrls)) return data.imageUrls[0] as string;
    if (Array.isArray(data.data)) return extractImageUrl(data.data);
    return (
      (data.url as string | undefined) ??
      (data.imageUrl as string | undefined) ??
      (data.fileUrl as string | undefined)
    );
  }
  return undefined;
};

const buildUploadFile = (params: {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}) => {
  const mime = params.mimeType ?? "image/jpeg";
  const normalizedMime =
    mime === "image/jpg" || mime === "image/heic" || mime === "image/heif"
      ? "image/jpeg"
      : mime;
  const ext = normalizedMime.includes("png") ? "png" : "jpg";
  const name = params.fileName?.includes(".")
    ? params.fileName
    : `upload-${Date.now()}.${ext}`;

  return {
    uri: Platform.OS === "ios" ? params.uri.replace("file://", "") : params.uri,
    name,
    type: normalizedMime,
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
  } catch {
    return await tryUpload("/api/v1/products-images");
  }
};
