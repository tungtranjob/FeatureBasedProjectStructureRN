/**
 * WIRE CONTRACTS — the JSON shapes the server returns.
 *
 * In a real project this file is usually GENERATED from OpenAPI/Swagger
 * (openapi-typescript, orval, ...) rather than typed by hand.
 *
 * ⚠️ The most important architectural point in this file:
 *    A DTO (the server's data) is NOT the domain model (the app's data).
 *
 * Every feature has a `dto -> model` mapper in its api/ layer. It sounds like
 * boilerplate, but it buys you three things:
 *  1. Backend renames a field -> fix 1 mapper, not 30 components.
 *  2. The app gets tighter types than the server (Money, branded ids, enum unions)
 *     while the JSON only has strings and numbers.
 *  3. Merge or drop fields to suit the UI without asking backend to change the API.
 *
 * It lives in core/ (not features/) because it is a shared contract, and because
 * core/ is not allowed to import features/ — which keeps the dependency direction right.
 */

/* --------------------------------- Users --------------------------------- */

export interface UserDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface AddressDto {
  id: string;
  label: string; // "Nhà", "Công ty"
  recipientName: string;
  phone: string;
  line: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

/* ------------------------------ Restaurants ------------------------------ */

export interface RestaurantDto {
  id: string;
  name: string;
  coverImageUrl: string;
  cuisines: string[];
  rating: number;
  ratingCount: number;
  distanceKm: number;
  deliveryFee: number;
  minOrderAmount: number;
  etaMinutes: number;
  /** Opening/closing hours in 24h form, e.g. 8 and 22. */
  openHour: number;
  closeHour: number;
  /** The restaurant paused incoming orders even though it is within opening hours. */
  isPaused: boolean;
  promoLabel: string | null;
}

/* --------------------------------- Menu ---------------------------------- */

export interface MenuOptionDto {
  id: string;
  name: string;
  priceDelta: number;
}

export interface MenuOptionGroupDto {
  id: string;
  name: string;
  /** Required (e.g. pick a size) or optional (e.g. add toppings). */
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: MenuOptionDto[];
}

export interface MenuItemDto {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  isAvailable: boolean;
  soldCount: number;
  optionGroups: MenuOptionGroupDto[];
}

export interface MenuSectionDto {
  categoryId: string;
  categoryName: string;
  items: MenuItemDto[];
}

export interface MenuDto {
  restaurantId: string;
  sections: MenuSectionDto[];
}

/* ------------------------------ Promotions ------------------------------- */

export type DiscountTypeDto = 'PERCENT' | 'FIXED' | 'FREESHIP';

export interface VoucherDto {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountTypeDto;
  /** PERCENT: 20 means 20%. FIXED: an amount. FREESHIP: ignored. */
  value: number;
  /** Discount cap for the PERCENT type. null = no cap. */
  maxDiscount: number | null;
  minOrderAmount: number;
  /** null = applies to every restaurant. */
  restaurantId: string | null;
  expiresAt: string;
}

/* -------------------------------- Orders --------------------------------- */

export type OrderStatusDto =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethodDto = 'COD' | 'MOMO' | 'VNPAY' | 'CARD';
export type PaymentStatusDto = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface FeeBreakdownDto {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
}

export interface OrderItemDto {
  menuItemId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  /** Unit price INCLUDING toppings, LOCKED at the time the order was placed. */
  unitPrice: number;
  optionNames: string[];
  note: string;
  lineTotal: number;
}

export interface OrderStatusEventDto {
  status: OrderStatusDto;
  at: string;
  note: string;
}

export interface OrderDto {
  id: string;
  code: string;
  restaurant: {id: string; name: string; imageUrl: string};
  items: OrderItemDto[];
  fees: FeeBreakdownDto;
  status: OrderStatusDto;
  paymentMethod: PaymentMethodDto;
  paymentStatus: PaymentStatusDto;
  address: AddressDto;
  placedAt: string;
  etaMinutes: number;
  statusHistory: OrderStatusEventDto[];
}

/** Body sent when placing an order. */
export interface PlaceOrderRequestDto {
  restaurantId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    optionIds: string[];
    note: string;
  }>;
  addressId: string;
  voucherId: string | null;
  paymentMethod: PaymentMethodDto;
  /**
   * ⚠️ IDEMPOTENCY KEY — generated by the client, sent with every order attempt.
   * If the network flakes and the app retries, a server that sees a duplicate key
   * returns the original order instead of creating a second one. Without it the user pays twice.
   */
  idempotencyKey: string;
}

export interface PlaceOrderResponseDto {
  order: OrderDto;
  /** null for COD (no payment gateway needed). */
  paymentIntent: PaymentIntentDto | null;
}

/* -------------------------------- Payment -------------------------------- */

export interface PaymentIntentDto {
  id: string;
  orderId: string;
  method: PaymentMethodDto;
  amount: number;
  status: PaymentStatusDto;
  /** URL/deeplink that opens the gateway app. null for COD. */
  redirectUrl: string | null;
  expiresAt: string;
}

/* ------------------------------- Fee quote ------------------------------- */

export interface QuoteRequestDto {
  restaurantId: string;
  subtotal: number;
  voucherId: string | null;
}

export type QuoteResponseDto = FeeBreakdownDto;
