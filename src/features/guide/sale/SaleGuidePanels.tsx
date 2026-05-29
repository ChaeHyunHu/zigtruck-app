import React from "react";

import {
  GuideBulletList,
  GuideCoverImage,
  GuideEmphasis,
  GuideHeading,
  GuideContractSampleImage,
  GuideInlineImage,
  GuideLink,
  GuideNote,
  GuideOrderedBlock,
  GuideParagraph,
  GuideSection,
  GuideServiceLinks,
  guideImages,
} from "@/src/features/guide/components/GuidePrimitives";

export function SalePlanPanel() {
  return (
    <>
      <GuideCoverImage uri={guideImages.salePlanCover} alt="판매 계획 수립 커버" />
      <GuideSection>
        <GuideHeading>매물을 빠르게 판매하세요</GuideHeading>
        <GuideParagraph>
          트럭 판매를 고민하고 계신가요?{"\n"}저희 직트럭에서 도와드리겠습니다.
        </GuideParagraph>
        <GuideParagraph>
          직트럭에서는 크게 두가지 방법으로 빠르게 매물을 판매하실 수 있어요.
        </GuideParagraph>
        <GuideParagraph>
          <GuideEmphasis>1. 차주 A - "지금 당장 판매해야 해요!"</GuideEmphasis>
          {"\n"}• 직트럭에서 차량을 빠르게 매입해드려요!{"\n"}[내차 판매] 탭에서
          [직트럭에 즉시 매각]을 선택하시고 차량 등록 후 매입 견적 연락을 드릴
          예정이며, 48시간 이내에 차량 매입 처리가 가능합니다.
        </GuideParagraph>
        <GuideParagraph>
          <GuideEmphasis>
            2. 차주 B - "급하진 않아서 운행하면서 판매하고싶어요~"
          </GuideEmphasis>
          {"\n"}• 직트럭에서 직접 차량을 판매할 수 있어요!{"\n"}
          차량 정보만 기입하면 소유하고 있는 차량의 시세를 확인할수있고,
          간편하게 차량을 등록할수 있습니다. 차량에 관심이 있다면 실시간 채팅
          및 전화를 통해 상담 할 수 있습니다.{"\n\n"}
          혹여나 전화번호가 노출될까 걱정마세요! 전화번호는 노출되지않고
          안심번호로 연결됩니다.
        </GuideParagraph>
      </GuideSection>
      <GuideSection>
        <GuideHeading>판매가 지연되는 경우</GuideHeading>
        <GuideParagraph>
          차량 판매가 더디거나 지연되는 경우가 있어요.{"\n"}
          이럴 땐 아래 사항들을 확인하시면 조금 더 빠른 시기에 판매가 가능해질 수
          있습니다.
        </GuideParagraph>
        <GuideParagraph>
          • 판매하는 차량이 시세보다 높은 가격은 아닌지 체크해야 하며, 영업용
          화물차의 경우 차량 선호도 차이(차량 모델,특장의 종류 등)로 판매가
          지연될 수 있습니다.
        </GuideParagraph>
        <GuideParagraph>
          • 차량 정보를 오기입하진 않았는지, 차량을 세세하게 확인할 수 있는
          사진을 올렸는지 확인해야 해요.
        </GuideParagraph>
        <GuideParagraph>
          • 차량을 기존보다 낮은 가격으로 수정하면 직트럭 홈 화면에 [추천
          차량]으로 업데이트되고 차량 노출 횟수가 이전보다 높아집니다.
        </GuideParagraph>
        <GuideServiceLinks
          links={[
            { label: "시세 검색", path: "/price-trend/form" },
            { label: "추천 차량", path: "/(tabs)/purchase" },
          ]}
        />
      </GuideSection>
    </>
  );
}

