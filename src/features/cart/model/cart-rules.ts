import {generateId} from '@shared/lib/id';
import {addMoney, money, multiplyMoney, type Money} from '@shared/types/money';
import type {AddToCartInput, Cart, CartLine} from './types';

/**
 * ALL OF THE CART'S BUSINESS RULES — pure functions, no React.
 *
 * The store above does exactly one thing: call these functions and save the result.
 * That lets us test "adding a duplicate item merges the lines" without standing up
 * zustand, without rendering, and without mocking storage.
 */

export const EMPTY_CART: Cart = {
  restaurantId: null,
  restaurantName: null,
  lines: [],
};

/**
 * Two lines count as DUPLICATES when it is the same item AND the same options AND the same note.
 *
 * Sort optionIds before comparing: ['A','B'] and ['B','A'] are the same selection.
 * Miss that detail and you end up with two identical lines in the cart.
 */
export const isSameLine = (
  line: Pick<CartLine, 'menuItemId' | 'optionIds' | 'note'>,
  input: Pick<AddToCartInput, 'menuItemId' | 'optionIds' | 'note'>,
): boolean =>
  line.menuItemId === input.menuItemId &&
  line.note.trim() === input.note.trim() &&
  [...line.optionIds].sort().join('|') === [...input.optionIds].sort().join('|');

/** Whether adding an item means switching to a different restaurant. */
export const isDifferentRestaurant = (cart: Cart, restaurantId: string): boolean =>
  cart.restaurantId !== null &&
  cart.lines.length > 0 &&
  cart.restaurantId !== restaurantId;

export const addLine = (cart: Cart, input: AddToCartInput): Cart => {
  // An item from another restaurant -> replace the cart. The caller is responsible for
  // ASKING the user first (see use-add-to-cart.ts). At the model layer we only define
  // the outcome, we do not show a dialog — the model knows nothing about the UI.
  const base = isDifferentRestaurant(cart, input.restaurantId)
    ? {...EMPTY_CART}
    : cart;

  const existingIndex = base.lines.findIndex(line => isSameLine(line, input));

  const lines =
    existingIndex >= 0
      ? base.lines.map((line, index) =>
          index === existingIndex
            ? {...line, quantity: line.quantity + input.quantity}
            : line,
        )
      : [
          ...base.lines,
          {
            id: generateId('line'),
            menuItemId: input.menuItemId,
            name: input.name,
            imageUrl: input.imageUrl,
            unitPrice: money(input.unitPrice),
            quantity: input.quantity,
            optionIds: input.optionIds,
            optionNames: input.optionNames,
            note: input.note,
          },
        ];

  return {
    restaurantId: input.restaurantId,
    restaurantName: input.restaurantName,
    lines,
  };
};

export const updateLineQuantity = (
  cart: Cart,
  lineId: string,
  quantity: number,
): Cart => {
  // Dropping to 0 = remove the line. We never keep a zero-quantity line in the cart.
  if (quantity <= 0) {
    return removeLine(cart, lineId);
  }
  return {
    ...cart,
    lines: cart.lines.map(line =>
      line.id === lineId ? {...line, quantity} : line,
    ),
  };
};

export const removeLine = (cart: Cart, lineId: string): Cart => {
  const lines = cart.lines.filter(line => line.id !== lineId);
  // Removing the last line -> the cart is completely empty and forgets the restaurant.
  // Otherwise the user gets asked "switch restaurant?" for a cart that is already empty.
  return lines.length === 0 ? EMPTY_CART : {...cart, lines};
};

export const calcSubtotal = (cart: Cart): Money =>
  addMoney(
    ...cart.lines.map(line => multiplyMoney(line.unitPrice, line.quantity)),
  );

export const countItems = (cart: Cart): number =>
  cart.lines.reduce((sum, line) => sum + line.quantity, 0);

export const isEmpty = (cart: Cart): boolean => cart.lines.length === 0;
