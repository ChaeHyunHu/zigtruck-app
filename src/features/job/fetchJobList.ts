import { getJobList } from "@/src/api/public";
import { JOB_ROWS_PER_PAGE } from "@/src/features/job/constants";
import { buildJobSearchQuery } from "@/src/features/job/jobUtils";
import type { Job, JobSearchParams } from "@/src/features/job/types";
import { pickArray } from "@/src/utils/pickArray";

export async function fetchJobListPage(
  params: JobSearchParams,
  page: number,
): Promise<Job[]> {
  const res = await getJobList(buildJobSearchQuery(params, page));
  return pickArray(res.data) as Job[];
}

export async function fetchJobListAll(params: JobSearchParams): Promise<Job[]> {
  const first = await fetchJobListPage(params, 1);
  if (first.length < JOB_ROWS_PER_PAGE) {
    return first;
  }

  const items = [...first];
  let page = 2;
  for (;;) {
    const next = await fetchJobListPage(params, page);
    if (next.length === 0) break;
    items.push(...next);
    if (next.length < JOB_ROWS_PER_PAGE) break;
    page += 1;
  }
  return items;
}
