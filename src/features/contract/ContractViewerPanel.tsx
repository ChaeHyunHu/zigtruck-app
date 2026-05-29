import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { TRANSFEREE, TRANSFEROR } from "@/src/constants/contract";
import {
  ContractDocumentWebView,
  type ContractDocumentWebViewRef,
} from "@/src/features/contract/ContractDocumentWebView";
import { toContractBool } from "@/src/features/contract/navigation";
import type { ContractInfo } from "@/src/features/contract/types";
import { saveContractJpegToDevice } from "@/src/features/contract/saveContractImage";
import { uploadContractDocumentForDownload } from "@/src/features/contract/uploadContractDownload";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";

type Props = {
  contract: ContractInfo;
  contractWriterType: string;
  onWrite: () => void;
  onContractUpdated?: (patch: Partial<ContractInfo>) => void;
};

export function ContractViewerPanel({
  contract,
  contractWriterType,
  onWrite,
  onContractUpdated,
}: Props) {
  const docRef = useRef<ContractDocumentWebViewRef>(null);
  const [downloading, setDownloading] = useState(false);

  const isTransferor = contractWriterType === TRANSFEROR;
  const isTransferee = contractWriterType === TRANSFEREE;

  const transferorCompleted = toContractBool(contract.transferorCompleted);
  const transfereeCompleted = toContractBool(contract.transfereeCompleted);

  const isOnlyTransferorCompleted =
    isTransferor && transferorCompleted && !transfereeCompleted;

  const isShowWriteButton =
    (isTransferor && !transferorCompleted) ||
    (isTransferee && !transfereeCompleted) ||
    isOnlyTransferorCompleted;

  const writeDisabled = isTransferee && !transferorCompleted;
  const bothCompleted = transferorCompleted && transfereeCompleted;

  const handleDownload = useCallback(async () => {
    if (!bothCompleted || !contract.id) {
      Alert.alert("안내", "양도인·양수인 작성 완료 후 문서 다운로드가 가능합니다.");
      return;
    }

    const fileName = `계약서_${contract.carName || contract.carNumber || "contract"}`;

    setDownloading(true);
    try {
      if (contract.fileUrl) {
        const { message } = await saveContractJpegToDevice({
          remoteUrl: contract.fileUrl,
          fileName,
        });
        Alert.alert("안내", message);
        return;
      }

      const dataUrl = await docRef.current?.captureAsJpeg();
      if (!dataUrl) {
        throw new Error("계약서 이미지를 만들지 못했습니다.");
      }

      const { message } = await saveContractJpegToDevice({ dataUrl, fileName });

      try {
        const url = await uploadContractDocumentForDownload(
          contract.id,
          dataUrl,
          contract.carName,
        );
        onContractUpdated?.({ fileUrl: url });
      } catch {
        /* 서버 동기화 실패해도 로컬 저장은 완료 */
      }

      Alert.alert("안내", message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "문서 다운로드에 실패했습니다.";
      Alert.alert("오류", message);
    } finally {
      setDownloading(false);
    }
  }, [bothCompleted, contract.carName, contract.fileUrl, contract.id, onContractUpdated]);

  const footer = useMemo(() => {
    if (isShowWriteButton) {
      return (
        <DualFooterButtons
          leftLabel="문서 다운로드"
          rightLabel={isOnlyTransferorCompleted ? "수정하기" : "작성하기"}
          onPressLeft={() => {
            void handleDownload();
          }}
          onPressRight={onWrite}
          rightDisabled={writeDisabled}
          safeAreaBottom={false}
          loading={downloading}
        />
      );
    }
    return (
      <View className="border-t border-gray300 bg-white px-4 pb-3 pt-3">
        <Pressable
          onPress={() => void handleDownload()}
          disabled={!bothCompleted || downloading}
          className="h-12 flex-row items-center justify-center rounded-xl bg-primary"
          style={{ opacity: bothCompleted && !downloading ? 1 : 0.45 }}
        >
          {downloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[16px] font-bold text-white">문서 다운로드</Text>
          )}
        </Pressable>
      </View>
    );
  }, [
    bothCompleted,
    downloading,
    handleDownload,
    isOnlyTransferorCompleted,
    isShowWriteButton,
    onWrite,
    writeDisabled,
  ]);

  return (
    <View className="flex-1">
      <View className="min-h-0 flex-1">
        <ContractDocumentWebView ref={docRef} contract={contract} />
      </View>
      {footer}
    </View>
  );
}
