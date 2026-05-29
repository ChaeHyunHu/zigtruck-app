const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
const expoConfig = appJson.expo;

module.exports = ({ config }) => ({
  ...config,
  ...expoConfig,
  plugins: [
    ...(expoConfig.plugins ?? []),
    "./plugins/withAndroidSplashFullscreen.js",
  ],
});
