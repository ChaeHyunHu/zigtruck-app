export type InfiniteCarouselSlides = {
  slides: string[];
  loopEnabled: boolean;
  toRealIndex: (extendedIndex: number) => number;
  toExtendedIndex: (realIndex: number) => number;
};

export const buildInfiniteCarouselSlides = (
  images: string[],
): InfiniteCarouselSlides => {
  if (images.length <= 1) {
    return {
      slides: images,
      loopEnabled: false,
      toRealIndex: (index) => index,
      toExtendedIndex: (index) => index,
    };
  }

  return {
    slides: [images[images.length - 1], ...images, images[0]],
    loopEnabled: true,
    toRealIndex: (extendedIndex) => {
      if (extendedIndex <= 0) return images.length - 1;
      if (extendedIndex >= images.length + 1) return 0;
      return extendedIndex - 1;
    },
    toExtendedIndex: (realIndex) => realIndex + 1,
  };
};

export const resolveLoopExtendedIndex = (
  extendedIndex: number,
  imageCount: number,
): number | null => {
  if (imageCount <= 1) return null;
  if (extendedIndex === 0) return imageCount;
  if (extendedIndex === imageCount + 1) return 1;
  return null;
};
