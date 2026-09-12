import type {Money} from '@shared/types/money';
import type {OrderId, PaymentIntentId} from '@shared/types/id';

export type PaymentMethod = 'COD' | 'MOMO' | 'VNPAY' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface PaymentIntent {
  id: PaymentIntentId;
  orderId: OrderId;
  method: PaymentMethod;
  amount: Money;
  status: PaymentStatus;
  /** URL/deeplink để mở app cổng thanh toán. null với COD. */
  redirectUrl: string | null;
  expiresAt: string;
}

/**
 * Kết quả của việc "khởi động" thanh toán.
 *
 * ⭐ Phân biệt `completed` và `redirected` là điểm mấu chốt của thanh toán
 * trên mobile:
 *
 *   completed  -> xong ngay trong app (COD, hoặc Apple Pay/Google Pay sheet).
 *   redirected -> APP ĐÃ BỊ ĐẨY RA NỀN. Người dùng đang ở trong app MoMo.
 *                 Ta không biết khi nào họ quay lại, hay có quay lại không.
 *                 Hệ điều hành hoàn toàn có thể giết app trong lúc đó.
 *   aborted    -> không khởi động được (chưa cài app cổng thanh toán).
 */
export type PaymentLaunchResult =
  | {status: 'completed'}
  | {status: 'redirected'}
  | {status: 'aborted'; reason: string};

/** Trạng thái của luồng thanh toán nhìn từ phía UI. */
export type PaymentFlowStatus =
  | 'idle'
  | 'initiating' // đang gọi server tạo giao dịch
  | 'redirected' // đã rời app, đang chờ quay lại
  | 'verifying' // đã quay lại, đang hỏi server kết quả
  | 'succeeded'
  | 'failed';
