import {useCallback, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {generateId} from '@shared/lib/id';
import {toUserMessage} from '@shared/errors/app-error';
import {logger} from '@core/logger/logger';
import {usePlaceOrder} from '@features/order';
import {PAYMENT_ROUTES, useInitiatePayment} from '@features/payment';
import {ORDER_ROUTES} from '@features/order';
import {useCheckoutDraft} from './use-checkout-draft';
import {useCheckoutStore} from '../store/checkout.store';

/**
 * ⭐ ĐIỀU PHỐI TOÀN BỘ LUỒNG ĐẶT HÀNG.
 *
 * Luồng:
 *   1. Sinh idempotency key (một lần cho mỗi lần thử đặt).
 *   2. POST /orders  -> nhận về order + paymentIntent (null nếu COD).
 *   3a. COD          -> vào thẳng màn chi tiết đơn.
 *   3b. Khác COD     -> khởi động provider, sang màn chờ thanh toán.
 *
 * Toàn bộ điều phối nằm ở ĐÂY, không nằm trong CheckoutScreen. Nhờ vậy màn
 * hình chỉ còn việc vẽ, và luồng này tái dùng được cho "đặt lại đơn cũ"
 * hay thanh toán lại một đơn đang treo.
 */
export function useCheckoutFlow() {
  const navigation = useNavigation();
  const draft = useCheckoutDraft();
  const placeOrder = usePlaceOrder();
  const {pay} = useInitiatePayment();
  const resetCheckout = useCheckoutStore(state => state.reset);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * ⭐ IDEMPOTENCY KEY giữ nguyên trong suốt các lần thử LẠI của cùng một
   * đơn hàng.
   *
   * Kịch bản nó cứu bạn: user bấm "Đặt hàng", request đi tới server, server
   * tạo đơn xong thì mạng rớt trước khi response về. App báo lỗi, user bấm
   * lại. Nếu key mới -> hai đơn, trừ tiền hai lần. Nếu key cũ -> server
   * nhận ra và trả về đúng đơn đã tạo.
   *
   * Key chỉ được làm mới khi đặt THÀNH CÔNG (đơn mới thật sự).
   */
  const idempotencyKey = useRef(generateId('idem'));

  const submit = useCallback(async () => {
    if (!draft.canPlaceOrder || !draft.address || !draft.cart.restaurantId) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      /* ---- Bước 1: tạo đơn ---- */
      const result = await placeOrder.mutateAsync({
        restaurantId: draft.cart.restaurantId,
        items: draft.cart.lines.map(line => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          optionIds: line.optionIds,
          note: line.note,
        })),
        addressId: draft.address.id,
        voucherId: draft.voucher?.id ?? null,
        paymentMethod: draft.paymentMethod,
        idempotencyKey: idempotencyKey.current,
      });

      // Đặt thành công -> đơn tiếp theo phải có key mới.
      idempotencyKey.current = generateId('idem');
      resetCheckout();

      /* ---- Bước 2: COD thì xong luôn ---- */
      if (!result.paymentIntent) {
        // Giỏ hàng được xoá ở app/bootstrap khi nghe event 'order:placed'.
        // checkout KHÔNG tự gọi cart.clear() — nó không cần biết cart tồn tại.
        navigation.reset({
          index: 1,
          routes: [
            {name: 'MainTabs'},
            {
              name: ORDER_ROUTES.OrderDetail,
              params: {orderId: result.order.id},
            },
          ],
        });
        return;
      }

      /* ---- Bước 3: khởi động cổng thanh toán ---- */
      // Điều hướng TRƯỚC khi gọi pay(): pay() có thể đẩy app ra nền ngay
      // lập tức, và ta muốn màn hình chờ đã sẵn sàng khi người dùng quay lại.
      navigation.navigate(PAYMENT_ROUTES.PaymentProcessing, {
        intentId: result.paymentIntent.id,
        orderId: result.order.id,
        orderCode: result.order.code,
      });

      await pay(result.paymentIntent);
    } catch (caught) {
      logger.error('Checkout', 'Đặt hàng thất bại', caught);
      setError(toUserMessage(caught));
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, placeOrder, pay, navigation, resetCheckout]);

  return {
    ...draft,
    submit,
    isSubmitting: isSubmitting || placeOrder.isPending,
    error,
    clearError: () => setError(null),
  };
}
