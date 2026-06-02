const { withAndroidStyles, withMainActivity } = require("@expo/config-plugins");

const FULLSCREEN_SPLASH_STYLE = {
  $: {
    name: "Theme.App.SplashScreen",
    parent: "AppTheme",
  },
  item: [
    {
      $: { name: "android:windowBackground" },
      _: "@drawable/ic_launcher_background",
    },
  ],
};

/** Android 12+ 원형 아이콘 스플래시 제거 → windowBackground 전체 화면 비트맵 */
function withAndroidSplashFullscreen(config) {
  config = withAndroidStyles(config, (config) => {
    const styles = config.modResults;
    const styleList = styles.resources?.style ?? [];

    styles.resources.style = [
      ...styleList.filter(
        (style) => style.$?.name !== "Theme.App.SplashScreen",
      ),
      FULLSCREEN_SPLASH_STYLE,
    ];

    return config;
  });

  config = withMainActivity(config, (config) => {
    let contents = config.modResults.contents;

    // installSplashScreen()이 없으면 앱 아이콘(둥근 사각)이 스플래시로 뜨는 문제 방지
    contents = contents.replace(
      /\s*\/\/ @generated begin expo-splashscreen[\s\S]*?\/\/ @generated end expo-splashscreen\n?/,
      "\n",
    );
    contents = contents.replace(
      /import expo\.modules\.splashscreen\.SplashScreenManager\n/,
      "",
    );

    config.modResults.contents = contents;
    return config;
  });

  return config;
}

module.exports = withAndroidSplashFullscreen;
