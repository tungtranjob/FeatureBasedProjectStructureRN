import type {Money} from '@shared/types/money';
import type {PaymentMethod} from './types';

/**
 * The platform is passed IN rather than read from Platform.OS.
 * See the note in ../lib/current-platform.ts for why.
 */
export type AppPlatform = 'ios' | 'android';

/**
 * THE PAYMENT METHOD CATALOGUE.
 *
 * Everything about each method in ONE table instead of if/else scattered through the UI.
 * Adding ZaloPay = one row here + one provider file. No screen is touched.
 */
export interface PaymentMethodInfo {
  method: PaymentMethod;
  label: string;
  icon: string;
  description: string;
  /** The maximum amount. null = no limit. */
  maxAmount: number | null;
  /** Supported platforms. Apple Pay is iOS only, Google Pay Android only. */
  platforms: AppPlatform[];
}

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    method: 'COD',
    label: 'Tiền mặt khi nhận hàng',
    icon: '💵',
    description: 'Thanh toán trực tiếp cho tài xế',
    // A real business rule: large orders cannot use COD because of the risk of refusal.
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
 * Filters down to the methods USABLE for this order.
 *
 * A pure function taking platform as a parameter -> both platforms are testable on
 * one machine.
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
 * Picks a valid default method.
 *
 * A real situation: the user picks COD for a 500k order, then adds items up to 1.2 million.
 * COD is no longer valid -> we have to switch automatically, or they tap order and
 * get a server error with no idea why.
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
