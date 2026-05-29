import apiManager from "../AxiosInstance";

export const fetchPriceTruckInfo = async (carNumber: string, ownerName: string) => {
  const res = await apiManager.get("/api/v1/prices/truck-info", {
    params: { carNumber, ownerName },
  });
  return res.data;
};
