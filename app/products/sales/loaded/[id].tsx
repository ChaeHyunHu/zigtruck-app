import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Keyboard, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { SALESTYPE } from "@/src/constants/products";
import { DimensionInputRow } from "@/src/features/sell-car/registration/DimensionInputRow";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { usePatchProduct, useRegistrationProduct } from "@/src/features/sell-car/registration/hooks";
import {
  OptionItem,
  OptionPickerSheet,
} from "@/src/features/sell-car/registration/OptionPickerSheet";
import { getStepIndex } from "@/src/features/sell-car/registration/productUtils";
import { SellCarRegistrationHeader } from "@/src/features/sell-car/registration/SellCarRegistrationHeader";
import { StepBadge } from "@/src/features/sell-car/registration/StepBadge";
import { UnderlineSelectField } from "@/src/features/sell-car/registration/UnderlineSelectField";
import { validateLoadedInnerLength } from "@/src/features/sell-car/registration/validation";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";

export default function LoadedFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productFormData, setProductFormData } = useRegistrationProduct(id);
  const { productEnum } = useProductRegistration();
  const { patch, saving } = usePatchProduct();
  const [picker, setPicker] = useState<"loaded" | "loadedDetail" | null>(null);
  const [lengthError, setLengthError] = useState("");

  const tonsNum = Number(productFormData?.tons);
  const isOneTonRange = tonsNum === 1 || tonsNum === 1.1 || tonsNum === 1.2;

  const loadedOptions = useMemo<OptionItem[]>(() => {
    if (!productEnum) return [];
    const list = isOneTonRange
      ? productEnum.oneTonsLoaded ?? []
      : (productEnum.loaded ?? []).filter((item) => item.code !== "WIDEWINGBODY");
    return list.map((item) => ({ code: String(item.code), desc: String(item.desc) }));
  }, [isOneTonRange, productEnum]);

  const detailOptions = useMemo<OptionItem[]>(() => {
    if (!productFormData?.loaded?.code) return [];
    if (isOneTonRange && productEnum?.oneTonsLoaded) {
      const found = productEnum.oneTonsLoaded.find(
        (item) => item.code === productFormData.loaded?.code,
      );
      return (found?.loadedDetail ?? []).map((d) => ({
        code: String(d.code),
        desc: String(d.desc),
      }));
    }
    return [];
  }, [isOneTonRange, productEnum, productFormData?.loaded?.code]);

  const title =
    SALESTYPE[(productFormData?.type?.code as keyof typeof SALESTYPE) ?? "DIRECT"];

  const onNext = async () => {
    const lengthMsg = validateLoadedInnerLength(
      productFormData?.tons,
      String(productFormData?.loadedInnerLength ?? ""),
    );
    if (lengthMsg) {
      setLengthError(lengthMsg);
      return;
    }
    if (!productFormData?.loaded?.code || !productFormData?.id) {
      Alert.alert("입력 필요", "적재함 종류와 길이를 입력해주세요.");
      return;
    }
    try {
      await patch({
        id: productFormData.id,
        loaded: productFormData.loaded.code,
        loadedDetail: productFormData.loadedDetail?.code ?? "",
        loadedInnerLength: Number(productFormData.loadedInnerLength),
        loadedInnerArea: Number(productFormData.loadedInnerArea || 0),
        loadedInnerHeight: Number(productFormData.loadedInnerHeight || 0),
      });
      router.replace({
        pathname: "/products/sales/axis/[id]",
        params: { id: String(productFormData.id) },
      });
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    }
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <View className="flex-1">
        <SellCarRegistrationHeader title={title} />
        <ScrollView
          className="flex-1 px-4 pt-6"
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: 24 }}
        >
        <View className="flex-row items-start justify-between pt-6">
          <Text className="flex-1 text-[24px] font-bold leading-[30px] text-gray800">
            적재함 종류와{"\n"}길이(내측 길이)를 입력해주세요.
          </Text>
          <StepBadge text={`${getStepIndex("loaded")}/9`} />
        </View>

        <View className="mt-8">
          <UnderlineSelectField
            placeholder="적재함 종류 선택"
            value={productFormData?.loaded?.desc}
            onPress={() => {
              Keyboard.dismiss();
              setPicker("loaded");
            }}
          />
          {detailOptions.length > 0 ? (
            <UnderlineSelectField
              placeholder="세부 적재함 종류 선택"
              value={productFormData?.loadedDetail?.desc}
              onPress={() => {
                Keyboard.dismiss();
                setPicker("loadedDetail");
              }}
            />
          ) : null}

          <DimensionInputRow
            label="길이"
            value={String(productFormData?.loadedInnerLength ?? "")}
            error={lengthError}
            onChangeText={(value) => {
              setLengthError("");
              setProductFormData((prev) =>
                prev ? { ...prev, loadedInnerLength: value } : prev,
              );
            }}
          />
          <DimensionInputRow
            label="너비"
            value={String(productFormData?.loadedInnerArea ?? "")}
            onChangeText={(value) =>
              setProductFormData((prev) =>
                prev ? { ...prev, loadedInnerArea: value } : prev,
              )
            }
          />
          <DimensionInputRow
            label="높이"
            value={String(productFormData?.loadedInnerHeight ?? "")}
            onChangeText={(value) =>
              setProductFormData((prev) =>
                prev ? { ...prev, loadedInnerHeight: value } : prev,
              )
            }
          />
        </View>
        </ScrollView>

        <DualFooterButtons
          onPressLeft={() =>
            router.replace({ pathname: "/products/sales/tons/[id]", params: { id: String(id) } })
          }
          rightLabel="다음(가변축)"
          onPressRight={onNext}
          loading={saving}
        />
      </View>

      {picker !== null ? (
        <OptionPickerSheet
          visible
          title={picker === "loaded" ? "적재함 종류" : "세부 적재함 종류"}
          options={picker === "loaded" ? loadedOptions : detailOptions}
          selectedCode={
            picker === "loaded"
              ? productFormData?.loaded?.code
              : productFormData?.loadedDetail?.code
          }
          onClose={() => setPicker(null)}
          onSelect={(item) => {
            if (picker === "loaded") {
              setProductFormData((prev) =>
                prev
                  ? {
                      ...prev,
                      loaded: { code: item.code, desc: item.desc },
                      loadedDetail: undefined,
                    }
                  : prev,
              );
            } else {
              setProductFormData((prev) =>
                prev
                  ? { ...prev, loadedDetail: { code: item.code, desc: item.desc } }
                  : prev,
              );
            }
            setPicker(null);
          }}
        />
      ) : null}
    </Screen>
  );
}
