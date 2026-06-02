import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { Screen } from "@/src/components/common/Screen";
import { showAppAlert } from "@/src/providers/appDialog";
import { DriveAddButtons } from "@/src/features/drive/components/DriveAddButtons";
import { DriveCalendar } from "@/src/features/drive/components/DriveCalendar";
import { DriveDaySheet } from "@/src/features/drive/components/DriveDaySheet";
import { DriveDaySheetBackdrop } from "@/src/features/drive/components/DriveDaySheetBackdrop";
import { DriveLogBottomSheet } from "@/src/features/drive/components/DriveLogBottomSheet";
import { FuelFormBottomSheet } from "@/src/features/drive/components/FuelFormBottomSheet";
import { OtherExpenseFormBottomSheet } from "@/src/features/drive/components/OtherExpenseFormBottomSheet";
import { DriveMonthStats } from "@/src/features/drive/components/DriveMonthStats";
import { DriveTutorialFinalModal } from "@/src/features/drive/components/DriveTutorialFinalModal";
import {
  DriveTutorialProvider,
} from "@/src/features/drive/driveTutorialContext";
import { DriveOnboardingView } from "@/src/features/drive/DriveOnboardingView";
import {
  fetchDriveHistory,
  fetchDriveVehicleInfo,
  patchOutstandingReceived,
} from "@/src/features/drive/driveApi";
import {
  formatYYYYMM,
  formatYYYYMMDD,
  formatWeekdayLabel,
  isSameDay,
  startOfMonth,
} from "@/src/features/drive/driveDateUtils";
import {
  TUTORIAL_STEP_DELAY_MS,
  type DriveTutorialStep,
} from "@/src/features/drive/driveTutorialSteps";
import { runTutorialLayoutReady } from "@/src/features/drive/runTutorialLayoutReady";
import {
  getDriveOnboardingSeen,
  getDriveTutorial,
  setDriveOnboardingSeen,
  setDriveTutorial,
} from "@/src/features/drive/driveStorage";
import type {
  DriveHistoryItem,
  DriveInfoResponse,
  FuelingHistoryItem,
  DriveVehicleInfo,
  TransportInfoItem,
  IncomeHistoryDay,
  OtherExpenseWithCategory,
} from "@/src/features/drive/types";

type DaySheetLists = {
  driveItems: DriveHistoryItem[];
  fuelItems: FuelingHistoryItem[];
  otherItems: OtherExpenseWithCategory[];
};

function listsFromDriveInfo(data: DriveInfoResponse): DaySheetLists {
  return {
    driveItems: data.driveHistoryList ?? [],
    fuelItems: (data.fuelingHistories ?? []) as FuelingHistoryItem[],
    otherItems: data.otherExpensesHistory ?? [],
  };
}

import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { navigateToLogin } from "@/src/lib/authNavigation";


