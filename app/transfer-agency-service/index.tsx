import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

import { createTransferAgencyServices } from "@/src/api/AdditionalServices/createAdditionalServices";
import { AdditionalServiceApplyScreen } from "@/src/features/additional-services/components/AdditionalServiceApplyScreen";
import { TransferGuideView } from "@/src/features/additional-services/components/TransferGuideView";
import { parseVehicleParams } from "@/src/features/additional-services/parseVehicleParams";

export default function TransferAgencyServiceScreen() {
  const params = useLocalSearchParams();
  const initialVehicle = useMemo(() => parseVehicleParams(params), [params]);

  return (
    <AdditionalServiceApplyScreen
      serviceType="transfer-agency-service"
      title="서류 이전 대행 서비스"
      applyLabel="서비스 신청하기"
      completedLabel="서비스 신청완료"
      footerBgClassName="bg-gray200"
      guide={<TransferGuideView />}
      initialVehicle={initialVehicle}
      disclaimer={
        <View className="bg-gray200 px-4 pb-2 pt-6">
          <Text className="pb-5 text-[14px] font-medium leading-[20px] text-gray700">
            [안내] 명의 이전에 필요한 서류 및 절차는 법인명의 영업용번호판, 개인명의
            영업용번호판에 따라 상이하므로 서비스 신청 후 별도의 안내를 드리고 있습니다.
          </Text>
          <Text className="pb-5 text-[14px] font-medium leading-[20px] text-gray700">
            * 서류 이전 대행 서비스는 위탁판매 서비스 내에 포함된 서비스입니다. 직거래
            위탁판매 서비스 이용 시 이전 대행 서비스도 함께 제공되며 이전 대행 서비스
            단독 이용 시 위탁판매 서비스는 제공되지 않습니다.
          </Text>
        </View>
      }
      submitRequest={(payload) =>
        createTransferAgencyServices({
          name: payload.name,
          phoneNumber: payload.phoneNumber,
          ...(payload.chatRoomId ? { chatRoomId: payload.chatRoomId } : {}),
        })
      }
      successMessage="서류 이전 대행 서비스를 신청했어요."
      confirmContent={({ truckName, productId }) => ({
        title: productId ? truckName : undefined,
        body: productId
          ? "선택한 차량으로 서류 이전 대행\n서비스를 신청할까요?"
          : "서류 이전 대행 서비스를\n신청하시겠어요?",
      })}
    />
  );
}
