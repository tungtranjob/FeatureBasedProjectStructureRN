import {http, withQuery} from '@core/api/http-client';
import type {VoucherDto} from '@core/api/contracts';
import {asId} from '@shared/types/id';
import type {VoucherId} from '@shared/types/id';
import {money} from '@shared/types/money';
import type {Voucher} from '../model/types';

const toVoucher = (dto: VoucherDto): Voucher => ({
  id: asId<VoucherId>(dto.id),
  code: dto.code,
  title: dto.title,
  description: dto.description,
  discountType: dto.discountType,
  value: dto.value,
  maxDiscount: dto.maxDiscount === null ? null : money(dto.maxDiscount),
  minOrderAmount: money(dto.minOrderAmount),
  restaurantId: dto.restaurantId,
  expiresAt: dto.expiresAt,
});

export const promotionApi = {
  async listVouchers(restaurantId: string | null): Promise<Voucher[]> {
    const dtos = await http.get<VoucherDto[]>(
      withQuery('/vouchers', {restaurantId}),
    );
    return dtos.map(toVoucher);
  },
};
