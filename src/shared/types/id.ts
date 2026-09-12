/**
 * Branded ID — chặn lỗi truyền nhầm loại id cho nhau.
 *
 * Không có nó, `getOrder(restaurantId)` biên dịch ngon lành vì cả hai đều là
 * `string`, rồi chết lúc runtime. Có nó, TypeScript chặn ngay lúc gõ.
 * Chi phí: 0 byte lúc runtime (đây thuần tuý là kiểu, bị xoá khi compile).
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
 * Ép kiểu tại BIÊN của hệ thống (khi parse response API).
 * Bên trong app thì kiểu đã đúng rồi, không cần gọi lại.
 */
export const asId = <T extends string>(value: string): T => value as T;
