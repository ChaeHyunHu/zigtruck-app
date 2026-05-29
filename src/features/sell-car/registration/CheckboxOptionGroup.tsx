import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { appColors } from "@/src/constants/colors";

import type { EnumPresenter, RegistrationProduct } from "./types";

export type CheckboxGroupType =
  | "maintenance"
  | "normalOption"
  | "additionalOption"
  | "breakOption";

const PLACEHOLDER: Record<CheckboxGroupType, string> = {
  maintenance: "정비 이력 입력",
  normalOption: "옵션 입력",
  additionalOption: "옵션 입력",
  breakOption: "브레이크 입력",
};

type CheckboxOptionGroupProps = {
  groupType: CheckboxGroupType;
  sectionTitle?: string;
  options: EnumPresenter[];
  productFormData: RegistrationProduct;
  setProductFormData: React.Dispatch<React.SetStateAction<RegistrationProduct | null>>;
};

export const CheckboxOptionGroup = React.memo(function CheckboxOptionGroup({
  groupType,
  sectionTitle,
  options,
  productFormData,
  setProductFormData,
}: CheckboxOptionGroupProps) {
  const selectedCodes = useCallback(() => {
    if (groupType === "maintenance") {
      return (productFormData.maintenance?.maintenanceData ?? []).map((item) => String(item.code));
    }
    return (productFormData.carOption?.[groupType]?.option ?? []).map((item) => String(item.code));
  }, [groupType, productFormData]);

  const etcValue =
    groupType === "maintenance"
      ? productFormData.maintenance?.etc ?? ""
      : productFormData.carOption?.[groupType]?.etc ?? "";

  const toggle = (item: EnumPresenter) => {
    const code = String(item.code);
    const current = selectedCodes();
    const next = current.includes(code)
      ? current.filter((value) => value !== code)
      : [...current, code];
    const nextItems = options.filter((opt) => next.includes(String(opt.code)));

    setProductFormData((prev) => {
      if (!prev) return prev;
      if (groupType === "maintenance") {
        return {
          ...prev,
          maintenance: {
            ...prev.maintenance,
            etc: prev.maintenance?.etc ?? "",
            maintenanceData: nextItems,
          },
        };
      }
      return {
        ...prev,
        carOption: {
          ...prev.carOption,
          [groupType]: {
            etc: prev.carOption?.[groupType]?.etc ?? "",
            option: nextItems,
          },
        },
      };
    });
  };

  const onChangeEtc = (text: string) => {
    setProductFormData((prev) => {
      if (!prev) return prev;
      if (groupType === "maintenance") {
        return {
          ...prev,
          maintenance: {
            maintenanceData: prev.maintenance?.maintenanceData ?? [],
            etc: text,
          },
        };
      }
      return {
        ...prev,
        carOption: {
          ...prev.carOption,
          [groupType]: {
            option: prev.carOption?.[groupType]?.option ?? [],
            etc: text,
          },
        },
      };
    });
  };

  const codes = selectedCodes();

  return (
    <View className="rounded-lg bg-gray100 p-4">
      {sectionTitle ? (
        <Text className="mb-3 text-[15px] font-bold text-gray800">{sectionTitle}</Text>
      ) : null}
      <View className="flex-row flex-wrap">
        {options.map((item) => {
          const checked = codes.includes(String(item.code));
          return (
            <Pressable
              key={item.code}
              className="mb-3 w-1/2 flex-row items-center pr-2"
              onPress={() => toggle(item)}
            >
              <Ionicons
                name={checked ? "checkmark-circle" : "checkmark-circle-outline"}
                size={20}
                color={checked ? appColors.primary : appColors.gray400}
              />
              <Text className="ml-1.5 flex-1 text-[14px] text-gray800" numberOfLines={2}>
                {item.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mt-2 flex-row items-center border-t border-gray300 pt-3">
        <Text className="mr-3 text-[14px] text-gray700">직접입력</Text>
        <TextInput
          className="flex-1 rounded-lg border border-gray300 bg-white px-3 py-2 text-[14px]"
          placeholder={PLACEHOLDER[groupType]}
          value={etcValue}
          onChangeText={onChangeEtc}
        />
      </View>
    </View>
  );
});
