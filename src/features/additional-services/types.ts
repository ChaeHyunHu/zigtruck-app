export type ServiceFormField = {
  value: string;
  error: boolean;
  errorMessage: string;
};

export type AdditionalServiceFormState = {
  name: ServiceFormField;
  phoneNumber: ServiceFormField;
  productId?: number;
  truckName?: string;
  chatRoomId?: number;
};

export type SelectedVehicleInfo = {
  productId?: number;
  truckName?: string;
  chatRoomId?: number;
  productPrice?: number;
};

export type ChatRoomListItem = {
  chatRoomId: number;
  lastMessage?: string;
  memberName?: string;
  productRepresentImageUrl?: string;
  truckNumber?: string;
  truckName?: string;
  productId?: number;
  price?: number;
};
