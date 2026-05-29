import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import type { OwnerErrorInfo, OwnerInfo } from "./types";

const PLATE_ALLOWED = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]*$/;

type LicensePlateInputProps = {
  ownerInfo: OwnerInfo;
  setOwnerInfo: React.Dispatch<React.SetStateAction<OwnerInfo>>;
  errorInfo?: OwnerErrorInfo;
  setErrorInfo: React.Dispatch<React.SetStateAction<OwnerErrorInfo | undefined>>;
  onLookup: () => void;
};

export const LicensePlateInput = React.memo(function LicensePlateInput({
  ownerInfo,
  setOwnerInfo,
  errorInfo,
  setErrorInfo,
  onLookup,
}: LicensePlateInputProps) {
  const onChange = (value: string) => {
    setErrorInfo({
      licenseNumberError: false,
      licenseNumberErrorMessage: "",
      ownerNameError: false,
      ownerNameErrorMessage: "",
    });
    if (PLATE_ALLOWED.test(value)) {
      setOwnerInfo((prev) => ({ ...prev, licenseNumber: value }));
    }
  };

  const handleLookup = () => {
    if (!ownerInfo.licenseNumber.trim()) {
      setErrorInfo({
        ownerNameError: false,
        ownerNameErrorMessage: "",
        licenseNumberError: true,
        licenseNumberErrorMessage: "차량 번호를 입력해주세요.",
      });
      return;
    }
    onLookup();
  };

  return (
    <View>
      <View
        className="rounded-lg p-1"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <View
          className="flex-row items-center rounded-lg border-2 border-gray800 px-3 py-3"
          style={{ backgroundColor: "#F5D300" }}
        >
          <TextInput
            className="min-w-0 flex-1 py-0 text-[28px] font-semibold text-gray900"
            style={{ includeFontPadding: false }}
            value={ownerInfo.licenseNumber}
            onChangeText={onChange}
            placeholder="경기24아6249"
            placeholderTextColor="#B89600"
            maxLength={9}
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={handleLookup}
          />
          <Pressable
            onPress={handleLookup}
            className="ml-2 items-center justify-center rounded-lg bg-white"
            style={{
              width: 60,
              height: 46,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Text className="text-[16px] font-bold text-gray800">조회</Text>
          </Pressable>
        </View>
      </View>
      {errorInfo?.licenseNumberError ? (
        <Text className="mt-2 text-[13px] text-red-500">
          {errorInfo.licenseNumberErrorMessage}
        </Text>
      ) : null}
    </View>
  );
});
