import { Dimensions, PixelRatio } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_HORIZONTAL_PADDING = 16;

export const LIST_CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;
export const LIST_CARD_MAIN_ASPECT = 1.55;
export const LIST_CARD_MAIN_HEIGHT = LIST_CARD_WIDTH / LIST_CARD_MAIN_ASPECT;
export const LIST_THUMB_GAP = 8;
export const LIST_THUMB_WIDTH = Math.round(
  (LIST_CARD_WIDTH - LIST_THUMB_GAP * 4) / 5,
);
export const LIST_THUMB_HEIGHT = Math.round(LIST_THUMB_WIDTH * 0.72);

const toPixelSize = (layoutSize: number) =>
  Math.max(1, Math.round(layoutSize * PixelRatio.get()));

export const LIST_CARD_MAIN_PIXEL = {
  width: toPixelSize(LIST_CARD_WIDTH),
  height: toPixelSize(LIST_CARD_MAIN_HEIGHT),
};

export const LIST_THUMB_PIXEL = {
  width: toPixelSize(LIST_THUMB_WIDTH),
  height: toPixelSize(LIST_THUMB_HEIGHT),
};

export const buildListCardImageSource = (
  uri: string,
  pixelSize: { width: number; height: number },
) => ({
  uri,
  width: pixelSize.width,
  height: pixelSize.height,
});
