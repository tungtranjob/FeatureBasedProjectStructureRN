import {generateId} from '@shared/lib/id';
import type {Paginated} from '@shared/types/api';
import type {
  FeeBreakdownDto,
  LoginResponseDto,
  MenuDto,
  MenuItemDto,
  MenuSectionDto,
  OrderDto,
  OrderItemDto,
  OrderStatusDto,
  PaymentIntentDto,
  PlaceOrderRequestDto,
  PlaceOrderResponseDto,
  QuoteRequestDto,
  RestaurantDto,
  VoucherDto,
} from '../contracts';
import {
  mockAddresses,
  mockCategoryNames,
  mockDb,
  mockMenuItems,
  mockRestaurants,
  mockUser,
  mockVouchers,
} from './db';
import {MockHttpError, route} from './mock-server';

/**
 * "NGHIỆP VỤ" CỦA BACKEND GIẢ LẬP.
 *
 * Lưu ý quan trọng về phân chia trách nhiệm:
 *   Server là NGUỒN SỰ THẬT về tiền và trạng thái đơn.
 *   Client có tính lại phí (xem features/checkout/model/calc-order-total.ts)
 *   nhưng CHỈ để hiện ngay cho mượt. Khi đặt đơn, con số của server thắng.
 *
 * Đây không phải chuyện lý thuyết: nếu tin con số client gửi lên, ai đó sửa
 * request là mua được pizza giá 0đ.
 */

/* ------------------------------ Tiện ích --------------------------------- */

const notFound = (what: string) =>
  new MockHttpError(404, 'NOT_FOUND', `Không tìm thấy ${what}`);

const findRestaurant = (id: string): RestaurantDto => {
  const found = mockRestaurants.find(r => r.id === id);
  if (!found) {
    throw notFound('nhà hàng');
  }
  return found;
};

const findMenuItem = (id: string): MenuItemDto => {
  const found = mockMenuItems.find(i => i.id === id);
  if (!found) {
    throw notFound('món ăn');
  }
  return found;
};

/** Phí dịch vụ: 3% tạm tính, trần 10.000đ. */
const calcServiceFee = (subtotal: number): number =>
  Math.min(Math.round(subtotal * 0.03), 10000);

/**
 * Tính giảm giá từ voucher. Ném lỗi 409 nếu không đủ điều kiện —
 * y hệt backend thật, để client buộc phải xử lý nhánh thất bại.
 */
const calcDiscount = (
  voucher: VoucherDto | null,
  subtotal: number,
  deliveryFee: number,
  restaurantId: string,
): number => {
  if (!voucher) {
    return 0;
  }
  if (new Date(voucher.expiresAt).getTime() < Date.now()) {
    throw new MockHttpError(409, 'VOUCHER_EXPIRED', 'Voucher đã hết hạn');
  }
  if (subtotal < voucher.minOrderAmount) {
    throw new MockHttpError(
      409,
      'VOUCHER_MIN_ORDER',
      `Đơn tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')}đ`,
    );
  }
  if (voucher.restaurantId && voucher.restaurantId !== restaurantId) {
    throw new MockHttpError(
      409,
      'VOUCHER_RESTAURANT_MISMATCH',
      'Voucher không áp dụng cho nhà hàng này',
    );
  }

  switch (voucher.discountType) {
    case 'PERCENT': {
      const raw = Math.round((subtotal * voucher.value) / 100);
      return voucher.maxDiscount ? Math.min(raw, voucher.maxDiscount) : raw;
    }
    case 'FIXED':
      return Math.min(voucher.value, subtotal);
    case 'FREESHIP':
      return deliveryFee;
  }
};

const buildFees = (
  subtotal: number,
  restaurant: RestaurantDto,
  voucher: VoucherDto | null,
): FeeBreakdownDto => {
  const deliveryFee = restaurant.deliveryFee;
  const serviceFee = calcServiceFee(subtotal);
  const discount = calcDiscount(voucher, subtotal, deliveryFee, restaurant.id);
  return {
    subtotal,
    deliveryFee,
    serviceFee,
    discount,
    // Không bao giờ để tổng âm.
    total: Math.max(0, subtotal + deliveryFee + serviceFee - discount),
  };
};

