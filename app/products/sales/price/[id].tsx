import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { PRODUCT_STATUS_SALE, SALESTYPE } from "@/src/constants/products";
import { CarPriceTrendInfoView } from "@/src/features/price-trend/CarPriceTrendInfoView";
import {
  defaultProductSearchParams,
  mapOriginDataToSearchParams,
} from "@/src/features/price-trend/utils";
import type { RadioOption } from "@/src/features/price-trend/PriceTrendRadioGroup";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import {
  usePatchProduct,
  useRegistrationProduct,
} from "@/src/features/sell-car/registration/hooks";
import { LicenseSaleChoiceGroup } from "@/src/features/sell-car/registration/LicenseSaleChoiceGroup";
import { PriceInputField } from "@/src/features/sell-car/registration/PriceInputField";
import { getStepIndex } from "@/src/features/sell-car/registration/productUtils";
import { SellCarRegistrationHeader } from "@/src/features/sell-car/registration/SellCarRegistrationHeader";
import { SalesLicenseInfoSheet } from "@/src/features/sell-car/registration/SalesLicenseInfoSheet";
import { StepBadge } from "@/src/features/sell-car/registration/StepBadge";
import { syncProductLicense } from "@/src/features/sell-car/registration/syncProductLicense";
import { validatePrice } from "@/src/features/sell-car/registration/validation";
import { useAuth } from "@/src/hooks/useAuth";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";

const LICENSE_CHOICE_OPTIONS: RadioOption[] = [
  { code: "false", label: "아니요, 괜찮아요" },
  { code: "true", label: "네, 같이 판매할게요" },
];

export default function PriceFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { scrollBottomPadding } = useScreenInsets();
  const { memberId } = useAuth();
  const { productFormData, setProductFormData } = useRegistrationProduct(id);
  const { resetRegistration } = useProductRegistration();
  const { patch, saving } = usePatchProduct();
  const [priceError, setPriceError] = useState("");
  const [licenseSheetOpen, setLicenseSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const includeLicense = productFormData?.isSaleLicense ?? null;
  const licenseSaved = Boolean(
    productFormData?.license?.licenseType?.code &&
      productFormData?.license?.price,
  );

  const title =
    SALESTYPE[(productFormData?.type?.code as keyof typeof SALESTYPE) ?? "DIRECT"];

  const licenseChoiceValue = useMemo(() => {
    if (includeLicense === true) return "true";
    if (includeLicense === false) return "false";
    return "";
  }, [includeLicense]);

  const searchParams = useMemo(
    () =>
      productFormData
        ? mapOriginDataToSearchParams(productFormData)
        : defaultProductSearchParams(),
    [productFormData],
  );

  const priceValue = Number(productFormData?.price ?? 0);
  const priceValid = !validatePrice(String(priceValue));
  const canSubmit =
    priceValid &&
    includeLicense !== null &&
    (!includeLicense || licenseSaved);

  const onSubmit = async () => {
    const msg = validatePrice(String(priceValue));
    if (msg) {
      setPriceError(msg);
      return;
    }
    if (includeLicense === null) {
      Alert.alert("선택 필요", "번호판 판매 여부를 선택해주세요.");
      return;
    }
    if (includeLicense && !licenseSaved) {
      Alert.alert("입력 필요", "번호판 정보를 입력해주세요.");
      return;
    }
    if (!productFormData?.id) return;

    setSubmitting(true);
    try {
      await patch({
        id: productFormData.id,
        price: priceValue,
        isSaleLicense: includeLicense,
        status: PRODUCT_STATUS_SALE,
      });

      await syncProductLicense({
        productId: productFormData.id,
        isSaleLicense: includeLicense,
        product: productFormData,
        memberId,
      });

      resetRegistration();
      Alert.alert("등록 완료", "차량 판매 등록이 완료되었습니다.", [
        {
          text: "확인",
          onPress: () =>
            router.replace({
              pathname: "/product/[id]",
              params: { id: String(productFormData.id), mine: "true" },
            }),
        },
      ]);
    } catch (error) {
      if (error instanceof Error && error.message === "LICENSE_INFO_REQUIRED") {
        Alert.alert("입력 필요", "번호판 정보를 입력해주세요.");
        return;
      }
      Alert.alert("오류", "판매 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
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
      <SellCarRegistrationHeader title={title} />
      <ScrollView
        className="flex-1 px-4 pt-6"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        <View className="flex-row items-start justify-between pt-2">
          <Text className="flex-1 text-[24px] font-bold leading-[30px] text-gray800">
            판매 금액을{"\n"}입력해주세요.
          </Text>
          <StepBadge text={`${getStepIndex("price")}/9`} />
        </View>

        <View className="mt-8 gap-6">
          <View className="rounded-lg border border-gray300 p-[18px]">
            <Text className="mb-3 text-[14px] font-medium text-gray800">
              차량 판매 금액
            </Text>
            <PriceInputField
              value={
                typeof productFormData.price === "number"
                  ? productFormData.price
                  : undefined
              }
              error={priceError}
              onChangeValue={(next) => {
                setPriceError("");
                setProductFormData((prev) =>
                  prev ? { ...prev, price: next ?? null } : prev,
                );
              }}
            />
          </View>

          <View className="rounded-lg bg-gray100 p-[18px]">
            <View className="mb-2 flex-row items-center gap-2">
              <Text className="text-[15px] font-semibold text-gray800">
                혹시 번호판도 판매하시나요?
              </Text>
              {includeLicense && !licenseSaved ? (
                <View className="rounded bg-gray300 px-2 py-0.5">
                  <Text className="text-[12px] font-medium text-gray700">
                    입력전
                  </Text>
                </View>
              ) : null}
            </View>
            <Text className="mb-4 text-[14px] leading-[20px] text-gray600">
              간단한 번호판 정보를 알려주시면 차량 판매완료 시점에 번호판도
              판매하실 수 있도록 도와드릴게요.
            </Text>

            <LicenseSaleChoiceGroup
              options={LICENSE_CHOICE_OPTIONS}
              value={licenseChoiceValue}
              onChange={(code) => {
                const sellTogether = code === "true";
                setProductFormData((prev) =>
                  prev
                    ? {
                        ...prev,
                        isSaleLicense: sellTogether,
                        license: sellTogether ? prev.license : undefined,
                      }
                    : prev,
                );
                if (sellTogether) {
                  setLicenseSheetOpen(true);
                }
              }}
            />

            {includeLicense ? (
              <Pressable
                className="mt-4 items-center"
                onPress={() => setLicenseSheetOpen(true)}
              >
                <Text className="text-[15px] font-medium text-gray800 underline">
                  번호판 정보 입력하기
                </Text>
              </Pressable>
            ) : null}
          </View>

          <CarPriceTrendInfoView searchParams={searchParams} apiType="public" />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0">
        <DualFooterButtons
          onPressLeft={() =>
            router.replace({
              pathname: "/products/sales/photo/[id]",
              params: { id: String(id) },
            })
          }
          rightLabel="등록완료"
          onPressRight={onSubmit}
          rightDisabled={!canSubmit}
          loading={saving || submitting}
        />
      </View>

      <SalesLicenseInfoSheet
        visible={licenseSheetOpen}
        tons={productFormData.tons}
        initialLicense={productFormData.license}
        onClose={() => setLicenseSheetOpen(false)}
        onSave={(license) => {
          setProductFormData((prev) =>
            prev
              ? {
                  ...prev,
                  isSaleLicense: true,
                  license,
                }
              : prev,
          );
        }}
      />
    </Screen>
  );
}
