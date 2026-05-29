/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // zigtruck-front primary 스케일 (DEFAULT는 웹 메인 네이비 = primary-10)
        primary: {
          DEFAULT: '#1E42A6',
          0: '#F8FAFF',
          1: '#F1F5FF',
          2: '#E4EBFF',
          3: '#D5E0FF',
          4: '#C2D2FF',
          5: '#A3BBFE',
          6: '#89A7FB',
          7: '#688DF4',
          8: '#4A71DD',
          9: '#335AC7',
          10: '#1E42A6',
          11: '#0E2E87',
          12: '#062069',
        },
        primaryDark: '#1E42A6',
        primaryLight: '#10ACFF',
        // zigtruck-front grey 스케일
        grey: {
          0: '#ffffff',
          1: '#FAFAFA',
          2: '#F5F5F5',
          3: '#EBEBEB',
          4: '#DCDCDC',
          5: '#BFBFBF',
          6: '#909090',
          7: '#6B6B6B',
          8: '#535353',
          9: '#414141',
          10: '#2D2D2D',
          11: '#191919',
          12: '#000000',
        },
        // 앱 기존 gray 플랫 토큰 (zigtruck-front gray 스케일과 동일)
        gray50: '#FAFAFA',
        gray100: '#FAFAFA',
        gray200: '#F5F5F5',
        gray300: '#E8E8E8',
        gray400: '#DCDCDC',
        gray500: '#BEBEBE',
        gray600: '#919191',
        gray700: '#737373',
        gray800: '#414141',
        gray900: '#121212',
        // zigtruck-front secondary/point 색상
        green: {
          0: '#34A853',
          1: '#7CD296',
        },
        brown: {
          0: '#C77840',
          1: '#FFF9EA',
        },
        secondaryBlue: {
          0: '#E9ECF6',
          1: '#1E42A6',
          faq: '#EFF6FF',
        },
        secondaryRed: {
          0: '#F6E9E9',
          1: '#A61E20',
          light: '#FFF8F8',
          faq: '#FFEFEF',
        },
        secondaryYellow: {
          0: '#FEFCE8',
          1: '#FFF085',
        },
        dealer: {
          DEFAULT: '#2D3E50',
          0: '#2D3E50',
          1: 'rgba(255, 255, 255, 0.20)',
        },
        border: '#E8EAF0',
        danger: '#E5484D',
        kakao: '#FFE402',
        naver: '#03C75A',
      },
    },
  },
  plugins: [],
};

