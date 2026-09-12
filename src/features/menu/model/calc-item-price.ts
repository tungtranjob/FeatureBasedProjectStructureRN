import {addMoney, money, multiplyMoney, type Money} from '@shared/types/money';
import type {MenuItem, MenuOption, OptionSelection} from './types';

/**
 * Flattens the selected options into a plain list.
 * Unknown ids (stale data, a menu that just changed) are skipped rather than throwing —
 * the user should not get a blank screen just because the restaurant dropped a topping.
 */
export const resolveSelectedOptions = (
  item: MenuItem,
  selection: OptionSelection,
): MenuOption[] => {
  const result: MenuOption[] = [];
  for (const group of item.optionGroups) {
    const selectedIds = selection[group.id] ?? [];
    for (const optionId of selectedIds) {
      const option = group.options.find(o => o.id === optionId);
      if (option) {
        result.push(option);
      }
    }
  }
  return result;
};

/** Unit price = base price + the sum of the option deltas. */
export const calcUnitPrice = (
  item: MenuItem,
  selection: OptionSelection,
): Money => {
  const options = resolveSelectedOptions(item, selection);
  return addMoney(item.basePrice, ...options.map(o => o.priceDelta));
};

/** Line price = unit price × quantity. */
export const calcLinePrice = (
  item: MenuItem,
  selection: OptionSelection,
  quantity: number,
): Money => {
  if (quantity < 0 || !Number.isInteger(quantity)) {
    throw new Error(`Số lượng không hợp lệ: ${quantity}`);
  }
  if (quantity === 0) {
    return money(0);
  }
  return multiplyMoney(calcUnitPrice(item, selection), quantity);
};
