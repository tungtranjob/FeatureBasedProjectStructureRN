import type {AddressId} from '@shared/types/id';

export interface DeliveryAddress {
  id: AddressId;
  label: string;
  recipientName: string;
  phone: string;
  line: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

/** Gộp thành một dòng để hiện trong danh sách. */
export const formatFullAddress = (address: DeliveryAddress): string =>
  [address.line, address.ward, address.district, address.city].join(', ');
