import {useEffect, useState} from 'react';

/** Trì hoãn giá trị — dùng cho ô tìm kiếm để khỏi gọi API mỗi ký tự. */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
