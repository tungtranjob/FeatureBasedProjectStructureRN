import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {mmkvStorage} from '@core/storage/zustand-persist';
import type {Money} from '@shared/types/money';
import {appEventBus} from '@core/events/app-event-bus';
import * as rules from '../model/cart-rules';
import type {AddToCartInput, Cart} from '../model/types';

/**
 * CART STORE — ví dụ mẫu về CLIENT STATE.
 *
 * Vì sao giỏ hàng KHÔNG dùng TanStack Query:
 *   - Không có endpoint nào để "fetch giỏ hàng về" — app tự tạo ra nó.
 *   - Phải dùng được khi mất mạng (đi thang máy vẫn chọn món được).
 *   - Ghi vào nó rất nhiều lần và phải phản hồi tức thì, không có độ trễ.
 *
 * Nhìn kỹ sẽ thấy store này gần như KHÔNG chứa logic: mỗi action chỉ gọi
 * một hàm thuần trong model/ rồi lưu kết quả. Đó là chủ ý. Logic ở trong
 * hàm thuần thì test dễ; logic nhét trong store thì phải dựng store mới
 * test được.
 */
interface CartState {
  cart: Cart;

  add: (input: AddToCartInput) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: rules.EMPTY_CART,

      add: input => {
        const current = get().cart;

        // Phát event khi người dùng chuyển sang mua ở quán khác.
        // cart không cần biết ai quan tâm (analytics? gợi ý món?) —
        // nó chỉ thông báo sự thật đã xảy ra.
        if (rules.isDifferentRestaurant(current, input.restaurantId)) {
          appEventBus.emit('cart:restaurant-switched', {
            fromRestaurantId: current.restaurantId as string,
            toRestaurantId: input.restaurantId,
          });
        }

        set({cart: rules.addLine(current, input)});
      },

      setQuantity: (lineId, quantity) =>
        set(state => ({
          cart: rules.updateLineQuantity(state.cart, lineId, quantity),
        })),

      remove: lineId =>
        set(state => ({cart: rules.removeLine(state.cart, lineId)})),

      clear: () => set({cart: rules.EMPTY_CART}),
    }),
    {
      name: 'foodgo.cart',
      storage: createJSONStorage(() => mmkvStorage),
      /**
       * version + migrate: BẮT BUỘC với store có persist.
       *
       * Người dùng cập nhật app nhưng dữ liệu cũ vẫn nằm trong máy họ. Nếu
       * bạn đổi hình dạng CartLine mà không tăng version, app sẽ đọc phải
       * dữ liệu cũ và crash ngay lần mở đầu tiên sau khi update — một lỗi
       * cực kỳ khó tái hiện trên máy dev vì máy dev luôn cài mới.
       */
      version: 1,
      migrate: (persisted, fromVersion) => {
        if (fromVersion === 0) {
          // Schema v0 quá khác -> bỏ giỏ cũ còn hơn crash.
          return {cart: rules.EMPTY_CART};
        }
        return persisted as {cart: Cart};
      },
    },
  ),
);

/* ------------------------------ SELECTORS -------------------------------- */

/**
 * ⭐ SELECTOR NGUYÊN THUỶ — chi tiết nhỏ nhưng ảnh hưởng lớn tới hiệu năng.
 *
 * `useCartStore(selectItemCount)` trả về một con số. Zustand so sánh bằng
 * Object.is, nên component CHỈ re-render khi con số đó thật sự đổi.
 *
 * Nếu viết `useCartStore(s => ({count: ..., total: ...}))` thì mỗi lần store
 * đổi bất cứ thứ gì, selector tạo object MỚI -> Object.is false -> re-render
 * vô ích. Với badge giỏ hàng hiện ở mọi màn hình, sai lầm này khiến cả app
 * render lại mỗi lần user gõ ghi chú.
 */
export const selectItemCount = (state: CartState): number =>
  rules.countItems(state.cart);

/**
 * Trả về `Money` chứ không phải `number`.
 *
 * Nếu để `number`, branded type bị "tuột" ngay tại selector và mọi hàm phía
 * sau (calcDiscount, calcOrderTotal, validateCheckout) sẽ nhận number trần —
 * mất sạch lớp bảo vệ mà Money dựng lên. Branded type chỉ có tác dụng khi
 * được giữ nguyên suốt đường đi.
 */
export const selectSubtotal = (state: CartState): Money =>
  rules.calcSubtotal(state.cart);

export const selectIsEmpty = (state: CartState): boolean =>
  rules.isEmpty(state.cart);

export const selectLines = (state: CartState) => state.cart.lines;
export const selectRestaurantId = (state: CartState) => state.cart.restaurantId;
export const selectRestaurantName = (state: CartState) =>
  state.cart.restaurantName;
