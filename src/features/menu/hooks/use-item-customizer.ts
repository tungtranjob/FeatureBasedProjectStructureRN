import {useMemo, useState} from 'react';
import {calcLinePrice, calcUnitPrice} from '../model/calc-item-price';
import {
  buildDefaultSelection,
  toggleOption,
  validateOptionSelection,
} from '../model/validate-options';
import type {MenuItem, OptionSelection} from '../model/types';

/**
 * TẦNG NỐI GIỮA model/ VÀ MÀN HÌNH.
 *
 * Hook này giữ state tạm của form tuỳ chọn món và uỷ thác MỌI quyết định
 * cho các hàm thuần trong model/. Bản thân nó gần như không chứa logic —
 * đó là dấu hiệu tốt.
 *
 * Vì sao state ở đây mà không ở Zustand: lựa chọn topping chỉ sống trong
 * lúc màn hình mở. Rời màn hình là bỏ đi. Đưa vào store toàn cục chỉ tổ
 * phải nhớ dọn dẹp và sẽ rò rỉ sang lần mở sau.
 */
export function useItemCustomizer(item: MenuItem | undefined) {
  const [selection, setSelection] = useState<OptionSelection>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Khởi tạo lựa chọn mặc định NGAY khi item về, không cần useEffect.
  // Mẹo "derived state": so sánh id đã khởi tạo với id hiện tại.
  const [initializedFor, setInitializedFor] = useState<string | null>(null);
  if (item && initializedFor !== item.id) {
    setInitializedFor(item.id);
    setSelection(buildDefaultSelection(item));
    setQuantity(1);
    setNote('');
    setHasSubmitted(false);
  }

  const errors = useMemo(
    () => (item ? validateOptionSelection(item, selection) : []),
    [item, selection],
  );

  const unitPrice = useMemo(
    () => (item ? calcUnitPrice(item, selection) : 0),
    [item, selection],
  );

  const totalPrice = useMemo(
    () => (item ? calcLinePrice(item, selection, quantity) : 0),
    [item, selection, quantity],
  );

  return {
    selection,
    quantity,
    note,
    unitPrice,
    totalPrice,
    errors,
    isValid: errors.length === 0,
    /** Chỉ hiện lỗi SAU khi người dùng bấm thêm vào giỏ, tránh màn hình đỏ lòm ngay lúc mở. */
    visibleErrors: hasSubmitted ? errors : [],

    setQuantity,
    setNote,
    markSubmitted: () => setHasSubmitted(true),
    toggle: (groupId: string, optionId: string) => {
      if (item) {
        setSelection(current => toggleOption(item, current, groupId, optionId));
      }
    },
  };
}
