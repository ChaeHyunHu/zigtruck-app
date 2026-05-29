import { Stack } from "expo-router";
import React from "react";

import { JobSearchProvider } from "@/src/features/job/JobSearchContext";

export default function JobLayout() {
  return (
    <JobSearchProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </JobSearchProvider>
  );
}
