import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  defaultJobSearchParams,
  isDefaultJobSearchParams,
} from "@/src/features/job/jobUtils";
import type { JobSearchParams } from "@/src/features/job/types";

type JobSearchContextValue = {
  params: JobSearchParams;
  setParams: React.Dispatch<React.SetStateAction<JobSearchParams>>;
  resetParams: () => void;
  hasFilterChanged: boolean;
};

const JobSearchContext = createContext<JobSearchContextValue | null>(null);

export function JobSearchProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => defaultJobSearchParams(), []);
  const [params, setParams] = useState<JobSearchParams>(initial);

  const resetParams = useCallback(() => {
    setParams(defaultJobSearchParams());
  }, []);

  const hasFilterChanged = useMemo(
    () => !isDefaultJobSearchParams(params),
    [params],
  );

  const value = useMemo(
    () => ({
      params,
      setParams,
      resetParams,
      hasFilterChanged,
    }),
    [hasFilterChanged, params, resetParams],
  );

  return (
    <JobSearchContext.Provider value={value}>{children}</JobSearchContext.Provider>
  );
}

export function useJobSearch() {
  const ctx = useContext(JobSearchContext);
  if (!ctx) {
    throw new Error("useJobSearch must be used within JobSearchProvider");
  }
  return ctx;
}
