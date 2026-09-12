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
   * ⚠️ DEMO ONLY.
   *
   * It stands in for the user actually confirming in the MoMo app. In production the
   * gateway calls a webhook on the backend; the app has no endpoint for telling it
   * "I have paid".
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
