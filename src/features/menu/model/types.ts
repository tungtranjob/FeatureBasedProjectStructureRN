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
 * The user's selection: groupId -> the list of selected optionIds.
 *
 * A map rather than a flat array because most operations ask "what is selected in this
 * group" (checking required groups, checking selection limits) — a map gives us O(1).
 */
export type OptionSelection = Record<string, string[]>;
