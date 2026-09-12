/**
 * Logic thuần — không React, không RN. Test được bằng jest trong ~1ms.
 *
 * Đây chính là lý do tồn tại của thư mục model/: tách phần "suy nghĩ" ra
 * khỏi phần "vẽ", để phần suy nghĩ kiểm thử được dễ dàng.
 */
export const normalizePhone = (raw: string): string =>
  raw.replace(/[^0-9+]/g, '').replace(/^\+84/, '0');

export const isValidVietnamesePhone = (raw: string): boolean =>
  /^0[35789][0-9]{8}$/.test(normalizePhone(raw));

export const isValidOtp = (raw: string): boolean => /^[0-9]{6}$/.test(raw);
