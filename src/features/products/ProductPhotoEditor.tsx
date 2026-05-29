import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  Text,
  View,
} from "react-native";

import { appColors } from "@/src/constants/colors";
import { IMAGE_BASE_URL } from "@/src/constants/url";
import { resolveImageUri } from "@/src/features/products/utils";
import { uploadProductImage } from "@/src/features/sell-car/registration/uploadProductImage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 8;
const GRID_COLUMNS = 3;
const CELL_SIZE =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
  GRID_COLUMNS;

const REQUIRED_PHOTOS = [
  { key: "frontSideImageUrl", label: "앞측면" },
  { key: "backSideImageUrl", label: "뒷측면" },
  { key: "frontImageUrl", label: "전면" },
] as const;

const OPTIONAL_PHOTO_KEYS = [
  "backImageUrl",
  "tireImageUrl",
  "engineImageUrl",
  "insideImageUrl",
  "dashboardImageUrl",
  "sheetImageUrl",
] as const;

const MAX_OPTIONAL_COUNT = 10;

export type ProductImagesState = {
  id?: number;
  frontSideImageUrl?: string;
  backSideImageUrl?: string;
  frontImageUrl?: string;
  certificateImageUrl?: string;
  backImageUrl?: string;
  tireImageUrl?: string;
  engineImageUrl?: string;
  insideImageUrl?: string;
  dashboardImageUrl?: string;
  sheetImageUrl?: string;
  optionImageUrl?: string[];
};

export const buildImagesStateFromDetail = (
  productsImage?: Record<string, unknown> | null,
): ProductImagesState => {
  const source = productsImage ?? {};
  const optionImageUrl = Array.isArray(source.optionImageUrl)
    ? source.optionImageUrl
        .map((url) => resolveImageUri(url))
        .filter((url): url is string => Boolean(url))
    : [];

  return {
    id: typeof source.id === "number" ? source.id : undefined,
    frontSideImageUrl: resolveImageUri(source.frontSideImageUrl),
    backSideImageUrl: resolveImageUri(source.backSideImageUrl),
    frontImageUrl: resolveImageUri(source.frontImageUrl),
    certificateImageUrl: resolveImageUri(source.certificateImageUrl),
    backImageUrl: resolveImageUri(source.backImageUrl),
    tireImageUrl: resolveImageUri(source.tireImageUrl),
    engineImageUrl: resolveImageUri(source.engineImageUrl),
    insideImageUrl: resolveImageUri(source.insideImageUrl),
    dashboardImageUrl: resolveImageUri(source.dashboardImageUrl),
    sheetImageUrl: resolveImageUri(source.sheetImageUrl),
    optionImageUrl,
  };
};

export const buildImagePatchPayload = (images: ProductImagesState) => ({
  frontSideImageUrl: images.frontSideImageUrl ?? "",
  backSideImageUrl: images.backSideImageUrl ?? "",
  frontImageUrl: images.frontImageUrl ?? "",
  certificateImageUrl: images.certificateImageUrl ?? "",
  backImageUrl: images.backImageUrl ?? "",
  tireImageUrl: images.tireImageUrl ?? "",
  engineImageUrl: images.engineImageUrl ?? "",
  insideImageUrl: images.insideImageUrl ?? "",
  dashboardImageUrl: images.dashboardImageUrl ?? "",
  sheetImageUrl: images.sheetImageUrl ?? "",
  optionImageUrl: images.optionImageUrl?.filter(Boolean) ?? [],
});

type ProductPhotoEditorProps = {
  images: ProductImagesState;
  truckNumber?: string;
  onChange: (next: ProductImagesState) => void;
};

type UploadTarget =
  | { type: "required"; key: (typeof REQUIRED_PHOTOS)[number]["key"] }
  | { type: "optional"; key: (typeof OPTIONAL_PHOTO_KEYS)[number] }
  | { type: "option"; index: number }
  | { type: "certificate" };

