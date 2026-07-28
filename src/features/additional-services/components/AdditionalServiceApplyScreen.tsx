import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Text } from "react-native";

import { postOneStopService } from "@/src/api/public";
import { showAppAlert } from "@/src/providers/appDialog";
import {
  createCapitalCounselServices,
  createPurchaseAccompanyingServices,
  createTransferAgencyServices,
} from "@/src/api/AdditionalServices/createAdditionalServices";
import { useAuth } from "@/src/hooks/useAuth";
import { promptLogin } from "@/src/lib/authNavigation";

import type { AdditionalServiceType } from "../constants";
import { ConfirmApplyModal } from "./ConfirmApplyModal";
import { ServiceApplyFormFields } from "./ServiceApplyFormFields";
import { ServiceScreenLayout } from "./ServiceScreenLayout";
import { useMemberApplyFlag } from "../hooks/useMemberApplyFlag";
import { useServiceApplyForm } from "../hooks/useServiceApplyForm";
import { takePendingSelectedVehicle } from "../pendingSelectedVehicle";
import type { SelectedVehicleInfo } from "../types";

type AdditionalServiceApplyScreenProps = {
  serviceType: AdditionalServiceType;
  title: string;
  applyLabel: string;
  completedLabel: string;
  guide: React.ReactNode | ((ctx: { productPrice?: number }) => React.ReactNode);
  footerBgClassName?: string;
  showVehicleSelector?: boolean;
  vehicleLabel?: string;
  vehicleSelectPath?: string;
  disclaimer?: React.ReactNode;
  initialVehicle?: SelectedVehicleInfo;
  submitRequest: (payload: {
    name: string;
    phoneNumber: string;
    productId?: number;
    chatRoomId?: number;
  }) => Promise<unknown>;
  successMessage: string;
  confirmContent: (ctx: {
    truckName?: string;
    productId?: number;
  }) => { title?: string; body: string };
};

export function AdditionalServiceApplyScreen({
  serviceType,
  title,
  applyLabel,
  completedLabel,
  guide,
  footerBgClassName,
  showVehicleSelector,
  vehicleLabel,
  vehicleSelectPath,
  disclaimer,
  initialVehicle,
  submitRequest,
  successMessage,
  confirmContent,
}: AdditionalServiceApplyScreenProps) {
  const { isAuthenticated } = useAuth();
  const { isAlreadyApply, setIsAlreadyApply } = useMemberApplyFlag(serviceType);
  const form = useServiceApplyForm(initialVehicle);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const applyVehicle = form.applyVehicle;

  // 차량 선택 화면(router.back)에서 돌아왔을 때, 선택 결과를 현재 인스턴스에 반영한다.
  // 화면을 새로 push/replace 하지 않으므로 스크롤 위치가 그대로 유지된다.
  useFocusEffect(
    useCallback(() => {
      const pending = takePendingSelectedVehicle();
      if (pending) applyVehicle(pending);
    }, [applyVehicle]),
  );

  const onPressVehicleSelect = useCallback(() => {
    if (!vehicleSelectPath) return;
    router.push({
      pathname: vehicleSelectPath as "/purchase-accompanying-service/select",
      params: {
        chatRoomId: form.chatRoomId ? String(form.chatRoomId) : "",
      },
    });
  }, [form.chatRoomId, vehicleSelectPath]);

  const onPressApply = useCallback(() => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    if (!form.runValidation(form.name, form.phoneNumber)) return;
    setConfirmOpen(true);
  }, [form, isAuthenticated]);

  const onConfirmSubmit = useCallback(async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await submitRequest({
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        productId: form.productId,
        chatRoomId: form.chatRoomId,
      });
      setConfirmOpen(false);
      setIsAlreadyApply(true);
      showAppAlert({ title: "완료", message: successMessage });
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "요청 처리 중 오류가 발생했습니다.";
      showAppAlert({ title: "오류", message });
    } finally {
      setSubmitting(false);
    }
  }, [
    form.chatRoomId,
    form.name,
    form.phoneNumber,
    form.productId,
    setIsAlreadyApply,
    submitRequest,
    submitting,
    successMessage,
  ]);

  const confirm = useMemo(
    () => confirmContent({ truckName: form.truckName, productId: form.productId }),
    [confirmContent, form.productId, form.truckName],
  );

  return (
    <ServiceScreenLayout
      title={title}
      footerBgClassName={footerBgClassName}
      applyLabel={applyLabel}
      completedLabel={completedLabel}
      isAlreadyApply={isAlreadyApply}
      isSubmitDisabled={form.isSubmitDisabled || submitting}
      onPressApply={onPressApply}
    >
      {typeof guide === "function" ? guide({ productPrice: form.productPrice }) : guide}
      <ServiceApplyFormFields
        name={form.name}
        phoneNumber={form.phoneNumber}
        nameError={form.nameError}
        nameErrorMessage={form.nameErrorMessage}
        phoneError={form.phoneError}
        phoneErrorMessage={form.phoneErrorMessage}
        onChangeName={form.onChangeName}
        onChangePhone={form.onChangePhone}
        showVehicleSelector={showVehicleSelector}
        vehicleLabel={vehicleLabel}
        vehicleValue={form.truckName}
        onPressVehicleSelect={onPressVehicleSelect}
      />
      {disclaimer}
      <ConfirmApplyModal
        visible={confirmOpen}
        title={confirm.title}
        content={
          <Text className="text-center text-[15px] leading-[22px] text-gray800">
            {confirm.body.split("\n").join("\n")}
          </Text>
        }
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onConfirmSubmit}
      />
    </ServiceScreenLayout>
  );
}
