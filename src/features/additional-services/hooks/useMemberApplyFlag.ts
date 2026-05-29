import { useCallback, useEffect, useState } from "react";

import apiManager from "@/src/api/AxiosInstance";
import { useAuth } from "@/src/hooks/useAuth";

import {
  SERVICE_APPLY_FLAG_KEY,
  type AdditionalServiceType,
} from "../constants";

export function useMemberApplyFlag(serviceType: AdditionalServiceType) {
  const { isAuthenticated, memberId } = useAuth();
  const [isAlreadyApply, setIsAlreadyApply] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !memberId) {
      setIsAlreadyApply(false);
      return;
    }
    try {
      const response = await apiManager.get(`/api/v1/members/${memberId}`);
      const flagKey = SERVICE_APPLY_FLAG_KEY[serviceType];
      setIsAlreadyApply(Boolean(response.data?.[flagKey]));
    } catch {
      setIsAlreadyApply(false);
    }
  }, [isAuthenticated, memberId, serviceType]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { isAlreadyApply, setIsAlreadyApply, refresh };
}
