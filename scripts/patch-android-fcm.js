/**
 * prebuild 후 Android FCM(google-services) 연동을 보강합니다.
 * - 상태표시줄: ic_stat_logo (단색)
 * - 알림 펼침: notification_large_icon (컬러 앱 아이콘)
 * - ZigtruckFirebaseMessagingService 가 백그라운드 알림 표시 + 딥링크
 * 사용: node scripts/patch-android-fcm.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const googleServicesSrc = path.join(root, "google-services.json");
const googleServicesDest = path.join(root, "android/app/google-services.json");
const rootGradlePath = path.join(root, "android/build.gradle");
const appGradlePath = path.join(root, "android/app/build.gradle");
const manifestPath = path.join(
  root,
  "android/app/src/main/AndroidManifest.xml",
);
const pushIconAssetsDir = path.join(root, "assets/push");
const resRoot = path.join(root, "android/app/src/main/res");
const SMALL_ICON = "ic_stat_logo";
const LARGE_ICON = "notification_large_icon";
const colorIconSrc = fs.existsSync(
  path.join(pushIconAssetsDir, `${LARGE_ICON}.png`),
)
  ? path.join(pushIconAssetsDir, `${LARGE_ICON}.png`)
  : path.join(root, "assets/images/icon.png");
const DPI_FOLDERS = ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"];

const REMOVED_EXPO_FCM =
  "expo.modules.notifications.service.ExpoFirebaseMessagingService";
const REMOVED_RN_FCM_SERVICE =
  "io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService";

const MANIFEST_METAS = [
  '<meta-data android:name="com.google.firebase.messaging.default_notification_channel_id" android:value="default" tools:replace="android:value"/>',
  `<meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/${SMALL_ICON}" tools:replace="android:resource"/>`,
  `<meta-data android:name="expo.modules.notifications.default_notification_icon" android:resource="@drawable/${SMALL_ICON}" tools:replace="android:resource"/>`,
  `<meta-data android:name="expo.modules.notifications.large_notification_icon" android:resource="@drawable/${LARGE_ICON}" tools:replace="android:resource"/>`,
  '<meta-data android:name="firebase_messaging_notification_delegation_enabled" android:value="false" tools:replace="android:value"/>',
  '<meta-data android:name="com.google.firebase.messaging.default_notification_click_action" android:value="com.zigtruck.android.PUSH_OPEN"/>',
];

function copyGoogleServices() {
  if (!fs.existsSync(googleServicesSrc)) {
    console.warn(
      "[patch-android-fcm] google-services.json not found at project root.",
    );
    return;
  }
  fs.mkdirSync(path.dirname(googleServicesDest), { recursive: true });
  fs.copyFileSync(googleServicesSrc, googleServicesDest);
  console.log(
    "[patch-android-fcm] copied google-services.json -> android/app/",
  );
}

function copyDrawableSet(iconName, assetsSubdir) {
  let copied = 0;
  const fallback = path.join(pushIconAssetsDir, `${iconName}.png`);

  for (const dpi of DPI_FOLDERS) {
    const src = path.join(
      pushIconAssetsDir,
      `drawable-${dpi}`,
      `${iconName}.png`,
    );
    if (!fs.existsSync(src)) {
      continue;
    }
    const destDir = path.join(resRoot, `drawable-${dpi}`);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, path.join(destDir, `${iconName}.png`));
    copied += 1;
  }

  if (fs.existsSync(fallback)) {
    const drawableDir = path.join(resRoot, "drawable");
    fs.mkdirSync(drawableDir, { recursive: true });
    fs.copyFileSync(fallback, path.join(drawableDir, `${iconName}.png`));
  }

  return copied;
}

function resolveLargeIconSource() {
  const appIcon = path.join(root, "assets/images/icon.png");
  if (!fs.existsSync(colorIconSrc)) {
    return appIcon;
  }
  try {
    const { execSync } = require("child_process");
    const fileType = execSync(`file -b "${colorIconSrc}"`, {
      encoding: "utf8",
    }).trim();
    if (fileType.startsWith("PNG ")) {
      return colorIconSrc;
    }
    console.warn(
      `[patch-android-fcm] ${path.basename(colorIconSrc)} is not PNG (${fileType}); using icon.png`,
    );
  } catch {
    // ignore
  }
  return appIcon;
}

function copyLargeIconFromAppIcon() {
  const source = resolveLargeIconSource();
  if (!fs.existsSync(source)) {
    console.warn("[patch-android-fcm] large icon source not found.");
    return;
  }

  const { execSync } = require("child_process");
  const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

  for (const [dpi, px] of Object.entries(sizes)) {
    const destDir = path.join(resRoot, `drawable-${dpi}`);
    const assetsDir = path.join(pushIconAssetsDir, `drawable-${dpi}`);
    fs.mkdirSync(destDir, { recursive: true });
    fs.mkdirSync(assetsDir, { recursive: true });
    const dest = path.join(destDir, `${LARGE_ICON}.png`);
    try {
      execSync(`sips -z ${px} ${px} "${source}" --out "${dest}"`, {
        stdio: "ignore",
      });
      fs.copyFileSync(dest, path.join(assetsDir, `${LARGE_ICON}.png`));
    } catch {
      fs.copyFileSync(source, dest);
      fs.copyFileSync(source, path.join(assetsDir, `${LARGE_ICON}.png`));
    }
  }

  fs.mkdirSync(path.join(resRoot, "drawable"), { recursive: true });
  fs.mkdirSync(pushIconAssetsDir, { recursive: true });
  execSync(
    `sips -Z 192 "${source}" --out "${path.join(resRoot, "drawable", `${LARGE_ICON}.png`)}"`,
    {
      stdio: "ignore",
    },
  );
  fs.copyFileSync(
    path.join(resRoot, "drawable", `${LARGE_ICON}.png`),
    path.join(pushIconAssetsDir, `${LARGE_ICON}.png`),
  );
  console.log(
    `[patch-android-fcm] copied color large notification icon (${path.basename(source)})`,
  );
}

function copyLargeIconDrawableSet() {
  const copied = copyDrawableSet(LARGE_ICON);
  if (copied > 0) {
    console.log(
      `[patch-android-fcm] large icon drawable set (${copied} densities)`,
    );
  }
}

function copyNotificationIcons() {
  const smallCopied = copyDrawableSet(SMALL_ICON);
  if (smallCopied === 0) {
    console.warn(
      "[patch-android-fcm] ic_stat_logo missing. Add assets/push/drawable-*/ic_stat_logo.png from ic_stat_logo.zip",
    );
  } else {
    console.log(
      `[patch-android-fcm] small icon ${SMALL_ICON} (${smallCopied} densities)`,
    );
  }
  copyLargeIconFromAppIcon();
  copyLargeIconDrawableSet();
}

