import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ListRow } from "@/src/components/common/ListRow";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import {
  NAME_VALIDATION_LENGTH_MESSAGE,
  NAME_VALIDATION_MESSAGE,
} from "@/src/features/additional-services/validation";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { navigateToLogin } from "@/src/lib/authNavigation";
import { validateMemberName } from "@/src/lib/memberValidation";
import { showAppAlert, showAppConfirm } from "@/src/providers/appDialog";
import { pickImageFromLibrary } from "@/src/utils/pickImageFromLibrary";

export default function SettingsScreen() {
  const {
    isAuthenticated,
    logout,
    profile,
    uploadProfileImage,
    updateProfileName,
    isProfileUpdating,
  } = useAuth();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [editingName, setEditingName] = useState(profile?.name ?? "");
  const [isSavingName, setIsSavingName] = useState(false);

  const displayName = useMemo(
    () => profile?.name || "직트럭 사용자",
    [profile?.name],
  );
  const displayPhone = useMemo(
    () => profile?.phoneNumber || "-",
    [profile?.phoneNumber],
  );

  // 입력값 실시간 검증: 띄어쓰기·특수문자가 있으면 오류 메시지 노출
  const editingNameError = useMemo(() => {
    if (!editingName.trim()) return "";
    if (!validateMemberName(editingName)) return NAME_VALIDATION_MESSAGE;
    if (editingName.length > 20) return NAME_VALIDATION_LENGTH_MESSAGE;
    return "";
  }, [editingName]);

  const canSaveName =
    editingName.trim().length > 0 && !editingNameError && !isSavingName;

  const onLogout = useCallback(() => {
    showAppConfirm({
      title: "로그아웃",
      message: "정말 로그아웃 하시겠어요?",
      leftLabel: "취소",
      rightLabel: "로그아웃",
      onRight: async () => {
        await logout();
        navigateToLogin();
      },
    });
  }, [logout]);

  const onPressEditName = () => {
    setEditingName(displayName);
    setIsNameModalOpen(true);
  };

  const closeNameModal = useCallback(() => {
    Keyboard.dismiss();
    setIsNameModalOpen(false);
  }, []);

  const onSaveName = async () => {
    const nextName = editingName.trim();
    if (!nextName) {
      showAppAlert({ title: "이름 입력", message: "이름을 입력해주세요." });
      return;
    }
    if (!validateMemberName(nextName)) {
      showAppAlert({ title: "이름 확인", message: NAME_VALIDATION_MESSAGE });
      return;
    }
    if (nextName.length > 20) {
      showAppAlert({
        title: "이름 확인",
        message: NAME_VALIDATION_LENGTH_MESSAGE,
      });
      return;
    }
    // iOS: 키보드가 열린 상태로 Modal을 닫으면 화면 터치가 막히는 문제가 있어
    // 저장 전에 키보드를 먼저 내린다.
    Keyboard.dismiss();
    setIsSavingName(true);
    try {
      await updateProfileName(nextName);
      setIsNameModalOpen(false);
    } catch (error: any) {
      showAppAlert({
        title: "변경 실패",
        message: error?.message ?? "이름 변경에 실패했습니다.",
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const onPressEditProfile = async () => {
    const result = await pickImageFromLibrary({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result) {
      showAppAlert({
        title: "권한 필요",
        message: "프로필 이미지를 변경하려면 사진 접근 권한이 필요합니다.",
      });
      return;
    }
    if (result.canceled) return;
    const nextUri = result.assets?.[0]?.uri;
    if (!nextUri) return;
    try {
      await uploadProfileImage(nextUri);
    } catch (error: any) {
      showAppAlert({
        title: "업로드 실패",
        message: error?.message ?? "프로필 이미지 업로드에 실패했습니다.",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Screen variant="stack" className="flex-1 bg-gray50">
        <RegistrationHeader title="설정" />
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-[15px] text-gray700">
            로그인 후 이용 가능한 메뉴입니다.
          </Text>
          <Pressable
            className="h-11 items-center justify-center rounded-[10px] bg-primary px-[18px]"
            onPress={navigateToLogin}
          >
            <Text className="text-[15px] font-bold text-white">
              로그인 하러가기
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="설정" />
      <ScrollView className="flex-1">
        <View className="mx-4 mb-3 mt-3 flex-row items-center justify-between rounded-2xl border border-border bg-white p-4">
          <View className="flex-1">
            <Pressable
              className="flex-row items-center gap-1.5"
              onPress={onPressEditName}
            >
              <Text className="text-[17px] font-bold text-black">
                {displayName}
              </Text>
              <Ionicons name="pencil" size={18} color={appColors.gray800} />
            </Pressable>
            <Text className="mt-1 text-[16px] text-gray700">
              {displayPhone}
            </Text>
          </View>
          <View className="h-[70px] w-[70px] items-center justify-center">
            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-gray300 bg-white">
              {profile?.profileImageUri ? (
                <Image
                  source={{ uri: profile.profileImageUri }}
                  className="h-full w-full"
                />
              ) : (
                <Ionicons name="person" size={30} color={appColors.gray400} />
              )}
              {isProfileUpdating ? (
                <View className="absolute inset-0 items-center justify-center bg-black/30">
                  <ActivityIndicator color="#fff" />
                </View>
              ) : null}
            </View>
            <Pressable
              className="absolute bottom-[-2px] right-[-2px] h-[30px] w-[30px] items-center justify-center rounded-full border border-gray300 bg-white"
              onPress={onPressEditProfile}
              disabled={isProfileUpdating}
            >
              <Ionicons name="add" size={18} color={appColors.gray800} />
            </Pressable>
          </View>
        </View>

        <View className="mt-[14px] h-[10px] bg-gray100" />

        <View className="bg-white">
          <ListRow
            title="휴대폰 번호 변경"
            onPress={() => router.push("/settings/phone")}
          />
          <ListRow
            title="비밀번호 변경"
            onPress={() => router.push("/settings/password")}
          />
          <ListRow
            title="알림 설정"
            onPress={() => router.push("/notification-settings")}
          />
        </View>

        <View className="mt-[14px] h-[10px] bg-gray100" />

        <View className="mt-2 bg-white">
          <Pressable
            className="py-[20px] flex-row items-center gap-1.5 px-4"
            onPress={onLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={appColors.danger}
            />
            <Text className="text-[16px] font-bold text-danger">로그아웃</Text>
          </Pressable>
        </View>
      </ScrollView>

      {isNameModalOpen ? (
        <View
          style={[StyleSheet.absoluteFill, { zIndex: 1000, elevation: 1000 }]}
        >
          <View className="flex-1 items-center justify-center bg-black/35 p-5">
            <View className="w-full rounded-[14px] bg-white p-4">
              <Text className="mb-3 text-[18px] font-bold text-gray900">
                이름 변경
              </Text>
              <TextInput
                value={editingName}
                onChangeText={setEditingName}
                className={`h-[46px] rounded-[10px] border px-3 text-[16px] text-gray900 ${
                  editingNameError ? "border-danger" : "border-gray300"
                }`}
                placeholder="이름을 입력하세요"
                placeholderTextColor={appColors.gray600}
                maxLength={20}
              />
              {editingNameError ? (
                <Text className="mt-2 text-[13px] text-danger">
                  {editingNameError}
                </Text>
              ) : null}
              <View className="mt-3 flex-row justify-end gap-2">
                <Pressable
                  onPress={closeNameModal}
                  className="h-[38px] min-w-[70px] items-center justify-center rounded-lg bg-gray100"
                >
                  <Text className="font-semibold text-gray800">취소</Text>
                </Pressable>
                <Pressable
                  onPress={onSaveName}
                  disabled={!canSaveName}
                  className="h-[38px] min-w-[70px] items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: canSaveName
                      ? appColors.primary
                      : appColors.gray400,
                  }}
                >
                  {isSavingName ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="font-bold text-white">저장</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
