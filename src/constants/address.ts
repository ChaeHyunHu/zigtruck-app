export type AddressItem = { desc: string };

export const ADDRESS1 = [
  { desc: '서울시' },
  {  desc: '부산시' },
  {  desc: '대구시' },
  { desc: '인천시' },
  { desc: '광주시' },
  { desc: '대전시' },
  { desc: '울산시' },
  { desc: '세종시' },
  { desc: '경기도' },
  { desc: '강원도' },
  { desc: '충청북도' },
  { desc: '충청남도' },
  { desc: '전라북도' },
  { desc: '전라남도' },
  { desc: '경상북도' },
  { desc: '경상남도' },
  { desc: '제주도' },
];

// 시/군 리스트 (address2)
export const ADDRESS2: Record<string, { desc: string }[]> = {
  제주도: [
    { desc: '제주시' },
    { desc: '서귀포시' },
  ],
  경기도: [
    { desc: '수원시' }, { desc: '용인시' },
    { desc: '고양시' }, { desc: '성남시' },
    { desc: '안산시' }, { desc: '안양시' },
    { desc: '화성시' }, { desc: '남양주시' },
    { desc: '평택시' }, { desc: '의정부시' },
    { desc: '파주시' }, { desc: '김포시' },
    { desc: '광주시' }, { desc: '시흥시' },
    { desc: '군포시' }, { desc: '이천시' },
    { desc: '하남시' }, { desc: '오산시' },
    { desc: '양주시' }, { desc: '구리시' },
    { desc: '안성시' }, { desc: '포천시' },
    { desc: '의왕시' }, { desc: '여주시' }
  ],
  강원도: [
    { desc: '춘천시' }, { desc: '원주시' },
    { desc: '강릉시' }, { desc: '동해시' },
    { desc: '속초시' }, { desc: '삼척시' }
  ],
  충청북도: [
    { desc: '청주시' }, { desc: '충주시' }, { desc: '제천시' }
  ],
  충청남도: [
    { desc: '천안시' }, { desc: '아산시' }, { desc: '서산시' },
    { desc: '논산시' }, { desc: '공주시' }, { desc: '보령시' }
  ],
  전라북도: [
    { desc: '전주시' }, { desc: '익산시' }, { desc: '군산시' },
    { desc: '정읍시' }, { desc: '남원시' }
  ],
  전라남도: [
    { desc: '여수시' }, { desc: '순천시' }, { desc: '목포시' },
    { desc: '광양시' }, { desc: '나주시' }
  ],
  경상북도: [
    { desc: '포항시' }, { desc: '구미시' }, { desc: '경주시' },
    { desc: '안동시' }, { desc: '김천시' }, { desc: '영주시' },
    { desc: '영천시' }, { desc: '상주시' }
  ],
  경상남도: [
    { desc: '창원시' }, { desc: '진주시' }, { desc: '김해시' },
    { desc: '양산시' }, { desc: '거제시' }, { desc: '통영시' }
  ]
}

export const ADDRESS3: Record<string, { desc: string }[]> = {
  제주도: [
    { desc: '제주시' },
    { desc: '서귀포시' },
  ],
  경기도: [
    { desc: '수원시' }, { desc: '용인시' },
    { desc: '고양시' }, { desc: '성남시' },
    { desc: '안산시' }, { desc: '안양시' },
    { desc: '화성시' }, { desc: '남양주시' },
    { desc: '평택시' }, { desc: '의정부시' },
    { desc: '파주시' }, { desc: '김포시' },
    { desc: '광주시' }, { desc: '시흥시' },
    { desc: '군포시' }, { desc: '이천시' },
    { desc: '하남시' }, { desc: '오산시' },
    { desc: '양주시' }, { desc: '구리시' },
    { desc: '안성시' }, { desc: '포천시' },
    { desc: '의왕시' }, { desc: '여주시' }
  ],
  강원도: [
    { desc: '춘천시' }, { desc: '원주시' },
    { desc: '강릉시' }, { desc: '동해시' },
    { desc: '속초시' }, { desc: '삼척시' }
  ],
  충청북도: [
    { desc: '청주시' }, { desc: '충주시' }, { desc: '제천시' }
  ],
  충청남도: [
    { desc: '천안시' }, { desc: '아산시' }, { desc: '서산시' },
    { desc: '논산시' }, { desc: '공주시' }, { desc: '보령시' }
  ],
  전라북도: [
    { desc: '전주시' }, { desc: '익산시' }, { desc: '군산시' },
    { desc: '정읍시' }, { desc: '남원시' }
  ],
  전라남도: [
    { desc: '여수시' }, { desc: '순천시' }, { desc: '목포시' },
    { desc: '광양시' }, { desc: '나주시' }
  ],
  경상북도: [
    { desc: '포항시' }, { desc: '구미시' }, { desc: '경주시' },
    { desc: '안동시' }, { desc: '김천시' }, { desc: '영주시' },
    { desc: '영천시' }, { desc: '상주시' }
  ],
  경상남도: [
    { desc: '창원시' }, { desc: '진주시' }, { desc: '김해시' },
    { desc: '양산시' }, { desc: '거제시' }, { desc: '통영시' }
  ]
}
