export const SIGN_UP_AGREEMENT_ITEMS = [
  {
    id: 'terms' as const,
    title: '이용 약관',
    isRequired: true,
    termType: 'USE_TERMS',
  },
  {
    id: 'personalInfo' as const,
    title: '개인정보 수집 및 이용 동의',
    isRequired: true,
    termType: 'PERSONAL_INFO_TERMS',
  },
  {
    id: 'marketing' as const,
    title: '마케팅 정보 수신 및 활용 동의',
    isRequired: false,
    termType: 'MARKETING',
  },
];

export const DEALER_AGREEMENT_CLAUSES = [
  '사원증 제출 및 자격 조회에 동의합니다.',
  '딜러회원 매물은 검수 후 노출 원칙에 동의합니다.',
  '문의 응대는 직트럭(영업팀/CS) 우선 접수 후 연결 방식에 동의합니다.',
  '허위/미끼/과장 매물 등록 금지 및 정보 진실성에 서약합니다.',
  '문의자 정보는 필요 최소 정보만 제공되며, 목적 외 사용/제3자 제공 금지에 동의합니다.',
  '위반 시 노출 제한/정지/해지 및 손해배상 조치에 동의합니다.',
];
