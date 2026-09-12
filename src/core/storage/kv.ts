import {MMKV} from 'react-native-mmkv';

/**
 * THE LOCAL STORAGE ABSTRACTION — THIS IS THE ONLY FILE THAT KNOWS ABOUT MMKV.
 *
 * Why wrap it instead of importing MMKV everywhere:
 *  1. Swapping the engine (MMKV -> AsyncStorage -> SQLite) touches only this file.
 *  2. Tests: jest cannot run native modules; here we can substitute an in-memory
 *     Map without touching a single store.
 *  3. It forces data to be partitioned (see `secureKv` below).
 */
const storage = new MMKV({id: 'foodgo.default'});

/**
 * A separate partition for sensitive data (tokens).
 *
 * MMKV supports encryption. A real app should consider react-native-keychain for
 * the refresh token. The architectural point: tokens do NOT share a partition with
 * the cart or search history, because on logout we wipe one and keep the other.
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

/** Typed JSON read/write helpers; parse errors are swallowed so corrupt data cannot crash the app. */
export const kvJson = {
  read<T>(store: KvStore, key: string): T | undefined {
    const raw = store.getString(key);
    if (!raw) {
      return undefined;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Old data does not match the new schema -> ignore it, treat it as absent.
      store.delete(key);
      return undefined;
    }
  },
  write(store: KvStore, key: string, value: unknown): void {
    store.set(key, JSON.stringify(value));
  },
};
