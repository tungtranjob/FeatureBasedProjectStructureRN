import {generateId} from '@shared/lib/id';
import {addMoney, money, multiplyMoney, type Money} from '@shared/types/money';
import type {AddToCartInput, Cart, CartLine} from './types';

/**
 * TOÀN BỘ QUY TẮC NGHIỆP VỤ CỦA GIỎ HÀNG — hàm thuần, không React.
 *
 * Store ở tầng trên chỉ làm mỗi việc: gọi các hàm này rồi lưu kết quả.
 * Nhờ vậy ta test được "thêm món trùng thì gộp dòng" mà không cần dựng
 * zustand, không cần render, không cần mock storage.
 */

export const EMPTY_CART: Cart = {
  restaurantId: null,
  restaurantName: null,
  lines: [],
};

/**
 * Hai dòng được coi là TRÙNG khi cùng món VÀ cùng tuỳ chọn VÀ cùng ghi chú.
 *
 * Sắp xếp optionIds trước khi so sánh: ['A','B'] và ['B','A'] là cùng một
 * lựa chọn. Bỏ qua chi tiết này là sinh ra hai dòng y hệt nhau trong giỏ.
 */
export const isSameLine = (
  line: Pick<CartLine, 'menuItemId' | 'optionIds' | 'note'>,
  input: Pick<AddToCartInput, 'menuItemId' | 'optionIds' | 'note'>,
): boolean =>
  line.menuItemId === input.menuItemId &&
  line.note.trim() === input.note.trim() &&
  [...line.optionIds].sort().join('|') === [...input.optionIds].sort().join('|');

/** Thêm món có nhận diện được nhà hàng khác không. */
export const isDifferentRestaurant = (cart: Cart, restaurantId: string): boolean =>
  cart.restaurantId !== null &&
  cart.lines.length > 0 &&
  cart.restaurantId !== restaurantId;

export const addLine = (cart: Cart, input: AddToCartInput): Cart => {
  // Món của quán khác -> thay giỏ mới. Người gọi có trách nhiệm HỎI người
  // dùng trước (xem use-add-to-cart.ts). Ở tầng model ta chỉ định nghĩa
  // kết quả, không hiện dialog — model không biết gì về UI.
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
  // Giảm về 0 = xoá dòng. Không giữ dòng số lượng 0 trong giỏ.
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
  // Xoá dòng cuối cùng -> giỏ rỗng hoàn toàn, quên luôn nhà hàng.
  // Nếu không, user sẽ bị hỏi "đổi nhà hàng?" cho một cái giỏ đang rỗng.
  return lines.length === 0 ? EMPTY_CART : {...cart, lines};
};

export const calcSubtotal = (cart: Cart): Money =>
  addMoney(
    ...cart.lines.map(line => multiplyMoney(line.unitPrice, line.quantity)),
  );

export const countItems = (cart: Cart): number =>
  cart.lines.reduce((sum, line) => sum + line.quantity, 0);

export const isEmpty = (cart: Cart): boolean => cart.lines.length === 0;
