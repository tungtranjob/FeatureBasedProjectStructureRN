import {clampToZero, money, type Money} from '@shared/types/money';
import type {FeeBreakdown} from '@features/order';

/**
 * ⚠️ CLIENT-SIDE FEE CALCULATION — FOR INSTANT DISPLAY ONLY.
 *
 * This logic DUPLICATES the server's (see core/api/mock/handlers.ts).
 * The duplication is deliberate, and it is worth understanding why:
 *
 *   Why compute on the client at all: a user toggling a voucher or changing a quantity
 *   must see the total change IMMEDIATELY. Waiting for a 300ms network round trip on
 *   every tap is a poor experience.
 *
 *   Why the server MUST still recompute: numbers from the client are never
 *   trustworthy. Anyone can edit the request. A real order always uses the server's numbers.
 *
 *   When the two disagree: the SERVER wins. See use-checkout-draft.ts — it prefers
 *   the server-quoted breakdown as soon as it arrives.
 *
 * This is the "optimistic UI" pattern: guess ahead for smoothness, but always defer
 * to the server for the truth.
 */

const SERVICE_FEE_RATE = 0.03;
const SERVICE_FEE_CAP = 10000;

export const calcServiceFee = (subtotal: Money): Money =>
  money(Math.min(Math.round(subtotal * SERVICE_FEE_RATE), SERVICE_FEE_CAP));

export const calcOrderTotal = (params: {
  subtotal: Money;
  deliveryFee: Money;
  discount: Money;
}): FeeBreakdown => {
  const serviceFee = calcServiceFee(params.subtotal);
  const total = clampToZero(
    money(
      params.subtotal + params.deliveryFee + serviceFee - params.discount,
    ),
  );

  return {
    subtotal: params.subtotal,
    deliveryFee: params.deliveryFee,
    serviceFee,
    discount: params.discount,
    total,
  };
};

/** An empty breakdown — used before data arrives, so the UI never has to handle null. */
export const EMPTY_FEES: FeeBreakdown = {
  subtotal: money(0),
  deliveryFee: money(0),
  serviceFee: money(0),
  discount: money(0),
  total: money(0),
};
