import type {Money} from '@shared/types/money';

/**
 * Một dòng trong giỏ hàng.
 *
 * ⭐ Chú ý: đây là ẢNH CHỤP (snapshot), không phải tham chiếu tới MenuItem.
 * Giỏ hàng lưu sẵn tên, ảnh, giá đã tính — nhờ vậy nó hiển thị được kể cả
 * khi mất mạng, và giá không tự nhảy khi quán đổi bảng giá lúc user đang
 * chọn món.
 *
 * `cart` KHÔNG import gì từ `menu`. Quan hệ là một chiều: menu -> cart.
 */
export interface CartLine {
  /** Id của dòng, KHÁC với menuItemId: cùng một món chọn topping khác nhau
   *  là hai dòng riêng biệt. */
  id: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  /** Giá một phần, ĐÃ gồm chênh lệch topping. */
  unitPrice: Money;
  quantity: number;
  optionIds: string[];
  optionNames: string[];
  note: string;
}

/**
 * Giỏ hàng chỉ chứa món của MỘT nhà hàng.
 *
 * Đây là quy tắc nghiệp vụ, không phải giới hạn kỹ thuật: một đơn = một
 * nhà hàng = một tài xế. Việc mã hoá quy tắc này ngay trong kiểu dữ liệu
 * (restaurantId nằm ở cấp giỏ hàng chứ không phải cấp từng dòng) khiến
 * trạng thái sai trở thành bất khả thi.
 */
export interface Cart {
  restaurantId: string | null;
  restaurantName: string | null;
  lines: CartLine[];
}

export interface AddToCartInput {
  restaurantId: string;
  restaurantName: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  optionIds: string[];
  optionNames: string[];
  note: string;
}
