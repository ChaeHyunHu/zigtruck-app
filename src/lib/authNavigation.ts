import { router } from "expo-router";
import { Alert, InteractionManager } from "react-native";

export const LOGIN_ROUTE = "/(auth)/login";

/** Alert 콜백·탭 전환 직후 등에서도 안전하게 로그인 화면으로 이동 */
export function navigateToLogin() {
  InteractionManager.runAfterInteractions(() => {
    router.push(LOGIN_ROUTE);
  });
}

export function promptLogin(
  message = "이 메뉴는 로그인 후 이용 가능합니다.",
) {
  Alert.alert("로그인 필요", message, [
    { text: "취소", style: "cancel" },
    { text: "로그인", onPress: navigateToLogin },
  ]);
}
