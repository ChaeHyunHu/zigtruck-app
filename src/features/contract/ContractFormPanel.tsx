import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { createContract, updateContract } from "@/src/api/contract";
import { showAppAlert } from "@/src/providers/appDialog";
import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { appColors } from "@/src/constants/colors";
import { TRANSFEREE, TRANSFEROR } from "@/src/constants/contract";
import {
  ContractChevronSuffix,
  ContractSignatureBox,
  ContractUnderlineInput,
  ContractVehicleSummary,
} from "@/src/features/contract/components/ContractField";
import {
  clearSignaturePad,
  SignaturePadWebView,
} from "@/src/features/contract/SignaturePadWebView";
import type { ContractInfo, ContractRequest } from "@/src/features/contract/types";
import {
  validateContractName,
  validateContractRegistrationNumber,
  validatePositiveAmount,
} from "@/src/features/contract/validation";
import { DaumPostcodeWebView } from "@/src/features/drive/components/DaumPostcodeWebView";
import { DriveDateCalendarPicker } from "@/src/features/drive/components/DriveDateCalendarPicker";
import { formatYYYYMMDD } from "@/src/features/drive/driveDateUtils";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

type Props = {
  chatRoomId: string;
  contractWriterType: string;
  contractInfo: ContractInfo;
  setContractInfo: React.Dispatch<React.SetStateAction<ContractInfo>>;
  listProductPrice?: number;
  onSaved: () => void;
};

