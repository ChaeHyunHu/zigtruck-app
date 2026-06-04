import { Image } from "expo-image";

import { guideImages } from "@/src/features/guide/components/GuidePrimitives";

const ALL_GUIDE_IMAGE_URIS = Object.values(guideImages);

let prefetchPromise: Promise<void> | null = null;

export function preloadGuideImages(): Promise<void> {
  if (!prefetchPromise) {
    prefetchPromise = Promise.all(
      ALL_GUIDE_IMAGE_URIS.map((uri) => Image.prefetch(uri).catch(() => undefined)),
    ).then(() => undefined);
  }
  return prefetchPromise;
}
