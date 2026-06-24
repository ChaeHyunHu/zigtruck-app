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
  const chromeHeight = HEADER_HEIGHT + ACTION_ROW_HEIGHT + SCROLL_PADDING_V;
  const maxHeight = getDefaultBottomSheetHeight(
    MAX_SHEET_RATIO,
    input.topReserved,
    input.bottomPad,
  );
  // 내역이 없으면 안내 문구 높이에 맞춰 최소로 (하단 빈 공백 제거)
  const isEmpty =
    input.driveItems.length === 0 &&
    input.fuelItems.length === 0 &&
    input.otherItems.length === 0;

  if (isEmpty) {
    const sheetHeight = chromeHeight + EMPTY_MESSAGE_HEIGHT + input.bottomPad;
    return { sheetHeight, contentLayout: "hug" as const };
  }

  // 내역이 있으면 내용 높이에 맞춰(auto) 열고, max 를 넘으면 max 로 제한 + 내부 스크롤.
  // 시트는 데이터가 확정된 뒤(DriveHomeScreen 에서 listsSettled 후) 열리므로,
  // 열린 뒤 높이가 바뀌어 더블 모션이 생기는 일은 없다.
  const bodyHeight = estimateContentBodyHeight(input);
  const totalNeeded = chromeHeight + bodyHeight + input.bottomPad;

  if (totalNeeded >= maxHeight) {
    return { sheetHeight: maxHeight, contentLayout: "fill" as const };
  }

  return { sheetHeight: totalNeeded, contentLayout: "hug" as const };
}
