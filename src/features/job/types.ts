export type JobEnumField = {
  code: string;
  desc: string;
};

export type Job = {
  id: number;
  title: string;
  status: JobEnumField;
  transportItem: string;
  transportSection: string;
  minTons: number;
  maxTons: number;
  loadedInnerLength?: number;
  workingArea?: JobEnumField;
  period?: JobEnumField;
  workingDays?: JobEnumField;
  workingHours?: JobEnumField;
  workingStartHour: number;
  workingEndHour: number;
  salaryType?: JobEnumField;
  salary: number;
  detailContents: string;
};

export type JobSearchParams = {
  minTons: number;
  maxTons: number;
  workingArea?: JobEnumField;
  workingDays?: JobEnumField;
  workingHours?: JobEnumField;
};

export type JobFilterInfo = {
  workingArea: JobEnumField[];
  workingDays: JobEnumField[];
  workingHours: JobEnumField[];
};
