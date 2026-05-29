import React from "react";
import { Pressable, Text, View } from "react-native";

import type { RegistrationProduct } from "./types";

type OriginHistoryCountViewProps = {
  data: RegistrationProduct;
  onSelectTab: (tab: number) => void;
};

const HistoryBadge = ({
  count,
  label,
  onPress,
}: {
  count?: number | null;
  label: string;
  onPress: () => void;
}) => {
  const hasCount = typeof count === "number" && count > 0;
  return (
    <Pressable className="items-center" onPress={onPress}>
      <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-gray100">
        <Text
          className={`text-[18px] font-bold ${hasCount ? "text-primary" : "font-medium text-gray600"}`}
        >
          {hasCount ? `${count}건` : "없음"}
        </Text>
      </View>
      <Text className="text-[13px] text-gray700">{label}</Text>
    </Pressable>
  );
};

export const OriginHistoryCountView = React.memo(function OriginHistoryCountView({
  data,
  onSelectTab,
}: OriginHistoryCountViewProps) {
  return (
    <View className="border-t-8 border-gray100 px-4 py-6">
      <View className="flex-row justify-around">
        {data.seizureHistory !== undefined && data.seizureCount !== undefined ? (
          <HistoryBadge
            count={data.seizureCount}
            label="압류이력"
            onPress={() => onSelectTab(0)}
          />
        ) : null}
        {data.mortgageHistory !== undefined && data.mortgageCount !== undefined ? (
          <HistoryBadge
            count={data.mortgageCount}
            label="저당이력"
            onPress={() => onSelectTab(0)}
          />
        ) : null}
        <HistoryBadge
          count={data.tradingHistoryCount}
          label="소유자변경"
          onPress={() => onSelectTab(1)}
        />
        <HistoryBadge
          count={data.tuningHistoryCount}
          label="구조변경"
          onPress={() => onSelectTab(3)}
        />
      </View>
    </View>
  );
});

const TABS = ["압류·저당", "소유자변경", "검사이력", "구조변경"];

export const OriginInfoTabs = React.memo(function OriginInfoTabs({
  activeTab,
  onChange,
}: {
  activeTab: number;
  onChange: (tab: number) => void;
}) {
  return (
    <View className="flex-row border-b border-gray300">
      {TABS.map((title, index) => {
        const active = activeTab === index;
        return (
          <Pressable
            key={title}
            className="flex-1 items-center pb-3 pt-2"
            onPress={() => onChange(index)}
          >
            <Text
              className={`text-[13px] ${active ? "font-bold text-gray900" : "text-gray600"}`}
              numberOfLines={1}
            >
              {title}
            </Text>
            {active ? <View className="absolute bottom-0 h-[2px] w-full bg-gray900" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
});

export const OriginInfoTabContent = React.memo(function OriginInfoTabContent({
  activeTab,
  data,
}: {
  activeTab: number;
  data: RegistrationProduct;
}) {
  if (activeTab === 0) {
    return (
      <View className="py-4">
        <Text className="mx-4 mb-3 text-[18px] font-semibold text-gray800">압류 이력</Text>
        <View className="mx-4 rounded-lg bg-gray100 p-4">
          {data.seizureHistory && data.seizureHistory.length > 0 ? (
            data.seizureHistory.map((item, index) => (
              <View key={`seizure-${index}`} className={index > 0 ? "mt-5 border-t border-gray300 pt-5" : ""}>
                <Text className="text-[16px] font-semibold text-gray800">{item.regDate}</Text>
                <Text className="mt-2 text-[14px] text-gray800">・ 압류내역 : {item.content}</Text>
                <Text className="text-[14px] text-gray800">・ 촉탁기관 : {item.agency}</Text>
                {item.agencyPhoneNumber ? (
                  <Text className="text-[14px] text-gray800">・ 전화번호 : {item.agencyPhoneNumber}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text className="text-gray600">압류 이력 없음</Text>
          )}
        </View>
        <View className="my-8 h-2 bg-gray100" />
        <Text className="mx-4 mb-3 text-[18px] font-semibold text-gray800">저당 이력</Text>
        <View className="mx-4 rounded-lg bg-gray100 p-4">
          {data.mortgageHistory && data.mortgageHistory.length > 0 ? (
            data.mortgageHistory.map((item, index) => (
              <View key={`mortgage-${index}`} className={index > 0 ? "mt-5 border-t border-gray300 pt-5" : ""}>
                <Text className="text-[16px] font-semibold text-gray800">{item.occurDate}</Text>
                <Text className="mt-2 text-[14px] text-gray800">・ 기관 : {item.mortgageName}</Text>
                <Text className="text-[14px] text-gray800">・ 채무자 : (차주){item.debtorName}</Text>
                <Text className="text-[14px] text-gray800">・ 채권가액 : {item.amount}원</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray600">저당 이력 없음</Text>
          )}
        </View>
      </View>
    );
  }

  if (activeTab === 1) {
    return (
      <View className="px-4 py-4">
        <View className="rounded-lg bg-gray100 p-4">
          {data.tradingHistory && data.tradingHistory.length > 0 ? (
            data.tradingHistory.map((item, index) => (
              <View key={`trading-${index}`} className={index > 0 ? "mt-5 border-t border-gray300 pt-5" : ""}>
                <Text className="font-semibold text-gray800">{item.date}</Text>
                <Text className="mt-2 text-[14px] text-gray800">{item.content}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray600">거래 이력 없음</Text>
          )}
        </View>
      </View>
    );
  }

  if (activeTab === 2) {
    return (
      <View className="px-4 py-4">
        <View className="rounded-lg bg-gray100 p-4">
          {data.inspectionHistory && data.inspectionHistory.length > 0 ? (
            data.inspectionHistory.map((item, index) => (
              <View key={`inspection-${index}`} className={index > 0 ? "mt-5 border-t border-gray300 pt-5" : ""}>
                <Text className="font-semibold text-gray800">{item.date}</Text>
                <Text className="mt-2 text-[14px] text-gray800">{item.content}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray600">자동차 검사 이력 없음</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 py-4">
      <View className="rounded-lg bg-gray100 p-4">
        {data.tuningHistory && data.tuningHistory.length > 0 ? (
          data.tuningHistory.map((item, index) => (
            <View key={`tuning-${index}`} className={index > 0 ? "mt-5" : ""}>
              <Text className="font-semibold text-gray800">{item.date}</Text>
              <Text className="mt-2 text-[14px] text-gray800">・ 구조변경 : {item.before}</Text>
              <Text className="text-[14px] text-gray800">・ 구조변경 후 내역 : {item.after}</Text>
            </View>
          ))
        ) : (
          <Text className="text-gray600">변경 이력 없음</Text>
        )}
      </View>
    </View>
  );
});
