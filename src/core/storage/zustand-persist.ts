import type {StateStorage} from 'zustand/middleware';
import {kv, secureKv} from './kv';

/**
 * Adapter nối MMKV vào middleware `persist` của zustand.
 *
 * zustand mong đợi một interface giống localStorage (get/set/remove trả về
 * string | Promise<string>). MMKV là đồng bộ nên nhanh hơn AsyncStorage rất
 * nhiều — quan trọng vì store được hydrate ngay lúc app khởi động.
 */
export const mmkvStorage: StateStorage = {
  getItem: name => kv.getString(name) ?? null,
  setItem: (name, value) => kv.set(name, value),
  removeItem: name => kv.delete(name),
};

/** Dùng cho store chứa token. */
export const secureMmkvStorage: StateStorage = {
  getItem: name => secureKv.getString(name) ?? null,
  setItem: (name, value) => secureKv.set(name, value),
  removeItem: name => secureKv.delete(name),
};
