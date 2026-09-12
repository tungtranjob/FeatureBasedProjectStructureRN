/**
 * Pure logic — no React, no RN. Testable with jest in about 1ms.
 *
 * This is exactly why the model/ folder exists: separate the "thinking" from the
 * "drawing", so the thinking is easy to test.
 */
export const normalizePhone = (raw: string): string =>
  raw.replace(/[^0-9+]/g, '').replace(/^\+84/, '0');

export const isValidVietnamesePhone = (raw: string): boolean =>
  /^0[35789][0-9]{8}$/.test(normalizePhone(raw));

export const isValidOtp = (raw: string): boolean => /^[0-9]{6}$/.test(raw);
