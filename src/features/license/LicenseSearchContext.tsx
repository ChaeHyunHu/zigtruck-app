import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  defaultLicenseSearchParams,
  type LicenseSearchParams,
} from "@/src/features/license/types";

type LicenseSearchContextValue = {
  params: LicenseSearchParams;
  initialParams: LicenseSearchParams;
  setParams: React.Dispatch<React.SetStateAction<LicenseSearchParams>>;
  resetParams: () => void;
  hasFilterChanged: boolean;
};

const LicenseSearchContext = createContext<LicenseSearchContextValue | null>(
  null,
);

export function LicenseSearchProvider({
  memberId,
  children,
}: {
  memberId: number | null;
  children: React.ReactNode;
}) {
  const initial = useMemo(
    () => defaultLicenseSearchParams(memberId),
    [memberId],
  );
  const [params, setParams] = useState<LicenseSearchParams>(initial);

  const resetParams = useCallback(() => {
    setParams(defaultLicenseSearchParams(memberId));
  }, [memberId]);

  const hasFilterChanged = useMemo(
    () => JSON.stringify(params) !== JSON.stringify(initial),
    [initial, params],
  );

  const value = useMemo(
    () => ({
      params,
      initialParams: initial,
      setParams,
      resetParams,
      hasFilterChanged,
    }),
    [hasFilterChanged, initial, params, resetParams],
  );

  return (
    <LicenseSearchContext.Provider value={value}>
      {children}
    </LicenseSearchContext.Provider>
  );
}

export function useLicenseSearch() {
  const ctx = useContext(LicenseSearchContext);
  if (!ctx) {
    throw new Error("useLicenseSearch must be used within LicenseSearchProvider");
  }
  return ctx;
}
