import {http} from '@core/api/http-client';
import type {PaymentIntentDto} from '@core/api/contracts';
import {asId} from '@shared/types/id';
import type {OrderId, PaymentIntentId} from '@shared/types/id';
import {money} from '@shared/types/money';
import type {PaymentIntent} from '../model/types';

export const toPaymentIntent = (dto: PaymentIntentDto): PaymentIntent => ({
  id: asId<PaymentIntentId>(dto.id),
  orderId: asId<OrderId>(dto.orderId),
  method: dto.method,
  amount: money(dto.amount),
  status: dto.status,
  redirectUrl: dto.redirectUrl,
  expiresAt: dto.expiresAt,
});

export const paymentApi = {
  async getIntent(intentId: string): Promise<PaymentIntent> {
    const dto = await http.get<PaymentIntentDto>(`/payments/${intentId}`);
    return toPaymentIntent(dto);
  },

  /**
   * ⚠️ CHỈ DÙNG TRONG DEMO.
   *
   * Thay cho việc người dùng thật sự xác nhận trong app MoMo. Ở production,
   * cổng thanh toán gọi webhook tới backend; app không có endpoint nào để
   * tự nói "tôi đã trả tiền rồi".
   */
  async simulateGateway(
    intentId: string,
    outcome: 'success' | 'failure',
  ): Promise<PaymentIntent> {
    const dto = await http.post<PaymentIntentDto>(
      `/payments/${intentId}/simulate`,
      {outcome},
    );
    return toPaymentIntent(dto);
  },
};
