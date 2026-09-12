/**
 * MONEY IS STORED AS INTEGER VND. NEVER USE FLOATING POINT.
 *
 * `0.1 + 0.2 !== 0.3` in JS. With money that rounding error turns into reconciliation
 * mismatches and customer complaints. VND makes it easy: the smallest unit is 1 dong,
 * so integers are enough. (For USD, store cents — also an integer.)
 *
 * The branded type stops `Money` from being mixed up with a plain `number` by accident
 * (e.g. passing a quantity where an amount is expected) — TypeScript flags it.
 */
export type Money = number & {readonly __brand: 'Money'};

export const money = (amount: number): Money => {
  if (!Number.isInteger(amount)) {
    // Failing fast in dev beats a money mismatch in production.
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

/** Clamps negatives away — used when applying discounts so the total never goes negative. */
export const clampToZero = (a: Money): Money => money(Math.max(0, a));

/** min/max keep the Money type instead of degrading to number. */
export const minMoney = (a: Money, b: Money): Money => (a < b ? a : b);
