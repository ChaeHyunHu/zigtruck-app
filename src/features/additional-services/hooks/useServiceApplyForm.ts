import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/src/hooks/useAuth";

import type { SelectedVehicleInfo } from "../types";
import { validateApplicantFields } from "../validation";

export function useServiceApplyForm(vehicle?: SelectedVehicleInfo) {
  const { profile } = useAuth();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState("");
  const [productId, setProductId] = useState<number | undefined>(vehicle?.productId);
  const [truckName, setTruckName] = useState(vehicle?.truckName ?? "");
  const [chatRoomId, setChatRoomId] = useState<number | undefined>(vehicle?.chatRoomId);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (profile?.phoneNumber) setPhoneNumber(profile.phoneNumber);
  }, [profile?.name, profile?.phoneNumber]);

  useEffect(() => {
    if (vehicle?.productId) setProductId(vehicle.productId);
    if (vehicle?.truckName) setTruckName(vehicle.truckName);
    if (vehicle?.chatRoomId) setChatRoomId(vehicle.chatRoomId);
  }, [vehicle?.chatRoomId, vehicle?.productId, vehicle?.truckName]);

  const runValidation = useCallback((nextName: string, nextPhone: string) => {
    const result = validateApplicantFields(nextName, nextPhone);
    setNameError(result.nameError);
    setNameErrorMessage(result.nameErrorMessage);
    setPhoneError(result.phoneError);
    setPhoneErrorMessage(result.phoneErrorMessage);
    return !result.hasError;
  }, []);

  const onChangeName = useCallback(
    (value: string) => {
      setName(value);
      runValidation(value, phoneNumber);
    },
    [phoneNumber, runValidation],
  );

  const onChangePhone = useCallback(
    (value: string) => {
      const digits = value.replace(/[^\d]/g, "");
      setPhoneNumber(digits);
      runValidation(name, digits);
    },
    [name, runValidation],
  );

  const isSubmitDisabled = useMemo(
    () => nameError || phoneError || !name.trim() || !phoneNumber.trim(),
    [name, nameError, phoneError, phoneNumber],
  );

  const applyVehicle = useCallback((info: SelectedVehicleInfo) => {
    setProductId(info.productId);
    setTruckName(info.truckName ?? "");
    setChatRoomId(info.chatRoomId);
  }, []);

  return {
    name,
    phoneNumber,
    nameError,
    nameErrorMessage,
    phoneError,
    phoneErrorMessage,
    productId,
    truckName,
    chatRoomId,
    isSubmitDisabled,
    onChangeName,
    onChangePhone,
    applyVehicle,
    runValidation,
  };
}
