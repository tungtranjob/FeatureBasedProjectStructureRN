/**
 * Client-side id generation (cart line ids, idempotency keys, ...).
 *
 * We avoid the uuid package to skip a dependency — for this purpose random +
 * timestamp is enough. If you need a real UUID v4 (e.g. sending it to the server
 * as a primary key), swap in `react-native-uuid`.
 */
export const generateId = (prefix = 'id'): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
