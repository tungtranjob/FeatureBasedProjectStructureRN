import type {Money} from '@shared/types/money';

/**
 * A single line in the cart.
 *
 * ⭐ Note: this is a SNAPSHOT, not a reference to a MenuItem.
 * The cart stores the name, image and computed price up front — so it renders even
 * when offline, and the price does not jump when the restaurant changes its prices
 * while the user is picking items.
 *
 * `cart` imports NOTHING from `menu`. The relationship is one-way: menu -> cart.
 */
export interface CartLine {
  /** The line's id, DIFFERENT from menuItemId: the same item with different toppings
   *  is two separate lines. */
  id: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  /** Unit price, INCLUDING the topping deltas. */
  unitPrice: Money;
  quantity: number;
  optionIds: string[];
  optionNames: string[];
  note: string;
}

/**
 * A cart only holds items from ONE restaurant.
 *
 * That is a business rule, not a technical limitation: one order = one restaurant =
 * one driver. Encoding the rule in the type itself (restaurantId lives at the cart
 * level rather than on each line) makes the invalid state impossible to represent.
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