export function PreSaleCheckListPanel() {
  return (
    <>
      <GuideCoverImage
        uri={guideImages.preSaleChecklistCover}
        alt="판매 전 체크사항 커버"
      />
      <GuideSection>
        <GuideHeading>판매 전 차량 시세를 확인하세요</GuideHeading>
        <GuideParagraph>
          직트럭에서는 다년간 쌓아온 내부 데이터베이스를 활용해 약 2만건의 적절한
          중고화물차 시세를 제공하고 있어요.
        </GuideParagraph>
        <GuideParagraph>
          [내차판매], [시세검색] 탭에서 시세를 확인 할 수 있어요.
        </GuideParagraph>
        <GuideServiceLinks
          links={[
            { label: "내차 판매", path: "/sell-car" },
            { label: "시세 검색", path: "/price-trend/form" },
          ]}
        />
      </GuideSection>
      <GuideSection>
        <GuideHeading>시세에 영향을 주는 요인은?</GuideHeading>
        <GuideParagraph>
          화물차 시세에 영향을 주는 요인은 사고 유무, 차량의 주행 거리, 적재함의
          종류와 길이, 차량 옵션, 차량 수리 유무가 있어요.
        </GuideParagraph>
        <GuideOrderedBlock
          items={[
            {
              title: "1. 사고 유무",
              body: "사고 후에 수리를 했더라도 사고 범위에 따라 시세 차이가 커질 수 있어요.",
            },
            {
              title: "2. 주행 거리",
              body: "주행 거리는 차량 가격에 큰 영향을 주는 부분입니다. 같은 연식의 차량이라도 주행 거리에 따라서 시세 차이가 커집니다.\n예) 5톤 차량 기준 평균 1년치 주행 거리는 8만km 내외입니다.",
            },
            {
              title: "3. 적재함 종류/길이",
              body: "영업용 화물차는 일반 승용차와는 다르게 동일한 차종이라도 특장의 종류, 길이에 따라 선호도에 차이가 있어 수요와 공급이 다르기 때문에 이러한 부분도 시세에 영향을 줄 수 있습니다.",
            },
            {
              title: "4. 옵션",
              body: "추가로 장착된 옵션들은 상황에따라 차량가격외 추가비용이 발생하는 경우도 있겠습니다.\nEx) 어라운드뷰,무시동에어컨,안산철배터리 등",
            },
            {
              title: "5. 차량 수리 상태",
              body: "오래된 연식이거나 주행 거리가 많은 차량이라도 정비와 수리를 꾸준하게 했다면 최신 연식 못지 않은 차량일 수 있어요. 하지만 관리를 소홀히 했다면 원하는 가격에 판매하긴 어렵겠죠?\n또한 그동안 수리했던 내역을 확인할 수 있는 내역서를 꼭 가지고 계시는 걸 추천합니다.",
            },
          ]}
        />
        <GuideServiceLinks links={[{ label: "시세 검색", path: "/price-trend/form" }]} />
      </GuideSection>
      <GuideSection>
        <GuideHeading>압류와 저당을 확인하세요</GuideHeading>
        <GuideParagraph>
          압류나 저당이 있을 시 명의 이전이 불가능하므로 반드시 확인 후
          해지해야 합니다.
        </GuideParagraph>
        <GuideParagraph>
          압류와 저당 유무는 각 관공서 및 캐피탈 사에 연락하여 등록원부 조회 후
          확인할 수 있어요.{"\n"}
          이후, 해지 서류까지 확인하시면 압류, 저당 문제는 해결됩니다.
        </GuideParagraph>
        <GuideParagraph>
          아래 민원24시 에서 원부 무료 발급(인터넷 기준)이 가능해요.{"\n"}
          <GuideLink href="https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=A03007&CappBizCD=15000000334&tp_seq=02">
            https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=A03007&CappBizCD=15000000334&tp_seq=02
          </GuideLink>
        </GuideParagraph>
      </GuideSection>
      <GuideSection bordered={false}>
        <GuideHeading>차량에 할부가 남은 경우 처리 방법은?</GuideHeading>
        <GuideParagraph>
          할부가 남아 있는 경우 처리하는 방법은 두 가지 입니다.
        </GuideParagraph>
        <GuideOrderedBlock
          items={[
            {
              title:
                "1. 판매자가 남은 할부금을 캐피탈 사에 확인하고 일시 납부하거나, 잔금 입금 시에 구매자가 입금 후 근저당설정을 해지 하는방법.",
              body: "* 차량 금액보다 할부금이 더 많이 남아있는 경우라면 차액금액을 판매자가 선 입금 처리여부가 가능한지 확인하세요.",
            },
            {
              title: "2. 판매자가 구매자에게 할부를 승계하는 방법",
              body: "* 구매자의 신용, 소득요건에 따라 가능/불가능 여부가 달라지므로 구매자의 승계 적격 여부를 캐피탈사에 문의해야 해요.",
            },
          ]}
        />
      </GuideSection>
    </>
  );
}

export function SaleContractPanel() {
  return (
    <>
      <GuideCoverImage uri={guideImages.saleContractCover} alt="판매 차량 계약 커버" />
      <GuideSection>
        <GuideHeading>계약 준비 서류를 확인하세요</GuideHeading>
        <GuideParagraph>
          직거래로 차량 계약 시 직트럭에서는 보관과 작성이 편리한 전자계약서를
          무료로 제공하고 있어요.{"\n"}
          전자계약서를 작성한 후 마이페이지를 통해서 PDF로(PC만 가능)
          다운로드가 가능하고 카카오톡으로 공유도 가능해요.
        </GuideParagraph>
        <GuideNote>
          ※ 직트럭은 전자계약서 폼(양식)만 제공합니다. 당사자 계약 가격 및 내용
          등에는 관여하지 않습니다.
        </GuideNote>
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

export function SaleAfterCarePanel() {
  return (
    <>
      <GuideCoverImage uri={guideImages.saleAfterCareCover} alt="판매 후 주의사항 커버" />
      <GuideSection bordered={false}>
        <GuideHeading>판매 후 주의 사항을 확인하세요</GuideHeading>
        <GuideParagraph>판매 완료 후 주의해야 할 사항은 아래와 같아요.</GuideParagraph>
        <GuideBulletList
          items={[
            "• 명의 이전이 완료된 등록증을 확인하세요",
            "• 자동차 보험 해지 확인과 선납한 금액에 대한 환급 요청",
            "• 선납 자동차세가 있으면 환급 요청",
          ]}
        />
        <GuideNote>
          ※ 1년치 선납 자동차세가 있는 경우{"\n"}
          차량 판매 후 해당 구(군)청 세무과 담당자과 연락하여 명의가 변경된
          자동차 등록증을 통해 내용 확인 후 선납 자동차세를 일할 계산하여 환급
          받을 수 있습니다.
        </GuideNote>
      </GuideSection>
    </>
  );
}
