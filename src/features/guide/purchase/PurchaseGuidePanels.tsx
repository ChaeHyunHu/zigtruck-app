import React from "react";

import {
  GuideAccent,
  GuideCoverImage,
  GuideEmphasis,
  GuideHeading,
  GuideContractSampleImage,
  GuideInlineImage,
  GuideLink,
  GuideOrderedBlock,
  GuideParagraph,
  GuideSection,
  guideImages,
} from "@/src/features/guide/components/GuidePrimitives";

export function PurchaseOnlinePanel() {
  return (
    <>
      <GuideCoverImage uri={guideImages.onlineCover} alt="온라인 차량 확인 커버" />
      <GuideSection>
        <GuideHeading>허위 매물인지 확인하세요</GuideHeading>
        <GuideParagraph>
          허위 매물이란 구매자를 유인할 목적으로 실제로는 존재하지 않는
          매물이거나 판매의사 없이 터무니없이 낮은 가격에 매물을 게시하는 것을
          의미해요.
        </GuideParagraph>
        <GuideParagraph>
          허위 매물 구매 방지를 하려면 구매하려는 차량에 대해서 차량등록증 및
          등록원부를 꼼꼼히 확인하시고 판매자가 실제 차주 인지 확인해야 해요.
        </GuideParagraph>
      </GuideSection>
      <GuideSection>
        <GuideHeading>온라인에서 확인해야 하는 정보</GuideHeading>
        <GuideParagraph>
          온라인으로 차량을 확인할 때, 아래와 같은 항목이 입력되어 있는지 꼭
          확인하고 구매해야 해요.
        </GuideParagraph>
        <GuideOrderedBlock
          items={[
            { title: "1. 자동차의 압류 및 저당에 관한 정보" },
            {
              title:
                "2. 판매자가 자동차 매매업자의 경우, 상호, 주소 및 전화번호에 관한 사항",
            },
            { title: "3. 자동차 등록번호, 주요 제원 및 옵션에 관한 사항" },
          ]}
        />
      </GuideSection>
      <GuideSection>
        <GuideHeading>실제 적재함 길이를 확인하세요</GuideHeading>
        <GuideParagraph>
          영업용 화물차는 화물 운송 목적을 가진 차량이기 때문에 특장의 종류와
          특장의 길이가 가장 중요합니다.
        </GuideParagraph>
        <GuideParagraph>
          중고 화물차 거래를 진행할 땐, 적재함의 정확한 길이를 체크하고
          특이사항이 없는지 확인해야 해요.
        </GuideParagraph>
        <GuideParagraph>
          적재함 종류 및 크기를 임의로 변경한 이력이 있거나 구조변경된 사이즈와
          실제 사이즈가 다르면 자동차 검사 시 문제가 생길 수 있어요.
        </GuideParagraph>
        <GuideParagraph>
          이러한 사항을 명확히 확인하고 문제시 구조 변경에 대한 협의나 거래자
          간 거래 취소를 고려해야 합니다.
        </GuideParagraph>
        <GuideParagraph>
          적재함 사이즈의 정확한 정보는 아래 URL로 접속하여 확인할 수 있습니다.
        </GuideParagraph>
        <GuideParagraph>
          한국교통안전공단 사이버검사소 [튜닝고객지원]{"\n"}
          <GuideLink href="https://www.cyberts.kr/ts/tcs/csm/readTsTcsCstmrSportMainView.do">
            https://www.cyberts.kr/ts/tcs/csm/readTsTcsCstmrSportMainView.do
          </GuideLink>
        </GuideParagraph>
        <GuideInlineImage uri={guideImages.online1} />
        <GuideParagraph>
          <GuideAccent>① 하중계산</GuideAccent>을 클릭한 후{" "}
          <GuideAccent>② 차량 번호</GuideAccent>를 입력하세요.
        </GuideParagraph>
        <GuideInlineImage uri={guideImages.online2} />
        <GuideParagraph>
          결과값이 표시되면 <GuideAccent>③ 전체 길이와 하대 길이</GuideAccent>를
          확인하세요.
        </GuideParagraph>
        <GuideParagraph>꼭! 차량 확인 시 실제 길이와 일치하는지 확인하세요.</GuideParagraph>
      </GuideSection>
      <GuideSection bordered={false}>
        <GuideHeading>실 차주를 확인하세요</GuideHeading>
        <GuideParagraph>
          영업용 화물차는 업체(운수사)로 부터 번호판을 임대 받아 사용하는 경우가
          많아요.{"\n"}
          이러한 경우 등록증 상의 소유자가 운수사(법인)으로 되어있기 때문에
          중고화물차 거래시 꼭 실제 차주를 확인해야 합니다.
        </GuideParagraph>
        <GuideParagraph>
          자동차 등록 원부 검토 시 <GuideEmphasis>[현물출자]</GuideEmphasis>란에{" "}
          <GuideEmphasis>[홍길동이 현물출자한 차량임]</GuideEmphasis>이라는
          내용과 현재 차량 소유자가 누구인지 확인이 가능해요.
        </GuideParagraph>
        <GuideParagraph>
          금전 거래 시 이와 같은 내용을 꼭 확인하시고 진행하시는 걸
          추천드려요.
        </GuideParagraph>
        <GuideParagraph>
          * 이 부분은 직트럭 어플에서 차량 확인 시{" "}
          <GuideEmphasis>
            [내차판매] {">"} [차량조회] {">"}[실소유자 정보]
          </GuideEmphasis>{" "}
          사항에서 쉽게 확인이 가능합니다.
        </GuideParagraph>
        <GuideInlineImage uri={guideImages.online3} />
      </GuideSection>
    </>
  );
}

