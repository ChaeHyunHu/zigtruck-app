/**
 * prebuild 후 Android 12 원형 마스크 스플래시를 전체 화면 비트맵 방식으로 교체합니다.
 * 사용: node scripts/patch-android-splash-style.js
 */
const fs = require("fs");
const path = require("path");

const stylesPath = path.join(
  __dirname,
  "../android/app/src/main/res/values/styles.xml",
);

const FULLSCREEN_SPLASH_STYLE = `  <style name="Theme.App.SplashScreen" parent="AppTheme">
    <item name="android:windowBackground">@drawable/ic_launcher_background</item>
  </style>`;

if (!fs.existsSync(stylesPath)) {
  console.warn("[patch-android-splash-style] styles.xml not found, skip.");
  process.exit(0);
}

let contents = fs.readFileSync(stylesPath, "utf8");

if (contents.includes("@drawable/ic_launcher_background") && contents.includes('parent="AppTheme"')) {
  console.log("[patch-android-splash-style] already patched.");
  process.exit(0);
}

contents = contents.replace(
  /\s*<style name="Theme\.App\.SplashScreen"[\s\S]*?<\/style>/,
  `\n${FULLSCREEN_SPLASH_STYLE}`,
);

fs.writeFileSync(stylesPath, contents);
console.log("[patch-android-splash-style] patched Theme.App.SplashScreen.");

const mainActivityPath = path.join(
  __dirname,
  "../android/app/src/main/java/com/zigtruck/app/MainActivity.kt",
);
if (fs.existsSync(mainActivityPath)) {
  let kt = fs.readFileSync(mainActivityPath, "utf8");
  kt = kt.replace(
    /import expo\.modules\.splashscreen\.SplashScreenManager\n/,
    "",
  );
  kt = kt.replace(
    /\s*\/\/ @generated begin expo-splashscreen[\s\S]*?\/\/ @generated end expo-splashscreen\n?/,
    "\n",
  );
  fs.writeFileSync(mainActivityPath, kt);
  console.log("[patch-android-splash-style] patched MainActivity.kt.");
}
