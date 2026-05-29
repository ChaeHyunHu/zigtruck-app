import { getAccessToken } from "@/src/api/authStorage";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

function unwrapUrl(json: unknown): string | undefined {
  if (!json || typeof json !== "object") return undefined;
  const root = json as Record<string, unknown>;
  const nested = root.data;
  if (nested && typeof nested === "object") {
    const url = (nested as Record<string, unknown>).url;
    if (typeof url === "string" && url.length > 0) return url;
  }
  if (typeof root.url === "string" && root.url.length > 0) return root.url;
  return undefined;
}

/** 웹과 동일: 계약서 JPEG 업로드 후 다운로드 URL 발급 */
export async function uploadContractDocumentForDownload(
  contractId: number,
  jpegDataUrl: string,
  carName?: string,
): Promise<string> {
  const formData = new FormData();
  formData.append(
    "contractFile",
    {
      uri: jpegDataUrl,
      name: `계약서_${carName || "contract"}.jpeg`,
      type: "image/jpeg",
    } as unknown as Blob,
  );

  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}/api/v1/contracts/${contractId}/download`, {
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
      json &&
      typeof json === "object" &&
      "message" in json &&
      typeof (json as { message: unknown }).message === "string"
        ? (json as { message: string }).message
        : "문서 다운로드에 실패했습니다.";
    throw new Error(message);
  }

  const url = unwrapUrl(json);
  if (!url) {
    throw new Error("다운로드 URL을 받지 못했습니다.");
  }
  return url;
}
