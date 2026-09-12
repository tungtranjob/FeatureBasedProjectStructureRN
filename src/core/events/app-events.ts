/**
 * DANH MỤC SỰ KIỆN TOÀN APP — "hợp đồng" giữa các feature.
 *
 * Đây là danh sách những chuyện có thể xảy ra trong app mà NHIỀU feature
 * cùng quan tâm. Nó cố tình nhỏ: nếu chỉ một feature quan tâm thì đừng
 * dùng event, cứ gọi hàm trực tiếp cho dễ đọc.
 *
 * Quy ước đặt tên: '<feature>:<chuyện đã xảy ra ở thì quá khứ>'.
 * Thì quá khứ rất quan trọng — event mô tả SỰ THẬT ĐÃ XẢY RA, không phải
 * mệnh lệnh. 'payment:succeeded' (đúng) vs 'clearCart' (sai — đó là lệnh,
 * và nó khiến payment phải biết cart tồn tại).
 */
export type AppEvents = {
  'auth:logged-in': {userId: string};
  'auth:logged-out': undefined;

  'cart:restaurant-switched': {fromRestaurantId: string; toRestaurantId: string};

  'order:placed': {orderId: string; orderCode: string; total: number};

  'payment:succeeded': {orderId: string; paymentIntentId: string};
  'payment:failed': {orderId: string; reason: string};
  'payment:cancelled': {orderId: string};
};

export type AppEventName = keyof AppEvents;
