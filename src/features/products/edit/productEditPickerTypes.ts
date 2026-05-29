import type { OptionItem } from "@/src/features/sell-car/registration/OptionPickerSheet";

export type ProductEditOpenPickerParams = {
  title: string;
  options: OptionItem[];
  selectedCode?: string;
  onSelect: (item: OptionItem) => void;
};
