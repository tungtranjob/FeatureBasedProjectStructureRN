import type {StateStorage} from 'zustand/middleware';
import {kv, secureKv} from './kv';

/**
 * Adapter that plugs MMKV into zustand's `persist` middleware.
 *
 * zustand expects a localStorage-like interface (get/set/remove returning
 * string | Promise<string>). MMKV is synchronous, so it is far faster than
 * AsyncStorage — which matters because stores hydrate during app startup.
 */
export const mmkvStorage: StateStorage = {
  getItem: name => kv.getString(name) ?? null,
  setItem: (name, value) => kv.set(name, value),
  removeItem: name => kv.delete(name),
};

/** For the store that holds tokens. */
export const secureMmkvStorage: StateStorage = {
  getItem: name => secureKv.getString(name) ?? null,
  setItem: (name, value) => secureKv.set(name, value),
  removeItem: name => secureKv.delete(name),
};
