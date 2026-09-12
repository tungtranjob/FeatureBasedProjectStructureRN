import type {MenuItem, OptionSelection} from './types';

export interface OptionValidationError {
  groupId: string;
  groupName: string;
  message: string;
}

/**
 * Kiểm tra lựa chọn tuỳ chọn có hợp lệ không.
 *
 * Trả về DANH SÁCH lỗi chứ không phải boolean, vì UI cần hiển thị đúng lỗi
 * bên cạnh đúng nhóm ("Vui lòng chọn size" ngay dưới mục Chọn size).
 * Trả về true/false thì màn hình chỉ biết nói "có gì đó sai" — vô dụng.
 */
export const validateOptionSelection = (
  item: MenuItem,
  selection: OptionSelection,
): OptionValidationError[] => {
  const errors: OptionValidationError[] = [];

  for (const group of item.optionGroups) {
    const selected = selection[group.id] ?? [];

    if (group.required && selected.length < Math.max(1, group.minSelect)) {
      errors.push({
        groupId: group.id,
        groupName: group.name,
        message: `Vui lòng chọn ${group.name.toLowerCase()}`,
      });
      continue;
    }

    if (selected.length > group.maxSelect) {
      errors.push({
        groupId: group.id,
        groupName: group.name,
        message: `Chỉ được chọn tối đa ${group.maxSelect} mục`,
      });
    }
  }

  return errors;
};

export const isSelectionValid = (
  item: MenuItem,
  selection: OptionSelection,
): boolean => validateOptionSelection(item, selection).length === 0;

/**
 * Lựa chọn mặc định khi mở màn hình chi tiết món.
 *
 * Nhóm bắt buộc thì tự chọn sẵn mục đầu tiên. Đây là quyết định về TRẢI
 * NGHIỆM, và nó nằm ở model/ chứ không nằm trong component — nhờ vậy khi
 * sản phẩm muốn đổi thành "chọn mục rẻ nhất", ta sửa 1 hàm có test bao phủ.
 */
export const buildDefaultSelection = (item: MenuItem): OptionSelection => {
  const selection: OptionSelection = {};
  for (const group of item.optionGroups) {
    const firstOption = group.options[0];
    selection[group.id] = group.required && firstOption ? [firstOption.id] : [];
  }
  return selection;
};

/**
 * Bật/tắt một option, tôn trọng ràng buộc của nhóm.
 *
 * - Nhóm chọn-một (maxSelect = 1): chọn cái mới thay thế cái cũ.
 * - Nhóm chọn-nhiều: chạm để bật/tắt, nhưng chặn khi đã đạt maxSelect.
 * - Nhóm bắt buộc: không cho bỏ chọn mục cuối cùng.
 */
export const toggleOption = (
  item: MenuItem,
  selection: OptionSelection,
  groupId: string,
  optionId: string,
): OptionSelection => {
  const group = item.optionGroups.find(g => g.id === groupId);
  if (!group) {
    return selection;
  }

  const current = selection[groupId] ?? [];
  const isSelected = current.includes(optionId);

  if (group.maxSelect === 1) {
    // Bỏ chọn mục duy nhất của nhóm bắt buộc -> không cho.
    if (isSelected && group.required) {
      return selection;
    }
    return {...selection, [groupId]: isSelected ? [] : [optionId]};
  }

  if (isSelected) {
    return {...selection, [groupId]: current.filter(id => id !== optionId)};
  }

  if (current.length >= group.maxSelect) {
    return selection; // đã đủ, bỏ qua thao tác
  }

  return {...selection, [groupId]: [...current, optionId]};
};
