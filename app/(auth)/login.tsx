import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, useFocusEffect, useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  type TextInput as TextInputType,
} from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { IMAGE_BASE_URL } from "@/src/constants/url";
import { DealerReviewModal } from "@/src/features/auth/DealerReviewModal";
import { SocialLoginWebView } from "@/src/features/auth/SocialLoginWebView";
import type { SocialLoginResult } from "@/src/features/auth/socialLogin";
import { useAuth } from "@/src/hooks/useAuth";

type LoginTab = "NORMAL" | "DEALER";

const TAB_GRADIENT = ["#535AFF", "#397AFF", "#10ACFF"] as const;
const DEALER_GRADIENT = ["#1D2B44", "#233854"] as const;
const KEYBOARD_OFFSET = 56 + 52;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { isAuthenticated, login, loginWithToken } = useAuth();
  const dealerScrollRef = useRef<ScrollView>(null);
  const passwordInputRef = useRef<TextInputType>(null);

  const [tab, setTab] = useState<LoginTab>("NORMAL");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState<
    "kakao" | "naver" | null
  >(null);
  const [socialLoading, setSocialLoading] = useState<"kakao" | "naver" | null>(
    null,
  );
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showDealerReview, setShowDealerReview] = useState(false);

  const isDealer = tab === "DEALER";

  const isDisabled = useMemo(
    () => !phoneNumber.trim() || !password.trim() || isSubmitting,
    [phoneNumber, password, isSubmitting],
  );

  const navigateBackFromLogin = useCallback(() => {
    if (socialProvider) {
      setSocialProvider(null);
      return;
    }

    let current: NavigationProp<ParamListBase> | undefined = navigation;
    while (current) {
      if (current.canGoBack()) {
        current.goBack();
        return;
      }
      current = current.getParent?.() ?? undefined;
    }

    router.replace("/(tabs)");
  }, [navigation, socialProvider]);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBackPress = () => {
        navigateBackFromLogin();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onHardwareBackPress,
      );
      return () => subscription.remove();
    }, [navigateBackFromLogin]),
  );

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleTabChange = useCallback(
    (nextTab: LoginTab) => {
      dismissKeyboard();
      setTab(nextTab);
    },
    [dismissKeyboard],
  );

  const scrollToForm = useCallback(() => {
    if (!isDealer) return;
    setTimeout(() => {
      dealerScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [isDealer]);

  useEffect(() => {
    if (isKeyboardVisible && isDealer) {
      scrollToForm();
    }
  }, [isDealer, isKeyboardVisible, scrollToForm]);

  const handleLogin = useCallback(async () => {
    if (isDisabled) return;

    setIsSubmitting(true);
    setErrorText("");
    try {
      const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");
      const result = await login({
        phoneNumber: normalizedPhoneNumber,
        password,
        type: tab,
      });
      // 승인 전/반려 딜러(삭제 상태)는 로그인하지 않고 심사 안내 모달 표시
      if (result?.blockedDeleted) {
        setShowDealerReview(true);
        return;
      }
      router.replace("/(tabs)");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "로그인에 실패했습니다.";
      setErrorText(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isDisabled, login, password, phoneNumber, tab]);

  const handleSocialLoginPress = useCallback(
    (provider: "kakao" | "naver") => {
      if (socialLoading || isSubmitting || socialProvider) return;
      setErrorText("");
      setSocialLoading(provider);
      setSocialProvider(provider);
    },
    [isSubmitting, socialLoading, socialProvider],
  );

  const handleSocialLoginResult = useCallback(
    async (result: SocialLoginResult) => {
      setSocialProvider(null);

      if (result.type === "cancel") {
        setSocialLoading(null);
        return;
      }

      try {
        if (result.type === "error") {
          setErrorText(result.message);
          return;
        }

        const { isNewMember } = await loginWithToken(result.token);
        if (isNewMember) {
          setErrorText(
            "회원가입이 필요한 계정입니다. 전화번호 회원가입을 진행해주세요.",
          );
          return;
        }

        router.replace("/(tabs)");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "소셜 로그인에 실패했습니다.";
        setErrorText(message);
      } finally {
        setSocialLoading(null);
      }
    },
    [loginWithToken],
  );

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const loginButtonColor = isDealer ? appColors.dealer : appColors.primaryDark;
  const signupColor = isDealer ? appColors.dealer : appColors.primaryDark;

  const dealerHero = (
    <View
      style={isKeyboardVisible ? undefined : { flex: 1 }}
      className={`px-5 pb-8 ${isKeyboardVisible ? "pt-4" : "pt-[30px]"}`}
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}/logo_white.png` }}
        className="mb-3.5 h-[30px] w-[76px]"
        contentFit="contain"
      />
      <Text className="text-[36px] font-extrabold leading-[50px] text-white">
        화물차 거래의
      </Text>
      <Text className="text-[36px] font-extrabold leading-[50px] text-white">
        새로운 기준
      </Text>
      {!isKeyboardVisible ? (
        <View className="mt-3 self-start rounded-full bg-white/20 px-4 py-1.5">
          <Text className="text-[14px] font-bold text-white">DEALER</Text>
        </View>
      ) : null}
    </View>
  );

  const normalHero = (
    <View className="px-5 pt-[30px]">
      <Image
        source={{ uri: `${IMAGE_BASE_URL}/logo_gra.png` }}
        className="mb-3.5 h-[30px] w-[76px]"
        contentFit="contain"
      />
      <Text className="text-[36px] font-extrabold leading-[50px] text-gray900">
        화물차 거래의
      </Text>
      <Text className="text-[36px] font-extrabold leading-[50px] text-gray900">
        새로운 기준
      </Text>
    </View>
  );

  const formSection = (
    <View
      className={`px-4 ${!isDealer && isKeyboardVisible ? "pb-0" : "pb-4"}`}
    >
      <LoginFormFields
        phoneNumber={phoneNumber}
        password={password}
        showPassword={showPassword}
        passwordInputRef={passwordInputRef}
        onChangePhoneNumber={(text) =>
          setPhoneNumber(text.replace(/\D/g, "").slice(0, 11))
        }
        onChangePassword={setPassword}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onFocusField={scrollToForm}
        signupColor={signupColor}
        isDealer={isDealer}
      />

      {errorText ? (
        <Text className="mb-2.5 text-[13px] text-danger">{errorText}</Text>
      ) : null}

      <LoginSubmitButton
        isDisabled={isDisabled}
        isSubmitting={isSubmitting}
        backgroundColor={loginButtonColor}
        onPress={handleLogin}
      />

      {!isDealer && !isKeyboardVisible ? (
        <>
          <View className="mt-3.5 flex-row items-center gap-2.5">
            <View className="h-px flex-1 bg-gray300" />
            <Text className="text-[12px] text-gray700">또는</Text>
            <View className="h-px flex-1 bg-gray300" />
          </View>

          <View className="mt-3 flex-row gap-2.5">
            <SocialLoginButton
              label="카카오톡"
              backgroundColor={appColors.kakao}
              textColor={appColors.gray900}
              iconUri={`${IMAGE_BASE_URL}/kakao_icon.png`}
              onPress={() => handleSocialLoginPress("kakao")}
              loading={socialLoading === "kakao"}
              disabled={Boolean(socialLoading) || isSubmitting}
            />
            <SocialLoginButton
              label="네이버"
              backgroundColor={appColors.naver}
              textColor={appColors.white}
              iconUri={`${IMAGE_BASE_URL}/naver_icon.png`}
              onPress={() => handleSocialLoginPress("naver")}
              loading={socialLoading === "naver"}
              disabled={Boolean(socialLoading) || isSubmitting}
            />
          </View>
        </>
      ) : null}
    </View>
  );

  const dealerContent = (
    <LinearGradient colors={[...DEALER_GRADIENT]} style={{ flex: 1 }}>
      <ScrollView
        ref={dealerScrollRef}
        className="flex-1"
        style={{ backgroundColor: "transparent" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
        bounces={false}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          flexGrow: isKeyboardVisible ? 0 : 1,
          paddingBottom: 0,
        }}
      >
        {dealerHero}
        <View className="mt-10 bg-white rounded-t-[20px] pt-8">
          {formSection}
        </View>
      </ScrollView>
    </LinearGradient>
  );

  const normalContent = (
    <View className="flex-1 bg-gray100">
      {normalHero}
      <View style={isKeyboardVisible ? undefined : { flex: 1 }} />
      <View className="pt-16">{formSection}</View>
    </View>
  );

  const mainContent = isDealer ? dealerContent : normalContent;

  return (
    <Screen className="flex-1 bg-white">
      <View className="h-14 flex-row items-center bg-white px-4">
        <Pressable className="py-1 pr-2" onPress={navigateBackFromLogin}>
          <Text className="text-[30px] leading-[30px] text-gray900">‹</Text>
        </Pressable>
        <Text className="text-[20px] font-bold text-gray900">로그인</Text>
      </View>

      <View className="h-[52px] flex-row border-b border-gray300 bg-white">
        <LoginTabButton
          title="일반 회원"
          active={!isDealer}
          variant="normal"
          onPress={() => handleTabChange("NORMAL")}
        />
        <LoginTabButton
          title="딜러 회원"
          active={isDealer}
          variant="dealer"
          onPress={() => handleTabChange("DEALER")}
        />
      </View>

      <View
        className="flex-1"
        style={{ backgroundColor: isDealer ? "#FFFFFF" : appColors.gray100 }}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
          <View className="flex-1">{mainContent}</View>
        </TouchableWithoutFeedback>
      </View>

      <SocialLoginWebView
        provider={socialProvider}
        onClose={() => setSocialProvider(null)}
        onResult={handleSocialLoginResult}
      />

      <DealerReviewModal
        visible={showDealerReview}
        onConfirm={() => setShowDealerReview(false)}
      />
    </Screen>
  );
}

function LoginTabButton({
  title,
  active,
  variant,
  onPress,
}: {
  title: string;
  active: boolean;
  variant: "normal" | "dealer";
  onPress: () => void;
}) {
  const isNormal = variant === "normal";

  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-center">
      <Text
        className={`text-[16px] font-bold ${
          active
            ? isNormal
              ? "text-primary"
              : "text-[#2D3E50]"
            : "text-gray500"
        }`}
      >
        {title}
      </Text>
      {active ? (
        isNormal ? (
          <LinearGradient
            colors={[...TAB_GRADIENT]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
            }}
          />
        ) : (
          <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D3E50]" />
        )
      ) : (
        <View className="absolute bottom-0 left-0 right-0 h-px bg-gray300" />
      )}
    </Pressable>
  );
}

function LoginFormFields({
  phoneNumber,
  password,
  showPassword,
  passwordInputRef,
  onChangePhoneNumber,
  onChangePassword,
  onTogglePassword,
  onFocusField,
  signupColor,
  isDealer,
}: {
  phoneNumber: string;
  password: string;
  showPassword: boolean;
  passwordInputRef: React.RefObject<TextInputType | null>;
  onChangePhoneNumber: (text: string) => void;
  onChangePassword: (text: string) => void;
  onTogglePassword: () => void;
  onFocusField: () => void;
  signupColor: string;
  isDealer: boolean;
}) {
  return (
    <>
      <View className="gap-[30px]">
        <UnderlineTextInput
          value={phoneNumber}
          onChangeText={onChangePhoneNumber}
          placeholder="휴대폰 번호를 입력하세요."
          keyboardType="number-pad"
          onFocus={onFocusField}
        />

        <View className="relative">
          <UnderlineTextInput
            ref={passwordInputRef}
            value={password}
            onChangeText={onChangePassword}
            placeholder="비밀번호를 입력하세요."
            secureTextEntry={!showPassword}
            containerClassName="pr-10"
            onFocus={onFocusField}
          />
          <Pressable
            onPress={onTogglePassword}
            className="absolute bottom-2 right-0 h-8 w-8 items-center justify-center"
            hitSlop={8}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={appColors.gray500}
            />
          </Pressable>
        </View>
      </View>

      <View className="mb-[18px] mt-[18px] flex-row justify-between">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(auth)/signup",
              params: { type: isDealer ? "DEALER" : "NORMAL" },
            })
          }
        >
          <Text
            className="text-[14px] font-semibold underline"
            style={{ color: signupColor }}
          >
            회원가입
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
          <Text className="text-[14px] font-semibold text-gray600">
            비밀번호 찾기
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const UnderlineTextInput = React.forwardRef<
  TextInputType,
  React.ComponentProps<typeof TextInput> & { containerClassName?: string }
>(function UnderlineTextInput(
  { containerClassName, onFocus, style, ...props },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={containerClassName}>
      <TextInput
        ref={ref}
        {...props}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={appColors.gray500}
        style={[
          {
            height: 52,
            paddingTop: 12,
            paddingBottom: 12,
            paddingHorizontal: 4,
            fontSize: 18,
            lineHeight: 22,
            color: appColors.gray900,
            borderBottomWidth: 1,
            borderBottomColor: isFocused
              ? appColors.primary
              : appColors.gray300,
            backgroundColor: "transparent",
            textAlignVertical: "center",
          },
          Platform.OS === "android" ? { includeFontPadding: false } : null,
          style,
        ]}
      />
    </View>
  );
});

function LoginSubmitButton({
  isDisabled,
  isSubmitting,
  backgroundColor,
  onPress,
}: {
  isDisabled: boolean;
  isSubmitting: boolean;
  backgroundColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="h-12 items-center justify-center rounded-[10px]"
      style={{ backgroundColor: isDisabled ? "#D9D9D9" : backgroundColor }}
      onPress={onPress}
      disabled={isDisabled}
    >
      {isSubmitting ? (
        <ActivityIndicator color={appColors.white} />
      ) : (
        <Text
          className="text-[16px] font-semibold"
          style={{ color: isDisabled ? "#9E9E9E" : appColors.white }}
        >
          로그인
        </Text>
      )}
    </Pressable>
  );
}

function SocialLoginButton({
  label,
  backgroundColor,
  textColor,
  iconUri,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
  iconUri: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <Pressable
      className="h-14 flex-1 flex-row items-center justify-center rounded-xl"
      style={{ backgroundColor }}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          <Image
            source={{ uri: iconUri }}
            className="absolute left-4 h-8 w-8"
            contentFit="contain"
          />
          <Text className="text-[16px] font-bold" style={{ color: textColor }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
