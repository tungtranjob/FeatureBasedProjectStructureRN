/**
 * TIỀN LƯU BẰNG SỐ NGUYÊN VND. KHÔNG BAO GIỜ DÙNG SỐ THẬP PHÂN.
 *
 * `0.1 + 0.2 !== 0.3` trong JS. Với tiền, sai số đó biến thành lệch đối soát
 * và khiếu nại của khách. Với VND thì đơn giản: đơn vị nhỏ nhất là 1 đồng,
 * nên số nguyên là đủ. (Nếu làm USD, lưu bằng cent — cũng là số nguyên.)
 *
 * Branded type khiến `Money` không thể vô tình trộn với `number` thường
 * (VD: truyền nhầm quantity vào chỗ nhận amount) — TypeScript sẽ báo lỗi.
 */
export type Money = number & {readonly __brand: 'Money'};

export const money = (amount: number): Money => {
  if (!Number.isInteger(amount)) {
    // Fail-fast lúc dev còn hơn lệch tiền lúc chạy thật.
    throw new Error(`Money phải là số nguyên VND, nhận được: ${amount}`);
  }
  return amount as Money;
};

export const ZERO = money(0);

export const addMoney = (...values: Money[]): Money =>
  money(values.reduce<number>((sum, v) => sum + v, 0));

export const subtractMoney = (a: Money, b: Money): Money => money(a - b);

export const multiplyMoney = (a: Money, factor: number): Money =>
  money(Math.round(a * factor));

/** Không cho phép âm — dùng khi tính giảm giá để tránh "tổng tiền âm". */
export const clampToZero = (a: Money): Money => money(Math.max(0, a));

/** min/max giữ nguyên kiểu Money thay vì tụt về number. */
export const minMoney = (a: Money, b: Money): Money => (a < b ? a : b);