export function PurchaseOfflinePanel() {
  return (
    <>
      <GuideCoverImage uri={guideImages.offlineCover} alt="오프라인 차량 확인 커버" />
      <GuideSection>
        <GuideHeading>실차 확인하는 방법</GuideHeading>
        <GuideParagraph>
          차량을 확인할 때는 가급적 밝은날에 하시는게 좋고 공단의 공영 주차장이나
          넓은 공터 등 차량을 세워 놓고 여유롭게 둘러볼 수 있는 곳이 좋습니다.
        </GuideParagraph>
        <GuideParagraph>
          차량을 확인할땐 사고나 침수가 있었는지 꼼꼼하게 확인하셔야 하고,
          만약 수리할 부분이 있다면 판매자와 수리 비용에 관한 협의가 필요할 수
          있습니다.{"\n"}그 외 체크해야 할 항목은 엔진룸, 차량 실내, 타이어
          상태, 가변축 작동 여부 등이 있어요. 특장(윙바디,탑차 등)의 기능적인
          부분, 작동 상태도 문제가 없는지 확인해야 합니다. 또한 차량의 특장
          사이즈 측정을 위해 줄자처럼 길이를 잴 수 있는 도구를 이용해 외측,내측
          사이즈에 이상이 없는지 확인해야 해요.
        </GuideParagraph>
      </GuideSection>
      <GuideSection bordered={false}>
        <GuideHeading>실차 확인 시 주의사항</GuideHeading>
        <GuideParagraph>중고화물차를 전문가 수준으로 평가하는 것은 쉽지 않아요.</GuideParagraph>
        <GuideParagraph>
          직트럭에서는 매물 등록 시 차량의 상세 정보 뿐만 아니라 사고 여부, 수리
          여부, 운송 물품, 운행 구간 등에 대한 정보를 판매자에게 기입하도록
          요청하고 있어요.
        </GuideParagraph>
        <GuideParagraph>
          상세 정보란에 이러한 내용이 누락된 경우, 꼭 판매자에게 해당 정보를
          문의해야 합니다.{"\n"}
          또한, 구매 의사가 있다면 수리 비용이 크게 발생될 수 있는 부분을 주의
          깊게 살펴보아야 합니다.
        </GuideParagraph>
      </GuideSection>
    </>
  );
}

export function PurchaseContractPanel() {
  return (
    <>
      <GuideCoverImage
        uri={guideImages.purchaseContractCover}
        alt="구매 차량 계약 커버"
      />
      <GuideSection>
        <GuideHeading>계약 준비 서류를 확인하세요</GuideHeading>
        <GuideParagraph>
          직거래로 차량 계약 시 직트럭에서는 보관과 작성이 편리한 전자계약서를
          무료로 제공하고 있어요.{"\n"}
          전자계약서를 작성한 후 마이페이지를 통해서 PDF로(PC만 가능)
          다운로드가 가능하고 카카오톡으로 공유도 가능해요.
        </GuideParagraph>
        <GuideParagraph>
          ※ 직트럭은 전자계약서 폼(양식)만 제공합니다. 당사자 계약 가격 및 내용
          등에는 관여하지 않습니다.
        </GuideParagraph>
        <GuideContractSampleImage uri={guideImages.contractSample} />
      </GuideSection>
      <GuideSection bordered={false}>
        <GuideHeading>계약서 내용을 꼼꼼하게 확인하세요</GuideHeading>
        <GuideOrderedBlock
          items={[
            {
              title:
                "1. 계약서 작성 시 사전 협의된 내용이 있다면 특약사항 란에 필수로 작성하시는 걸 권장해요.",
              body:
                "예시)\n• 차량은 사고가 있거나 침수 차량이 아니어야 한다.\n• 차량 인도 후 약속된 기한 내로 명의 이전을 끝마쳐야 한다.\n• 차량의 저당 및 압류가 있을 시 거래에 문제가 되지 않도록 필수로 해지해야 한다.",
            },
            { title: "2. 차량의 자동차 등록증과 차량 표시 내용이 동일한지 확인하세요." },
            { title: "3. 판매자와 구매자의 인적사항을 명확하게 기입했는지 확인하세요." },
          ]}
        />
      </GuideSection>
    </>
  );
}
