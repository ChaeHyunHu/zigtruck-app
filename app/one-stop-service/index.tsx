import React from "react";

import { postOneStopService } from "@/src/api/public";
import { AdditionalServiceApplyScreen } from "@/src/features/additional-services/components/AdditionalServiceApplyScreen";
import { OneStopGuideSection } from "@/src/features/additional-services/components/OneStopGuideSection";

export default function OneStopServiceScreen() {
  return (
    <AdditionalServiceApplyScreen
      serviceType="one-stop-service"
      title="위탁판매 서비스"
      applyLabel="서비스 신청하기"
      completedLabel="서비스 신청완료"
      guide={<OneStopGuideSection />}
      submitRequest={(payload) => postOneStopService(payload)}
      successMessage="위탁판매 서비스를 신청했어요."
      confirmContent={() => ({
        body: "위탁판매 서비스를\n신청하시겠어요?",
      })}
    />
  );
}
