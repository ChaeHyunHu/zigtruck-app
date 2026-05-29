import type { ImagePickerAsset } from "expo-image-picker";

import { CHAT_IMAGE } from "@/src/features/chat/chatMessageTypes";
import { pickImageFromLibrary } from "@/src/utils/pickImageFromLibrary";

const MAX_CHAT_IMAGES = 15;

export function buildChatImageFormData(params: {
  chatRoomId?: number;
  productId?: number;
  assets: ImagePickerAsset[];
}): FormData {
  const formData = new FormData();

  if (params.chatRoomId) {
    formData.append("chatRoomId", String(params.chatRoomId));
  } else if (params.productId) {
    formData.append("productId", String(params.productId));
  }

  formData.append("type", CHAT_IMAGE);
  formData.append("contents", "");

  params.assets.forEach((asset, index) => {
    const name = asset.fileName ?? `image_${index}.jpg`;
    const type = asset.mimeType ?? "image/jpeg";
    formData.append(
      "images",
      {
        uri: asset.uri,
        name,
        type,
      } as unknown as Blob,
    );
  });

  return formData;
}

export function pickChatImageAssets() {
  return pickImageFromLibrary({
    quality: 0.85,
    allowsMultipleSelection: true,
    selectionLimit: MAX_CHAT_IMAGES,
  });
}

export { MAX_CHAT_IMAGES };
