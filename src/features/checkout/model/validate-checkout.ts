import type {Money} from '@shared/types/money';
import {formatCurrency} from '@shared/lib/format';

/**
 * The reasons an order CANNOT be placed.
 *
 * A discriminated union rather than an array of strings, so the UI can handle each
 * kind differently: a missing address opens the address picker, while a minimum-order
 * shortfall only shows a message.
 */
export type CheckoutBlocker =
  | {kind: 'empty-cart'; message: string}
  | {kind: 'no-address'; message: string}
  | {kind: 'restaurant-closed'; message: string}
  | {kind: 'below-min-order'; message: string; missing: Money};

export interface CheckoutValidationInput {
  itemCount: number;
  hasAddress: boolean;
  isRestaurantOpen: boolean;
  subtotal: Money;
  minOrderAmount: Money;
}

/**
 * Returns the list of problems, IN THE ORDER they should be dealt with.
 *
 * The order matters: the UI only shows the FIRST problem on the order button. Dumping
 * all 4 errors on screen at once just alarms the user — guide them through one step
 * at a time.
 */
export const validateCheckout = (
  input: CheckoutValidationInput,
): CheckoutBlocker[] => {
  const blockers: CheckoutBlocker[] = [];

  if (input.itemCount === 0) {
    blockers.push({kind: 'empty-cart', message: 'Giỏ hàng đang trống'});
    // With an empty cart, every other check is meaningless.
    return blockers;
  }

  if (!input.hasAddress) {
    blockers.push({
      kind: 'no-address',
      message: 'Vui lòng chọn địa chỉ giao hàng',
    });
  }

  if (!input.isRestaurantOpen) {
    blockers.push({
      kind: 'restaurant-closed',
      message: 'Nhà hàng hiện không nhận đơn',
    });
  }

  if (input.subtotal < input.minOrderAmount) {
    const missing = (input.minOrderAmount - input.subtotal) as Money;
    blockers.push({
      kind: 'below-min-order',
      message: `Mua thêm ${formatCurrency(missing)} để đạt đơn tối thiểu`,
      missing,
    });
  }

  return blockers;
};

export const canPlaceOrder = (input: CheckoutValidationInput): boolean =>
  validateCheckout(input).length === 0;
