import React from "react";
import { Text, View } from "react-native";

import type { HistoryItem, ProductDetail } from "@/src/features/products/types";

type ProductHistorySectionsProps = {
  detail: ProductDetail;
};

function HistoryBox({
  children,
  emptyText,
  isEmpty,
}: {
  children?: React.ReactNode;
  emptyText: string;
  isEmpty?: boolean;
}) {
  return (
    <View className="rounded-[10px] bg-gray100 p-4">
      {isEmpty ? (
        <Text className="text-[15px] text-gray600">{emptyText}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function DateContentItem({
  date,
  content,
  showTopSpacing,
}: {
  date?: string;
  content?: React.ReactNode;
  showTopSpacing?: boolean;
}) {
  return (
    <View className={showTopSpacing ? "mt-5 border-t border-gray300 pt-5" : ""}>
      {date ? <Text className="text-[15px] font-bold text-gray900">{date}</Text> : null}
      {content ? <View className="mt-3">{content}</View> : null}
    </View>
  );
}

function SectionDivider() {
  return <View className="my-2 h-2 bg-gray100" />;
}

export function ProductHistorySections({ detail }: ProductHistorySectionsProps) {
  const lastOwner = detail.lastOwnerInfo;
  const seizureHistory = detail.seizureHistory;
  const mortgageHistory = detail.mortgageHistory;
  const tradingHistory = detail.tradingHistory;
  const inspectionHistory = detail.inspectionHistory;
  const tuningHistory = detail.tuningHistory;

  return (
    <View className="bg-white pb-6">
      <View className="px-4 pt-2 pb-6">
        <Text className="text-[18px] font-bold text-gray900">
          소유자 정보 (현물출자 이력)
        </Text>
        <View className="mt-3">
          <HistoryBox
            isEmpty={!lastOwner?.date && !lastOwner?.content}
            emptyText="소유자 정보 없음"
          >
            {lastOwner?.date ? (
              <Text className="text-[15px] font-bold text-gray900">{lastOwner.date}</Text>
            ) : null}
            {lastOwner?.content ? (
              <Text className={`text-[15px] text-gray800 ${lastOwner?.date ? "mt-1" : ""}`}>
                {lastOwner.content}
              </Text>
            ) : null}
          </HistoryBox>
        </View>
      </View>

      {seizureHistory ? (
        <>
          <SectionDivider />
          <View className="px-4 py-6">
            <Text className="text-[18px] font-bold text-gray900">압류 이력</Text>
            <View className="mt-3">
              <HistoryBox
                isEmpty={!seizureHistory.length}
                emptyText="압류 이력 없음"
              >
                {seizureHistory.map((item, index) => (
                  <SeizureItem key={`${item.regDate}-${index}`} item={item} index={index} />
                ))}
              </HistoryBox>
            </View>
          </View>
        </>
      ) : null}

      {mortgageHistory ? (
        <>
          <SectionDivider />
          <View className="px-4 py-6">
            <Text className="text-[18px] font-bold text-gray900">저당 이력</Text>
            <View className="mt-3">
              <HistoryBox
                isEmpty={!mortgageHistory.length}
                emptyText="저당 이력 없음"
              >
                {mortgageHistory.map((item, index) => (
                  <MortgageItem
                    key={`${item.occurDate}-${index}`}
                    item={item}
                    index={index}
                    isLast={index === mortgageHistory.length - 1}
                  />
                ))}
              </HistoryBox>
            </View>
          </View>
        </>
      ) : null}

      <SectionDivider />
      <HistoryListSection
        title="소유자 변경 이력"
        items={tradingHistory}
        emptyText="소유자 변경 이력 없음"
      />

      <SectionDivider />
      <HistoryListSection
        title="검사 이력"
        items={inspectionHistory}
        emptyText="검사 이력 없음"
      />

      <SectionDivider />
      <View className="px-4 py-6">
        <Text className="text-[18px] font-bold text-gray900">구조 변경 이력</Text>
        <View className="mt-3">
          <HistoryBox
            isEmpty={!tuningHistory?.length}
            emptyText="구조 변경 이력 없음"
          >
            {tuningHistory?.map((item, index) => (
              <TuningItem key={`${item.date}-${index}`} item={item} index={index} />
            ))}
          </HistoryBox>
        </View>
      </View>
    </View>
  );
}

function HistoryListSection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items?: HistoryItem[];
  emptyText: string;
}) {
  return (
    <View className="px-4 py-6">
      <Text className="text-[18px] font-bold text-gray900">{title}</Text>
      <View className="mt-3">
        <HistoryBox isEmpty={!items?.length} emptyText={emptyText}>
          {items?.map((item, index) => (
            <DateContentItem
              key={`${item.date}-${index}`}
              date={item.date}
              showTopSpacing={index > 0}
              content={
                item.content ? (
                  <Text className="text-[15px] text-gray800">{item.content}</Text>
                ) : null
              }
            />
          ))}
        </HistoryBox>
      </View>
    </View>
  );
}

function SeizureItem({ item, index }: { item: HistoryItem; index: number }) {
  return (
    <DateContentItem
      date={item.regDate}
      showTopSpacing={index > 0}
      content={
        <View className="gap-1">
          <Text className="text-[15px] text-gray800">・ 압류내역 : {item.content ?? "-"}</Text>
          <Text className="text-[15px] text-gray800">・ 촉탁기관 : {item.agency ?? "-"}</Text>
          {item.agencyPhoneNumber ? (
            <Text className="text-[15px] text-gray800">
              ・ 전화번호 : {item.agencyPhoneNumber}
            </Text>
          ) : null}
        </View>
      }
    />
  );
}

function MortgageItem({
  item,
  index,
  isLast,
}: {
  item: HistoryItem;
  index: number;
  isLast: boolean;
}) {
  return (
    <View>
      <DateContentItem
        date={item.occurDate}
        showTopSpacing={index > 0}
        content={
          <View className="gap-1">
            <Text className="text-[15px] text-gray800">・ 기관 : {item.mortgageName ?? "-"}</Text>
            <Text className="text-[15px] text-gray800">
              ・ 채무자 : (차주){item.debtorName ?? "-"}
            </Text>
            <Text className="text-[15px] text-gray800">・ 채권가액 : {item.amount ?? "-"}원</Text>
          </View>
        }
      />
      {isLast ? (
        <Text className="mt-4 text-[12px] leading-[16px] text-gray700">
          * 차량 대금 입금 전, ‘조회 당일 기준’ 남아있는 완납금을 확인하시고 차량 대금보다
          완납 금액이 높게 남아있을 경우 차액 금액은 판매자가 처리할 수 있어야 합니다.
        </Text>
      ) : null}
    </View>
  );
}

function TuningItem({ item, index }: { item: HistoryItem; index: number }) {
  return (
    <DateContentItem
      date={item.date}
      showTopSpacing={index > 0}
      content={
        <View className="gap-1">
          <Text className="text-[15px] text-gray800">・ 구조변경 : {item.before ?? "-"}</Text>
          <Text className="text-[15px] text-gray800">
            ・ 구조변경 후 내역 : {item.after ?? "-"}
          </Text>
        </View>
      }
    />
  );
}
