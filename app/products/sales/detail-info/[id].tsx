import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Keyboard, ScrollView, Text, TextInput, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { showAppAlert } from "@/src/providers/appDialog";
import { SALESTYPE } from "@/src/constants/products";
import {
  PriceTrendRadioGroup,
  type RadioOption,
} from "@/src/features/price-trend/PriceTrendRadioGroup";
import { CheckboxOptionGroup } from "@/src/features/sell-car/registration/CheckboxOptionGroup";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import {
  usePatchProduct,
  useRegistrationProduct,
} from "@/src/features/sell-car/registration/hooks";
import {
  OptionItem,
  OptionPickerSheet,
} from "@/src/features/sell-car/registration/OptionPickerSheet";
import { getStepIndex } from "@/src/features/sell-car/registration/productUtils";
import { SellCarRegistrationHeader } from "@/src/features/sell-car/registration/SellCarRegistrationHeader";
import { SelectField } from "@/src/features/sell-car/registration/SelectField";
import { StepBadge } from "@/src/features/sell-car/registration/StepBadge";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

const PHONE_REGEX = /01[016789]-?\d{3,4}-?\d{4}/;

const ACCIDENT_OPTIONS: RadioOption[] = [
  { code: "false", label: "없음" },
  { code: "true", label: "있음" },
];

const inputClassName =
  "h-[50px] rounded-lg border border-gray300 px-4 text-[16px] text-gray900";

const multilineClassName =
  "min-h-[100px] rounded-lg border border-gray300 px-4 py-3 text-[16px] text-gray900";

