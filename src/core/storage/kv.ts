import {MMKV} from 'react-native-mmkv';

/**
 * TẦNG TRỪU TƯỢNG CHO LƯU TRỮ CỤC BỘ — CHỈ 1 FILE NÀY BIẾT MMKV.
 *
 * Tại sao phải bọc lại thay vì import MMKV khắp nơi:
 *  1. Đổi engine (MMKV -> AsyncStorage -> SQLite) chỉ sửa file này.
 *  2. Test: jest không chạy được native module; ở đây ta có thể thay bằng
 *     Map in-memory mà không đụng tới bất kỳ store nào.
 *  3. Bắt buộc phân tách vùng dữ liệu (xem `secureKv` bên dưới).
 */
const storage = new MMKV({id: 'foodgo.default'});

/**
 * Vùng riêng cho dữ liệu nhạy cảm (token).
 *
 * MMKV có hỗ trợ mã hoá. Trong app thật nên cân nhắc react-native-keychain
 * cho refresh token. Điều quan trọng về kiến trúc: token KHÔNG nằm chung
 * vùng với cart/lịch sử tìm kiếm, vì lúc logout ta xoá vùng này mà giữ vùng kia.
 */
const secureStorage = new MMKV({
  id: 'foodgo.secure',
  encryptionKey: 'foodgo-demo-key-doi-lai-trong-app-that',
});

interface KvStore {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  clearAll(): void;
}

const wrap = (instance: MMKV): KvStore => ({
  getString: key => instance.getString(key),
  set: (key, value) => instance.set(key, value),
  delete: key => instance.delete(key),
  clearAll: () => instance.clearAll(),
});

export const kv = wrap(storage);
export const secureKv = wrap(secureStorage);

/** Helper đọc/ghi JSON có kiểu, nuốt lỗi parse để dữ liệu hỏng không làm crash app. */
export const kvJson = {
  read<T>(store: KvStore, key: string): T | undefined {
    const raw = store.getString(key);
    if (!raw) {
      return undefined;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Dữ liệu cũ không tương thích schema mới -> bỏ qua, coi như chưa có.
      store.delete(key);
      return undefined;
    }
  },
  write(store: KvStore, key: string, value: unknown): void {
    store.set(key, JSON.stringify(value));
  },
};