type PaymentDateField =
  | "downPaymentDate"
  | "intermediatePaymentDate"
  | "balancePaymentDate";

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function ContractFormPanel({
  chatRoomId,
  contractWriterType,
  contractInfo,
  setContractInfo,
  listProductPrice,
  onSaved,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [paymentDateField, setPaymentDateField] = useState<PaymentDateField | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");
  const [regError, setRegError] = useState("");
  const [tradingError, setTradingError] = useState("");
  const [downPaymentError, setDownPaymentError] = useState("");
  const [draftSign, setDraftSign] = useState<string | null>(null);
  const signWebRef = useRef<WebView>(null);

  const isTransferor = contractWriterType === TRANSFEROR;
  const addressKey = isTransferor ? "transferorAddress" : "transfereeAddress";
  const nameKey = isTransferor ? "transferorName" : "transfereeName";
  const phoneKey = isTransferor ? "transferorPhoneNumber" : "transfereePhoneNumber";
  const regKey = isTransferor ? "transferorRegistrationNumber" : "transfereeRegistrationNumber";
  const signKey = isTransferor ? "transferorSignImageUrl" : "transfereeSignImageUrl";
  const insets = useAppSafeAreaInsets();

  const signatureUrl = contractInfo[signKey as keyof ContractInfo] as string;

  const paymentDatePickerValue = paymentDateField
    ? String(contractInfo[paymentDateField] ?? "")
    : "";

  const signSheetHeight = useMemo(
    () => 56 + 130 + 44 + 48 + 20 + Math.max(insets.bottom, 8),
    [insets.bottom],
  );

  useEffect(() => {
    if (!isTransferor) return;
    const trading = Number(contractInfo.tradingAmount) || 0;
    const down = Number(contractInfo.downPayment) || 0;
    const mid = Number(contractInfo.intermediatePayment) || 0;
    if (trading > 0 && (down > 0 || mid > 0)) {
      const balance = Math.max(trading - down - mid, 0);
      setContractInfo((prev) => ({ ...prev, balance }));
    }
  }, [
    contractInfo.tradingAmount,
    contractInfo.downPayment,
    contractInfo.intermediatePayment,
    isTransferor,
    setContractInfo,
  ]);

  const canSubmit = useMemo(() => {
    if (isTransferor) {
      const base =
        contractInfo.tradingAmount &&
        contractInfo.downPayment &&
        contractInfo.downPaymentDate &&
        contractInfo.transferorAddress &&
        contractInfo.transferorName &&
        contractInfo.transferorPhoneNumber &&
        contractInfo.transferorRegistrationNumber &&
        contractInfo.transferorSignImageUrl &&
        !tradingError &&
        !downPaymentError &&
        !nameError &&
        !regError;
      if (contractInfo.balance) return base && contractInfo.balancePaymentDate;
      if (contractInfo.intermediatePayment) return base && contractInfo.intermediatePaymentDate;
      return Boolean(base);
    }
    return Boolean(
      contractInfo.transfereeAddress &&
        contractInfo.transfereeName &&
        contractInfo.transfereePhoneNumber &&
        contractInfo.transfereeRegistrationNumber &&
        contractInfo.transfereeSignImageUrl &&
        !nameError &&
        !regError,
    );
  }, [contractInfo, downPaymentError, isTransferor, nameError, regError, tradingError]);

  const buildRequest = useCallback((): ContractRequest => {
    if (isTransferor) {
      return {
        balance: contractInfo.balance != null ? Number(contractInfo.balance) : null,
        balancePaymentDate: contractInfo.balancePaymentDate,
        carName: contractInfo.carName,
        carNumber: contractInfo.carNumber,
        carType: contractInfo.carType,
        carUse: contractInfo.carUse,
        chatRoomId: Number(chatRoomId),
        contractWriterType,
        downPayment: Number(contractInfo.downPayment),
        downPaymentDate: contractInfo.downPaymentDate,
        identificationNumber: contractInfo.identificationNumber || "",
        intermediatePayment: contractInfo.intermediatePayment
          ? Number(contractInfo.intermediatePayment)
          : null,
        intermediatePaymentDate: contractInfo.intermediatePaymentDate,
        motorType: contractInfo.motorType || "",
        tradingAmount: Number(contractInfo.tradingAmount) || 0,
        transferorAddress: contractInfo.transferorAddress,
        transferorName: contractInfo.transferorName,
        transferorPhoneNumber: contractInfo.transferorPhoneNumber,
        transferorRegistrationNumber: contractInfo.transferorRegistrationNumber.replace(/-/g, ""),
        transferorSignImageUrl: contractInfo.transferorSignImageUrl,
        year: contractInfo.year,
        additionalConditions: contractInfo.additionalConditions || "",
      };
    }
    return {
      chatRoomId: Number(chatRoomId),
      contractWriterType,
      transfereeAddress: contractInfo.transfereeAddress,
      transfereeName: contractInfo.transfereeName,
      transfereePhoneNumber: contractInfo.transfereePhoneNumber,
      transfereeRegistrationNumber: contractInfo.transfereeRegistrationNumber.replace(/-/g, ""),
      transfereeSignImageUrl: contractInfo.transfereeSignImageUrl,
    };
  }, [chatRoomId, contractInfo, contractWriterType, isTransferor]);

  const onSave = useCallback(async () => {
    setSubmitting(true);
    try {
      const body = buildRequest();
      if (contractInfo.id && isTransferor) {
        await updateContract(contractInfo.id, body);
        showAppAlert({ title: "완료", message: "전자계약서가 수정되었어요." });
      } else {
        await createContract(body);
        showAppAlert({ title: "완료", message: "전자계약서가 저장되었어요." });
      }
      onSaved();
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "저장에 실패했습니다.";
      showAppAlert({ title: "오류", message });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }, [buildRequest, contractInfo.id, isTransferor, onSaved]);

  return (
    <>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {isTransferor ? (
          <View className="gap-7">
            <ContractVehicleSummary contract={contractInfo} />
            <ContractUnderlineInput
              label="매매금액"
              required
              value={contractInfo.tradingAmount ? formatNumberWithComma(contractInfo.tradingAmount) : ""}
              onChangeText={(text) => {
                const v = digitsOnly(text);
                const validation = validatePositiveAmount(v, "매매금액");
                setTradingError(validation.errorMessage);
                setContractInfo((prev) => ({ ...prev, tradingAmount: Number(v) || 0 }));
                if (listProductPrice && v && Number(v) !== listProductPrice) {
                  setTradingError("");
                }
              }}
              placeholder="매매금액 입력"
              keyboardType="numeric"
              error={tradingError}
              suffix={<Text className="text-gray600">만원</Text>}
            />
            {listProductPrice && Number(contractInfo.tradingAmount) !== listProductPrice ? (
              <Text className="-mt-4 text-[13px] text-primary">
                판매중인 금액과 계약서 상 매매금액이 다릅니다. 올바르게 입력했는지 다시 한번 확인해주세요.
              </Text>
            ) : null}
            <ContractUnderlineInput
              label="계약금"
              required
              value={contractInfo.downPayment ? formatNumberWithComma(contractInfo.downPayment) : ""}
              onChangeText={(text) => {
                const v = digitsOnly(text);
                const validation = validatePositiveAmount(v, "계약금");
                setDownPaymentError(validation.errorMessage);
                setContractInfo((prev) => ({ ...prev, downPayment: Number(v) || null }));
              }}
              keyboardType="numeric"
              error={downPaymentError}
              suffix={<Text className="text-gray600">만원</Text>}
            />
            <ContractUnderlineInput
              label="계약금 지급일"
              required
              value={contractInfo.downPaymentDate}
              readOnly
              onPress={() => setPaymentDateField("downPaymentDate")}
              placeholder="계약금 지급일 입력"
              suffix={<ContractChevronSuffix />}
            />
            <ContractUnderlineInput
              label="중도금"
              value={
                contractInfo.intermediatePayment
                  ? formatNumberWithComma(contractInfo.intermediatePayment)
                  : ""
              }
              onChangeText={(text) =>
                setContractInfo((prev) => ({
                  ...prev,
                  intermediatePayment: Number(digitsOnly(text)) || null,
                }))
              }
              keyboardType="numeric"
              suffix={<Text className="text-gray600">만원</Text>}
            />
            <ContractUnderlineInput
              label="중도금 지급일"
              value={contractInfo.intermediatePaymentDate}
              readOnly
              onPress={() => setPaymentDateField("intermediatePaymentDate")}
              placeholder="중도금 지급일 입력"
              suffix={<ContractChevronSuffix />}
            />
            <ContractUnderlineInput
              label="잔금"
              value={contractInfo.balance ? formatNumberWithComma(contractInfo.balance) : ""}
              onChangeText={(text) =>
                setContractInfo((prev) => ({
                  ...prev,
                  balance: Number(digitsOnly(text)) || null,
                }))
              }
              keyboardType="numeric"
              suffix={<Text className="text-gray600">만원</Text>}
            />
            <ContractUnderlineInput
              label="잔금 지급일"
              value={contractInfo.balancePaymentDate}
              readOnly
              onPress={() => setPaymentDateField("balancePaymentDate")}
              placeholder="잔금 지급일 입력"
              suffix={<ContractChevronSuffix />}
            />
            <View>
              <ContractUnderlineInput
                label="특약사항"
                value={contractInfo.additionalConditions}
                onChangeText={(text) =>
                  setContractInfo((prev) => ({ ...prev, additionalConditions: text }))
                }
                placeholder="특약사항 입력"
              />
            </View>
          </View>
        ) : null}

        <View className={isTransferor ? "mt-7 gap-7" : "gap-7"}>
          <ContractUnderlineInput
            label="주소"
            required
            value={String(contractInfo[addressKey as keyof ContractInfo] ?? "")}
            readOnly
            onPress={() => setAddressOpen(true)}
            placeholder="주소 검색"
            suffix={<ContractChevronSuffix />}
          />
          <ContractUnderlineInput
            label="성명"
            required
            value={String(contractInfo[nameKey as keyof ContractInfo] ?? "")}
            onChangeText={(text) => {
              const v = validateContractName(text);
              setNameError(v.errorMessage);
              setContractInfo((prev) => ({ ...prev, [nameKey]: text }));
            }}
            placeholder="성명 입력"
            error={nameError}
          />
          <ContractUnderlineInput
            label="전화번호"
            required
            value={String(contractInfo[phoneKey as keyof ContractInfo] ?? "")}
            onChangeText={(text) =>
              setContractInfo((prev) => ({
                ...prev,
                [phoneKey]: digitsOnly(text).slice(0, 11),
              }))
            }
            placeholder="전화번호 '-'를 제외 숫자만 입력"
            keyboardType="phone-pad"
            maxLength={11}
          />
          <ContractUnderlineInput
            label="주민등록번호(사업자번호)"
            required
            value={String(contractInfo[regKey as keyof ContractInfo] ?? "")}
            onChangeText={(text) => {
              const v = validateContractRegistrationNumber(text);
              setRegError(v.errorMessage);
              setContractInfo((prev) => ({ ...prev, [regKey]: text }));
            }}
            placeholder="주민등록번호(사업자번호) 입력"
            keyboardType="numeric"
            error={regError}
            maxLength={14}
          />
          <ContractSignatureBox
            signatureUrl={signatureUrl}
            onPress={() => {
              setDraftSign(signatureUrl || null);
              setSignOpen(true);
            }}
          />
        </View>
      </ScrollView>

      <View className="border-t border-gray300 bg-white px-4 py-3">
        <Pressable
          onPress={() => setConfirmOpen(true)}
          disabled={!canSubmit || submitting}
          className="h-12 items-center justify-center rounded-xl bg-primary"
          style={{ opacity: !canSubmit || submitting ? 0.45 : 1 }}
        >
          <Text className="text-[16px] font-bold text-white">저장하기</Text>
        </Pressable>
      </View>

      <Modal visible={confirmOpen} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-8">
          <View className="w-full overflow-hidden rounded-2xl bg-white">
            <Text className="px-5 pb-2 pt-6 text-center text-[18px] font-bold text-gray900">
              작성 완료하기
            </Text>
            <Text className="px-5 pb-4 text-center text-[15px] leading-6 text-gray700">
              양도인, 양수인 모두 작성 완료 시{"\n"}수정이 불가능합니다.{"\n"}
              계약서 작성을 완료하시겠습니까?{"\n\n"}
              <Text className="font-bold">
                * 전자계약 사고 방지를 위해서{"\n"}대면 후 계약해주세요.
              </Text>
            </Text>
            <View className="flex-row border-t border-gray300">
              <Pressable
                onPress={() => setConfirmOpen(false)}
                className="h-12 flex-1 items-center justify-center border-r border-gray300"
              >
                <Text className="text-[16px] text-gray600">취소</Text>
              </Pressable>
              <Pressable
                onPress={() => void onSave()}
                className="h-12 flex-1 items-center justify-center"
              >
                <Text className="text-[16px] font-semibold text-primary">저장하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <DriveDateCalendarPicker
        visible={paymentDateField !== null}
        selectedYmd={paymentDatePickerValue || formatYYYYMMDD(new Date())}
        onClose={() => setPaymentDateField(null)}
        onSelect={(ymd) => {
          if (!paymentDateField) return;
          setContractInfo((prev) => ({ ...prev, [paymentDateField]: ymd }));
        }}
      />

      <BottomSheet visible={addressOpen} onClose={() => setAddressOpen(false)} heightRatio={0.92}>
        <BottomSheetHeader title="주소" onClose={() => setAddressOpen(false)} />
        <DaumPostcodeWebView
          onComplete={(result) => {
            setContractInfo((prev) => ({
              ...prev,
              [addressKey]: result.fullLocate || "",
            }));
            setAddressOpen(false);
          }}
        />
      </BottomSheet>

      <BottomSheet
        visible={signOpen}
        onClose={() => setSignOpen(false)}
        contentLayout="hug"
        sheetHeight={signSheetHeight}
      >
        <BottomSheetHeader
          title={`${isTransferor ? "양도인" : "양수인"} 서명 입력`}
          onClose={() => setSignOpen(false)}
          bordered={false}
        />
        <View className="px-4 pb-3">
          <SignaturePadWebView
            key={signOpen ? "sign-open" : "sign-closed"}
            webViewRef={signWebRef}
            initialDataUrl={draftSign}
            onStrokeEnd={(url) => setDraftSign(url)}
          />
          <View className="mt-3 flex-row justify-end">
            <Pressable
              onPress={() => {
                clearSignaturePad(signWebRef);
                setDraftSign(null);
              }}
              className="flex-row items-center rounded-lg border border-gray300 px-3 py-2"
            >
              <Ionicons name="refresh" size={16} color={appColors.gray800} />
              <Text className="ml-1 text-[14px] text-gray800">다시 입력</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              if (!draftSign) return;
              setContractInfo((prev) => ({ ...prev, [signKey]: draftSign }));
              setSignOpen(false);
            }}
            disabled={!draftSign}
            className="mt-3 h-12 items-center justify-center rounded-xl bg-primary"
            style={{ opacity: draftSign ? 1 : 0.45 }}
          >
            <Text className="text-[16px] font-bold text-white">저장하기</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}
