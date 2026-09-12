import type {MenuItemId, RestaurantId} from '@shared/types/id';
import type {Money} from '@shared/types/money';

export interface MenuOption {
  id: string;
  name: string;
  priceDelta: Money;
}

export interface MenuOptionGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: MenuOption[];
}

export interface MenuItem {
  id: MenuItemId;
  restaurantId: RestaurantId;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: Money;
  isAvailable: boolean;
  soldCount: number;
  optionGroups: MenuOptionGroup[];
}

export interface MenuSection {
  categoryId: string;
  categoryName: string;
  items: MenuItem[];
}

export interface Menu {
  restaurantId: RestaurantId;
  sections: MenuSection[];
}

/**
 * Lựa chọn của người dùng: groupId -> danh sách optionId đã chọn.
 *
 * Dùng map thay vì mảng phẳng vì phần lớn thao tác là "nhóm này đang chọn
 * gì" (kiểm tra bắt buộc, giới hạn số lượng chọn) — map cho ta O(1).
 */
export type OptionSelection = Record<string, string[]>;
