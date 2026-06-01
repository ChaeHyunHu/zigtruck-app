import React from "react";

import { ProductEditOptionSheet } from "@/src/features/products/edit/ProductEditOptionSheet";

export type OptionItem = { code: string; desc: string };

type OptionPickerSheetProps = {
  visible: boolean;
  title: string;
  options: OptionItem[];
  selectedCode?: string;
  onClose: () => void;
  onSelect: (item: OptionItem) => void;
  /** @deprecated ProductEditOptionSheet 사용 — 무시됨 */
  noModal?: boolean;
  /** @deprecated ProductEditOptionSheet 사용 — 무시됨 */
  overlayZIndex?: number;
};

/**
 * 판매 등록·필터 등 공통 옵션 바텀시트.
 * Stack 화면에서 Modal 터치/중첩 이슈를 피하기 위해 ProductEditOptionSheet 를 사용한다.
 */
export const OptionPickerSheet = React.memo(function OptionPickerSheet({
  visible,
  title,
  options,
  selectedCode,
  onClose,
  onSelect,
}: OptionPickerSheetProps) {
  return (
    <ProductEditOptionSheet
      visible={visible}
      title={title}
      options={options}
      selectedCode={selectedCode}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
});

export { getOptionPickerSheetLayout } from "@/src/components/common/optionPickerSheetLayout";
