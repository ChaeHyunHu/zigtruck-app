import { getDefaultBottomSheetHeight } from "@/src/components/common/AnimatedBottomSheetModal";

export const OPTION_PICKER_HEADER_HEIGHT = 57;
export const OPTION_PICKER_ROW_HEIGHT = 57;

export function getOptionPickerSheetLayout(
  optionCount: number,
  bottomInset: number,
  maxHeightRatio = 0.75,
) {
  const bottomPadding = Math.max(bottomInset, 12);
  const contentHeight =
    OPTION_PICKER_HEADER_HEIGHT +
    optionCount * OPTION_PICKER_ROW_HEIGHT +
    bottomPadding;
  const maxHeight = getDefaultBottomSheetHeight(maxHeightRatio);
  const sheetHeight = Math.min(contentHeight, maxHeight);
  const scrollable = contentHeight > maxHeight;
  const scrollMaxHeight =
    sheetHeight - OPTION_PICKER_HEADER_HEIGHT - bottomPadding;

  return { sheetHeight, bottomPadding, scrollable, scrollMaxHeight };
}
