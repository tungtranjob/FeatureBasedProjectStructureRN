import {logger} from '../logger/logger';
import type {AppEventName, AppEvents} from './app-events';

/**
 * EVENT BUS — cách hai feature "nói chuyện" mà không cần biết nhau.
 *
 * Khi nào dùng event thay vì import trực tiếp:
 *  - Nhiều bên cùng quan tâm tới một chuyện (payment xong -> cart + order +
 *    navigation + analytics đều cần phản ứng).
 *  - Bên phát KHÔNG cần biết kết quả, cũng không cần chờ.
 *  - Muốn tránh phụ thuộc ngược chiều (payment không nên biết cart tồn tại).
 *
 * Khi nào KHÔNG dùng:
 *  - Cần giá trị trả về ngay -> gọi hàm/hook trực tiếp.
 *  - Chỉ 1 nơi lắng nghe -> event làm code khó lần dấu vết mà chẳng lợi gì.
 *
 * Cài đặt thủ công ~40 dòng thay vì thêm dependency: đủ dùng và không có
 * gì bí ẩn khi cần debug.
 */
type Listener<K extends AppEventName> = (payload: AppEvents[K]) => void;

/**
 * Bên trong lưu listener dưới dạng "không rõ kiểu" và ép kiểu tại biên
 * (trong `on` và `emit`). TypeScript không thể tự chứng minh rằng
 * Set<Listener<K>> khớp với một mapped type theo K, nên nếu cố giữ kiểu chặt
 * ở đây ta sẽ phải bọc mọi thứ trong generic phức tạp mà chẳng thêm an toàn.
 *
 * An toàn kiểu THẬT SỰ nằm ở chữ ký public của `on`/`emit` — nơi người dùng
 * API chạm vào. Bên trong là chi tiết cài đặt.
 */
type UnknownListener = (payload: unknown) => void;

const listeners = new Map<AppEventName, Set<UnknownListener>>();

export const appEventBus = {
  /** Trả về hàm huỷ đăng ký — LUÔN gọi nó trong cleanup của useEffect. */
  on<K extends AppEventName>(event: K, listener: Listener<K>): () => void {
    let set = listeners.get(event);
    if (!set) {
      set = new Set();
      listeners.set(event, set);
    }
    const wrapped = listener as UnknownListener;
    set.add(wrapped);
    return () => {
      set?.delete(wrapped);
    };
  },

  emit<K extends AppEventName>(event: K, payload: AppEvents[K]): void {
    logger.debug('EventBus', `emit ${event}`, payload);
    const set = listeners.get(event);
    if (!set || set.size === 0) {
      return;
    }
    // Sao chép sang mảng trước khi duyệt: listener có thể tự huỷ đăng ký
    // ngay trong lúc chạy, sửa Set đang lặp sẽ gây lỗi khó lần.
    for (const listener of Array.from(set)) {
      try {
        (listener as Listener<K>)(payload);
      } catch (error) {
        // Một listener lỗi KHÔNG được làm chết các listener còn lại.
        logger.error('EventBus', `listener của "${event}" ném lỗi`, error);
      }
    }
  },

  /** Dùng trong test để dọn sạch giữa các case. */
  reset(): void {
    listeners.clear();
  },
};
