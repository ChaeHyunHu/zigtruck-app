import React from "react";
import { Pressable, Text, View } from "react-native";

import { JOB_STATUS_COMPLETED } from "@/src/features/job/constants";
import {
  formatJobSalary,
  formatJobTimeRange,
  formatJobTitle,
} from "@/src/features/job/jobUtils";
import type { Job } from "@/src/features/job/types";

type Props = {
  item: Job;
  onPress: () => void;
};

export function JobListCard({ item, onPress }: Props) {
  const completed = item.status?.code === JOB_STATUS_COMPLETED;

  return (
    <View className="rounded-xl border border-gray300 bg-white p-4">
      <View className="mb-3 self-start rounded-lg bg-gray100 px-2.5 py-1">
        <Text
          className={`text-[13px] font-semibold ${
            completed ? "text-gray600" : "text-primary"
          }`}
        >
          {item.status?.desc ?? "-"}
        </Text>
      </View>
      <Text className="text-[17px] font-bold text-gray900">
        {formatJobTitle(item)}
      </Text>

      <View className="mt-3 gap-2.5">
        <InfoRow label="운송 품목" value={item.transportItem} />
        <InfoRow label="운송 구간" value={item.transportSection} />
        <InfoRow label="근무 요일" value={item.workingDays?.desc ?? "-"} />
        <InfoRow
          label="근무 시간"
          value={formatJobTimeRange(item.workingStartHour, item.workingEndHour)}
        />
        <InfoRow label="급여" value={formatJobSalary(item)} />
      </View>

      <Pressable
        onPress={onPress}
        disabled={completed}
        className={`mt-4 h-11 items-center justify-center rounded-lg border ${
          completed
            ? "border-gray300 bg-gray200"
            : "border-primary bg-[#E7EFFF]"
        }`}
      >
        <Text
          className={`text-[15px] font-semibold ${
            completed ? "text-gray600" : "text-primary"
          }`}
        >
          {completed ? "모집 완료" : "상세내용 보기"}
        </Text>
      </Pressable>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row">
      <Text className="w-[72px] text-[14px] text-gray700">{label}</Text>
      <Text className="flex-1 text-[14px] text-gray900">{value || "-"}</Text>
    </View>
  );
}
