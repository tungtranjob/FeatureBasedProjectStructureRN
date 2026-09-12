import {useEffect, useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {money} from '@shared/types/money';
// ⭐ CHECKOUT LÀ ĐIỂM HỘI TỤ: nó import 5 feature khác.
// Điều này BÌNH THƯỜNG và ĐÚNG — checkout tồn tại chính là để ghép chúng lại.
// Chiều ngược lại thì tuyệt đối không: cart không được import checkout.
import {useCart} from '@features/cart';
import {useDeliveryAddress} from '@features/address';
import {calcDiscount, useVouchers} from '@features/promotion';
import {getAvailability, useRestaurant} from '@features/restaurant';
import {getCurrentPlatform, resolveValidMethod} from '@features/payment';
import {orderApi, type FeeBreakdown} from '@features/order';
import {calcOrderTotal, EMPTY_FEES} from '../model/calc-order-total';
import {validateCheckout} from '../model/validate-checkout';
import {useCheckoutStore} from '../store/checkout.store';

/**
 * Gom toàn bộ dữ liệu cần cho màn checkout.
 *
 * Hook này làm 4 việc: gom dữ liệu từ các feature, tính phí tạm (client),
 * đối chiếu với báo giá của server, và kiểm tra điều kiện đặt hàng.
 */
export function useCheckoutDraft() {
  const cart = useCart();
  const {address} = useDeliveryAddress();
  const {data: restaurant} = useRestaurant(cart.restaurantId ?? undefined);
  const {data: vouchers} = useVouchers(cart.restaurantId);

  const voucherId = useCheckoutStore(state => state.voucherId);
  const paymentMethod = useCheckoutStore(state => state.paymentMethod);
  const setPaymentMethod = useCheckoutStore(state => state.setPaymentMethod);
  const note = useCheckoutStore(state => state.note);

  const voucher = useMemo(
    () => vouchers?.find(item => item.id === voucherId) ?? null,
    [vouchers, voucherId],
  );

  const deliveryFee = restaurant?.deliveryFee ?? money(0);

  const discount = useMemo(
    () =>
      calcDiscount(voucher, {
        subtotal: cart.subtotal,
        deliveryFee,
        restaurantId: cart.restaurantId,
      }),
    [voucher, cart.subtotal, deliveryFee, cart.restaurantId],
  );

  /* ---- 1. Tính nhanh ở client để UI phản hồi tức thì ---- */
  const localFees = useMemo<FeeBreakdown>(
    () =>
      cart.isEmpty
        ? EMPTY_FEES
        : calcOrderTotal({subtotal: cart.subtotal, deliveryFee, discount}),
    [cart.isEmpty, cart.subtotal, deliveryFee, discount],
  );

  /* ---- 2. Hỏi server báo giá chính thức ---- */
  const quote = useQuery({
    queryKey: ['checkout-quote', cart.restaurantId, cart.subtotal, voucherId],
    queryFn: () =>
      orderApi.quote({
        restaurantId: cart.restaurantId as string,
        subtotal: cart.subtotal,
        voucherId,
      }),
    enabled: Boolean(cart.restaurantId) && !cart.isEmpty,
    /**
     * Giữ dữ liệu cũ khi query key đổi, thay vì nháy về trạng thái loading.
     * Người dùng đổi voucher sẽ thấy số cũ mờ đi rồi cập nhật, chứ không
     * thấy bảng phí biến mất rồi hiện lại.
     */
    placeholderData: previous => previous,
    retry: 1,
  });

  /* ---- 3. Server thắng khi có kết quả ---- */
  const fees = quote.data ?? localFees;

  /* ---- 4. Kiểm tra điều kiện đặt hàng ---- */
  const isRestaurantOpen = restaurant
    ? getAvailability(restaurant) === 'open'
    : true; // chưa tải xong -> chưa vội báo lỗi

  const blockers = useMemo(
    () =>
      validateCheckout({
        itemCount: cart.itemCount,
        hasAddress: Boolean(address),
        isRestaurantOpen,
        subtotal: cart.subtotal,
        minOrderAmount: restaurant?.minOrderAmount ?? money(0),
      }),
    [cart.itemCount, cart.subtotal, address, isRestaurantOpen, restaurant],
  );

  /**
   * Tự chuyển hình thức thanh toán khi lựa chọn hiện tại không còn hợp lệ.
   *
   * Kịch bản: chọn COD cho đơn 800k, rồi thêm món lên 1.2 triệu (COD chỉ
   * cho tối đa 1 triệu). Không tự chuyển thì người dùng bấm đặt hàng và
   * nhận lỗi từ server mà chẳng hiểu vì sao.
   *
   * Đặt trong useEffect vì đây là ĐỒNG BỘ HOÁ state với một giá trị dẫn
   * xuất — trường hợp hiếm hoi mà useEffect là đúng công cụ.
   */
  useEffect(() => {
    const valid = resolveValidMethod(
      paymentMethod,
      fees.total,
      getCurrentPlatform(),
    );
    if (valid !== paymentMethod) {
      setPaymentMethod(valid);
    }
  }, [fees.total, paymentMethod, setPaymentMethod]);

  return {
    cart,
    address,
    restaurant,
    voucher,
    vouchers: vouchers ?? [],
    paymentMethod,
    note,
    fees,
    /** Bảng phí đang là số tạm của client hay đã là số chính thức của server. */
    isQuoting: quote.isFetching,
    blockers,
    canPlaceOrder: blockers.length === 0 && !quote.isFetching,
  };
}