/**
 * Đơn hàng TỰ ĐỘNG chạy qua các trạng thái theo thời gian.
 * Mỗi 45 giây nhảy 1 bước, để bạn xem được màn theo dõi đơn "sống"
 * mà không cần dựng bếp và tài xế thật.
 */
const LIFECYCLE: OrderStatusDto[] = [
  'CONFIRMED',
  'PREPARING',
  'DELIVERING',
  'COMPLETED',
];
const STEP_MS = 45_000;

const advanceLifecycle = (order: OrderDto): OrderDto => {
  if (order.status === 'CANCELLED' || order.status === 'PENDING_PAYMENT') {
    return order;
  }
  const elapsed = Date.now() - new Date(order.placedAt).getTime();
  const stepIndex = Math.min(
    Math.floor(elapsed / STEP_MS),
    LIFECYCLE.length - 1,
  );
  const target = LIFECYCLE[stepIndex] as OrderStatusDto;
  const currentIndex = LIFECYCLE.indexOf(order.status);

  if (stepIndex > currentIndex) {
    order.status = target;
    order.statusHistory.push({
      status: target,
      at: new Date().toISOString(),
      note: STATUS_NOTE[target],
    });
  }
  return order;
};

const STATUS_NOTE: Record<OrderStatusDto, string> = {
  PENDING_PAYMENT: 'Đang chờ thanh toán',
  CONFIRMED: 'Nhà hàng đã xác nhận đơn',
  PREPARING: 'Nhà hàng đang chuẩn bị món',
  DELIVERING: 'Tài xế đang giao đến bạn',
  COMPLETED: 'Đơn hàng đã hoàn tất',
  CANCELLED: 'Đơn hàng đã bị huỷ',
};

/* ------------------------------ Xác thực --------------------------------- */

route('POST', '/auth/login', ({body}): LoginResponseDto => {
  const {phone, otp} = (body ?? {}) as {phone?: string; otp?: string};

  if (!phone || phone.length < 9) {
    throw new MockHttpError(422, 'INVALID_PHONE', 'Số điện thoại không hợp lệ');
  }
  // OTP demo: 6 số bất kỳ đều được, trừ 000000 để test nhánh sai OTP.
  if (otp === '000000') {
    throw new MockHttpError(401, 'INVALID_OTP', 'Mã OTP không đúng');
  }

  return {
    accessToken: `mock_access_${generateId('tk')}`,
    refreshToken: `mock_refresh_${generateId('tk')}`,
    user: {...mockUser, phone},
  };
});

route('GET', '/me/addresses', () => mockAddresses);

/* ------------------------------- Nhà hàng -------------------------------- */

route('GET', '/restaurants', ({query}): Paginated<RestaurantDto> => {
  const search = (query.search ?? '').trim().toLowerCase();
  const cuisine = query.cuisine ?? '';

  let items = mockRestaurants;
  if (search) {
    items = items.filter(
      r =>
        r.name.toLowerCase().includes(search) ||
        r.cuisines.some(c => c.toLowerCase().includes(search)),
    );
  }
  if (cuisine) {
    items = items.filter(r => r.cuisines.includes(cuisine));
  }

  const page = Number(query.page ?? '1');
  const pageSize = Number(query.pageSize ?? '10');
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items: pageItems,
    page,
    pageSize,
    total: items.length,
    hasNextPage: start + pageSize < items.length,
  };
});

route('GET', '/restaurants/:id', ({params}) =>
  findRestaurant(params.id as string),
);

route('GET', '/restaurants/:id/menu', ({params}): MenuDto => {
  const restaurantId = params.id as string;
  findRestaurant(restaurantId); // ném 404 nếu id sai

  const items = mockMenuItems.filter(i => i.restaurantId === restaurantId);

  // Gom món theo danh mục, giữ nguyên thứ tự xuất hiện đầu tiên.
  const sections: MenuSectionDto[] = [];
  for (const item of items) {
    let section = sections.find(s => s.categoryId === item.categoryId);
    if (!section) {
      section = {
        categoryId: item.categoryId,
        categoryName: mockCategoryNames[item.categoryId] ?? 'Khác',
        items: [],
      };
      sections.push(section);
    }
    section.items.push(item);
  }

  return {restaurantId, sections};
});

route('GET', '/menu-items/:id', ({params}) => findMenuItem(params.id as string));

