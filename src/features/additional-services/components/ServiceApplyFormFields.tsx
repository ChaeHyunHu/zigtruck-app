import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

import { appColors } from "@/src/constants/colors";

import { LabeledTextInput } from "./LabeledTextInput";

type ServiceApplyFormFieldsProps = {
  name: string;
  phoneNumber: string;
  nameError: boolean;
  nameErrorMessage: string;
  phoneError: boolean;
  phoneErrorMessage: string;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  vehicleLabel?: string;
  vehicleValue?: string;
  onPressVehicleSelect?: () => void;
  showVehicleSelector?: boolean;
};

export function ServiceApplyFormFields({
  name,
  phoneNumber,
  nameError,
  nameErrorMessage,
  phoneError,
  phoneErrorMessage,
  onChangeName,
  onChangePhone,
  vehicleLabel = "구매할 차량 선택하기",
  vehicleValue = "",
  onPressVehicleSelect,
  showVehicleSelector = false,
}: ServiceApplyFormFieldsProps) {
  return (
    <View className="gap-[30px] bg-white px-4 py-[30px]">
      <LabeledTextInput
        label="신청자명"
        placeholder="신청자명을 입력해주세요."
        value={name}
        onChangeText={onChangeName}
        error={nameError}
        errorMessage={nameErrorMessage}
      />
      <LabeledTextInput
        label="휴대폰 번호"
        placeholder="휴대폰 번호를 입력해주세요."
        value={phoneNumber}
        onChangeText={onChangePhone}
        error={phoneError}
        errorMessage={phoneErrorMessage}
        keyboardType="phone-pad"
      />
      {showVehicleSelector || vehicleValue ? (
        <LabeledTextInput
          label={vehicleLabel}
          placeholder="차량 선택"
          value={vehicleValue}
          readOnly
          onPress={onPressVehicleSelect}
          suffix={
            onPressVehicleSelect ? (
              <Ionicons name="chevron-forward" size={20} color={appColors.gray800} />
            ) : undefined
          }
        />
      ) : null}
    </View>
  );
}
