import { createLicense } from "@/src/api/license/createLicense";
import { deleteLicenseByProduct } from "@/src/api/license/deleteLicenseByProduct";
import { BASE_TONNAGE } from "@/src/features/license/utils";

import type { RegistrationProduct } from "./types";

type SyncProductLicenseParams = {
  productId: number;
  isSaleLicense: boolean;
  product: RegistrationProduct;
  memberId?: number;
};

export async function syncProductLicense({
  productId,
  isSaleLicense,
  product,
  memberId,
}: SyncProductLicenseParams) {
  if (!isSaleLicense) {
    try {
      await deleteLicenseByProduct({ productId });
    } catch {
      // 연결된 번호판이 없을 수 있음
    }
    return;
  }

  const licenseType = product.license?.licenseType?.code;
  const price = product.license?.price;
  if (!licenseType || price == null || String(price).trim() === "") {
    throw new Error("LICENSE_INFO_REQUIRED");
  }

  const year =
    product.year != null
      ? String(product.year)
      : product.firstRegistrationDate?.match(/\d{4}/)?.[0] ?? "";
  const tons = product.tons != null ? String(product.tons) : "";
  const maxTons = tons
    ? String(Math.max(BASE_TONNAGE, Number(tons)))
    : String(BASE_TONNAGE);

  await createLicense({
    productId,
    memberId,
    licenseType,
    price: String(price),
    year,
    tons,
    maxTons,
    licenseSalesType: "TRADE",
    certificationImageUrl: "",
    licenseImageUrl: "",
  });
}
