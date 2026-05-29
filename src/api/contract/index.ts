import apiManager from "@/src/api/AxiosInstance";
import type { ContractInfo, ContractRequest } from "@/src/features/contract/types";

export async function fetchContract(params: {
  chatRoomId: string | number;
  contractWriterType: string;
}) {
  const res = await apiManager.get<ContractInfo>("/api/v1/contracts", { params });
  return res.data;
}

export async function createContract(body: ContractRequest) {
  const res = await apiManager.post<ContractInfo>("/api/v1/contracts", body);
  return res.data;
}

export async function updateContract(contractId: number, body: ContractRequest) {
  const res = await apiManager.patch<ContractInfo>(`/api/v1/contracts/${contractId}`, body);
  return res.data;
}

export { getPublicContracts } from "@/src/api/contract/getContract";