function patchRootGradle() {
  if (!fs.existsSync(rootGradlePath)) {
    return;
  }
  let contents = fs.readFileSync(rootGradlePath, "utf8");
  if (contents.includes("com.google.gms:google-services")) {
    return;
  }
  contents = contents.replace(
    /dependencies\s*\{/,
    `dependencies {
    classpath('com.google.gms:google-services:4.4.2')`,
  );
  fs.writeFileSync(rootGradlePath, contents);
}

function patchAppGradle() {
  if (!fs.existsSync(appGradlePath)) {
    return;
  }
  let contents = fs.readFileSync(appGradlePath, "utf8");
  if (!contents.includes("com.google.gms.google-services")) {
    contents = `${contents.trim()}\n\napply plugin: "com.google.gms.google-services"\n`;
    fs.writeFileSync(appGradlePath, contents);
  }
}

function ensureToolsNamespace(contents) {
  if (contents.includes('xmlns:tools="http://schemas.android.com/tools"')) {
    return contents;
  }
  return contents.replace(
    '<manifest xmlns:android="http://schemas.android.com/apk/res/android"',
    '<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools"',
  );
}

function ensureRemovalBlock(contents, tag, name) {
  const marker = `android:name="${name}"`;
  if (contents.includes(marker) && contents.includes('tools:node="remove"')) {
    return contents;
  }
  const block =
    tag === "service"
      ? `    <service android:name="${name}" tools:node="remove"/>\n`
      : `    <receiver android:name="${name}" tools:node="remove"/>\n`;
  return contents.replace("  </application>", `${block}  </application>`);
}

function removeNotificationTapActivity(contents) {
  return contents.replace(
    /\s*<activity android:name="\.NotificationTapActivity"[\s\S]*?\/>\s*/g,
    "\n",
  );
}

function ensurePushOpenIntentFilter(contents) {
  const hasPrimary = contents.includes(
    'android:name="com.zigtruck.android.PUSH_OPEN"',
  );
  const hasFlutter = contents.includes(
    'android:name="FLUTTER_NOTIFICATION_CLICK"',
  );
  const hasExpoOpen = contents.includes(
    'android:name="expo.modules.notifications.OPEN_APP_ACTION"',
  );
  const hasLegacy1 = contents.includes('android:name=".MainActivity"');
  const hasLegacy2 = contents.includes(
    'android:name="com.zigtruck.app.MainActivity"',
  );
  const hasViewDefaultOnly = contents.includes(
    '<intent-filter>\n        <action android:name="android.intent.action.VIEW"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>',
  );
  if (
    hasPrimary &&
    hasFlutter &&
    hasExpoOpen &&
    hasLegacy1 &&
    hasLegacy2 &&
    hasViewDefaultOnly
  ) {
    return contents;
  }
  let next = contents.replace(
    /(<activity android:name="\.MainActivity"[\s\S]*?<intent-filter>\s*<action android:name="android\.intent\.action\.MAIN"\/>\s*<category android:name="android\.intent\.category\.LAUNCHER"\/>\s*<\/intent-filter>)/,
    `$1\n      <intent-filter>\n        <action android:name="android.intent.action.MAIN"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>\n      <intent-filter>\n        <action android:name="com.zigtruck.android.PUSH_OPEN"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>\n      <intent-filter>\n        <action android:name="FLUTTER_NOTIFICATION_CLICK"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>\n      <intent-filter>\n        <action android:name="expo.modules.notifications.OPEN_APP_ACTION"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>\n      <intent-filter>\n        <action android:name=".MainActivity"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>\n      <intent-filter>\n        <action android:name="com.zigtruck.app.MainActivity"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>\n      <intent-filter>\n        <action android:name="android.intent.action.VIEW"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>`,
  );
  if (!next.includes('android:name="FLUTTER_NOTIFICATION_CLICK"')) {
    next = next.replace(
      /(<action android:name="com\.zigtruck\.android\.PUSH_OPEN"\/>\s*<category android:name="android\.intent\.category\.DEFAULT"\/>\s*<\/intent-filter>)/,
      `$1\n      <intent-filter>\n        <action android:name="FLUTTER_NOTIFICATION_CLICK"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>`,
    );
  }
  if (
    !next.includes('android:name="expo.modules.notifications.OPEN_APP_ACTION"')
  ) {
    next = next.replace(
      /(<action android:name="com\.zigtruck\.android\.PUSH_OPEN"\/>\s*<category android:name="android\.intent\.category\.DEFAULT"\/>\s*<\/intent-filter>)/,
      `$1\n      <intent-filter>\n        <action android:name="expo.modules.notifications.OPEN_APP_ACTION"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>`,
    );
  }
  if (!next.includes('android:name=".MainActivity"')) {
    next = next.replace(
      /(<action android:name="com\.zigtruck\.android\.PUSH_OPEN"\/>\s*<category android:name="android\.intent\.category\.DEFAULT"\/>\s*<\/intent-filter>)/,
      `$1\n      <intent-filter>\n        <action android:name=".MainActivity"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>`,
    );
  }
  if (!next.includes('android:name="com.zigtruck.app.MainActivity"')) {
    next = next.replace(
      /(<action android:name="com\.zigtruck\.android\.PUSH_OPEN"\/>\s*<category android:name="android\.intent\.category\.DEFAULT"\/>\s*<\/intent-filter>)/,
      `$1\n      <intent-filter>\n        <action android:name="com.zigtruck.app.MainActivity"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>`,
    );
  }
  if (
    !next.includes(
      '<intent-filter>\n        <action android:name="android.intent.action.VIEW"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>',
    )
  ) {
    next = next.replace(
      /(<action android:name="com\.zigtruck\.android\.PUSH_OPEN"\/>\s*<category android:name="android\.intent\.category\.DEFAULT"\/>\s*<\/intent-filter>)/,
      `$1\n      <intent-filter>\n        <action android:name="android.intent.action.VIEW"/>\n        <category android:name="android.intent.category.DEFAULT"/>\n      </intent-filter>`,
    );
  }
  return next;
}

function ensureZigtruckService(contents) {
  if (contents.includes("ZigtruckFirebaseMessagingService")) {
    return contents.replace(
      /<intent-filter>\s*<action android:name="com\.google\.firebase\.MESSAGING_EVENT"\/>/,
      '<intent-filter android:priority="1">\n        <action android:name="com.google.firebase.MESSAGING_EVENT"/>',
    );
  }
  const block = `    <service android:name=".ZigtruckFirebaseMessagingService" android:exported="false" android:directBootAware="true">
      <intent-filter android:priority="1">
        <action android:name="com.google.firebase.MESSAGING_EVENT"/>
      </intent-filter>
    </service>
`;
  return contents.replace("  </application>", `${block}  </application>`);
}

function upsertManifestMeta(contents, metaLine) {
  const metaName = metaLine.match(/android:name="([^"]+)"/)?.[1];
  if (!metaName) {
    return contents;
  }
  const pattern = new RegExp(
    `<meta-data android:name="${metaName.replace(/\./g, "\\.")}"[^>]*/>`,
    "g",
  );
  if (pattern.test(contents)) {
    return contents.replace(pattern, metaLine.trim());
  }
  return contents.replace(/(<application[^>]*>)/, `$1\n    ${metaLine.trim()}`);
}

