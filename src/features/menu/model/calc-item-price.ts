import {addMoney, money, multiplyMoney, type Money} from '@shared/types/money';
import type {MenuItem, MenuOption, OptionSelection} from './types';

/**
 * Lấy ra các option đã chọn dưới dạng danh sách phẳng.
 * Bỏ qua id không tồn tại (dữ liệu cũ, menu vừa đổi) thay vì ném lỗi —
 * người dùng không nên thấy màn hình trắng chỉ vì quán bỏ một topping.
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

/** Giá MỘT phần = giá gốc + tổng chênh lệch của các tuỳ chọn. */
export const calcUnitPrice = (
  item: MenuItem,
  selection: OptionSelection,
): Money => {
  const options = resolveSelectedOptions(item, selection);
  return addMoney(item.basePrice, ...options.map(o => o.priceDelta));
};

/** Giá của cả dòng = giá một phần × số lượng. */
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
