import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from "react-native";

import { fetchContract } from "@/src/api/contract";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { TRANSFEREE, TRANSFEROR } from "@/src/constants/contract";
import { ContractFormPanel } from "@/src/features/contract/ContractFormPanel";
import { ContractViewerPanel } from "@/src/features/contract/ContractViewerPanel";
import { normalizeContractInfo } from "@/src/features/contract/navigation";
import { INITIAL_CONTRACT_INFO, type ContractInfo } from "@/src/features/contract/types";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

export function ContractScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    chatRoomId?: string;
    contractWriterType?: string;
    productPrice?: string;
  }>();

  const chatRoomId = params.chatRoomId ?? "";
  const contractWriterType =
    params.contractWriterType === TRANSFEREE ? TRANSFEREE : TRANSFEROR;
  const listProductPrice = params.productPrice ? Number(params.productPrice) : undefined;

  const [page, setPage] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [contractInfo, setContractInfo] = useState<ContractInfo>(INITIAL_CONTRACT_INFO);
  const [blockTransfereeOpen, setBlockTransfereeOpen] = useState(false);

  const title =
    page === 1
      ? "안심 전자계약서"
      : contractWriterType === TRANSFEROR
        ? "양도인 계약서 작성하기"
        : "양수인 계약서 작성하기";

  const loadContract = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!chatRoomId) return;
      if (!options?.silent) setLoading(true);
      try {
        const raw = await fetchContract({ chatRoomId, contractWriterType });
        const data = normalizeContractInfo({
          ...INITIAL_CONTRACT_INFO,
          ...raw,
          id: raw.id ?? 0,
        });
        setContractInfo(data);

        if (contractWriterType === TRANSFEREE && !data.transferorCompleted) {
          setBlockTransfereeOpen(true);
        }
      } catch {
        Alert.alert("오류", "계약서 정보를 불러오지 못했습니다.", [
          { text: "확인", onPress: () => router.back() },
        ]);
      } finally {
        if (!options?.silent) setLoading(false);
      }
    },
    [chatRoomId, contractWriterType, router],
  );

  useEffect(() => {
    void loadContract();
  }, [loadContract]);

  const onBack = () => {
    if (page === 2) {
      setPage(1);
      return;
    }
    router.back();
  };

  const onWrite = () => {
    if (contractWriterType === TRANSFEREE && !contractInfo.transferorCompleted) {
      setBlockTransfereeOpen(true);
      return;
    }
    setPage(2);
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title={title} onBack={onBack} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
        </View>
      ) : (
        <View className="flex-1">
          <View
            className="flex-1"
            style={page === 2 ? { height: 0, overflow: "hidden", opacity: 0 } : undefined}
            pointerEvents={page === 1 ? "auto" : "none"}
          >
        <ContractViewerPanel
          contract={contractInfo}
          contractWriterType={contractWriterType}
          onWrite={onWrite}
          onContractUpdated={(patch) =>
            setContractInfo((prev) => ({ ...prev, ...patch }))
          }
        />
          </View>

          {page === 2 ? (
            <View className="absolute inset-0 flex-1 bg-white">
              <ContractFormPanel
                chatRoomId={chatRoomId}
                contractWriterType={contractWriterType}
                contractInfo={contractInfo}
                setContractInfo={setContractInfo}
                listProductPrice={listProductPrice}
                onSaved={() => {
                  setPage(1);
                  void loadContract({ silent: true });
                }}
              />
            </View>
          ) : null}
        </View>
      )}

      <Modal visible={blockTransfereeOpen} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-8">
          <View className="w-full overflow-hidden rounded-2xl bg-white px-5 py-6">
            <Text className="text-center text-[16px] leading-6 text-gray800">
              양수인이 계약서를 작성하기 전,{"\n"}
              양도인이 먼저 계약서를 작성해야 합니다.{"\n"}
              양도인에게 계약서 작성을 요청 해주세요.
            </Text>
            <Pressable
              onPress={() => setBlockTransfereeOpen(false)}
              className="mt-5 h-11 items-center justify-center rounded-lg bg-primary"
            >
              <Text className="text-[16px] font-semibold text-white">확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
