import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { type Href, router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { IMAGE_BASE_URL } from "@/src/constants/url";
import { useAuth } from "@/src/hooks/useAuth";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { navigateToLogin } from "@/src/lib/authNavigation";

const serviceMenus = [
  {
    title: "위탁판매 서비스",
    icon: "car-outline" as const,
    path: "/one-stop-service",
  },
  {
    title: "구매동행 서비스",
    icon: "search-outline" as const,
    path: "/purchase-accompanying-service",
  },
  {
    title: "이전대행 서비스",
    icon: "document-text-outline" as const,
    path: "/transfer-agency-service",
  },
  {
    title: "대출상담 서비스",
    icon: "cash-outline" as const,
    path: "/capital-counsel-service",
  },
];

const infoMenus = [
  { title: "공지사항", path: "/notice" },
  { title: "서비스 이용약관 확인", path: "/terms" },
];

export default function MoreScreen() {
  const { listPaddingBottom } = useScreenInsets();
  const { isAuthenticated, profile } = useAuth();

  const onPressService = (path: string) => {
    router.push(path as Href);
  };

  return (
    <Screen variant="tab" className="flex-1 bg-white">
      <View className="h-14 justify-center border-b border-gray300 px-4">
        <Text className="text-[20px] font-bold text-gray900">더보기</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: listPaddingBottom }}>
        {isAuthenticated ? (
          <>
            <View
              className="mx-4 mt-2 flex-row items-center gap-[10px] rounded-xl border border-gray300 bg-white px-[14px] py-[14px]"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 2,
              }}
            >
              <View className="flex-1">
                <Text className="text-[17px] font-bold text-gray900">
                  {profile?.name || "직트럭 사용자"}
                </Text>
                <Text className="mt-0.5 text-[16px] text-gray700">
                  {profile?.phoneNumber || "-"}
                </Text>
              </View>
              <View className="h-[74px] w-[74px] overflow-hidden items-center justify-center rounded-full border border-gray300 bg-white">
                {profile?.profileImageUri ? (
                  <Image
                    source={{ uri: profile.profileImageUri }}
                    className="h-full w-full"
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person" size={28} color={appColors.gray400} />
                )}
              </View>
            </View>

            <Pressable
              className="mx-4 mt-[10px] h-12 flex-row items-center justify-center gap-1.5 rounded-[10px] border border-gray300 bg-gray100"
              onPress={() => router.push("/settings")}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={appColors.gray900}
              />
              <Text className="text-[16px] font-semibold text-gray900">
                설정
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            className="mx-4 mt-[14px] min-h-[72px] flex-row items-center justify-between rounded-xl border border-gray300 bg-white px-4"
            onPress={navigateToLogin}
          >
            <Text className="text-[18px] font-bold text-gray900">
              회원가입/로그인 하러가기
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={appColors.gray500}
            />
          </Pressable>
        )}

        {isAuthenticated ? (
          <>
            <View className="mt-[14px] h-[10px] bg-gray100" />

            <View className="bg-white px-4 pt-0.5">
              <Pressable
                className="py-[20px] flex-row items-center justify-between border-b border-gray300 last:border-b-0"
                onPress={() => router.push("/license/my")}
              >
                <View className="flex-row items-center gap-[10px]">
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={appColors.gray700}
                  />
                  <Text className="text-[16px] font-semibold text-gray900">
                    내 번호판 관리
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={appColors.gray500}
                />
              </Pressable>
              <Pressable
                className="py-[20px] flex-row items-center justify-between border-b border-gray300 last:border-b-0"
                onPress={() => router.push("/interest")}
              >
                <View className="flex-row items-center gap-[10px]">
                  <Ionicons
                    name="heart-outline"
                    size={24}
                    color={appColors.gray700}
                  />
                  <Text className="text-[16px] font-semibold text-gray900">
                    찜한 차량
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={appColors.gray500}
                />
              </Pressable>
            </View>
          </>
        ) : null}

        <View className="mt-[10px] h-[10px] bg-gray100" />

        <View className="bg-white px-4 pt-0.5">
          <Text className="mb-[10px] mt-4 text-[16px] font-bold text-gray800">
            부가 서비스
          </Text>
          {serviceMenus.map((menu) => (
            <Pressable
              key={menu.title}
              className="py-[20px] flex-row items-center justify-between border-b border-gray300 last:border-b-0"
              onPress={() => onPressService(menu.path)}
            >
              <View className="flex-row items-center gap-[16px]">
                <Ionicons
                  name={menu.icon}
                  size={24}
                  color={appColors.gray700}
                />
                <Text className="text-[18px] font-semibold text-gray900">
                  {menu.title}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={appColors.gray500}
              />
            </Pressable>
          ))}
        </View>

        <View className="mt-[14px] h-[10px] bg-gray100" />

        <View className="bg-white px-4 pt-0.5">
          <Text className="mb-[10px] mt-4 text-[16px] font-bold text-gray800">
            중고 화물차 똑똑하게 사고 파는 법
          </Text>
          <Pressable
            className="mb-1 min-h-[70px] flex-row items-center justify-between"
            onPress={() => onPressService("/guide/sale")}
          >
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-[54px] w-[70px] items-center justify-center rounded-xl bg-[#F1F5FF]">
                <Image
                  source={{ uri: `${IMAGE_BASE_URL}/purchase_guide.png` }}
                  className="h-11 w-11"
                  contentFit="contain"
                />
              </View>
              <View>
                <Text className="mb-[2px] text-[14px] font-semibold text-gray600">
                  판매 가이드 보러가기
                </Text>
                <Text className="text-[16px] font-bold text-gray800">
                  중고 화물차 판매 가이드
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={appColors.gray500}
            />
          </Pressable>

          <Pressable
            className="mb-2 min-h-[70px] flex-row items-center justify-between"
            onPress={() => onPressService("/guide/perchase")}
          >
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-[54px] w-[70px] items-center justify-center rounded-xl bg-[#F1F5FF]">
                <Image
                  source={{ uri: `${IMAGE_BASE_URL}/sale_guide.png` }}
                  className="h-11 w-11"
                  contentFit="contain"
                />
              </View>
              <View>
                <Text className="mb-[3px] text-[14px] font-semibold text-gray600">
                  구매 가이드 보러가기
                </Text>
                <Text className="text-[16px] font-bold text-gray800">
                  중고 화물차 구매 가이드
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={appColors.gray500}
            />
          </Pressable>
        </View>

        <View className="mt-[14px] h-[10px] bg-gray100" />

        <View className="bg-white px-4 py-0.5">
          {infoMenus.map((menu) => (
            <Pressable
              key={menu.title}
              className="py-[20px] flex-row items-center justify-between border-b border-gray300 last:border-b-0"
              onPress={() => onPressService(menu.path)}
            >
              <View className="flex-row items-center gap-[10px]">
                <Text className="text-[16px] font-semibold text-gray900">
                  {menu.title}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={appColors.gray500}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
