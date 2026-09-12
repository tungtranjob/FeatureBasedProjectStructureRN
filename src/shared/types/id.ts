/**
 * Branded IDs — prevent passing the wrong kind of id to a function.
 *
 * Without them, `getOrder(restaurantId)` compiles happily because both are
 * `string`, then blows up at runtime. With them, TypeScript catches it as you type.
 * Cost: 0 bytes at runtime (this is purely a type, erased at compile time).
 */
declare const brand: unique symbol;
type Brand<T, B> = T & {readonly [brand]: B};

export type RestaurantId = Brand<string, 'RestaurantId'>;
export type MenuItemId = Brand<string, 'MenuItemId'>;
export type CartLineId = Brand<string, 'CartLineId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type PaymentIntentId = Brand<string, 'PaymentIntentId'>;
export type VoucherId = Brand<string, 'VoucherId'>;
export type UserId = Brand<string, 'UserId'>;
export type AddressId = Brand<string, 'AddressId'>;

/**
 * Cast at the BOUNDARY of the system (when parsing an API response).
 * Inside the app the types are already correct, so no need to call this again.
 */
export const asId = <T extends string>(value: string): T => value as T;
