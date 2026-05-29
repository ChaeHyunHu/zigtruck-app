import type { SelectedVehicleInfo } from "./types";

export function parseVehicleParams(params: {
  productId?: string | string[];
  truckName?: string | string[];
  chatRoomId?: string | string[];
  productPrice?: string | string[];
}): SelectedVehicleInfo | undefined {
  const productIdRaw = Array.isArray(params.productId)
    ? params.productId[0]
    : params.productId;
  const truckName = Array.isArray(params.truckName)
    ? params.truckName[0]
    : params.truckName;
  const chatRoomIdRaw = Array.isArray(params.chatRoomId)
    ? params.chatRoomId[0]
    : params.chatRoomId;
  const productPriceRaw = Array.isArray(params.productPrice)
    ? params.productPrice[0]
    : params.productPrice;

  if (!productIdRaw && !truckName && !chatRoomIdRaw) return undefined;

  return {
    productId: productIdRaw ? Number(productIdRaw) : undefined,
    truckName: truckName || undefined,
    chatRoomId: chatRoomIdRaw ? Number(chatRoomIdRaw) : undefined,
    productPrice: productPriceRaw ? Number(productPriceRaw) : undefined,
  };
}
