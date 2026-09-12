/**
 * WIRE CONTRACTS — hình dạng JSON mà server trả về.
 *
 * Trong dự án thật, file này thường được SINH TỰ ĐỘNG từ OpenAPI/Swagger
 * (openapi-typescript, orval...) chứ không gõ tay.
 *
 * ⚠️ Điểm kiến trúc quan trọng nhất của file này:
 *    DTO (dữ liệu của server) KHÔNG PHẢI là domain model (dữ liệu của app).
 *
 * Mỗi feature sẽ có một mapper `dto -> model` ở tầng api/. Nghe có vẻ thừa,
 * nhưng nó mua cho bạn 3 thứ:
 *  1. Backend đổi tên field -> sửa 1 mapper, không phải sửa 30 component.
 *  2. App có kiểu chặt hơn server (Money, branded id, enum union) trong khi
 *     JSON chỉ có string/number.
 *  3. Ghép/bỏ field tuỳ nhu cầu UI mà không phải xin backend đổi API.
 *
 * Đặt ở core/ (không phải features/) vì đây là hợp đồng dùng chung, và vì
 * core/ không được phép import features/ — giữ chiều phụ thuộc luôn đúng.
 */

/* ------------------------------- Người dùng ------------------------------ */

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

/* ------------------------------- Nhà hàng -------------------------------- */

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
  /** Giờ mở/đóng cửa dạng 24h, VD 8 và 22. */
  openHour: number;
  closeHour: number;
  /** Nhà hàng tự tạm ngưng nhận đơn dù đang trong giờ mở cửa. */
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
  /** Bắt buộc chọn (VD: chọn size) hay tuỳ chọn (VD: thêm topping). */
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

/* ------------------------------- Khuyến mãi ------------------------------ */

export type DiscountTypeDto = 'PERCENT' | 'FIXED' | 'FREESHIP';

export interface VoucherDto {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountTypeDto;
  /** PERCENT: 20 nghĩa là 20%. FIXED: số tiền. FREESHIP: bỏ qua. */
  value: number;
  /** Trần giảm giá cho loại PERCENT. null = không giới hạn. */
  maxDiscount: number | null;
  minOrderAmount: number;
  /** null = áp dụng mọi nhà hàng. */
  restaurantId: string | null;
  expiresAt: string;
}

/* -------------------------------- Đơn hàng ------------------------------- */

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
  /** Giá 1 phần ĐÃ gồm topping, CHỐT tại thời điểm đặt hàng. */
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

/** Body gửi lên khi đặt đơn. */
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
   * ⚠️ IDEMPOTENCY KEY — client sinh ra, gửi kèm mỗi lần đặt đơn.
   * Nếu mạng chập chờn và app retry, server nhận key trùng sẽ trả về đúng
   * đơn cũ thay vì tạo đơn thứ hai. Không có nó, user bị trừ tiền 2 lần.
   */
  idempotencyKey: string;
}

export interface PlaceOrderResponseDto {
  order: OrderDto;
  /** null khi thanh toán COD (không cần cổng thanh toán). */
  paymentIntent: PaymentIntentDto | null;
}

/* ------------------------------ Thanh toán ------------------------------- */

export interface PaymentIntentDto {
  id: string;
  orderId: string;
  method: PaymentMethodDto;
  amount: number;
  status: PaymentStatusDto;
  /** URL/deeplink để mở app cổng thanh toán. null với COD. */
  redirectUrl: string | null;
  expiresAt: string;
}

/* ------------------------------- Báo giá phí ----------------------------- */

export interface QuoteRequestDto {
  restaurantId: string;
  subtotal: number;
  voucherId: string | null;
}

export type QuoteResponseDto = FeeBreakdownDto;
