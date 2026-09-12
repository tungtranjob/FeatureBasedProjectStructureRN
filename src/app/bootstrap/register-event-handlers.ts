import {appEventBus} from '@core/events/app-event-bus';
import {queryClient} from '@core/api/query-client';
import {logger} from '@core/logger/logger';
import {clearCart} from '@features/cart';
import {orderKeys} from '@features/order';
import {resetCheckoutDraft} from '@features/checkout';
import {resetSelectedAddress} from '@features/address';
import {navigate} from '../navigation/navigation.service';

/**
 * ⭐⭐ FILE QUAN TRỌNG NHẤT ĐỂ HIỂU KIẾN TRÚC NÀY.
 *
 * Đây là nơi DUY NHẤT các feature được "nối dây" với nhau. Đọc file này là
 * hiểu ngay app phản ứng thế nào với các sự kiện lớn, mà không cần mở 8 thư
 * mục feature.
 *
 * Hãy để ý điều KHÔNG xảy ra ở các feature:
 *   - payment KHÔNG gọi cart.clear(). Nó chỉ phát 'payment:succeeded'.
 *   - auth KHÔNG gọi resetCheckoutDraft(). Nó chỉ phát 'auth:logged-out'.
 *   - order KHÔNG biết ai quan tâm tới đơn hàng mới.
 *
 * Kết quả: mỗi feature xoá đi được mà không làm vỡ feature khác. Muốn thêm
 * hành vi mới khi thanh toán thành công (gửi analytics, hiện đánh giá, cộng
 * điểm thưởng)? Thêm một dòng ở đây. Không đụng vào payment.
 *
 * Đánh đổi cần biết: luồng chạy khó lần dấu hơn so với gọi hàm trực tiếp —
 * bạn không "Go to definition" từ nơi phát sang nơi nhận được. Đó là lý do
 * số lượng event phải ít và tập trung hết ở một file như thế này.
 */
export function registerEventHandlers(): () => void {
  const unsubscribers: Array<() => void> = [];

  /* ---------------------- Đặt hàng thành công ---------------------- */
  unsubscribers.push(
    appEventBus.on('order:placed', ({orderId, orderCode}) => {
      logger.info('App', `Đã tạo đơn ${orderCode}`);

      // Giỏ hàng được xoá TẠI ĐÂY, không phải trong checkout.
      // checkout không cần biết cart tồn tại.
      clearCart();
      resetCheckoutDraft();

      void queryClient.invalidateQueries({queryKey: orderKeys.lists()});

      // Chỗ để gắn analytics:
      // analytics.track('order_placed', {orderId, orderCode});
      void orderId;
    }),
  );

  /* ---------------------- Thanh toán thành công -------------------- */
  unsubscribers.push(
    appEventBus.on('payment:succeeded', ({orderId}) => {
      logger.info('App', `Thanh toán thành công cho đơn ${orderId}`);

      // Làm mới đơn hàng để trạng thái cập nhật ngay khi user nhìn thấy.
      void queryClient.invalidateQueries({queryKey: orderKeys.detail(orderId)});
      void queryClient.invalidateQueries({queryKey: orderKeys.lists()});

      // Giỏ hàng lẽ ra đã rỗng từ 'order:placed', nhưng gọi lại cho chắc:
      // thanh toán có thể là lần thử lại cho một đơn cũ đang treo.
      clearCart();
    }),
  );

  /* ---------------------- Thanh toán thất bại ---------------------- */
  unsubscribers.push(
    appEventBus.on('payment:failed', ({orderId, reason}) => {
      logger.warn('App', `Thanh toán thất bại: ${reason}`);
      void queryClient.invalidateQueries({queryKey: orderKeys.detail(orderId)});
      // KHÔNG xoá giỏ hàng: người dùng có thể muốn thử lại bằng cách khác.
    }),
  );

  /* ------------------------- Đăng xuất ----------------------------- */
  unsubscribers.push(
    appEventBus.on('auth:logged-out', () => {
      logger.info('App', 'Người dùng đăng xuất — dọn toàn bộ dữ liệu cá nhân');

      // Dọn CLIENT STATE của từng feature qua public API của chúng.
      clearCart();
      resetCheckoutDraft();
      resetSelectedAddress();

      // Dọn SERVER STATE: xoá sạch cache, nếu không người dùng tiếp theo
      // đăng nhập trên cùng máy sẽ thấy đơn hàng của người trước.
      // Đây là lỗi bảo mật hay gặp và rất dễ bỏ sót.
      queryClient.clear();
    }),
  );

  /* -------------------- Đổi nhà hàng trong giỏ --------------------- */
  unsubscribers.push(
    appEventBus.on('cart:restaurant-switched', ({toRestaurantId}) => {
      // Voucher cũ gắn với nhà hàng cũ -> không còn hợp lệ.
      resetCheckoutDraft();
      void toRestaurantId;
    }),
  );

  /* ------------------- Thanh toán bị người dùng huỷ ---------------- */
  unsubscribers.push(
    appEventBus.on('payment:cancelled', ({orderId}) => {
      // Đưa người dùng về xem đơn đang treo, thay vì bỏ họ lơ lửng.
      navigate('OrderDetail', {orderId});
    }),
  );

  // Trả về hàm dọn dẹp: cần cho Fast Refresh lúc dev, nếu không listener
  // sẽ nhân đôi sau mỗi lần sửa file và bạn sẽ thấy hành vi chạy hai lần.
  return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
