import {useEffect, useRef} from 'react';
import {AppState, type AppStateStatus} from 'react-native';

/**
 * Gọi callback khi app chuyển trạng thái (background <-> foreground).
 *
 * Đây là hook TỐI QUAN TRỌNG với luồng thanh toán: khi user rời app sang
 * MoMo rồi quay lại, đôi khi KHÔNG có deep link nào được bắn (user tự bấm
 * nút back). Lúc đó sự kiện 'active' là tín hiệu duy nhất ta có.
 */
export function useAppState(
  onChange: (next: AppStateStatus, previous: AppStateStatus) => void,
): void {
  const previous = useRef(AppState.currentState);
  // Giữ callback trong ref để không phải gỡ/gắn lại listener mỗi lần render.
  const callback = useRef(onChange);
  callback.current = onChange;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      const prev = previous.current;
      previous.current = next;
      callback.current(next, prev);
    });
    return () => subscription.remove();
  }, []);
}