export function DriveHomeScreen() {
  const insets = useAppSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [vehicle, setVehicle] = useState<DriveVehicleInfo | null>(null);
  const [driveData, setDriveData] = useState<DriveInfoResponse | null>(null);
  /** 캘린더 전용 — 날짜 탭(loadDaySheet) 시 갱신하지 않아 깜빡임 방지 */
  const [calendarDayList, setCalendarDayList] = useState<IncomeHistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [daySheetLists, setDaySheetLists] = useState<DaySheetLists | null>(null);
  /** 시트에 표시 중인 목록이 어느 날짜 기준인지 (웹 react-query keepPreviousData와 동일) */
  const [daySheetListsDay, setDaySheetListsDay] = useState<string | null>(null);
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;
  const daySheetListsRef = useRef(daySheetLists);
  daySheetListsRef.current = daySheetLists;
  const daySheetListsDayRef = useRef(daySheetListsDay);
  daySheetListsDayRef.current = daySheetListsDay;
  const [logSheetVisible, setLogSheetVisible] = useState(false);
  const [logEditItem, setLogEditItem] = useState<DriveHistoryItem | null>(null);
  const [fuelSheetVisible, setFuelSheetVisible] = useState(false);
  const [otherExpenseSheetVisible, setOtherExpenseSheetVisible] = useState(false);
  const [vehiclePromptOpen, setVehiclePromptOpen] = useState(false);

  const [tutorialStep, setTutorialStep] = useState<DriveTutorialStep | null>(null);
  const [showTutorialFinal, setShowTutorialFinal] = useState(false);
  const [tutorialOpenCategory, setTutorialOpenCategory] = useState(false);
  const tutorialInitRef = useRef(false);
  const tutorialSyncingRef = useRef(false);

  const loadVehicle = useCallback(async () => {
    const info = await fetchDriveVehicleInfo();
    setVehicle(info);
    return info;
  }, []);

  const loadHistory = useCallback(
    async (
      vehicleId: number,
      date: Date,
      options?: { syncDaySheet?: boolean },
    ) => {
      const data = await fetchDriveHistory({
        driveVehicleInfoId: vehicleId,
        baseYearMonth: formatYYYYMM(date),
        baseDay: formatYYYYMMDD(date),
      });
      const baseDay = formatYYYYMMDD(date);
      setDriveData(data);
      setCalendarDayList(data.incomeHistoryDayList ?? []);
      if (options?.syncDaySheet !== false) {
        setDaySheetLists(listsFromDriveInfo(data));
        setDaySheetListsDay(baseDay);
      }
      return data;
    },
    [],
  );

  const loadDaySheet = useCallback(async (vehicleId: number, date: Date) => {
    const baseDay = formatYYYYMMDD(date);
    const data = await fetchDriveHistory({
      driveVehicleInfoId: vehicleId,
      baseYearMonth: formatYYYYMM(date),
      baseDay,
    });
    return { baseDay, lists: listsFromDriveInfo(data) };
  }, []);

  const applyDaySheetResult = useCallback(
    (baseDay: string, lists: DaySheetLists) => {
      if (formatYYYYMMDD(selectedDateRef.current) !== baseDay) return;
      setDaySheetLists(lists);
      setDaySheetListsDay(baseDay);
    },
    [],
  );

  const refreshDaySheet = useCallback(async () => {
    const id = vehicle?.id;
    if (!id) return;
    const date = selectedDateRef.current;
    const result = await loadDaySheet(id, date);
    if (result) applyDaySheetResult(result.baseDay, result.lists);
    void loadHistory(id, date, { syncDaySheet: false });
  }, [applyDaySheetResult, loadDaySheet, loadHistory, vehicle?.id]);

  const handleToggleReceived = useCallback(
    async (info: TransportInfoItem) => {
      if (!info.id) return;
      try {
        await patchOutstandingReceived([
          { transportInfoId: info.id, isReceived: !info.isReceivedCost },
        ]);
        await refreshDaySheet();
      } catch {
        showAppAlert({ title: "오류", message: "수금 상태 변경에 실패했습니다." });
      }
    },
    [refreshDaySheet],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const info = await loadVehicle();
      if (info?.id) {
        await loadHistory(info.id, selectedDateRef.current);
      } else {
        setDriveData(null);
        setCalendarDayList([]);
      }
    } catch {
      setDriveData(null);
      setCalendarDayList([]);
    } finally {
      setLoading(false);
    }
  }, [loadHistory, loadVehicle]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    getDriveOnboardingSeen().then((seen) => {
      setShowOnboarding(!seen);
      if (seen) void refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 진입 1회만
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated || showOnboarding || tutorialStep !== null) return;
      void loadVehicle().then((info) => {
        if (info?.id) {
          void loadHistory(info.id, selectedDateRef.current, {
            syncDaySheet: false,
          });
        }
      });
    }, [
      isAuthenticated,
      loadHistory,
      loadVehicle,
      showOnboarding,
      tutorialStep,
    ]),
  );

  const prepareTutorialUi = useCallback((step: DriveTutorialStep) => {
    // 시트는 누적식으로 유지한다. 한 번 열린 시트는 다음 단계에서도 mount 상태로 두고
    // 위에 새 시트만 올렸다 내렸다 한다 → 닫혔다 다시 열리며 깜빡이는 현상 제거.
    switch (step) {
      case 0:
        setDaySheetOpen(false);
        setLogSheetVisible(false);
        setOtherExpenseSheetVisible(false);
        break;
      case 1:
        setDaySheetOpen(true);
        setLogSheetVisible(false);
        setOtherExpenseSheetVisible(false);
        break;
      case 2:
        // daySheet 유지 + logSheet을 위에 띄움
        setDaySheetOpen(true);
        setLogSheetVisible(true);
        setOtherExpenseSheetVisible(false);
        break;
      case 3:
        // logSheet만 close, daySheet은 그대로 → + 기타내역 highlight
        setDaySheetOpen(true);
        setLogSheetVisible(false);
        setOtherExpenseSheetVisible(false);
        break;
      case 4:
      case 5:
        // daySheet 유지 + otherExpenseSheet를 위에 띄움
        setDaySheetOpen(true);
        setLogSheetVisible(false);
        setOtherExpenseSheetVisible(true);
        break;
      default:
        break;
    }
  }, []);

  /** 웹 reactour goTo(step) + setStep(step) — UI만 전환, hole은 앵커 onLayout이 맞춤 */
  const goToTutorialStep = useCallback(
    (step: DriveTutorialStep) => {
      setTutorialStep(step);
      prepareTutorialUi(step);
    },
    [prepareTutorialUi],
  );

  const advanceTutorialAfterDelay = useCallback(
    (next: DriveTutorialStep, beforeAdvance?: () => void) => {
      if (tutorialSyncingRef.current) return;
      tutorialSyncingRef.current = true;
      beforeAdvance?.();
      setTimeout(() => {
        goToTutorialStep(next);
        tutorialSyncingRef.current = false;
      }, TUTORIAL_STEP_DELAY_MS);
    },
    [goToTutorialStep],
  );

  useEffect(() => {
    if (!vehicle?.id || showOnboarding || loading || !driveData) return;
    if (tutorialInitRef.current || tutorialStep !== null) return;

    void (async () => {
      const tutorial = await getDriveTutorial();
      if (tutorial === "false") return;
      const shouldStart =
        tutorial === "true" || Boolean(driveData.isFirstDriveHistory);
      if (!shouldStart) return;

      tutorialInitRef.current = true;
      const today = new Date();
      setCalendarMonth(startOfMonth(today));
      setSelectedDate(today);
      await loadHistory(vehicle.id, today);
      goToTutorialStep(0);
    })();
  }, [driveData, goToTutorialStep, loadHistory, loading, showOnboarding, tutorialStep, vehicle?.id]);

  const completeOnboarding = async () => {
    await setDriveOnboardingSeen(true);
    setShowOnboarding(false);
    refresh();
  };

  const endTutorial = async () => {
    await setDriveTutorial(false);
    setTutorialOpenCategory(false);
    setOtherExpenseSheetVisible(false);
    setLogSheetVisible(false);
    setDaySheetOpen(false);
    setTutorialStep(null);
  };

  // 웹 onClickLastTutorial: 시트·팝업 전부 닫은 뒤 완료 배너 표시
  const finishTutorial = async () => {
    if (tutorialSyncingRef.current) return;
    tutorialSyncingRef.current = true;
    try {
      await setDriveTutorial(false);
      setTutorialOpenCategory(false);
      setOtherExpenseSheetVisible(false);
      setLogSheetVisible(false);
      setDaySheetOpen(false);
      await runTutorialLayoutReady(320);
      setTutorialStep(null);
      setShowTutorialFinal(true);
    } finally {
      tutorialSyncingRef.current = false;
    }
  };

  const skipTutorial = async () => {
    await endTutorial();
  };

  const requireVehicle = (): number | null => {
    if (!vehicle?.id) {
      setVehiclePromptOpen(true);
      return null;
    }
    return vehicle.id;
  };

  const onSelectDate = useCallback(
    (date: Date) => {
      if (tutorialStep === 0 && !isSameDay(date, new Date())) return;
      if (tutorialStep !== null && tutorialStep !== 0) return;
      const id = requireVehicle();
      if (!id) return;
      const baseDay = formatYYYYMMDD(date);
      if (!isSameDay(date, selectedDateRef.current)) {
        setSelectedDate(date);
      }
      setDaySheetOpen(true);
      if (
        daySheetListsDayRef.current === baseDay &&
        daySheetListsRef.current !== null
      ) {
        return;
      }
      if (tutorialStep === 0) {
        advanceTutorialAfterDelay(1);
        void loadDaySheet(id, date)
          .then((result) => {
            if (result) applyDaySheetResult(result.baseDay, result.lists);
          })
          .catch(() => undefined);
        return;
      }
      void loadDaySheet(id, date)
        .then((result) => {
          if (result) applyDaySheetResult(result.baseDay, result.lists);
        })
        .catch(() => {
          showAppAlert({ title: "오류", message: "일지 정보를 불러오지 못했습니다." });
        });
    },
    [
      advanceTutorialAfterDelay,
      applyDaySheetResult,
      loadDaySheet,
      tutorialStep,
      vehicle?.id,
    ],
  );

  const onChangeMonth = useCallback(
    (date: Date) => {
      if (tutorialStep !== null) return;
      setCalendarMonth(startOfMonth(date));
      if (vehicle?.id) {
        void loadHistory(vehicle.id, date, { syncDaySheet: false });
      }
    },
    [loadHistory, tutorialStep, vehicle?.id],
  );

  const driveParams = () => ({
    baseDay: formatYYYYMMDD(selectedDate),
    driveVehicleInfoId: String(vehicle!.id),
  });

  const navigateWithDate = (path: string) => {
    if (tutorialStep !== null) return;
    if (!requireVehicle()) return;
    router.push({
      pathname: path as never,
      params: driveParams(),
    });
  };

  const openLogForm = (item?: DriveHistoryItem) => {
    if (!requireVehicle()) return;
    setLogEditItem(item ?? null);
    setLogSheetVisible(true);
  };

  const handleLogSaved = async () => {
    const id = vehicle?.id;
    if (!id) return;
    try {
      await loadHistory(id, selectedDate);
    } catch {
      /* ignore */
    }
  };

  const openFuelForm = (item?: FuelingHistoryItem) => {
    if (!requireVehicle()) return;
    if (item) {
      router.push({
        pathname: "/drive/fuel/[id]",
        params: {
          ...driveParams(),
          id: String(item.id),
          data: JSON.stringify(item),
        },
      });
      return;
    }
    setFuelSheetVisible(true);
  };

  const openOtherExpenseForm = () => {
    if (!requireVehicle()) return;
    setOtherExpenseSheetVisible(true);
  };

  const handleTutorialSpotPress = () => {
    if (tutorialSyncingRef.current || tutorialStep === null) return;
    if (tutorialStep === 0) {
      const today = new Date();
      const id = vehicle?.id;
      if (!id) return;
      setSelectedDate(today);
      setDaySheetOpen(true);
      void loadDaySheet(id, today)
        .then((result) => {
          if (result) applyDaySheetResult(result.baseDay, result.lists);
        })
        .catch(() => undefined);
      advanceTutorialAfterDelay(1);
      return;
    }
    if (tutorialStep === 1) {
      advanceTutorialAfterDelay(2, () => openLogForm());
      return;
    }
    if (tutorialStep === 2) {
      advanceTutorialAfterDelay(3, () => setLogSheetVisible(false));
      return;
    }
    if (tutorialStep === 3) {
      advanceTutorialAfterDelay(4, () => openOtherExpenseForm());
      return;
    }
    if (tutorialStep === 5) {
      void finishTutorial();
    }
  };

  const handleTutorialCategoryPress = () => {
    if (tutorialStep !== 4 || tutorialSyncingRef.current) return;
    setTutorialOpenCategory(true);
    advanceTutorialAfterDelay(5, () => setTutorialOpenCategory(false));
  };

  const today = new Date();
  const tutorialActive = tutorialStep !== null;

  const tutorialContent = (() => {
    if (tutorialStep === 0) {
      return (
        <Pressable
          onPress={handleTutorialSpotPress}
          className="flex-row items-center"
        >
          <View className="mr-2 h-[30px] w-[30px] items-center justify-center rounded-md bg-white">
            <Text className="text-[6px] leading-[6px] text-gray800">
              {formatWeekdayLabel(today)}
            </Text>
            <Text className="mt-0.5 text-[14px] font-bold leading-[14px] text-gray900">
              {today.getDate()}
            </Text>
          </View>
          <Text className="flex-1 text-[15px] leading-[22px] text-white">
            운행일지를 추가할 날짜를 선택해주세요
          </Text>
        </Pressable>
      );
    }
    if (tutorialStep === 1) {
      return (
        <View className="flex-row items-center">
          <Ionicons name="add-circle" size={30} color="#FFFFFF" />
          <Text className="ml-2.5 flex-1 text-[15px] leading-[22px] text-white">
            내역에서 [+일지] 버튼을 클릭해{"\n"}오늘의 운행일지를 추가하세요
          </Text>
        </View>
      );
    }
    if (tutorialStep === 2) {
      return (
        <Pressable onPress={handleTutorialSpotPress} className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={30} color="#FFFFFF" />
          <Text className="ml-2.5 flex-1 text-[15px] leading-[22px] text-white">
            차량이 회차했다면 회차를 선택해주세요.
          </Text>
        </Pressable>
      );
    }
    if (tutorialStep === 5) {
      return (
        <Pressable onPress={handleTutorialSpotPress} className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={30} color="#FFFFFF" />
          <Text className="ml-2.5 flex-1 text-[15px] leading-[22px] text-white">
            편집 기능으로 자유롭게{"\n"}카테고리를 관리해보세요
          </Text>
        </Pressable>
      );
    }
    if (tutorialStep === 3) {
      return (
        <Pressable onPress={handleTutorialSpotPress} className="flex-row items-center">
          <Ionicons name="add-circle" size={30} color="#FFFFFF" />
          <Text className="ml-2.5 flex-1 text-[15px] leading-[22px] text-white">
            [+기타내역] 버튼을 클릭해{"\n"}기타지출과 기타수익을 추가하세요
          </Text>
        </Pressable>
      );
    }
    if (tutorialStep === 4) {
      return (
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={30} color="#FFFFFF" />
          <Text className="ml-2.5 flex-1 text-[15px] leading-[22px] text-white">
            지출과 수익 분류에 따라 카테고리를{"\n"}별도로 관리할 수 있어요
          </Text>
        </View>
      );
    }
    return null;
  })();

  if (showOnboarding === null) {
    return (
      <Screen className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </Screen>
    );
  }

  if (showOnboarding) {
    return <DriveOnboardingView onComplete={completeOnboarding} />;
  }

  return (
    <DriveTutorialProvider
      isActive={tutorialActive}
      step={tutorialStep}
      onSkip={skipTutorial}
      onHolePress={
        tutorialStep === 4
          ? handleTutorialCategoryPress
          : handleTutorialSpotPress
      }
      tooltipContent={tutorialContent}
    >
    <Screen className="flex-1 bg-white">
      <RegistrationHeader
        title="운행일지"
        rightElement={
          vehicle?.id && !tutorialActive ? (
            <Pressable onPress={() => router.push("/drive/vehicle")} hitSlop={8}>
              <Text className="text-[14px] font-medium text-gray800">
                차량정보 수정
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      <DriveAddButtons
        onPressLog={() => {
          if (tutorialActive) return;
          openLogForm();
        }}
        onPressFuel={() => {
          if (tutorialActive) return;
          openFuelForm();
        }}
        onPressOther={() => {
          if (tutorialActive) return;
          openOtherExpenseForm();
        }}
      />

      {loading ? (
        <ActivityIndicator className="mt-10" />
      ) : (
        <ScrollView
          className="flex-1 bg-gray100"
          scrollEnabled={!tutorialActive}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <DriveCalendar
            month={calendarMonth}
            selectedDate={selectedDate}
            dayData={calendarDayList}
            onSelectDate={onSelectDate}
            onChangeMonth={onChangeMonth}
          />
          {vehicle?.id ? (
            <DriveMonthStats
              className="flex-1"
              month={calendarMonth}
              data={driveData?.incomeHistoryMonth}
              bottomInset={Math.max(insets.bottom, 8)}
              onPressOutstanding={() => navigateWithDate("/drive/outstanding-amount")}
              onPressFuel={() => navigateWithDate("/drive/fuel")}
              onPressOtherExpense={() => navigateWithDate("/drive/other-expense")}
              onPressOtherIncome={() => navigateWithDate("/drive/other-expense")}
            />
          ) : (
            <View className="mx-4 mt-6 rounded-xl border border-primary bg-[#E7EFFF] p-4">
              <Text className="text-[16px] font-bold text-primary">차량정보 등록</Text>
              <Text className="mt-2 text-[14px] text-gray700">
                운행일지 작성을 위해 차량의 기본 정보를 입력해주세요.
              </Text>
              <Pressable
                onPress={() => router.push("/drive/vehicle")}
                className="mt-3 self-end rounded-lg bg-primary px-4 py-2"
              >
                <Text className="text-[14px] font-semibold text-white">등록하기</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      <DriveDaySheetBackdrop
        visible={
          daySheetOpen &&
          Boolean(vehicle?.id) &&
          !logSheetVisible &&
          !otherExpenseSheetVisible
        }
        onPress={() => {
          if (tutorialActive && tutorialStep !== 1) return;
          setDaySheetOpen(false);
        }}
      />

      <DriveDaySheet
        visible={daySheetOpen && Boolean(vehicle?.id)}
        selectedDate={selectedDate}
        listsSettled={
          daySheetListsDay === formatYYYYMMDD(selectedDate) && daySheetLists !== null
        }
        driveItems={daySheetLists?.driveItems ?? []}
        fuelItems={daySheetLists?.fuelItems ?? []}
        otherItems={daySheetLists?.otherItems ?? []}
        highlightAddLog={false}
        showBackdrop={false}
        noModal
        onClose={() => {
          if (tutorialActive && tutorialStep !== 1) return;
          setDaySheetOpen(false);
        }}
        onAddLog={() => {
          if (tutorialStep === 1) {
            void handleTutorialSpotPress();
            return;
          }
          setDaySheetOpen(false);
          openLogForm();
        }}
        onAddFuel={() => {
          if (tutorialActive) return;
          setDaySheetOpen(false);
          openFuelForm();
        }}
        onAddOther={() => {
          if (tutorialStep === 3) {
            void handleTutorialSpotPress();
            return;
          }
          if (tutorialActive) return;
          setDaySheetOpen(false);
          openOtherExpenseForm();
        }}
        onPressDrive={(item) => {
          setDaySheetOpen(false);
          openLogForm(item);
        }}
        onPressFuel={(item) => {
          setDaySheetOpen(false);
          openFuelForm(item);
        }}
        onPressOther={() => {
          setDaySheetOpen(false);
          navigateWithDate("/drive/other-expense");
        }}
        onToggleReceived={(info) => {
          void handleToggleReceived(info);
        }}
      />

      <DriveTutorialFinalModal
        visible={showTutorialFinal}
        onClose={() => setShowTutorialFinal(false)}
      />

      <ConfirmDialog
        visible={vehiclePromptOpen}
        title="차량 정보 등록"
        rightLabel="등록하기"
        onLeft={() => setVehiclePromptOpen(false)}
        onRight={() => {
          setVehiclePromptOpen(false);
          router.push("/drive/vehicle");
        }}
      >
        <Text className="text-center text-[14px] text-gray700">
          운행일지를 이용하기 위해{"\n"}차량 정보를 등록해주세요.
        </Text>
      </ConfirmDialog>

      {vehicle?.id ? (
        <>
          <DriveLogBottomSheet
            visible={logSheetVisible}
            driveVehicleInfoId={vehicle.id}
            baseDay={formatYYYYMMDD(selectedDate)}
            initial={logEditItem}
            noModal={tutorialActive}
            onClose={() => {
              setLogSheetVisible(false);
              setLogEditItem(null);
            }}
            onSaved={() => void handleLogSaved()}
          />
          <FuelFormBottomSheet
            visible={fuelSheetVisible}
            driveVehicleInfoId={vehicle.id}
            defaultRefuelDay={formatYYYYMMDD(selectedDate)}
            onClose={() => setFuelSheetVisible(false)}
            onRefetch={() => void handleLogSaved()}
          />
          <OtherExpenseFormBottomSheet
            visible={otherExpenseSheetVisible}
            driveVehicleInfoId={vehicle.id}
            baseDay={formatYYYYMMDD(selectedDate)}
            tutorialStep={tutorialStep}
            tutorialOpenCategory={tutorialOpenCategory}
            noModal={tutorialActive}
            onTutorialCategoryPress={handleTutorialCategoryPress}
            onClose={() => setOtherExpenseSheetVisible(false)}
            onSaved={() => void handleLogSaved()}
          />
        </>
      ) : null}

    </Screen>
    </DriveTutorialProvider>
  );
}
