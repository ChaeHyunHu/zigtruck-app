import { Platform } from "react-native";

import { getAccessToken } from "@/src/api/authStorage";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

function buildUploadFile(file: { uri: string; name: string; type: string }) {
  const mime = file.type || "image/jpeg";
  const normalizedMime =
    mime === "image/jpg" || mime === "image/heic" || mime === "image/heif"
      ? "image/jpeg"
      : mime;
  const ext = normalizedMime.includes("png") ? "png" : "jpg";
  const name = file.name?.includes(".") ? file.name : `receipt-${Date.now()}.${ext}`;

  return {
    uri: Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
    name,
    type: normalizedMime,
  };
}

function unwrapReceiptPayload(json: unknown): Record<string, unknown> {
  if (!json || typeof json !== "object") return {};
  const record = json as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    return record.data as Record<string, unknown>;
  }
  return record;
}

/** RN multipart 업로드 (axios FormData 이슈 회피) */
export async function uploadFuelingReceiptMultipart(file: {
  uri: string;
  name: string;
  type: string;
}) {
  const formData = new FormData();
  formData.append("file", buildUploadFile(file) as unknown as Blob);

  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}/api/v1/fueling-history/receipt`, {
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

  return { data: unwrapReceiptPayload(json) };
}
