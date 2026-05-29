export type BannerItem = {
  id: number;
  contents: string;
  link?: string;
  display?: boolean;
  sort?: number;
  type?: { code?: "INTERNAL" | "EXTERNAL" | string };
  bannerLocation?: { code?: string };
  contentsType?: { code?: "IMAGE" | "HTML" | string };
};

import type { EnumValue } from "@/src/features/products/types";

export type ProductsListItem = {
  id: number;
  productsNumber?: number | string;
  representImageUrl?: string;
  truckName?: string;
  firstRegistrationDate?: string;
  distance?: number;
  loadedInnerLength?: string | number;
  transmission?: EnumValue | string;
  power?: number | string;
  price?: number | null;
  salesType?: EnumValue | string;
  status?: EnumValue | string;
  youtubeUrl?: string;
  region?: string;
  location?: string;
};

export type YoutubeVideoItem = {
  id?: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
};
