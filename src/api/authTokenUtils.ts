import { jwtDecode } from "jwt-decode";

import apiManager from "@/src/api/AxiosInstance";
import { clearAccessToken, setAccessToken } from "@/src/api/authStorage";

export const getMemberIdFromToken = (token: string) => {
  try {
    const decodedToken = jwtDecode<Token>(token);
    if (typeof decodedToken.details === "string") {
      return JSON.parse(decodedToken.details)?.memberId as number | undefined;
    }
    return decodedToken.details?.memberId;
  } catch {
    return undefined;
  }
};

export const isAccessTokenExpired = (token: string, bufferSeconds = 30) => {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return false;
    return Date.now() >= (decoded.exp - bufferSeconds) * 1000;
  } catch {
    return true;
  }
};

export const refreshAccessToken = async () => {
  try {
    const response = await apiManager.post("/auth/refresh-token");
    const nextToken = response.data?.accessToken as string | undefined;
    if (!nextToken) {
      await clearAccessToken();
      return null;
    }
    await setAccessToken(nextToken);
    return nextToken;
  } catch {
    await clearAccessToken();
    return null;
  }
};
