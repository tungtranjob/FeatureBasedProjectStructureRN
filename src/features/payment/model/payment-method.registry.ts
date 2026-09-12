import type {Money} from '@shared/types/money';
import type {PaymentMethod} from './types';

/**
 * Nền tảng được truyền VÀO chứ không tự đọc từ Platform.OS.
 * Xem ghi chú trong ../lib/current-platform.ts để biết vì sao.
 */
export type AppPlatform = 'ios' | 'android';

/**
 * DANH MỤC HÌNH THỨC THANH TOÁN.
 *
 * Gom mọi thứ về từng phương thức vào MỘT bảng thay vì rải if/else khắp UI.
 * Thêm ZaloPay = thêm một dòng ở đây + một file provider. Không đụng màn hình.
 */
export interface PaymentMethodInfo {
  method: PaymentMethod;
  label: string;
  icon: string;
  description: string;
  /** Hạn mức tối đa. null = không giới hạn. */
  maxAmount: number | null;
  /** Nền tảng hỗ trợ. Apple Pay chỉ iOS, Google Pay chỉ Android. */
  platforms: AppPlatform[];
}

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    method: 'COD',
    label: 'Tiền mặt khi nhận hàng',
    icon: '💵',
    description: 'Thanh toán trực tiếp cho tài xế',
    // Quy tắc nghiệp vụ thật: đơn lớn không cho COD vì rủi ro bom hàng.
    maxAmount: 1_000_000,
    platforms: ['ios', 'android'],
  },
  {
    method: 'MOMO',
    label: 'Ví MoMo',
    icon: '🟣',
    description: 'Mở app MoMo để thanh toán',
    maxAmount: null,
    platforms: ['ios', 'android'],
  },
  {
    method: 'VNPAY',
    label: 'VNPAY',
    icon: '🔵',
    description: 'Thẻ ATM nội địa, QR code',
    maxAmount: null,
    platforms: ['ios', 'android'],
  },
  {
    method: 'CARD',
    label: 'Thẻ quốc tế',
    icon: '💳',
    description: 'Visa, Mastercard, JCB',
    maxAmount: null,
    platforms: ['ios', 'android'],
  },
];

/**
 * Lọc ra những phương thức DÙNG ĐƯỢC cho đơn hàng này.
 *
 * Hàm thuần, nhận platform làm tham số -> test được cả hai nền tảng trên
 * cùng một máy.
 */
export const getAvailableMethods = (
  amount: Money,
  platform: AppPlatform,
): PaymentMethodInfo[] =>
  PAYMENT_METHODS.filter(
    info =>
      info.platforms.includes(platform) &&
      (info.maxAmount === null || amount <= info.maxAmount),
  );

export const getMethodInfo = (method: PaymentMethod): PaymentMethodInfo =>
  PAYMENT_METHODS.find(info => info.method === method) ??
  (PAYMENT_METHODS[0] as PaymentMethodInfo);

/**
 * Chọn phương thức mặc định hợp lệ.
 *
 * Tình huống thật: user chọn COD cho đơn 500k, rồi thêm món lên 1.2 triệu.
 * COD không còn hợp lệ -> phải tự chuyển, nếu không họ sẽ bấm đặt hàng và
 * nhận lỗi từ server mà không hiểu vì sao.
 */
export const resolveValidMethod = (
  current: PaymentMethod,
  amount: Money,
  platform: AppPlatform,
): PaymentMethod => {
  const available = getAvailableMethods(amount, platform);
  const stillValid = available.some(info => info.method === current);
  return stillValid
    ? current
    : ((available[0]?.method ?? 'MOMO') as PaymentMethod);
};
