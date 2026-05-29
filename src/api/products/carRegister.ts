import newApiManager from "../NewAxiosInstance";

import type { RegistrationProduct } from "@/src/features/sell-car/registration/types";

export const fetchCarRegister = async (carNumber: string, ownerName?: string) => {
  const params: Record<string, string> = { carNumber };
  if (ownerName) params.ownerName = ownerName;
  const res = await newApiManager.get<RegistrationProduct>("/api/v1/products/car-register", {
    params,
  });
  return res.data;
};

export const fetchRegistrationProduct = async (id: string | number) => {
  const res = await newApiManager.get<RegistrationProduct>(`/api/v1/products/${id}`);
  return res.data;
};

export const getProductEnum = async () => {
  const res = await newApiManager.get("/api/v1/public/products/enum");
  return res.data;
};
