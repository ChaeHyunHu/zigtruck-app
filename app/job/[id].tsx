import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { ScreenStickyFooter } from "@/src/components/common/ScreenStickyFooter";
import {
  JOB_INQUIRY_PHONE,
  JOB_STATUS_COMPLETED,
} from "@/src/features/job/constants";
import {
  formatJobSalary,
  formatJobTimeRange,
  formatJobTitle,
} from "@/src/features/job/jobUtils";
import type { Job } from "@/src/features/job/types";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

export default function JobDetailScreen() {
  const { listPaddingBottom } = useScreenInsets();
  const { data } = useLocalSearchParams<{ id?: string; data?: string }>();

  const job = useMemo<Job | null>(() => {
    if (!data) return null;
    try {
      return JSON.parse(data) as Job;
    } catch {
      return null;
    }
  }, [data]);

  const completed = job?.status?.code === JOB_STATUS_COMPLETED;

  const onCall = () => {
    const tel = JOB_INQUIRY_PHONE.replace(/-/g, "");
    Linking.openURL(`tel:${tel}`).catch(() =>
      Alert.alert("전화 문의", JOB_INQUIRY_PHONE),
    );
  };

  if (!job) {
    return (
      <Screen className="flex-1 bg-white">
        <RegistrationHeader title="일자리 구하기" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[15px] text-gray700">
            일자리 정보를 불러오지 못했습니다.
          </Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text className="text-[15px] font-semibold text-primary">돌아가기</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const detailParagraphs = (job.detailContents ?? "")
    .split("\n")
    .filter((line) => line.length > 0);

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="일자리 구하기" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: listPaddingBottom + 88 }}
      >
        <View className="border-b-8 border-gray100 px-4 pb-5 pt-2">
          <View className="mb-3 self-start rounded-lg bg-gray100 px-2.5 py-1">
            <Text
              className={`text-[13px] font-semibold ${
                completed ? "text-gray600" : "text-primary"
              }`}
            >
              {job.status?.desc ?? "-"}
            </Text>
          </View>
          <Text className="text-[18px] font-bold text-gray900">
            {formatJobTitle(job)}
          </Text>

          <View className="mt-4 gap-3 border-t border-gray200 pt-4">
            <DetailRow label="운송 품목" value={job.transportItem} />
            <DetailRow label="운송 구간" value={job.transportSection} />
            <DetailRow
              label="적재함 길이"
              value={
                job.loadedInnerLength != null
                  ? `${job.loadedInnerLength}m`
                  : "-"
              }
            />
            <DetailRow label="근무 요일" value={job.workingDays?.desc ?? "-"} />
            <DetailRow
              label="근무 시간"
              value={formatJobTimeRange(job.workingStartHour, job.workingEndHour)}
            />
            <DetailRow label="근무 기간" value={job.period?.desc?.trim() || "-"} />
            <DetailRow label="급여" value={formatJobSalary(job)} />
          </View>
        </View>

        <View className="px-4 py-5">
          {detailParagraphs.length > 0 ? (
            detailParagraphs.map((paragraph, index) => (
              <Text
                key={`p-${index}`}
                className="text-[15px] leading-[26px] text-gray800"
              >
                {paragraph}
              </Text>
            ))
          ) : (
            <Text className="text-[15px] text-gray600">-</Text>
          )}
        </View>
      </ScrollView>

      <ScreenStickyFooter className="px-4 pt-3">
        <Pressable
          onPress={onCall}
          disabled={completed}
          className={`h-[52px] items-center justify-center rounded-lg ${
            completed ? "bg-gray300" : "bg-primary"
          }`}
        >
          <Text
            className={`text-[16px] font-bold ${
              completed ? "text-gray600" : "text-white"
            }`}
          >
            전화 문의
          </Text>
        </Pressable>
      </ScreenStickyFooter>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row gap-2">
      <Text className="w-[74px] text-[14px] text-gray700">{label}</Text>
      <Text className="flex-1 text-[14px] text-gray900">{value}</Text>
    </View>
  );
}
