import type { SelectedVehicleInfo } from "./types";

// 차량 선택 화면에서 선택한 차량을 이전(서비스) 화면 인스턴스로 전달하기 위한
// 모듈 레벨 임시 저장소. router.back() 으로 복귀 시 스크롤 위치와 네비게이션
// 스택을 유지하면서 선택 결과만 반영하기 위해 사용한다.
let pending: SelectedVehicleInfo | null = null;

export function setPendingSelectedVehicle(vehicle: SelectedVehicleInfo) {
  pending = vehicle;
}

export function takePendingSelectedVehicle(): SelectedVehicleInfo | null {
  const value = pending;
  pending = null;
  return value;
}

export function clearPendingSelectedVehicle() {
  pending = null;
}
