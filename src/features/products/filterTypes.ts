export type ProductSearchFilters = {
  keyword?: string;
  yearMin: string;
  yearMax: string;
  tonsMin: string;
  tonsMax: string;
  manufacturerCategoriesId?: string;
  loaded?: string;
  loadedLengthMin: string;
  loadedLengthMax: string;
  axis?: string;
  distanceMin: string;
  distanceMax: string;
  transmission?: string;
  sort: string;
  onlyOneTon: boolean;
  salesType?: string;
};

export type FilterOptionItem = {
  code: string;
  label: string;
  count?: number;
};