export function ProductPhotoEditor({
  images,
  truckNumber,
  onChange,
}: ProductPhotoEditorProps) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const optionalCount = useMemo(() => {
    const fixedCount = OPTIONAL_PHOTO_KEYS.filter((key) =>
      Boolean(images[key]),
    ).length;
    const optionCount = images.optionImageUrl?.filter(Boolean).length ?? 0;
    return fixedCount + optionCount;
  }, [images]);

  const optionalSlots = useMemo(() => {
    const slots: Array<
      | { kind: "fixed"; key: (typeof OPTIONAL_PHOTO_KEYS)[number]; uri?: string }
      | { kind: "option"; index: number; uri?: string }
    > = [];

    OPTIONAL_PHOTO_KEYS.forEach((key) => {
      if (images[key]) {
        slots.push({ kind: "fixed", key, uri: images[key] });
      }
    });

    (images.optionImageUrl ?? []).forEach((uri, index) => {
      if (uri) {
        slots.push({ kind: "option", index, uri });
      }
    });

    return slots;
  }, [images]);

  const requestPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const uploadAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    return uploadProductImage({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      truckNumber,
    });
  };

  const applyUploadedUrl = useCallback(
    (target: UploadTarget, url: string) => {
      onChange((() => {
        const next = { ...images };
        if (target.type === "required") {
          next[target.key] = url;
          return next;
        }
        if (target.type === "certificate") {
          next.certificateImageUrl = url;
          return next;
        }
        if (target.type === "optional") {
          next[target.key] = url;
          return next;
        }
        const optionImageUrl = [...(next.optionImageUrl ?? [])];
        while (optionImageUrl.length <= target.index) {
          optionImageUrl.push("");
        }
        optionImageUrl[target.index] = url;
        next.optionImageUrl = optionImageUrl;
        return next;
      })());
    },
    [images, onChange],
  );

  const pickSingle = async (target: UploadTarget) => {
    if (!(await requestPermission())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const key =
      target.type === "required"
        ? target.key
        : target.type === "optional"
          ? target.key
          : target.type === "option"
            ? `option-${target.index}`
            : "certificate";

    setUploadingKey(key);
    try {
      const url = await uploadAsset(result.assets[0]);
      applyUploadedUrl(target, url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.";
      Alert.alert(
        "오류",
        message === "IMAGE_UPLOAD_FAILED"
          ? "이미지 업로드에 실패했습니다. 다시 시도해주세요."
          : message,
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const pickBulk = async () => {
    if (!(await requestPermission())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: MAX_OPTIONAL_COUNT + REQUIRED_PHOTOS.length,
    });
    if (result.canceled || result.assets.length === 0) return;

    setIsBulkUploading(true);
    const next = { ...images };
    const targets: UploadTarget[] = [
      { type: "required", key: "frontSideImageUrl" },
      { type: "required", key: "backSideImageUrl" },
      { type: "required", key: "frontImageUrl" },
    ];

    OPTIONAL_PHOTO_KEYS.forEach((key) => {
      targets.push({ type: "optional", key });
    });
    for (let index = 0; index < 4; index += 1) {
      targets.push({ type: "option", index });
    }

    try {
      for (let index = 0; index < result.assets.length; index += 1) {
        const target = targets[index];
        if (!target) break;
        const url = await uploadAsset(result.assets[index]);
        if (target.type === "required") {
          next[target.key] = url;
        } else if (target.type === "optional") {
          next[target.key] = url;
        } else if (target.type === "option") {
          const optionImageUrl = [...(next.optionImageUrl ?? [])];
          while (optionImageUrl.length <= target.index) {
            optionImageUrl.push("");
          }
          optionImageUrl[target.index] = url;
          next.optionImageUrl = optionImageUrl;
        }
      }
      onChange(next);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.";
      Alert.alert(
        "오류",
        message === "IMAGE_UPLOAD_FAILED"
          ? "이미지 업로드에 실패했습니다. 다시 시도해주세요."
          : message,
      );
    } finally {
      setIsBulkUploading(false);
    }
  };

  const removeRequired = (key: (typeof REQUIRED_PHOTOS)[number]["key"]) => {
    onChange({ ...images, [key]: "" });
  };

  const removeOptionalSlot = (
    slot:
      | { kind: "fixed"; key: (typeof OPTIONAL_PHOTO_KEYS)[number] }
      | { kind: "option"; index: number },
  ) => {
    const next = { ...images };
    if (slot.kind === "fixed") {
      next[slot.key] = "";
    } else {
      const optionImageUrl = [...(next.optionImageUrl ?? [])];
      optionImageUrl.splice(slot.index, 1);
      next.optionImageUrl = optionImageUrl;
    }
    onChange(next);
  };

  const addOptionalPhoto = async () => {
    if (optionalCount >= MAX_OPTIONAL_COUNT) {
      Alert.alert("안내", `추가 사진은 최대 ${MAX_OPTIONAL_COUNT}장까지 등록할 수 있어요.`);
      return;
    }

    const emptyFixed = OPTIONAL_PHOTO_KEYS.find((key) => !images[key]);
    if (emptyFixed) {
      await pickSingle({ type: "optional", key: emptyFixed });
      return;
    }

    const nextIndex = images.optionImageUrl?.length ?? 0;
    await pickSingle({ type: "option", index: nextIndex });
  };

  const isUploading = isBulkUploading || uploadingKey !== null;

  return (
    <View className="px-4 pt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[16px] font-semibold text-gray900">차량 사진</Text>
        <Pressable
          onPress={pickBulk}
          disabled={isUploading}
          className="flex-row items-center rounded-lg bg-primary-1 px-2.5 py-1.5"
        >
          {isBulkUploading ? (
            <ActivityIndicator size="small" color={appColors.primary} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={14} color={appColors.primary} />
          )}
          <Text className="ml-1 text-[12px] font-semibold text-primary">
            한번에 불러오기
          </Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
        {REQUIRED_PHOTOS.map((photo) => {
          const uri = images[photo.key];
          const loading = uploadingKey === photo.key;
          return (
            <PhotoSlot
              key={photo.key}
              uri={uri}
              label={photo.label}
              required
              loading={loading}
              onPress={() => pickSingle({ type: "required", key: photo.key })}
              onRemove={() => removeRequired(photo.key)}
            />
          );
        })}

        {optionalSlots.map((slot, index) => {
          const slotKey =
            slot.kind === "fixed" ? slot.key : `option-${slot.index}`;
          const loading = uploadingKey === slotKey;
          return (
            <PhotoSlot
              key={`${slot.kind}-${slot.kind === "fixed" ? slot.key : slot.index}-${index}`}
              uri={slot.uri}
              loading={loading}
              onPress={() =>
                slot.kind === "fixed"
                  ? pickSingle({ type: "optional", key: slot.key })
                  : pickSingle({ type: "option", index: slot.index })
              }
              onRemove={() => removeOptionalSlot(slot)}
            />
          );
        })}

        {optionalCount < MAX_OPTIONAL_COUNT ? (
          <Pressable
            onPress={addOptionalPhoto}
            disabled={isUploading}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
            className="items-center justify-center rounded-[10px] bg-gray200"
          >
            <Ionicons name="add" size={28} color={appColors.gray500} />
            <Text className="mt-1 text-[13px] font-medium text-gray700">추가</Text>
            <Text className="text-[12px] text-gray600">
              {optionalCount}/{MAX_OPTIONAL_COUNT}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text className="mb-3 mt-8 text-[16px] font-semibold text-gray900">
        차량등록증
      </Text>
      <Pressable
        onPress={() => pickSingle({ type: "certificate" })}
        disabled={isUploading}
        className="h-[180px] items-center justify-center overflow-hidden rounded-[10px] bg-gray200"
      >
        {uploadingKey === "certificate" ? (
          <ActivityIndicator color={appColors.primary} />
        ) : images.certificateImageUrl ? (
          <>
            <Image
              source={{ uri: images.certificateImageUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onChange({ ...images, certificateImageUrl: "" });
              }}
              className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-white/95"
            >
              <Ionicons name="close" size={18} color="#111" />
            </Pressable>
          </>
        ) : (
          <>
            <Ionicons name="document-text-outline" size={42} color={appColors.gray500} />
            <Ionicons
              name="arrow-up"
              size={18}
              color={appColors.gray500}
              style={{ marginTop: 8 }}
            />
          </>
        )}
      </Pressable>
    </View>
  );
}

function PhotoSlot({
  uri,
  label,
  required,
  loading,
  onPress,
  onRemove,
}: {
  uri?: string;
  label?: string;
  required?: boolean;
  loading?: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
      className="overflow-hidden rounded-[10px] bg-gray200"
    >
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
        </View>
      ) : uri ? (
        <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      ) : (
        <View className="flex-1 items-center justify-center">
          {required ? (
            <Image
              source={{ uri: `${IMAGE_BASE_URL}/car_none.png` }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                opacity: 0.35,
              }}
              contentFit="cover"
            />
          ) : null}
          <Ionicons name="add" size={30} color={appColors.gray500} />
        </View>
      )}

      {required ? (
        <View className="absolute left-1.5 top-1.5 rounded bg-danger px-1.5 py-0.5">
          <Text className="text-[10px] font-bold text-white">필수</Text>
        </View>
      ) : null}

      {uri ? (
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full bg-white/95"
        >
          <Ionicons name="close" size={18} color="#111" />
        </Pressable>
      ) : null}

      {label ? (
        <View className="absolute bottom-0 left-0 right-0 items-center bg-black/45 py-1.5">
          <Text className="text-[12px] font-semibold text-white">{label}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export const validateRequiredPhotos = (images: ProductImagesState) =>
  Boolean(
    images.frontSideImageUrl && images.backSideImageUrl && images.frontImageUrl,
  );