export default function DetailInfoFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { scrollBottomPadding } = useScreenInsets();
  const { productFormData, setProductFormData } = useRegistrationProduct(id);
  const { productEnum } = useProductRegistration();
  const { patch, saving } = usePatchProduct();

  const accident =
    productFormData?.accidentsHistory?.accident ??
    productFormData?.accident ??
    false;

  const [routePicker, setRoutePicker] = useState<
    "transportStartLocate" | "transportEndLocate" | null
  >(null);

  const routeOptions = useMemo<OptionItem[]>(
    () =>
      (productEnum?.garage ?? []).map((item) => ({
        code: String(item.code),
        desc: String(item.desc),
      })),
    [productEnum?.garage],
  );

  const tireOptions = useMemo<RadioOption[]>(
    () =>
      (productEnum?.tireStatus ?? []).map((item) => ({
        code: String(item.code),
        label: String(item.desc),
      })),
    [productEnum?.tireStatus],
  );

  const title =
    SALESTYPE[(productFormData?.type?.code as keyof typeof SALESTYPE) ?? "DIRECT"];

  const setAccident = (hasAccident: boolean) => {
    setProductFormData((prev) =>
      prev
        ? {
            ...prev,
            accident: hasAccident,
            accidentsHistory: {
              accident: hasAccident,
              accidentContents: hasAccident
                ? (prev.accidentsHistory?.accidentContents ??
                  prev.accidentContents ??
                  "")
                : "",
            },
            accidentContents: hasAccident ? (prev.accidentContents ?? "") : "",
          }
        : prev,
    );
  };

  const onNext = async () => {
    if (!productFormData?.id) return;
    const accidentContents =
      productFormData.accidentsHistory?.accidentContents ??
      productFormData.accidentContents ??
      "";
    if (accident && !accidentContents.trim()) {
      showAppAlert({ title: "입력 필요", message: "사고 상세내용을 입력해주세요." });
      return;
    }
    if (PHONE_REGEX.test(productFormData.detailContent ?? "")) {
      showAppAlert({
        title: "입력 제한",
        message: "개인 정보 보호를 위해 전화번호 입력은 제한되어 있습니다.",
      });
      return;
    }

    const maintenanceData = {
      maintenanceCategories:
        productFormData.maintenance?.maintenanceData?.map((item) => item.code) ?? [],
      etc: productFormData.maintenance?.etc ?? "",
    };

    const carOption = {
      normalOption: {
        etc: productFormData.carOption?.normalOption?.etc ?? "",
        option:
          productFormData.carOption?.normalOption?.option?.map((item) => item.code) ??
          [],
      },
      additionalOption: {
        etc: productFormData.carOption?.additionalOption?.etc ?? "",
        option:
          productFormData.carOption?.additionalOption?.option?.map(
            (item) => item.code,
          ) ?? [],
      },
      breakOption: {
        etc: productFormData.carOption?.breakOption?.etc ?? "",
        option:
          productFormData.carOption?.breakOption?.option?.map((item) => item.code) ??
          [],
      },
    };

    try {
      await patch({
        id: productFormData.id,
        accident,
        accidentContents,
        maintenanceData,
        transportGoods: productFormData.transportGoods,
        transportStartLocate: productFormData.transportStartLocate?.code,
        transportEndLocate: productFormData.transportEndLocate?.code,
        tireStatus: productFormData.tireStatus?.code,
        carOption,
        detailContent: productFormData.detailContent,
      });
      router.replace({
        pathname: "/products/sales/photo/[id]",
        params: { id: String(productFormData.id) },
      });
    } catch {
      showAppAlert({ title: "오류", message: "저장에 실패했습니다." });
    }
  };

  if (!productFormData) {
    return (
      <Screen variant="stack" className="flex-1 items-center justify-center bg-white">
        <Text className="text-[15px] text-gray700">불러오는 중...</Text>
      </Screen>
    );
  }

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <View className="flex-1">
        <SellCarRegistrationHeader title={title} />
        <ScrollView
          className="flex-1 px-4 pt-6"
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        >
        <View className="flex-row items-start justify-between pt-2">
          <Text className="flex-1 text-[24px] font-bold leading-[30px] text-gray800">
            상세 정보를 입력해주세요.
          </Text>
          <StepBadge text={`${getStepIndex("detail-info")}/9`} />
        </View>

        <View className="mt-8 gap-6">
          <PriceTrendRadioGroup
            label="사고유무"
            options={ACCIDENT_OPTIONS}
            value={String(accident)}
            onChange={(code) => setAccident(code === "true")}
          />

          <View>
            <Text className="mb-2 text-[14px] font-medium text-gray700">
              사고 상세내용
              {accident ? <Text className="text-red-500"> (필수)</Text> : null}
            </Text>
            <TextInput
              className={inputClassName}
              placeholder="상세내용 입력"
              editable={accident}
              value={
                productFormData.accidentsHistory?.accidentContents ??
                productFormData.accidentContents ??
                ""
              }
              onChangeText={(text) =>
                setProductFormData((prev) =>
                  prev
                    ? {
                        ...prev,
                        accidentContents: text,
                        accidentsHistory: { accident: true, accidentContents: text },
                      }
                    : prev,
                )
              }
            />
          </View>

          <View>
            <Text className="mb-1 text-[14px] font-medium text-gray700">
              차량 정비 이력
            </Text>
            <Text className="mb-3 text-[14px] text-gray600">
              ※ 최근 1년 이내로 정비한 항목을 선택해주세요.
            </Text>
            <CheckboxOptionGroup
              groupType="maintenance"
              options={productEnum?.maintenanceCategories ?? []}
              productFormData={productFormData}
              setProductFormData={setProductFormData}
            />
          </View>

          <View>
            <Text className="mb-2 text-[14px] font-medium text-gray700">
              운송물품 입력
            </Text>
            <TextInput
              className={inputClassName}
              placeholder="운송물품 입력"
              value={productFormData.transportGoods ?? ""}
              maxLength={30}
              onChangeText={(text) =>
                setProductFormData((prev) =>
                  prev ? { ...prev, transportGoods: text } : prev,
                )
              }
            />
          </View>

          <View>
            <Text className="mb-2 text-[14px] font-medium text-gray700">
              주요운행구간
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <SelectField
                  label=""
                  placeholder="상차지 선택"
                  value={productFormData.transportStartLocate?.desc}
                  onPress={() => {
                    Keyboard.dismiss();
                    setRoutePicker("transportStartLocate");
                  }}
                />
              </View>
              <Text className="text-[16px] text-gray600">~</Text>
              <View className="flex-1">
                <SelectField
                  label=""
                  placeholder="하차지 선택"
                  value={productFormData.transportEndLocate?.desc}
                  onPress={() => {
                    Keyboard.dismiss();
                    setRoutePicker("transportEndLocate");
                  }}
                />
              </View>
            </View>
          </View>

          <PriceTrendRadioGroup
            label="차량 타이어 상태"
            options={tireOptions}
            value={productFormData.tireStatus?.code ?? ""}
            onChange={(code) => {
              const item = productEnum?.tireStatus?.find((opt) => opt.code === code);
              if (!item) return;
              setProductFormData((prev) =>
                prev ? { ...prev, tireStatus: { code: item.code, desc: item.desc } } : prev,
              );
            }}
          />

          <View>
            <Text className="mb-3 text-[14px] font-medium text-gray700">차량 옵션</Text>
            <View className="gap-3">
              <CheckboxOptionGroup
                groupType="normalOption"
                sectionTitle="일반 옵션"
                options={productEnum?.normalOption ?? []}
                productFormData={productFormData}
                setProductFormData={setProductFormData}
              />
              <CheckboxOptionGroup
                groupType="additionalOption"
                sectionTitle="추가 옵션"
                options={productEnum?.additionalOption ?? []}
                productFormData={productFormData}
                setProductFormData={setProductFormData}
              />
              <CheckboxOptionGroup
                groupType="breakOption"
                sectionTitle="브레이크 옵션"
                options={productEnum?.breakOption ?? []}
                productFormData={productFormData}
                setProductFormData={setProductFormData}
              />
            </View>
          </View>

          <View>
            <Text className="mb-3 text-[14px] font-medium text-gray700">
              차량 상세설명
            </Text>
            <View className="mb-4 rounded-lg bg-[#F0F6FF] p-4">
              <Text className="text-[14px] leading-[20px] text-gray800">
                기타 옵션 및 수리내역 등 차량의 상세 정보를 남겨주세요. 예) 네고
                가능/네고 불가능 등
              </Text>
              <Text className="mt-2 text-[14px] text-red-500">
                * 개인 정보 보호를 위해 현재 전화번호 입력은 제한되어있습니다.
              </Text>
            </View>
            <TextInput
              className={multilineClassName}
              placeholder="상세설명 입력"
              multiline
              textAlignVertical="top"
              value={productFormData.detailContent ?? ""}
              onChangeText={(text) =>
                setProductFormData((prev) =>
                  prev ? { ...prev, detailContent: text } : prev,
                )
              }
            />
          </View>
        </View>
        </ScrollView>

        <DualFooterButtons
          onPressLeft={() =>
            router.replace({
              pathname: "/products/sales/price-trend/[id]",
              params: { id: String(id) },
            })
          }
          rightLabel="다음"
          onPressRight={onNext}
          loading={saving}
        />
      </View>

      {routePicker !== null ? (
        <OptionPickerSheet
          visible
          title={routePicker === "transportStartLocate" ? "상차지 선택" : "하차지 선택"}
          options={routeOptions}
          selectedCode={
            routePicker === "transportStartLocate"
              ? productFormData.transportStartLocate?.code
              : productFormData.transportEndLocate?.code
          }
          onClose={() => setRoutePicker(null)}
          onSelect={(item) => {
            if (!routePicker) return;
            setProductFormData((prev) =>
              prev
                ? {
                    ...prev,
                    [routePicker]: { code: item.code, desc: item.desc },
                  }
                : prev,
            );
            setRoutePicker(null);
          }}
        />
      ) : null}
    </Screen>
  );
}
