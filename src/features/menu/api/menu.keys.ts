export const menuKeys = {
  all: ['menu'] as const,
  byRestaurant: (restaurantId: string) =>
    [...menuKeys.all, 'restaurant', restaurantId] as const,
  item: (itemId: string) => [...menuKeys.all, 'item', itemId] as const,
};
