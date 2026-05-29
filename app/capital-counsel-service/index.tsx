import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";

import { createCapitalCounselServices } from "@/src/api/AdditionalServices/createAdditionalServices";
import { AdditionalServiceApplyScreen } from "@/src/features/additional-services/components/AdditionalServiceApplyScreen";
import { CapitalGuideView } from "@/src/features/additional-services/components/CapitalGuideView";
import { parseVehicleParams } from "@/src/features/additional-services/parseVehicleParams";

export default function CapitalCounselServiceScreen() {
  const params = useLocalSearchParams();
  const initialVehicle = useMemo(() => parseVehicleParams(params), [params]);
  const guidePrice = initialVehicle?.productPrice ?? 5000;

  return (
    <AdditionalServiceApplyScreen
      serviceType="capital-counsel-service"
      title="화물차 대출 상담 서비스"
      applyLabel="한도 조회 신청하기"
      completedLabel="한도 조회 신청완료"
      guide={<CapitalGuideView price={guidePrice} />}
      initialVehicle={initialVehicle}
      submitRequest={(payload) =>
        createCapitalCounselServices({
          name: payload.name,
          phoneNumber: payload.phoneNumber,
          ...(payload.productId ? { productId: payload.productId } : {}),
        })
      }
      successMessage="화물차 대출 상담 서비스를 신청했어요."
      confirmContent={({ truckName, productId }) => ({
        title: productId ? truckName : undefined,
        body: productId
          ? "선택한 차량으로 화물차 대출 상담\n서비스를 신청할까요?"
          : "화물차 대출 상담 서비스를\n신청하시겠어요?",
      })}
    />
  );
}