/* ------------------------------ Khuyến mãi ------------------------------- */

route('GET', '/vouchers', ({query}): VoucherDto[] => {
  const restaurantId = query.restaurantId;
  // Trả về CẢ voucher không dùng được (hết hạn, chưa đủ đơn tối thiểu).
  // Client tự quyết định hiển thị mờ hay ẩn — server không đoán thay UI.
  return mockVouchers.filter(
    v => !v.restaurantId || !restaurantId || v.restaurantId === restaurantId,
  );
});

/* ------------------------------- Báo giá --------------------------------- */

route('POST', '/quote', ({body}): FeeBreakdownDto => {
  const request = body as QuoteRequestDto;
  const restaurant = findRestaurant(request.restaurantId);
  const voucher = request.voucherId
    ? (mockVouchers.find(v => v.id === request.voucherId) ?? null)
    : null;
  return buildFees(request.subtotal, restaurant, voucher);
});

/* ------------------------------- Đơn hàng -------------------------------- */

route('POST', '/orders', ({body}): PlaceOrderResponseDto => {
  const request = body as PlaceOrderRequestDto;

  /* ---- 1. Chống tạo đơn trùng (idempotency) ---- */
  const existingOrderId = mockDb.idempotency.get(request.idempotencyKey);
  if (existingOrderId) {
    const existing = mockDb.orders.find(o => o.id === existingOrderId);
    if (existing) {
      const intent =
        mockDb.paymentIntents.find(p => p.orderId === existing.id) ?? null;
      return {order: existing, paymentIntent: intent};
    }
  }

  /* ---- 2. Kiểm tra đầu vào ---- */
  const restaurant = findRestaurant(request.restaurantId);
  if (restaurant.isPaused) {
    throw new MockHttpError(
      409,
      'RESTAURANT_PAUSED',
      'Nhà hàng đang tạm ngưng nhận đơn',
    );
  }
  if (request.items.length === 0) {
    throw new MockHttpError(422, 'EMPTY_CART', 'Giỏ hàng trống');
  }

  const address = mockAddresses.find(a => a.id === request.addressId);
  if (!address) {
    throw notFound('địa chỉ giao hàng');
  }

  /* ---- 3. Server tự tính tiền, KHÔNG tin số từ client ---- */
  const orderItems: OrderItemDto[] = request.items.map(line => {
    const menuItem = findMenuItem(line.menuItemId);

    if (!menuItem.isAvailable) {
      throw new MockHttpError(
        409,
        'ITEM_UNAVAILABLE',
        `"${menuItem.name}" đã hết hàng`,
      );
    }

    const allOptions = menuItem.optionGroups.flatMap(g => g.options);
    const selected = line.optionIds
      .map(id => allOptions.find(o => o.id === id))
      .filter((o): o is NonNullable<typeof o> => Boolean(o));

    const unitPrice =
      menuItem.basePrice + selected.reduce((sum, o) => sum + o.priceDelta, 0);

    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      imageUrl: menuItem.imageUrl,
      quantity: line.quantity,
      unitPrice,
      optionNames: selected.map(o => o.name),
      note: line.note,
      lineTotal: unitPrice * line.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
  if (subtotal < restaurant.minOrderAmount) {
    throw new MockHttpError(
      409,
      'BELOW_MIN_ORDER',
      `Đơn tối thiểu ${restaurant.minOrderAmount.toLocaleString('vi-VN')}đ`,
    );
  }

  const voucher = request.voucherId
    ? (mockVouchers.find(v => v.id === request.voucherId) ?? null)
    : null;
  const fees = buildFees(subtotal, restaurant, voucher);

  /* ---- 4. Tạo đơn ---- */
  mockDb.orderSeq += 1;
  const isCod = request.paymentMethod === 'COD';
  const now = new Date().toISOString();

  const order: OrderDto = {
    id: generateId('ord'),
    code: `FG-${String(mockDb.orderSeq).padStart(4, '0')}`,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      imageUrl: restaurant.coverImageUrl,
    },
    items: orderItems,
    fees,
    // COD thì xác nhận ngay; các hình thức khác phải chờ thanh toán xong.
    status: isCod ? 'CONFIRMED' : 'PENDING_PAYMENT',
    paymentMethod: request.paymentMethod,
    paymentStatus: 'PENDING',
    address,
    placedAt: now,
    etaMinutes: restaurant.etaMinutes,
    statusHistory: [
      {
        status: isCod ? 'CONFIRMED' : 'PENDING_PAYMENT',
        at: now,
        note: STATUS_NOTE[isCod ? 'CONFIRMED' : 'PENDING_PAYMENT'],
      },
    ],
  };

  mockDb.orders.unshift(order);
  mockDb.idempotency.set(request.idempotencyKey, order.id);

  /* ---- 5. Tạo payment intent (trừ COD) ---- */
  let paymentIntent: PaymentIntentDto | null = null;
  if (!isCod) {
    paymentIntent = {
      id: generateId('pay'),
      orderId: order.id,
      method: request.paymentMethod,
      amount: fees.total,
      status: 'PENDING',
      // Deeplink giả lập của cổng thanh toán. Trong app thật, đây là URL
      // do MoMo/VNPay trả về sau khi backend tạo giao dịch.
      redirectUrl: buildMockRedirectUrl(request.paymentMethod, order.id),
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    };
    mockDb.paymentIntents.push(paymentIntent);
  }

  return {order, paymentIntent};
});

const buildMockRedirectUrl = (method: string, orderId: string): string =>
  `mock-gateway://${method.toLowerCase()}/pay?orderId=${orderId}`;

route('GET', '/orders', (): OrderDto[] =>
  mockDb.orders.map(order => advanceLifecycle(order)),
);

route('GET', '/orders/:id', ({params}): OrderDto => {
  const order = mockDb.orders.find(o => o.id === params.id);
  if (!order) {
    throw notFound('đơn hàng');
  }
  return advanceLifecycle(order);
});

route('POST', '/orders/:id/cancel', ({params}): OrderDto => {
  const order = mockDb.orders.find(o => o.id === params.id);
  if (!order) {
    throw notFound('đơn hàng');
  }
  // Quy tắc nghiệp vụ: chỉ huỷ được trước khi bếp bắt đầu nấu.
  if (order.status !== 'CONFIRMED' && order.status !== 'PENDING_PAYMENT') {
    throw new MockHttpError(
      409,
      'ORDER_NOT_CANCELLABLE',
      'Đơn đã được chuẩn bị, không thể huỷ',
    );
  }
  order.status = 'CANCELLED';
  order.statusHistory.push({
    status: 'CANCELLED',
    at: new Date().toISOString(),
    note: STATUS_NOTE.CANCELLED,
  });
  if (order.paymentStatus === 'PAID') {
    order.paymentStatus = 'REFUNDED';
  }
  return order;
});

/* ------------------------------ Thanh toán ------------------------------- */

route('GET', '/payments/:id', ({params}): PaymentIntentDto => {
  const intent = mockDb.paymentIntents.find(p => p.id === params.id);
  if (!intent) {
    throw notFound('giao dịch');
  }
  return intent;
});

/**
 * ⚠️ ROUTE NÀY CHỈ TỒN TẠI TRONG MOCK.
 *
 * Nó thay cho việc user thật sự mở app MoMo và bấm xác nhận. Ở production,
 * cổng thanh toán gọi webhook tới BACKEND, và app chỉ hỏi lại trạng thái.
 * App KHÔNG BAO GIỜ được tự đánh dấu "đã thanh toán" cho chính nó.
 */
route('POST', '/payments/:id/simulate', ({params, body}): PaymentIntentDto => {
  const intent = mockDb.paymentIntents.find(p => p.id === params.id);
  if (!intent) {
    throw notFound('giao dịch');
  }

  const {outcome} = (body ?? {}) as {outcome?: 'success' | 'failure'};
  const order = mockDb.orders.find(o => o.id === intent.orderId);

  if (outcome === 'failure') {
    intent.status = 'FAILED';
    if (order) {
      order.paymentStatus = 'FAILED';
    }
    return intent;
  }

  intent.status = 'PAID';
  if (order) {
    order.paymentStatus = 'PAID';
    order.status = 'CONFIRMED';
    // Reset mốc thời gian để vòng đời đơn bắt đầu tính từ lúc trả tiền xong.
    order.placedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'CONFIRMED',
      at: order.placedAt,
      note: STATUS_NOTE.CONFIRMED,
    });
  }
  return intent;
});
