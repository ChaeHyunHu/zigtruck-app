export type EnumPresenter = { code?: string; desc?: string; id?: number; name?: string };

export type ProductSearchParams = {
  tons: string;
  year: string;
  model: { id: number; name: string };
  manufacturerCategories: { id: number; name: string; code?: string };
  loaded: { code: string; desc: string };
  loadedInnerLength: string;
  loadedInnerArea: string;
  loadedInnerHeight: string;
  transmission: string;
  distance: string;
  fuel: string;
  power: string;
  axis: { code: string; desc: string };
  productId?: number | null;
  status?: EnumPresenter | null;
};

export type PriceTrendOriginData = {
  id?: number;
  truckNumber?: string;
  truckName?: string;
  year?: string | number;
  tons?: string | number;
  firstRegistrationDate?: string;
  manufacturerCategories?: { id: number; name: string; code?: string };
  model?: { id: number; name: string };
  loaded?: EnumPresenter;
  loadedInnerLength?: string | number;
  loadedInnerArea?: string | number;
  loadedInnerHeight?: string | number;
  transmission?: EnumPresenter;
  distance?: number;
  fuel?: EnumPresenter;
  power?: string | number;
  axis?: EnumPresenter;
  status?: EnumPresenter;
  isDuplicateProduct?: boolean;
};

export type PriceInfoResponse = {
  id?: number;
  result?: string;
  lowPrice?: string;
  highPrice?: string;
  firstRange?: string;
  secondRange?: string;
  thirdRange?: string;
  forthRange?: string;
  fifthRange?: string;
  sixthRange?: string;
  lowPricePercentage?: number;
  highPricePercentage?: number;
  level?: EnumPresenter;
};
