import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { LoginRequiredView } from "@/src/components/auth/LoginRequiredView";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { fetchCarRegister } from "@/src/api/products/carRegister";
import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { Screen } from "@/src/components/common/Screen";
import {
  PRODUCT_STATUS_BEFORE_SALE,
  PRODUCT_STATUS_SALE,
  PRODUCT_TYPE_DIRECT,
  SALESTYPE,
} from "@/src/constants/products";
import { LicensePlateInput } from "@/src/features/sell-car/registration/LicensePlateInput";
import { CarRegisterLoadingOverlay } from "@/src/features/sell-car/registration/CarRegisterLoadingOverlay";
import { OneStopServiceBanner } from "@/src/features/sell-car/registration/OneStopServiceBanner";
import {
  getPageName,
  normalizeCarRegisterResponse,
} from "@/src/features/sell-car/registration/productUtils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useRegistrationExitGuard } from "@/src/features/sell-car/registration/RegistrationExitGuard";
import type { OwnerErrorInfo, OwnerInfo } from "@/src/features/sell-car/registration/types";
import { useAuth } from "@/src/hooks/useAuth";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";

type SalesTypeKey = keyof typeof SALESTYPE;

export default function ProductSalesEntryScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const { isAuthenticated } = useAuth();
  const { setProductFormData, setSalesType, resetRegistration } = useProductRegistration();

  const salesType = (type === "DIRECT" || type === "SPEED" ? type : PRODUCT_TYPE_DIRECT) as SalesTypeKey;

  const [pageNum, setPageNum] = useState(1);
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo>({ licenseNumber: "", name: "" });
  const [errorInfo, setErrorInfo] = useState<OwnerErrorInfo>();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    rightLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const { requestExit } = useRegistrationExitGuard();

  useEffect(() => {
    resetRegistration();
    setSalesType(salesType);
  }, [resetRegistration, salesType, setSalesType]);

  const goPrev = useCallback(() => {
    if (pageNum === 1) {
      requestExit();
      return;
    }
    setPageNum((p) => p - 1);
  }, [pageNum, requestExit]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      goPrev();
      return true;
    });
    return () => subscription.remove();
  }, [goPrev]);

  const navigateToInfo = useCallback(
    (id: number) => {
      router.push({
        pathname: "/products/sales/info/[id]",
        params: { id: String(id), type: salesType },
      });
    },
    [salesType],
  );

  const onLookupSuccess = useCallback(
    (responseData: ReturnType<typeof normalizeCarRegisterResponse>) => {
      const data = normalizeCarRegisterResponse(responseData);
      setProductFormData(data);

      if (data.status?.code === "ORIGIN_DATA_REGISTER" || data.status?.code === "COMPLETED") {
        setConfirmConfig({
          title: data.year
            ? `${data.truckName} ${data.year}연식이 맞으신가요?`
            : `${data.truckName} 차량이 맞으신가요?`,
          message: data.isDuplicateProduct
            ? "동일 차량이 이미 등록되어 있을 수 있습니다. 계속 진행하시겠어요?"
            : "차량 정보가 맞는지 확인해주세요.",
          rightLabel: "네, 맞습니다",
          onConfirm: () => navigateToInfo(data.id),
        });
        setConfirmOpen(true);
        return;
      }

      if (data.status?.code === PRODUCT_STATUS_BEFORE_SALE) {
        setConfirmConfig({
          title: data.year
            ? `${data.truckName} ${data.year}연식`
            : `${data.truckName ?? "등록 중인 차량"}`,
          message: "이전에 등록한 정보가 있습니다.\n이어서 수정하시겠어요?",
          rightLabel: "수정",
          onConfirm: () => {
            const step = getPageName(data);
            router.push({
              pathname: `/products/sales/${step}/[id]` as "/products/sales/model/[id]",
              params: { id: String(data.id) },
            });
          },
        });
        setConfirmOpen(true);
        return;
      }

      if (data.status?.code === PRODUCT_STATUS_SALE) {
        setConfirmConfig({
          title: data.truckName ?? "판매중 차량",
          message: "이미 판매중인 차량입니다.",
          rightLabel: "내차관리로",
          onConfirm: () => router.push("/(tabs)/manage"),
        });
        setConfirmOpen(true);
        return;
      }

      navigateToInfo(data.id);
    },
    [navigateToInfo, setProductFormData],
  );

  const onClickGetData = useCallback(async () => {
    if (loading) return;
    if (!ownerInfo.name.trim()) {
      setErrorInfo({
        ownerNameError: true,
        ownerNameErrorMessage: "소유자 정보가 맞지 않습니다. 다시 입력해주세요.",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await fetchCarRegister(ownerInfo.licenseNumber, ownerInfo.name);
      onLookupSuccess(data);
    } catch (error: any) {
      const code = error?.code;
      const message = error?.message ?? "조회에 실패했습니다.";

      if (code === "NOT_EXIST_CAR_NUMBER" || code === "MISSING_CAR_NUMBER") {
        setErrorInfo({
          licenseNumberError: true,
          licenseNumberErrorMessage: message,
          ownerNameError: false,
        });
        setPageNum(1);
        Alert.alert("조회 실패", message);
      } else if (
        [
          "NOT_MATCH_OWNER_NAME",
          "MISSING_OWNER_NAME",
          "PRODUCTS_CAN_SALES_MAX_THREE",
          "NOT_MATCH_CAR_INFORMATION",
        ].includes(code)
      ) {
        setErrorInfo({
          ownerNameError: true,
          ownerNameErrorMessage: message,
        });
      } else if (code === "DATA_HUB_CAR_INFO_FOUND_FAIL") {
        setPageNum(3);
      } else {
        Alert.alert("조회 실패", message);
        setPageNum(1);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, onLookupSuccess, ownerInfo.licenseNumber, ownerInfo.name]);

  if (!isAuthenticated) {
    return (
      <Screen variant="stack" className="flex-1 bg-white">
        <RegistrationHeader title={SALESTYPE[salesType]} onBack={goPrev} />
        <LoginRequiredView message="차량 등록은 로그인 후 이용할 수 있습니다." />
      </Screen>
    );
  }

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title={SALESTYPE[salesType]} onBack={goPrev} />

      {pageNum === 1 ? (
        <KeyboardAwareScrollView className="flex-1 px-4 pt-6">
          <Text className="mb-6 text-[24px] font-bold leading-[30px] text-gray800">
            차량 정보 조회를 위해{"\n"}차량 번호를 입력해주세요
          </Text>
          <LicensePlateInput
            ownerInfo={ownerInfo}
            setOwnerInfo={setOwnerInfo}
            errorInfo={errorInfo}
            setErrorInfo={setErrorInfo}
            onLookup={() => setPageNum(2)}
          />
          {salesType === PRODUCT_TYPE_DIRECT ? <OneStopServiceBanner /> : null}
        </KeyboardAwareScrollView>
      ) : null}

      {pageNum === 2 ? (
        <View className="flex-1">
          <KeyboardAwareScrollView
            className="flex-1 px-4 pt-6"
            scrollEnabled={!loading}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-[24px] font-bold text-gray800">소유자명을 입력해주세요</Text>
            <Text className="mt-3 text-[15px] leading-[19px] text-gray700">
              차량번호와 소유자명을 입력하면{"\n"}소유한 차량의 기본 정보를 확인할 수 있어요.
            </Text>
            <View className="my-[24px] items-center px-[30px]">
              <Image
                source={{
                  uri: "https://zigtruck-service-public-image.s3.ap-northeast-2.amazonaws.com/vehicle_registration_certificate.png",
                }}
                className="h-[180px] w-full"
                contentFit="contain"
              />
            </View>
            <View className="mb-[24px] rounded-lg bg-[#F0F6FF] p-4">
              <Text className="text-[14px] text-gray800">
                * 소유자명은 자동차 등록증에서 확인이 가능합니다.
              </Text>
              <Text className="mt-1 text-[14px] text-red-500">
                * 법인차량은 "(주)", "주식회사" 단어까지 정확히 입력해주세요.
              </Text>
            </View>
            <View className="flex-row items-stretch gap-2">
              <TextInput
                className="h-[52px] flex-1 rounded-lg border border-gray300 px-4 text-[18px] text-gray900"
                placeholder="예) 주식회사 OOO, 홍길동"
                value={ownerInfo.name}
                editable={!loading}
                onChangeText={(value) => {
                  setErrorInfo(undefined);
                  setOwnerInfo((prev) => ({ ...prev, name: value }));
                }}
                returnKeyType="done"
                onSubmitEditing={() => onClickGetData()}
              />
              <Pressable
                onPress={onClickGetData}
                disabled={loading}
                className="h-[52px] items-center justify-center rounded-lg bg-primary px-6"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <Text className="text-[16px] font-bold text-white">조회</Text>
              </Pressable>
            </View>
            {errorInfo?.ownerNameError ? (
              <Text className="mt-2 text-[13px] text-red-500">
                {errorInfo.ownerNameErrorMessage}
              </Text>
            ) : null}
          </KeyboardAwareScrollView>
          {loading ? <CarRegisterLoadingOverlay /> : null}
        </View>
      ) : null}

      {pageNum === 3 ? (
        <View className="flex-1 items-center justify-center px-6 pt-6">
          <IoniconsPlaceholder />
          <Text className="mt-6 text-center text-[20px] font-bold text-gray800">
            차량의 등록원부 조회 중{"\n"}오류가 발생했습니다
          </Text>
          <Text className="mt-3 text-center text-[14px] text-gray700">
            서비스 정상화 후 자동으로{"\n"}차량 정보가 등록됩니다
          </Text>
        </View>
      ) : null}

      <Modal visible={confirmOpen} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-2xl bg-white p-5">
            <Text className="text-[18px] font-bold text-gray900">{confirmConfig?.title}</Text>
            <Text className="mt-3 text-[15px] leading-[22px] text-gray700">
              {confirmConfig?.message}
            </Text>
            <View className="mt-5 flex-row gap-2">
              <Pressable
                className="h-11 flex-1 items-center justify-center rounded-lg border border-gray300"
                onPress={() => setConfirmOpen(false)}
              >
                <Text className="font-semibold text-gray800">취소</Text>
              </Pressable>
              <Pressable
                className="h-11 flex-1 items-center justify-center rounded-lg bg-primary"
                onPress={() => {
                  setConfirmOpen(false);
                  confirmConfig?.onConfirm();
                }}
              >
                <Text className="font-bold text-white">{confirmConfig?.rightLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function IoniconsPlaceholder() {
  return (
    <View className="h-36 w-36 items-center justify-center rounded-full bg-gray200">
      <Text className="text-5xl text-gray500">!</Text>
    </View>
  );
}
