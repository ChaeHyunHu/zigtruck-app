import React, { useMemo } from "react";
import { Text, View } from "react-native";

import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";
import type { ProductEditOpenPickerParams } from "@/src/features/products/edit/productEditPickerTypes";
import { CheckboxOptionGroup } from "@/src/features/sell-car/registration/CheckboxOptionGroup";
import { SelectField } from "@/src/features/sell-car/registration/SelectField";
import { PriceTrendRadioGroup } from "@/src/features/price-trend/PriceTrendRadioGroup";
import type { ProductEnumData } from "@/src/features/sell-car/registration/types";
import type { RegistrationProduct } from "@/src/features/sell-car/registration/types";

const PHONE_REGEX = /01[016789]-?\d{3,4}-?\d{4}/;

type Props = {
  form: RegistrationProduct;
  productEnum: ProductEnumData | null;
  onChange: React.Dispatch<React.SetStateAction<RegistrationProduct>>;
  onOpenPicker: (params: ProductEditOpenPickerParams) => void;
};

type RoutePicker = "transportStartLocate" | "transportEndLocate";

export function ProductEditDetailTab({
  form,
  productEnum,
  onChange,
  onOpenPicker,
}: Props) {

  const accident =
    form.accidentsHistory?.accident ?? form.accident ?? false;

  const routeOptions = useMemo(
    () =>
      (productEnum?.garage ?? []).map((item) => ({
        code: String(item.code),
        desc: String(item.desc),
      })),
    [productEnum?.garage],
  );

  const openRoutePicker = (key: RoutePicker) => {
    onOpenPicker({
      title: key === "transportStartLocate" ? "상차지 선택" : "하차지 선택",
      options: routeOptions,
      selectedCode:
        key === "transportStartLocate"
          ? form.transportStartLocate?.code
          : form.transportEndLocate?.code,
      onSelect: (item) => {
        onChange((prev) => ({
          ...prev,
          [key]: { code: item.code, desc: item.desc },
        }));
      },
    });
  };

  const tireOptions = useMemo(
    () =>
      (productEnum?.tireStatus ?? []).map((item) => ({
        code: String(item.code),
        label: String(item.desc),
      })),
    [productEnum?.tireStatus],
  );

  const setAccident = (hasAccident: boolean) => {
    onChange((prev) => ({
      ...prev,
      accident: hasAccident,
      accidentsHistory: {
        accident: hasAccident,
        accidentContents: hasAccident
          ? prev.accidentsHistory?.accidentContents ??
            prev.accidentContents ??
            ""
          : "",
      },
      accidentContents: hasAccident ? prev.accidentContents ?? "" : "",
    }));
  };

  const setProductFormAdapter: React.Dispatch<
    React.SetStateAction<RegistrationProduct | null>
  > = (value) => {
    onChange((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      return next ?? prev;
    });
  };

  return (
    <View className="px-4 pt-4">
      <View className="gap-[30px]">
        <PriceTrendRadioGroup
          label="사고유무"
          options={[
            { code: "false", label: "없음" },
            { code: "true", label: "있음" },
          ]}
          value={String(accident)}
          onChange={(code) => setAccident(code === "true")}
          horizontal
        />

        <LabeledTextInput
          label="사고 상세내용"
          required={accident}
          placeholder="상세내용 입력"
          value={
            form.accidentsHistory?.accidentContents ??
            form.accidentContents ??
            ""
          }
          readOnly={!accident}
          onChangeText={(text) =>
            onChange((prev) => ({
              ...prev,
              accidentContents: text,
              accidentsHistory: { accident: true, accidentContents: text },
            }))
          }
        />

        <View>
          <Text className="mb-2 text-[14px] font-semibold text-gray800">
            차량 정비 이력
          </Text>
          <Text className="mb-3 text-[13px] text-gray600">
            ※ 최근 1년 이내로 정비한 항목을 선택해주세요.
          </Text>
          <CheckboxOptionGroup
            groupType="maintenance"
            options={productEnum?.maintenanceCategories ?? []}
            productFormData={form}
            setProductFormData={setProductFormAdapter}
          />
        </View>

        <LabeledTextInput
          label="운송물품"
          placeholder="운송물품 입력"
          value={form.transportGoods ?? ""}
          onChangeText={(text) =>
            onChange((prev) => ({ ...prev, transportGoods: text.slice(0, 30) }))
          }
        />

        <View>
          <Text className="mb-3 text-[15px] font-semibold text-gray800">
            주요운행구간
          </Text>
          <View className="flex-row items-center">
            <View className="flex-1">
              <SelectField
                label=""
                placeholder="상차지 선택"
                value={form.transportStartLocate?.desc}
                onPress={() => openRoutePicker("transportStartLocate")}
              />
            </View>
            <Text className="mx-2 text-[14px] text-gray600">~</Text>
            <View className="flex-1">
              <SelectField
                label=""
                placeholder="하차지 선택"
                value={form.transportEndLocate?.desc}
                onPress={() => openRoutePicker("transportEndLocate")}
              />
            </View>
          </View>
        </View>

        <PriceTrendRadioGroup
          label="차량 타이어 상태"
          options={tireOptions}
          value={form.tireStatus?.code ?? ""}
          onChange={(code) => {
            const item = productEnum?.tireStatus?.find((opt) => opt.code === code);
            if (!item) return;
            onChange((prev) => ({
              ...prev,
              tireStatus: { code: String(item.code), desc: String(item.desc) },
            }));
          }}
          horizontal
        />

        <View>
          <Text className="mb-3 text-[15px] font-semibold text-gray800">
            차량 옵션
          </Text>
          <View className="gap-4">
            <CheckboxOptionGroup
              groupType="normalOption"
              sectionTitle="일반 옵션"
              options={productEnum?.normalOption ?? []}
              productFormData={form}
              setProductFormData={setProductFormAdapter}
            />
            <CheckboxOptionGroup
              groupType="additionalOption"
              sectionTitle="추가 옵션"
              options={productEnum?.additionalOption ?? []}
              productFormData={form}
              setProductFormData={setProductFormAdapter}
            />
            <CheckboxOptionGroup
              groupType="breakOption"
              sectionTitle="브레이크 옵션"
              options={productEnum?.breakOption ?? []}
              productFormData={form}
              setProductFormData={setProductFormAdapter}
            />
          </View>
        </View>

        <View>
          <Text className="mb-3 text-[15px] font-semibold text-gray800">
            차량 상세설명
          </Text>
          <View className="mb-4 rounded-lg bg-[#F0F6FF] p-4">
            <Text className="text-[14px] leading-[20px] text-gray800">
              기타 옵션 및 수리내역 등 차량의 상세 정보를 남겨주세요. 예) 네고
              가능/네고 불가능 등
            </Text>
            <Text className="mt-2 text-[14px] text-danger">
              * 개인 정보 보호를 위해 현재 전화번호 입력은 제한되어있습니다.
            </Text>
          </View>
          <LabeledTextInput
            label=""
            placeholder="상세설명 입력"
            value={form.detailContent ?? ""}
            onChangeText={(text) => {
              if (PHONE_REGEX.test(text)) return;
              onChange((prev) => ({ ...prev, detailContent: text }));
            }}
          />
        </View>
      </View>
    </View>
  );
}