function removeNotificationColorMeta(contents) {
  let next = contents.replace(
    /\s*<meta-data android:name="com\.google\.firebase\.messaging\.default_notification_color"[^>]*\/>\s*/g,
    "\n",
  );
  const block =
    '    <meta-data android:name="com.google.firebase.messaging.default_notification_color" tools:node="remove"/>\n';
  if (!next.includes("default_notification_color")) {
    next = next.replace("  </application>", `${block}  </application>`);
  } else if (
    !next.includes('default_notification_color" tools:node="remove"')
  ) {
    next = next.replace(
      /<meta-data android:name="com\.google\.firebase\.messaging\.default_notification_color"[^>]*\/>/,
      block.trim(),
    );
  }
  return next;
}

function patchManifest() {
  if (!fs.existsSync(manifestPath)) {
    return;
  }
  let contents = fs.readFileSync(manifestPath, "utf8");
  contents = ensureToolsNamespace(contents);
  contents = ensureRemovalBlock(contents, "service", REMOVED_EXPO_FCM);
  contents = ensureRemovalBlock(contents, "service", REMOVED_RN_FCM_SERVICE);
  contents = removeNotificationTapActivity(contents);
  contents = ensurePushOpenIntentFilter(contents);
  contents = ensureZigtruckService(contents);

  if (!contents.includes("POST_NOTIFICATIONS")) {
    contents = contents.replace(
      '<uses-permission android:name="android.permission.INTERNET"/>',
      `<uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>`,
    );
  }

  for (const meta of MANIFEST_METAS) {
    contents = upsertManifestMeta(contents, meta);
  }
  contents = removeNotificationColorMeta(contents);

  fs.writeFileSync(manifestPath, contents);
  console.log(
    "[patch-android-fcm] manifest patched (small + large icon, delegation off)",
  );
}

copyGoogleServices();
copyNotificationIcons();
patchRootGradle();
patchAppGradle();
patchManifest();
