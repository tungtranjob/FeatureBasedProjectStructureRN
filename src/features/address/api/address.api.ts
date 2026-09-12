import {http} from '@core/api/http-client';
import type {AddressDto} from '@core/api/contracts';
import {asId} from '@shared/types/id';
import type {AddressId} from '@shared/types/id';
import type {DeliveryAddress} from '../model/types';

const toAddress = (dto: AddressDto): DeliveryAddress => ({
  id: asId<AddressId>(dto.id),
  label: dto.label,
  recipientName: dto.recipientName,
  phone: dto.phone,
  line: dto.line,
  ward: dto.ward,
  district: dto.district,
  city: dto.city,
  isDefault: dto.isDefault,
});

export const addressApi = {
  async list(): Promise<DeliveryAddress[]> {
    const dtos = await http.get<AddressDto[]>('/me/addresses');
    return dtos.map(toAddress);
  },
};
