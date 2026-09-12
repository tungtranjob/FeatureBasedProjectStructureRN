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

/** Joined into a single line for display in a list. */
export const formatFullAddress = (address: DeliveryAddress): string =>
  [address.line, address.ward, address.district, address.city].join(', ');
