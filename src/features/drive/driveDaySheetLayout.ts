import { Dimensions } from "react-native";

import { getDefaultBottomSheetHeight } from "@/src/components/common/AnimatedBottomSheetModal";
import type {
  DriveHistoryItem,
  FuelingHistoryItem,
  OtherExpenseWithCategory,
} from "@/src/features/drive/types";

const HEADER_HEIGHT = 57;
const ACTION_ROW_HEIGHT = 52;
const SCROLL_PADDING_V = 28;
const EMPTY_MESSAGE_HEIGHT = 44;
const SECTION_DIVIDER_HEIGHT = 20;
const SECTION_TITLE_HEIGHT = 36;
const DRIVE_ROUTE_ROW_HEIGHT = 36;
const TRANSPORT_CARD_HEIGHT = 76;
const TRANSPORT_CARD_CANCEL_HEIGHT = 52;
const DRIVE_PILLS_HEIGHT = 30;
const FUEL_CARD_HEIGHT = 72;
const OTHER_CARD_HEIGHT = 52;

const MIN_RATIO_WITH_DATA = 0.52;
const MAX_SHEET_RATIO = 0.84;

export type DriveDaySheetLayoutInput = {
  topReserved: number;
  bottomPad: number;
  listsSettled: boolean;
  driveItems: DriveHistoryItem[];
  fuelItems: FuelingHistoryItem[];
  otherItems: OtherExpenseWithCategory[];
};

function estimateContentBodyHeight(input: DriveDaySheetLayoutInput) {
  let height = SCROLL_PADDING_V;

  input.driveItems.forEach((item) => {
    height += DRIVE_ROUTE_ROW_HEIGHT;
    const transports = item.transportInfos?.length ? item.transportInfos : [];
    if (transports.length > 0) {
      transports.forEach((transport) => {
        height += transport.isCancel
          ? TRANSPORT_CARD_CANCEL_HEIGHT
          : TRANSPORT_CARD_HEIGHT;
      });
    } else {
      height += TRANSPORT_CARD_CANCEL_HEIGHT;
    }
    if (
      (item.toll != null && item.toll > 0) ||
      (item.fuelCost != null && item.fuelCost > 0)
    ) {
      height += DRIVE_PILLS_HEIGHT;
    }
    height += 12;
  });

  if (input.fuelItems.length > 0) {
    if (input.driveItems.length > 0) height += SECTION_DIVIDER_HEIGHT;
    height += SECTION_TITLE_HEIGHT;
    height += input.fuelItems.length * FUEL_CARD_HEIGHT;
  }

  if (input.otherItems.length > 0) {
    if (input.driveItems.length > 0 || input.fuelItems.length > 0) {
      height += SECTION_DIVIDER_HEIGHT;
    }
    height += SECTION_TITLE_HEIGHT;
    height += input.otherItems.length * OTHER_CARD_HEIGHT;
  }

  return height;
}

export function getDriveDaySheetLayout(input: DriveDaySheetLayoutInput) {
  const screenHeight = Dimensions.get("window").height;
  const chromeHeight = HEADER_HEIGHT + ACTION_ROW_HEIGHT + SCROLL_PADDING_V;
  const maxHeight = getDefaultBottomSheetHeight(
    MAX_SHEET_RATIO,
    input.topReserved,
    input.bottomPad,
  );
  const minWithData = Math.round(screenHeight * MIN_RATIO_WITH_DATA);

  const isEmpty =
    input.listsSettled &&
    input.driveItems.length === 0 &&
    input.fuelItems.length === 0 &&
    input.otherItems.length === 0;

  if (!input.listsSettled) {
    const sheetHeight = chromeHeight + 56 + input.bottomPad;
    return { sheetHeight, contentLayout: "hug" as const };
  }

  if (isEmpty) {
    const sheetHeight = chromeHeight + EMPTY_MESSAGE_HEIGHT + input.bottomPad;
    return { sheetHeight, contentLayout: "hug" as const };
  }

  const bodyHeight = estimateContentBodyHeight(input);
  const totalNeeded = chromeHeight + bodyHeight;

  if (totalNeeded >= maxHeight) {
    return { sheetHeight: maxHeight, contentLayout: "fill" as const };
  }

  const sheetHeight = Math.max(minWithData, totalNeeded) + input.bottomPad;
  return { sheetHeight, contentLayout: "hug" as const };
}
